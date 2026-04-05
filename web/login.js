/**
 * LOGICA DI LOGIN E PERSISTENZA CHIAVE
 */

const SALT = 'art-gallery-firenze-secret-salt'; 
const ITERATIONS = 100000;

/**
 * Salva la chiave in IndexedDB (accessibile dal Service Worker)
 */
async function saveKeyToIndexedDB(keyHex) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("GalleryDB", 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore("secrets");
        };
        request.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction("secrets", "readwrite");
            tx.objectStore("secrets").put(keyHex, "decryption_key");
            tx.oncomplete = () => resolve();
        };
        request.onerror = reject;
    });
}

async function deriveKey(password) {
    const encoder = new TextEncoder();
    const salt = encoder.encode(SALT);
    const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        true, ["decrypt"]
    );
}

async function tryLogin() {
    const pwdInput = document.getElementById('password');
    const statusDiv = document.getElementById('status');
    const loginBtn = document.getElementById('login-btn');
    const password = pwdInput.value;

    if (!password) return;
    statusDiv.innerText = "Verifica e decifratura in corso...";
    loginBtn.disabled = true;

    try {
        const key = await deriveKey(password);
        const resp = await fetch('vault/check.enc');
        const encryptedBuffer = await resp.arrayBuffer();
        
        const iv = encryptedBuffer.slice(0, 12);
        const tag = encryptedBuffer.slice(12, 28);
        const data = encryptedBuffer.slice(28);
        const combined = new Uint8Array(data.byteLength + tag.byteLength);
        combined.set(new Uint8Array(data));
        combined.set(new Uint8Array(tag), data.byteLength);

        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, combined);
        if (new TextDecoder().decode(decrypted) !== "AUTH_OK") throw new Error();

        const exportedKey = await crypto.subtle.exportKey("raw", key);
        const keyHex = Array.from(new Uint8Array(exportedKey)).map(b => b.toString(16).padStart(2, '0')).join('');
        
        // --- SALVATAGGIO PERSISTENTE ---
        await saveKeyToIndexedDB(keyHex);
        localStorage.setItem('gallery_authenticated', 'true');

        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.register('sw.js');
            await navigator.serviceWorker.ready;
            if (reg.active) reg.active.postMessage({ type: 'SET_KEY', key: keyHex });
            
            statusDiv.innerText = "Accesso eseguito. Caricamento galleria...";
            setTimeout(() => window.location.href = 'main.html', 500);
        }
    } catch (e) {
        statusDiv.innerText = "Password errata.";
        loginBtn.disabled = false;
    }
}

document.getElementById('password').addEventListener('keypress', (e) => { if (e.key === 'Enter') tryLogin(); });

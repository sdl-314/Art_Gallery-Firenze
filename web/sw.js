/**
 * SERVICE WORKER PERSISTENTE CON CACHE DEIFRATA
 */

const CACHE_NAME = 'decrypted-gallery-cache';
let galleryKeyHex = null;

/**
 * Recupera la chiave da IndexedDB (usato dopo il refresh)
 */
async function getKeyFromDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open("GalleryDB", 1);
        request.onsuccess = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("secrets")) { resolve(null); return; }
            const tx = db.transaction("secrets", "readonly");
            const getRequest = tx.objectStore("secrets").get("decryption_key");
            getRequest.onsuccess = () => resolve(getRequest.result);
        };
        request.onerror = () => resolve(null);
    });
}

self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_KEY') {
        galleryKeyHex = event.data.key;
        console.log("Service Worker: Chiave ripristinata dal client.");
    }
});

self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });

async function decryptBuffer(buffer, keyHex) {
    const keyArray = new Uint8Array(keyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const key = await crypto.subtle.importKey("raw", keyArray, "AES-GCM", false, ["decrypt"]);
    const iv = buffer.slice(0, 12);
    const tag = buffer.slice(12, 28);
    const data = buffer.slice(28);
    const combined = new Uint8Array(data.byteLength + tag.byteLength);
    combined.set(new Uint8Array(data));
    combined.set(new Uint8Array(tag), data.byteLength);
    return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, combined);
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const pathname = url.pathname;
    
    // Identifichiamo i file critici
    const protectedFiles = ['main.html', 'style.css', 'script.js', 'data.js', 'galleria.glb'];
    const isAsset = pathname.includes('/assets/') && (pathname.endsWith('.png') || pathname.endsWith('.jpg'));
    const isProtected = protectedFiles.some(f => pathname.endsWith(f)) || isAsset;

    if (isProtected) {
        event.respondWith((async () => {
            // 1. Controlliamo se è già presente nella cache dei file decifrati
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) return cachedResponse;

            // 2. Se non in cache, recuperiamo la chiave
            if (!galleryKeyHex) {
                galleryKeyHex = await getKeyFromDB();
            }

            if (!galleryKeyHex) return fetch(event.request);

            try {
                // 3. Calcoliamo il percorso verso il file cifrato
                const swFolder = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/') + 1);
                const relativePath = pathname.substring(swFolder.length);
                const vaultPath = `vault/${relativePath}.enc`;

                const response = await fetch(vaultPath);
                if (!response.ok) throw new Error();

                const encryptedBuffer = await response.arrayBuffer();
                const decryptedBuffer = await decryptBuffer(encryptedBuffer, galleryKeyHex);

                // Determiniamo il MIME type
                let type = 'application/octet-stream';
                if (pathname.endsWith('.html')) type = 'text/html';
                else if (pathname.endsWith('.css')) type = 'text/css';
                else if (pathname.endsWith('.js')) type = 'application/javascript';
                else if (pathname.endsWith('.png')) type = 'image/png';
                else if (pathname.endsWith('.glb')) type = 'model/gltf-binary';

                const decryptedResponse = new Response(decryptedBuffer, { headers: { 'Content-Type': type } });
                
                // 4. Salviamo nella cache per i refresh futuri
                cache.put(event.request, decryptedResponse.clone());
                
                return decryptedResponse;
            } catch (e) {
                return fetch(event.request);
            }
        })());
    }
});

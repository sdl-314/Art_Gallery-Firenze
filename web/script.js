/**
 * LOGICA PRINCIPALE DELLA MOSTRA
 * Carica l'ambiente 3D da file .glb e gestisce l'interazione.
 */

// --- CONFIGURAZIONE INIZIALE (SPAWN) ---
// Modifica questi valori per cambiare il punto di partenza
const START_POSITION = { x: 8.6, y: 1.7, z: 38 }; // Dove "nasce" l'utente
const START_LOOK_AT = { x: 10, y: 1.7, z: 0 };   // Dove guarda all'inizio

// --- CONFIGURAZIONE LUCI ---
// Definisci qui la posizione delle luci sul soffitto (x, y, z)
const lightPositions = [
    /*{ x: 8.6, y: 8, z: 31 },
    { x: 8.6, y: 9, z: 18 },
    { x: 8.6, y: 9, z: 11 },
    { x: 8.6, y: 9, z: 4 },
    { x: 20, y: 11, z: 31 },
    { x: 20, y: 15, z: 12 },
    { x: 20, y: 15, z: 18 },
    { x: 8.6, y: 11.5, z: -8 },
    { x: 8.6, y: 15.5, z: -17.5 },
    { x: 18, y: 11.5, z: -17.5 },
    { x: -7, y: 11.5, z: -17.5 },
    { x: -24, y: 9, z: 4 },
    { x: -24, y: 9, z: -5 },
	{ x: -24, y: 9, z: -15 },
    { x: 0, y: 8, z: -8 },
    { x: -7.5, y: 8, z: -8 },
    { x: -15, y: 8, z: -8 },
	{ x: -5, y: 8, z: 0 },
    { x: 0, y: 8, z: 12 },
    { x: 0, y: 8, z: 24 },*/

    //{ x: -10, y: 9, z: 5 },
    //{ x: 0, y: 9, z: 15 },
];

// --- VARIABILI GLOBALI ---
let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let raycasterInteract, raycasterCollision; 
const paintings = []; 
let environmentMesh = null; 
let isModalClosing = false; // Flag per evitare che il blocker appaia quando si chiude un modal

init();
animate();

function init() {
    // 1. Setup Scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222226); // CAMBIARE COLORE SFONDO QUI
    scene.fog = new THREE.Fog(0x111111, 0, 60); 

    // 2. Setup Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // IMPOSTAZIONE PUNTO DI PARTENZA
    camera.position.set(START_POSITION.x, START_POSITION.y, START_POSITION.z);
    camera.lookAt(START_LOOK_AT.x, START_LOOK_AT.y, START_LOOK_AT.z);

    // 3. Setup Renderer
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Ombre più morbide
    container.appendChild(renderer.domElement);

    // 4. Luci Ambientali
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Ridotta leggermente per far risaltare i faretti
    scene.add(ambientLight);

    // --- LUCE DI DEBUG (Rimuovi o commenta questa parte nella versione finale) ---
    const debugLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    scene.add(debugLight);
    // -------------------------------------------------------------------------

    // 5. Caricamento Modello 3D (Galleria)
    const loader = new THREE.GLTFLoader();
    loader.load(
        'galleria3.glb', 
        function (gltf) {
            environmentMesh = gltf.scene;
            environmentMesh.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(environmentMesh);
            console.log("Modello galleria caricato!");
        },
        undefined, 
        function (error) {
            console.error('Errore nel caricamento del modello:', error);
        }
    );

    // 6. Creazione Luci Appese
    lightPositions.forEach(pos => {
        createHangingLamp(pos.x, pos.y, pos.z);
    });

    // 7. Caricamento Opere
    if (typeof exhibitionData !== 'undefined') {
        exhibitionData.forEach(data => createPainting(data));
    }

    // 7.1 Caricamento Cartelli (Testi)
    if (typeof signData !== 'undefined') {
        signData.forEach(data => createSign(data));
    }

    // 8. Controlli
    setupControls();

    // 9. Event Listeners
    raycasterInteract = new THREE.Raycaster(); 
    raycasterCollision = new THREE.Raycaster(); 

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onWindowResize);
}

function setupControls() {
    controls = new THREE.PointerLockControls(camera, document.body);
    const blocker = document.getElementById('blocker');

    document.addEventListener('click', (e) => {
        if (e.target.closest('#info-modal') || e.target.closest('button')) return;
        const modalHidden = document.getElementById('info-modal').classList.contains('hidden');
        if (!controls.isLocked && modalHidden) {
            controls.lock();
        }
    });

    blocker.addEventListener('click', () => controls.lock());
    controls.addEventListener('lock', () => blocker.style.display = 'none');
    controls.addEventListener('unlock', () => {
        // Mostra il blocker SOLO se il modal è chiuso
        if (document.getElementById('info-modal').classList.contains('hidden')) {
            blocker.style.display = 'flex';
        }
    });
    scene.add(controls.getObject());
    
    if (window.location.hash.includes('no-overview')) {
        blocker.style.display = 'none';
    }
}

// --- CREAZIONE OGGETTI ---

// Funzione di utilità per suddividere il testo in linee per la canvas
function getLines(ctx, text, maxWidth) {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function createHangingLamp(x, y, z) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, y, z);

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5), new THREE.MeshBasicMaterial({ color: 0x222222 }));
    cord.position.y = -0.75; 
    lampGroup.add(cord);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide }));
    shade.position.y = -1.5;
    lampGroup.add(shade);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), new THREE.MeshBasicMaterial({ color: 0xffdd88 }));
    bulb.position.y = -1.5;
    lampGroup.add(bulb);

    const spotLight = new THREE.SpotLight(0xffeeb1, 1); 
    spotLight.position.set(0, 0, 0);
    spotLight.target.position.set(0, -10, 0); 
    spotLight.angle = Math.PI / 2.5; 
    spotLight.penumbra = 0.5;
    spotLight.decay = 2; // Decadimento più realistico
    spotLight.distance = 25;
    
    // Configurazione ombre
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512; // Risoluzione bilanciata per performance
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.camera.near = 0.1;
    spotLight.shadow.camera.far = 30;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.normalBias = 0.05; // Elimina gli artefatti (linee/onde) sulle pareti
    
    lampGroup.add(spotLight);
    lampGroup.add(spotLight.target);

    scene.add(lampGroup);
}

function createPainting(data) {
    const group = new THREE.Group();
    group.position.set(data.position.x, data.position.y, data.position.z);
    group.rotation.y = data.rotation.y;

    const textureLoader = new THREE.TextureLoader();
    
    // Mesh iniziale (verrà aggiornata all'onLoad)
    const painting = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1), 
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
    );
    painting.castShadow = true; 
    painting.receiveShadow = true; 
    painting.userData = { id: data.id };
    group.add(painting);

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.1, 0.05), 
        new THREE.MeshBasicMaterial({ color: 0x111111 })
    );
    frame.position.z = -0.05;
    frame.castShadow = true;
    group.add(frame);

    // Gestione caricamento immagine
    if (data.image) {
        textureLoader.load(data.image, (texture) => {
            const aspect = texture.image.width / texture.image.height;
            const w = data.width || 2; // Usa la larghezza da data.js o default a 2m
            const h = w / aspect;      // Calcola l'altezza in base al formato reale

            painting.material.map = texture;
            painting.material.color.set(0xffffff);
            painting.material.needsUpdate = true;
            painting.geometry = new THREE.PlaneGeometry(w, h);
            frame.geometry = new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.05);
            
            // Posizionamento dinamico della targhetta (allineata al fondo dell'opera)
            card.position.x = (w / 2) + 0.6;
            card.position.y = -(h / 2) + (card.geometry.parameters.height / 2);
        });
    } else {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = data.color || "#cccccc";
        ctx.fillRect(0, 0, 512, 512);
        
        const w = data.width || 2;
        const h = 2; // Default quadrato per il fallback
        
        painting.material.map = new THREE.CanvasTexture(canvas);
        painting.material.needsUpdate = true;
        painting.geometry = new THREE.PlaneGeometry(w, h);
        frame.geometry = new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.05);
        
        card.position.x = (w / 2) + 0.6;
        card.position.y = -(h / 2) + (card.geometry.parameters.height / 2);
    }

    // --- CREAZIONE CARTIGLIO DINAMICO ---
    const cardCanvas = document.createElement('canvas');
    const cCtx = cardCanvas.getContext('2d');
    const canvasWidth = 600; // Aumentata larghezza per testi grandi
    const padding = 30;
    const maxWidth = canvasWidth - padding * 2;

    // Definizioni Font
    const titleFont = "bold 44px Arial";
    const artistFont = "italic 32px Arial";
    const footerFont = "bold 24px Arial";
    
    // Interlinee
    const titleLineH = 50;
    const artistLineH = 40;

    // Misurazione preliminare per l'altezza (usando gli stessi font del disegno)
    cCtx.font = titleFont;
    const titleLines = getLines(cCtx, data.title, maxWidth);
    cCtx.font = artistFont;
    const artistLines = getLines(cCtx, data.artist, maxWidth);

    // Calcolo altezza totale dinamica
    const canvasHeight = padding * 2 
                       + (titleLines.length * titleLineH) 
                       + (artistLines.length * artistLineH) 
                       + 60; // Spazio extra per il footer
    
    cardCanvas.width = canvasWidth;
    cardCanvas.height = canvasHeight;

    // Disegno sfondo
    cCtx.fillStyle = "white";
    cCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Disegno testi
    cCtx.fillStyle = "black";
    cCtx.textAlign = "left";
    cCtx.textBaseline = "top";
    let y = padding;
    
    cCtx.font = titleFont;
    titleLines.forEach(line => {
        cCtx.fillText(line, padding, y);
        y += titleLineH;
    });

    y += 10; // Spazio tra titolo e artista
    cCtx.font = artistFont;
    cCtx.fillStyle = "#444444";
    artistLines.forEach(line => {
        cCtx.fillText(line, padding, y);
        y += artistLineH;
    });

    y += 15;
    cCtx.fillStyle = "blue";
    cCtx.font = footerFont;
    cCtx.fillText("Clicca per dettagli", padding, y);

    const cardRealWidth = 0.8; // Leggermente più largo per leggibilità
    const cardRealHeight = cardRealWidth * (canvasHeight / canvasWidth);
    
    const card = new THREE.Mesh(
        new THREE.PlaneGeometry(cardRealWidth, cardRealHeight), 
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cardCanvas) })
    );
    card.position.set(1.5, -0.5, 0.01);
    card.userData = { id: data.id };
    group.add(card);

    const spotLight = new THREE.SpotLight(0xffffff, data.lightIntensity || 2); 
    spotLight.position.set(0, 3, 2); 
    spotLight.target = painting; 
    spotLight.angle = data.lightAngle || Math.PI / 6; 
    spotLight.penumbra = 0.5; 
    spotLight.distance = 7;
    spotLight.decay = 2;
    spotLight.castShadow = false;
    
    group.add(spotLight);
    scene.add(group);
    paintings.push(painting, card); 
}

function createSign(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; // Alta risoluzione
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Sfondo (con padding)
    ctx.fillStyle = data.bgColor || "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Testo
    ctx.fillStyle = data.textColor || "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = data.fontSize || 32;
    ctx.font = `bold ${fontSize}px 'Segoe UI', Arial`;

    const lines = data.text.split('\n');
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    const startY = (canvas.height - totalHeight) / 2 + lineHeight / 2;

    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + (i * lineHeight));
    });

    const texture = new THREE.CanvasTexture(canvas);
    const w = data.width || 2;
    const h = w * (canvas.height / canvas.width);
    
    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
    );

    sign.position.set(data.position.x, data.position.y, data.position.z);
    sign.rotation.y = data.rotation.y || 0;
    
    scene.add(sign);
}

// --- LOGICA DI GIOCO ---

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward = true; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
        case 'ArrowDown': case 'KeyS': moveBackward = true; break;
        case 'ArrowRight': case 'KeyD': moveRight = true; break;
    }
}
function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward = false; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
        case 'ArrowDown': case 'KeyS': moveBackward = false; break;
        case 'ArrowRight': case 'KeyD': moveRight = false; break;
        case 'Escape': 
            if (!document.getElementById('info-modal').classList.contains('hidden')) {
                closeModal(); 
            }
            break;
    }
}

function onMouseClick(event) {
    if (!controls.isLocked) return;
    raycasterInteract.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    // Includiamo l'ambiente per bloccare il raggio se c'è un muro davanti
    let targets = [...paintings];
    if (environmentMesh) targets.push(environmentMesh);

    const intersects = raycasterInteract.intersectObjects(targets, true);
    
    if (intersects.length > 0) {
        const firstHit = intersects[0].object;
        
        // Controlliamo se l'oggetto più vicino è effettivamente un quadro o un cartellino
        if (paintings.includes(firstHit)) {
            const data = exhibitionData.find(d => d.id === firstHit.userData.id);
            if (data) openModal(data);
        }
        // Se il firstHit è parte di environmentMesh, non succede nulla (il muro blocca il raggio)
    }
}

function openModal(data) {
    document.getElementById('info-modal').classList.remove('hidden');
    controls.unlock();
    
    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-artist').innerText = data.artist;
    document.getElementById('modal-desc').innerText = data.description;
    document.getElementById('modal-year').innerText = data.year;
    document.getElementById('modal-tech').innerText = data.tech;
    
    const img = document.getElementById('modal-img');
    img.style.backgroundColor = data.color;
    
    // Se l'immagine è definita in data.js, caricala. Altrimenti usa il generatore di placeholder
    if (data.image) {
        img.src = data.image;
    } else {
        img.src = `https://placehold.co/600x400/${data.color.replace('#','')}/ffffff?text=${encodeURIComponent(data.title)}`;
    }
}

window.closeModal = function() {
    document.getElementById('info-modal').classList.add('hidden');
    controls.lock(); // Ricattura il mouse per la navigazione
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- RENDER LOOP ---

function animate() {
    requestAnimationFrame(animate);

    // DEBUG INFO UPDATE
    // Posizione Camera
    /*const cp = camera.position;
    document.getElementById('dbg-cam').innerText = 
        `${cp.x.toFixed(2)}, ${cp.y.toFixed(2)}, ${cp.z.toFixed(2)}`;

    // Raycast per vedere dove guardo
    raycasterInteract.setFromCamera(new THREE.Vector2(0, 0), camera);
    // Controllo collisioni con ambiente e quadri per il debug
    let targets = [];
    if (environmentMesh) targets.push(environmentMesh);
    targets = targets.concat(paintings);
    
    const hits = raycasterInteract.intersectObjects(targets, true);
    if (hits.length > 0) {
        const pt = hits[0].point;
        document.getElementById('dbg-look').innerText = 
            `${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)}`;
    } else {
        document.getElementById('dbg-look').innerText = "---";
    }*/

    if (controls.isLocked) {
        const speed = 0.15; 
        const playerRadius = 0.8; // Raggio leggermente aumentato per evitare di avvicinarsi troppo ai muri

        // Direzioni di movimento relative alla camera
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0; // Mantieni il movimento sul piano orizzontale
        camDir.normalize();

        const camSide = new THREE.Vector3().crossVectors(camDir, camera.up).normalize();

        // 1. CONTROLLO MOVIMENTO AVANTI/INDIETRO
        if (moveForward || moveBackward) {
            const direction = moveForward ? 1 : -1;
            const moveVector = camDir.clone().multiplyScalar(direction);
            
            raycasterCollision.set(camera.position, moveVector);
            const intersects = raycasterCollision.intersectObject(environmentMesh, true);
            
            if (intersects.length === 0 || intersects[0].distance > playerRadius) {
                controls.moveForward(speed * direction);
            }
        }

        // 2. CONTROLLO MOVIMENTO LATERALE (STRAFE)
        if (moveLeft || moveRight) {
            const direction = moveRight ? 1 : -1;
            const moveVector = camSide.clone().multiplyScalar(direction);

            raycasterCollision.set(camera.position, moveVector);
            const intersects = raycasterCollision.intersectObject(environmentMesh, true);

            if (intersects.length === 0 || intersects[0].distance > playerRadius) {
                controls.moveRight(speed * direction);
            }
        }
    }

    renderer.render(scene, camera);
}
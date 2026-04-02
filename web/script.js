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

init();
animate();

function init() {
    // 1. Setup Scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb9dcff); 
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Ridotta leggermente per far risaltare i faretti
    scene.add(ambientLight);

    // --- LUCE DI DEBUG (Rimuovi o commenta questa parte nella versione finale) ---
    const debugLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    scene.add(debugLight);
    // -------------------------------------------------------------------------

    // 5. Caricamento Modello 3D (Galleria)
    const loader = new THREE.GLTFLoader();
    loader.load(
        'galleria.glb', 
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
    
    lampGroup.add(spotLight);
    lampGroup.add(spotLight.target);

    scene.add(lampGroup);
}

function createPainting(data) {
    const group = new THREE.Group();
    group.position.set(data.position.x, data.position.y, data.position.z);
    group.rotation.y = data.rotation.y;

    const canvas = document.createElement('canvas');
    canvas.width = 500; canvas.height = 500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = data.color;
    ctx.fillRect(0, 0, 500, 500);
    ctx.beginPath();
    ctx.arc(250, 250, 100, 0, Math.PI*2);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fill();
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Art " + data.id, 250, 250);

    const texture = new THREE.CanvasTexture(canvas);
    const painting = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.1), new THREE.MeshStandardMaterial({ map: texture }));
    painting.castShadow = true; // Il quadro proietta ombra sulla parete
    painting.receiveShadow = true; // Il quadro riceve luce
    painting.userData = { id: data.id };
    group.add(painting);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 0.05), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    frame.position.z = -0.05;
    frame.castShadow = true;
    group.add(frame);

    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 300; cardCanvas.height = 150;
    const cCtx = cardCanvas.getContext('2d');
    cCtx.fillStyle = "white";
    cCtx.fillRect(0,0,300,150);
    cCtx.fillStyle = "black";
    cCtx.font = "bold 24px Arial";
    cCtx.fillText(data.title, 10, 40);
    cCtx.font = "16px Arial";
    cCtx.fillText(data.artist, 10, 80);
    cCtx.fillStyle = "blue";
    cCtx.fillText("Clicca per info", 10, 130);

    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cardCanvas) }));
    card.position.set(1.5, -0.5, 0.01); // Leggermente staccato per evitare z-fighting
    card.userData = { id: data.id };
    group.add(card);

    const spotLight = new THREE.SpotLight(0xffffff, 2); 
    spotLight.position.set(0, 3, 2); // Alzato un po' per un'inclinazione migliore
    spotLight.target = painting; 
    spotLight.angle = Math.PI / 6; 
    spotLight.penumbra = 0.5; 
    spotLight.distance = 15;
    spotLight.decay = 2;
    
    // Configurazione ombre per il faretto del quadro
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024; // Più alta per i quadri
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 15;
    
    group.add(spotLight);
    scene.add(group);
    paintings.push(painting, card); 
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
    }
}

function onMouseClick(event) {
    if (!controls.isLocked) return;
    raycasterInteract.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycasterInteract.intersectObjects(paintings);
    if (intersects.length > 0) {
        const data = exhibitionData.find(d => d.id === intersects[0].object.userData.id);
        if (data) openModal(data);
    }
}

function openModal(data) {
    controls.unlock();
    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-artist').innerText = data.artist;
    document.getElementById('modal-desc').innerText = data.description;
    document.getElementById('modal-year').innerText = data.year;
    document.getElementById('modal-tech').innerText = data.tech;
    const img = document.getElementById('modal-img');
    img.style.backgroundColor = data.color;
    img.src = `https://placehold.co/600x400/${data.color.replace('#','')}/ffffff?text=${encodeURIComponent(data.title)}`;
    document.getElementById('info-modal').classList.remove('hidden');
}

window.closeModal = function() {
    document.getElementById('info-modal').classList.add('hidden');
    controls.lock(); 
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
    const cp = camera.position;
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
    }

    if (controls.isLocked) {
        const speed = 0.15; 
        const playerRadius = 0.5; 

        const direction = new THREE.Vector3();
        const frontVector = new THREE.Vector3(0, 0, Number(moveBackward) - Number(moveForward));
        const sideVector = new THREE.Vector3(Number(moveLeft) - Number(moveRight), 0, 0);

        direction.subVectors(frontVector, sideVector).normalize();

        if ((moveForward || moveBackward || moveLeft || moveRight) && environmentMesh) {
            const moveVector = direction.clone().applyEuler(camera.rotation);
            moveVector.y = 0; 
            
            raycasterCollision.set(camera.position, moveVector.normalize());
            const intersects = raycasterCollision.intersectObject(environmentMesh, true);

            if (intersects.length === 0 || intersects[0].distance > playerRadius) {
                controls.moveRight(-sideVector.x * speed);
                controls.moveForward(-frontVector.z * speed);
            } 
        }
    }

    renderer.render(scene, camera);
}
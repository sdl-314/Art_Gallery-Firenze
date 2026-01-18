/**
 * LOGICA PRINCIPALE DELLA MOSTRA
 * Genera l'ambiente 3D basandosi sulla planimetria ASCII.
 * Versione Avanzata: Luci Custom (@), Soffitti Realistici, Atmosfera Intima.
 */

// --- CONFIGURAZIONE ---
const WALL_HEIGHT = 9;
const DOOR_HEIGHT = 4;
const WALL_THICKNESS = 1;
const CELL_SIZE = 1;

// Planimetria Aggiornata
// Puoi usare il carattere '@' al posto della lettera della stanza per piazzare una luce appesa.
const planimetriaString = `
                                   CCCCCCC                
                                  CaaaaaaaC               
                                 CaaaaaaaaC              
                                 *aaaa@aaaa*              
                                 *aaaaaaaaa*              
**********************************aaaaaaaaa**********     
*bbbbbbbbb*aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*     
*bbbbbbbbb*aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*     
*bbbbbbbbb*aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*     
*bbbbbbbbb=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*     
*bbbbbbbbb=aaaaaaaa@aaaaaaaaaaaaaaaaaa@aaaaaaaaaaaaa*     
*bbbb@bbbb=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*     
*bbbbbbbbb*aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*     
*bbbbbbbbb*aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*     
*bbbbbbbbb*aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa*     
*bbbbbbbbb*********===************aaaaaaaaa**********     
*bbbbbbbbb*ddddddd*      *ddddddd*aaaaaaaaa*              
*bbbbbbbbb*ddddddd*      *ddddddd*aaaaaaaaa*              
*bbbbbbbbb*ddddddd*      *ddddddd*aaaaaaaaa*              
*bbbb@bbbb*ddddddd=      =ddddddd*aaaa@aaaa*              
*bbbbbbbbb*ddd@ddd=      =ddd@ddd*aaaaaaaaa*              
*bbbbbbbbb*ddddddd=      =ddddddd*aaaaaaaaa*              
*bbbbbbbbb*ddddddd*      *ddddddd*aaaaaaaaa*              
*bbbbbbbbb*ddddddd*      *ddddddd*aaaaaaaaa*              
*bbbbbbbbb*********      *********aaaaaaaaa*              
*bbbbbbbbb*                      ****===******************
*bbbb@bbbb*                      *eeeeeeeee*fffffffffffff* 
*bbbbbbbbb*                      *eeeeeeeee=fffffffffffff* 
*bbbbbbbbb*                      *eeeeeeeee=fffffffffffff* 
*bbbbbbbbb*                      *eeeeeeeee=ffffff@ffffff* 
*bbbbbbbbb*                      *eeeeeeeee*fffffffffffff* 
*bbbbbbbbb*                      *eeee@eeee*fffffffffffff* 
*bbbbbbbbb*                      *eeeeeeeee***************
*bbbbbbbbb*                      *eeeeeeeee*ggggggggggggg* 
*bbbbbbbbb*                      *eeeeeeeee*ggggggggggggg* 
*bbbb@bbbb*                      *eeeeeeeee*ggggggggggggg* 
*bbbbbbbbb*                      *eeeeeeeee*ggggggggggggg* 
*bbbbbbbbb*                      *eeeeeeeee*ggggggggggggg* 
*bbbbbbbbb*                      *eeeeeeeee*gggggg@gggggg* 
*bbbbbbbbb*                      *eeee@eeee*ggggggggggggg* 
*bbbbbbbbb*                      *eeeeeeeee*ggggggggggggg* 
***********                      *eeeeeeeee*ggggggggggggg* 
                                 *eeeeeeeee*ggggggggggggg* 
                                 *eeeeeeeee*ggggggggggggg* 
                                 *eeeeeeeee*ggggggggggggg* 
                                 *eeeeeeeee*ggggggggggggg* 
                                 *eeeeeeeee*gggggg@gggggg* 
                                 *eeee@eeee=ggggggggggggg* 
                                 *eeeeeeeee=ggggggggggggg* 
                                 *eeeeeeeee=ggggggggggggg* 
                                 *eeeeeeeee*ggggggggggggg* 
                                 *eeeeeeeee*ggggggggggggg* 
                                 ****===*************===**
                                 *hhhhhhhhh*iiiiiiiiiiiii* 
                                 =hhhhhhhhh*iiiiiiiiiiiii* 
                                 =hhhhhhhhh*iiiiiiiiiiiii* 
                                 =hhhhhhhhh=iiiiiiiiiiiii* 
                                 *hhhhhhhhh=iiiiiiiiiiiii* 
                                 *hhhh@hhhh=iiiiii@iiiiii* 
                                 *hhhhhhhhh*iiiiiiiiiiiii* 
                                 *hhhhhhhhh*iiiiiiiiiiiii* 
                                 *hhhhhhhhh*iiiiiiiiiiiii* 
                                 *hhhhhhhhh*iiiiiiiiiiiii* 
                                 ****===******************
`;

// Variabili globali
let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let raycaster;
const paintings = [];
let collisionMap = []; 
let mapWidth = 0, mapHeight = 0;
let roomCenters = {};

// Dati per la collisione dell'abside
let apseData = null; // { centerX, centerZ, innerRadius, outerRadius, startZ }

const roomColors = {
    'h': 0xd2b48c, 'i': 0xffcccc, 'g': 0xadd8e6, 'e': 0x98fb98,
    'f': 0xffd700, 'a': 0xe0e0e0, 'b': 0xffb6c1, 'd': 0xdda0dd
};

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb9dcff); // Sfondo scuro per atmosfera
    scene.fog = new THREE.Fog(0x111111, 0, 40);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Ombre più morbide
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Luce ambientale minima
    scene.add(ambientLight);

    parseAndBuildEnvironment();

    controls = new THREE.PointerLockControls(camera, document.body);
    const blocker = document.getElementById('blocker');

    // Gestione click generico per avviare/riprendere (utile se blocker è nascosto o per rientro rapido)
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

    // Flag #no-overview: Nascondi blocker iniziale
    if (window.location.hash.includes('no-overview')) {
        blocker.style.display = 'none';
    }

    if (typeof exhibitionData !== 'undefined') {
        exhibitionData.forEach(data => createPainting(data));
    }

    raycaster = new THREE.Raycaster();
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onWindowResize);
}

function parseAndBuildEnvironment() {
    const rows = planimetriaString.split('\n').filter(r => r.length > 0);
    mapHeight = rows.length;
    mapWidth = rows.reduce((max, r) => Math.max(max, r.length), 0);
    const offsetX = -mapWidth / 2;
    const offsetZ = -mapHeight / 2;

    collisionMap = Array(mapHeight).fill().map(() => Array(mapWidth).fill(false));
    // FIX 1: Muri a "DoubleSide" per bloccare meglio la luce e prevenire "traspirazione"
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0, side: THREE.DoubleSide });
    
    const curvePoints = [];

    for (let z = 0; z < mapHeight; z++) {
        const row = rows[z];
        for (let x = 0; x < row.length; x++) {
            const char = row[x] || ' ';
            const posX = (x + offsetX) * CELL_SIZE;
            const posZ = (z + offsetZ) * CELL_SIZE;

            // --- MURI e PORTE ---
            if (char === '*' || char === '=') {
                const isDoor = (char === '=');
                collisionMap[z][x] = !isDoor; 

                const h = isDoor ? (WALL_HEIGHT - DOOR_HEIGHT) : WALL_HEIGHT;
                const y = isDoor ? (DOOR_HEIGHT + h/2) : (h/2);

                createBlock(WALL_THICKNESS, h, WALL_THICKNESS, posX, y, posZ, wallMat);

                // FIX 2: Aumento sovrapposizione (epsilon) da 0.01 a 0.05 per chiudere fessure di luce
                const nextChar = row[x+1] || ' ';
                if (nextChar === '*' || nextChar === '=' || nextChar === 'C') {
                    createBlock(CELL_SIZE - WALL_THICKNESS + 0.05, h, WALL_THICKNESS, posX + (CELL_SIZE/2), y, posZ, wallMat);
                }
                if (z < mapHeight - 1) {
                    const downChar = rows[z+1][x] || ' ';
                    if (downChar === '*' || downChar === '=' || downChar === 'C') {
                        createBlock(WALL_THICKNESS, h, CELL_SIZE - WALL_THICKNESS + 0.05, posX, y, posZ + (CELL_SIZE/2), wallMat);
                    }
                }
                
                if (x > 0 && (row[x-1] === 'C')) {
                     createBlock(CELL_SIZE - WALL_THICKNESS + 0.05, h, WALL_THICKNESS, posX - (CELL_SIZE/2), y, posZ, wallMat);
                }
                if (z > 0 && (rows[z-1][x] === 'C')) {
                    createBlock(WALL_THICKNESS, h, CELL_SIZE - WALL_THICKNESS + 0.05, posX, y, posZ - (CELL_SIZE/2), wallMat);
                }

                if (isDoor) createFloorTile(posX, posZ, 0xff6666);
            }
            // --- CURVA (C) ---
            else if (char === 'C') {
                collisionMap[z][x] = false; 
                curvePoints.push({x: posX, z: posZ, gridZ: z});
                createFloorTile(posX, posZ, roomColors['a']);
            }
            // --- LUCI APPESE (@) ---
            else if (char === '@') {
                let roomChar = 'a'; 
                if (x > 0 && roomColors[row[x-1]]) roomChar = row[x-1];
                else if (z > 0 && roomColors[rows[z-1][x]]) roomChar = rows[z-1][x];
                
                createFloorTile(posX, posZ, roomColors[roomChar] || 0xffffff);
                createHangingLamp(posX, WALL_HEIGHT, posZ);
            }
            // --- STANZE ---
            else if (char.match(/[a-z]/)) {
                createFloorTile(posX, posZ, roomColors[char] || 0xffffff);

                if (!roomCenters[char]) roomCenters[char] = { sumX: 0, sumZ: 0, count: 0 };
                roomCenters[char].sumX += posX;
                roomCenters[char].sumZ += posZ;
                roomCenters[char].count++;
            }
        }
    }

    // --- SOFFITTO UNIFORME ---
    // Invece di pezzi singoli, facciamo un unico grande soffitto per evitare buchi
    // Aggiungiamo un margine extra per sicurezza (+2)
    const ceilGeo = new THREE.PlaneGeometry(mapWidth * CELL_SIZE + 2, mapHeight * CELL_SIZE + 2);
    // FIX 3: Colore Soffitto cambiato a Bianco (0xffffff) per matchare i muri
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, side: THREE.FrontSide });
    const globalCeiling = new THREE.Mesh(ceilGeo, ceilMat);
    globalCeiling.rotation.x = Math.PI / 2;
    // Centrato e leggermente spostato per coprire i bordi esterni
    globalCeiling.position.set(0, WALL_HEIGHT, 0); 
    globalCeiling.receiveShadow = true;
    globalCeiling.castShadow = true; 
    scene.add(globalCeiling);

    // Costruzione Abside Curvo
    if (curvePoints.length > 0) {
        buildThickApse(curvePoints, wallMat);
        createApseFloor(apseData, roomColors['a']);
    }

    // Setup finale
    Object.keys(roomCenters).forEach(id => {
        const room = roomCenters[id];
        const cx = room.sumX / room.count;
        const cz = room.sumZ / room.count;
        
        if (id === 'h') camera.position.set(cx, 1.7, cz);
    });

    console.log("Environment generated.");
}

// Funzione per creare una lampada appesa con luce soffusa
function createHangingLamp(x, y, z) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, y, z);

    // Filo
    const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.5);
    const cordMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const cord = new THREE.Mesh(cordGeo, cordMat);
    cord.position.y = -0.75; 
    lampGroup.add(cord);

    // Paralume
    const shadeGeo = new THREE.ConeGeometry(0.4, 0.3, 32, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.y = -1.5;
    lampGroup.add(shade);

    // Lampadina 
    const bulbGeo = new THREE.SphereGeometry(0.1, 20, 20);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffdd88 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = -1.5;
    lampGroup.add(bulb);

    // Luce soffusa (SpotLight verso il basso)
    const spotLight = new THREE.SpotLight(0xffeeb1, 1); 
    spotLight.position.set(0, 0, 0);
    spotLight.target.position.set(0, -10, 0); 
    spotLight.angle = Math.PI / 2.5; 
    spotLight.penumbra = 1;
    spotLight.decay = 1.5; 
    spotLight.distance = 20;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.005; 
    
    lampGroup.add(spotLight);
    lampGroup.add(spotLight.target);

    scene.add(lampGroup);
}

function buildThickApse(points, material) {
    // 1. Calcoli geometrici
    let minX = Infinity, maxX = -Infinity, maxZ = -Infinity, maxGridZ = -Infinity;
    points.forEach(p => {
        if(p.x < minX) minX = p.x;
        if(p.x > maxX) maxX = p.x;
        if(p.z > maxZ) maxZ = p.z; 
        if(p.gridZ > maxGridZ) maxGridZ = p.gridZ;
    });

    // Coordinata Z del confine (esattamente tra l'ultima riga C e la prima *)
    const boundaryZ = maxZ + (CELL_SIZE / 2);

    const centerX = (minX + maxX) / 2;
    const outerRadius = ((maxX - minX) / 2) + (CELL_SIZE / 2); 
    const innerRadius = outerRadius - WALL_THICKNESS;

    // Salviamo i dati per la collisione
    apseData = {
        centerX: centerX,
        centerZ: boundaryZ, 
        outerRadius: outerRadius,
        innerRadius: innerRadius,
        boundaryZ: boundaryZ 
    };

    // 2. Creazione Mesh Spessa (Footprint Extrusion)
    const shape = new THREE.Shape();
    shape.moveTo(outerRadius, 0);
    shape.absarc(0, 0, outerRadius, 0, Math.PI, false);
    shape.lineTo(-innerRadius, 0);
    shape.absarc(0, 0, innerRadius, Math.PI, 0, true);
    shape.lineTo(outerRadius, 0);

    const extrudeSettings = {
        depth: WALL_HEIGHT, 
        bevelEnabled: false,
        curveSegments: 64
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(centerX, 0, boundaryZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
}

function createApseFloor(data, color) {
    if (!data) return;
    const geometry = new THREE.CircleGeometry(data.outerRadius, 64, 0, Math.PI);
    const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(data.centerX, 0.02, data.boundaryZ);
    mesh.receiveShadow = true;
    scene.add(mesh);
}

function createBlock(w, h, d, x, y, z, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
}

function createFloorTile(x, z, color) {
    const geo = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE);
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
}

function createCeilingTile(x, z, mat) {
    // Deprecated in favor of global ceiling
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
    painting.castShadow = true;
    painting.userData = { id: data.id };
    group.add(painting);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 0.05), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    frame.position.z = -0.05;
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
    card.position.set(1.5, -0.5, 0); 
    card.userData = { id: data.id };
    group.add(card);

    // --- LUCE DRAMMATICA OPERA ---
    const spotLight = new THREE.SpotLight(0xffffff, 1); // Intensità aumentata a 3
    spotLight.position.set(0, 2, 2); 
    spotLight.target = painting; 
    spotLight.angle = Math.PI / 6; 
    spotLight.penumbra = 0.5; 
    spotLight.decay = 2;
    spotLight.distance = 15;
    spotLight.castShadow = true;
    
    group.add(spotLight);
    scene.add(group);
    paintings.push(painting, card); 
}

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
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(paintings);
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
    controls.lock(); // Torna subito alla vista 3D
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const speed = 0.5;
        const oldPos = controls.getObject().position.clone();

        if (moveForward) controls.moveForward(speed);
        if (moveBackward) controls.moveForward(-speed);
        if (moveRight) controls.moveRight(speed);
        if (moveLeft) controls.moveRight(-speed);

        const pos = controls.getObject().position;
        const offsetX = -mapWidth / 2;
        const offsetZ = -mapHeight / 2;
        const gridX = Math.floor((pos.x / CELL_SIZE) - offsetX);
        const gridZ = Math.floor((pos.z / CELL_SIZE) - offsetZ);
        
        let collision = false;

        if (gridZ < 0 || gridZ >= mapHeight || gridX < 0 || gridX >= mapWidth || collisionMap[gridZ][gridX]) {
            collision = true;
        }

        if (!collision && apseData && pos.z < apseData.boundaryZ) {
            const dx = pos.x - apseData.centerX;
            const dz = pos.z - apseData.centerZ;
            const dist = Math.sqrt(dx*dx + dz*dz);
            const playerBuffer = 0.4; 
            if (dist > apseData.innerRadius - playerBuffer) {
                collision = true;
            }
        }

        if (collision) {
            controls.getObject().position.copy(oldPos);
        }
    }
    renderer.render(scene, camera);
}
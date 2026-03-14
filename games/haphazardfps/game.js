import * as THREE from 'three';

// ── Constants ────────────────────────────────────────────────────────────────
const PLAYER_SPEED     = 5;
const PLAYER_HEIGHT    = 1.7;
const GRAVITY          = 20;
const JUMP_VELOCITY    = 7;
const LOOK_SENSITIVITY = 0.002;
const MAX_AMMO         = 10;

// Corridor 1
const CW     = 4;
const CH     = 3.8;
const CL     = 22;
const DOOR_Z = -CL / 2;          // green door  z = -11

// Corridor 2
const CL2          = 26;
const BLUE_DOOR_Z  = DOOR_Z - CL2;           // z = -37
const C2_CENTER_Z  = DOOR_Z - CL2 / 2;       // z = -24
const HATCH_Z      = C2_CENTER_Z;             // z = -24  (block drops here)
const BLUE_AREA_Z  = DOOR_Z - 4;             // z = -15  (target, behind player)
const BLOCK_SIZE   = 0.8;

// ── Renderer / Scene / Camera ────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);
scene.fog = new THREE.Fog(0x050508, 10, 45);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.set(0, PLAYER_HEIGHT, CL / 2 - 1.5);

// ── Lighting ─────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x606880, 3.0));

// Corridor 1 – ceiling strip lights
for (let i = 0; i < 7; i++) {
    const z = CL / 2 - 1.5 - i * (CL / 6);
    const pl = new THREE.PointLight(0xddeeff, 2.0, 10);
    pl.position.set(0, CH - 0.1, z);
    scene.add(pl);
}
// Corridor 1 – wall fill lights
[-CW / 2 + 0.2, CW / 2 - 0.2].forEach(x =>
    [-6, 0, 6].forEach(z => {
        const pl = new THREE.PointLight(0xaabbff, 1.2, 8);
        pl.position.set(x, 2, z);
        scene.add(pl);
    })
);

const doorGlow = new THREE.PointLight(0x00ff44, 2.5, 9);
doorGlow.position.set(0, 1.8, DOOR_Z + 2);
scene.add(doorGlow);

// Corridor 2 – ceiling strip lights (blue tint)
for (let i = 0; i < 7; i++) {
    const z = DOOR_Z - 1.5 - i * (CL2 / 6);
    const pl = new THREE.PointLight(0xbbddff, 2.0, 10);
    pl.position.set(0, CH - 0.1, z);
    scene.add(pl);
}
// Corridor 2 – wall fill lights
[-CW / 2 + 0.2, CW / 2 - 0.2].forEach(x =>
    [DOOR_Z - 6, DOOR_Z - 13, DOOR_Z - 20].forEach(z => {
        const pl = new THREE.PointLight(0x4488ff, 1.2, 8);
        pl.position.set(x, 2, z);
        scene.add(pl);
    })
);

const blueDoorGlow = new THREE.PointLight(0x0055ff, 2.0, 9);
blueDoorGlow.position.set(0, 1.8, BLUE_DOOR_Z + 2);
scene.add(blueDoorGlow);

// Blue area glow on floor
const blueAreaGlow = new THREE.PointLight(0x0088ff, 2.0, 4);
blueAreaGlow.position.set(0, 0.6, BLUE_AREA_Z);
scene.add(blueAreaGlow);

// ── Materials ─────────────────────────────────────────────────────────────────
const wallMat        = new THREE.MeshLambertMaterial({ color: 0x1c1c2c });
const floorMat       = new THREE.MeshLambertMaterial({ color: 0x111118 });
const ceilMat        = new THREE.MeshLambertMaterial({ color: 0x16161f });
const panelMat       = new THREE.MeshLambertMaterial({ color: 0x222233 });
const doorMat        = new THREE.MeshLambertMaterial({ color: 0x006622, emissive: 0x001a08 });
const btnMat         = new THREE.MeshLambertMaterial({ color: 0x00ff66, emissive: 0x003311 });
const btnShotMat     = new THREE.MeshLambertMaterial({ color: 0xff4400, emissive: 0x330e00 });
const blueDoorMat    = new THREE.MeshLambertMaterial({ color: 0x001e88, emissive: 0x000822 });
const blueBtnMat     = new THREE.MeshLambertMaterial({ color: 0x2288ff, emissive: 0x001144 });
const blueBtnShotMat = new THREE.MeshLambertMaterial({ color: 0xff4400, emissive: 0x330e00 });
const blockMat       = new THREE.MeshLambertMaterial({ color: 0x888899 });
const hatchMat       = new THREE.MeshLambertMaterial({ color: 0x333355 });
const blueAreaMat    = new THREE.MeshLambertMaterial({ color: 0x0055ff, emissive: 0x001144 });

// ── Geometry helper ───────────────────────────────────────────────────────────
function box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = m.castShadow = true;
    scene.add(m);
    return m;
}

// ── Corridor 1 ────────────────────────────────────────────────────────────────
box(CW,   0.2,  CL,  floorMat,    0,    -0.1,       0);
box(CW,   0.2,  CL,  ceilMat,     0,  CH+0.1,       0);
box(0.3,  CH,   CL,  wallMat,  -CW/2,  CH/2,        0);
box(0.3,  CH,   CL,  wallMat,   CW/2,  CH/2,        0);
box(CW,   CH,  0.3,  wallMat,     0,   CH/2,     CL/2);  // back wall

const DOOR_W = 2.6;
const sideW  = (CW - DOOR_W) / 2;
box(sideW, CH, 0.3, wallMat, -(DOOR_W/2 + sideW/2), CH/2, DOOR_Z);
box(sideW, CH, 0.3, wallMat,  (DOOR_W/2 + sideW/2), CH/2, DOOR_Z);

const door = box(DOOR_W, CH, 0.2, doorMat, 0, CH/2, DOOR_Z);

const BTN_Y = 1.35;
const BTN_Z = DOOR_Z + 1.8;

box(0.08, 0.55, 0.55, panelMat, -CW/2 + 0.04, BTN_Y, BTN_Z);
box(0.08, 0.55, 0.55, panelMat,  CW/2 - 0.04, BTN_Y, BTN_Z);

const btnLeft  = box(0.18, 0.28, 0.28, btnMat, -CW/2 + 0.14, BTN_Y, BTN_Z);
const btnRight = box(0.18, 0.28, 0.28, btnMat,  CW/2 - 0.14, BTN_Y, BTN_Z);

const btnGlowL = new THREE.PointLight(0x00ff66, 1.0, 2.5);
btnGlowL.position.set(-CW/2 + 0.5, BTN_Y, BTN_Z);
scene.add(btnGlowL);

const btnGlowR = new THREE.PointLight(0x00ff66, 1.0, 2.5);
btnGlowR.position.set(CW/2 - 0.5, BTN_Y, BTN_Z);
scene.add(btnGlowR);

// ── Corridor 2 ────────────────────────────────────────────────────────────────
box(CW,   0.2, CL2,  floorMat,    0,    -0.1,  C2_CENTER_Z);
box(CW,   0.2, CL2,  ceilMat,     0,  CH+0.1,  C2_CENTER_Z);
box(0.3,  CH,  CL2,  wallMat,  -CW/2,  CH/2,   C2_CENTER_Z);
box(0.3,  CH,  CL2,  wallMat,   CW/2,  CH/2,   C2_CENTER_Z);

const BLUE_DOOR_W = 2.6;
const blueSideW   = (CW - BLUE_DOOR_W) / 2;
box(blueSideW, CH, 0.3, wallMat, -(BLUE_DOOR_W/2 + blueSideW/2), CH/2, BLUE_DOOR_Z);
box(blueSideW, CH, 0.3, wallMat,  (BLUE_DOOR_W/2 + blueSideW/2), CH/2, BLUE_DOOR_Z);

const blueDoor = box(BLUE_DOOR_W, CH, 0.2, blueDoorMat, 0, CH/2, BLUE_DOOR_Z);

const BLUE_BTN_Z = BLUE_DOOR_Z + 1.8;
box(0.08, 0.55, 0.55, panelMat, -CW/2 + 0.04, BTN_Y, BLUE_BTN_Z);
box(0.08, 0.55, 0.55, panelMat,  CW/2 - 0.04, BTN_Y, BLUE_BTN_Z);

const blueBtnLeft  = box(0.18, 0.28, 0.28, blueBtnMat, -CW/2 + 0.14, BTN_Y, BLUE_BTN_Z);
const blueBtnRight = box(0.18, 0.28, 0.28, blueBtnMat,  CW/2 - 0.14, BTN_Y, BLUE_BTN_Z);

const blueBtnGlowL = new THREE.PointLight(0x2288ff, 1.0, 2.5);
blueBtnGlowL.position.set(-CW/2 + 0.5, BTN_Y, BLUE_BTN_Z);
scene.add(blueBtnGlowL);

const blueBtnGlowR = new THREE.PointLight(0x2288ff, 1.0, 2.5);
blueBtnGlowR.position.set(CW/2 - 0.5, BTN_Y, BLUE_BTN_Z);
scene.add(blueBtnGlowR);

// Blue floor target area
box(1.5, 0.02, 1.5, blueAreaMat, 0, 0.01, BLUE_AREA_Z);

// Hatch panel (ceiling marker – disappears when buttons shot)
const hatch = box(BLOCK_SIZE + 0.3, 0.1, BLOCK_SIZE + 0.3, hatchMat, 0, CH - 0.01, HATCH_Z);

// Block – hangs at ceiling level, falls when hatch opens
const blockMesh = box(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, blockMat, 0, CH - BLOCK_SIZE / 2, HATCH_Z);

// ── Game state ────────────────────────────────────────────────────────────────
const greenDoor = { leftShot: false, rightShot: false, open: false };
const blueState = { leftShot: false, rightShot: false, open: false };
const block     = { active: false, onFloor: false, velocityY: 0 };

// ── Player state ──────────────────────────────────────────────────────────────
const player = {
    velocity: new THREE.Vector3(),
    onGround: false,
    ammo: MAX_AMMO,
    yaw: 0,
    pitch: 0,
};

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

// ── Pointer lock ──────────────────────────────────────────────────────────────
const blocker   = document.getElementById('blocker');
const crosshair = document.getElementById('crosshair');
const hud       = document.getElementById('hud');
let locked = false;

blocker.addEventListener('click', () => renderer.domElement.requestPointerLock());
document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === renderer.domElement;
    blocker.classList.toggle('hidden', locked);
    crosshair.classList.toggle('visible', locked);
    hud.classList.toggle('visible', locked);
});
document.addEventListener('mousemove', e => {
    if (!locked) return;
    player.yaw   -= e.movementX * LOOK_SENSITIVITY;
    player.pitch -= e.movementY * LOOK_SENSITIVITY;
    player.pitch  = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, player.pitch));
});

// ── HUD ───────────────────────────────────────────────────────────────────────
const btnCountEl = document.getElementById('score');
const ammoEl     = document.getElementById('ammo');
const statusEl   = document.getElementById('health');

btnCountEl.textContent = 'BUTTONS: 0 / 2';
ammoEl.textContent     = 'AMMO: ' + player.ammo;
statusEl.textContent   = '';

function updateHUD() {
    if (!greenDoor.open) {
        const n = (greenDoor.leftShot ? 1 : 0) + (greenDoor.rightShot ? 1 : 0);
        btnCountEl.textContent = 'BUTTONS: ' + n + ' / 2';
    } else {
        const n = (blueState.leftShot ? 1 : 0) + (blueState.rightShot ? 1 : 0);
        btnCountEl.textContent = 'BUTTONS: ' + n + ' / 2';
    }
}

// ── Shooting ──────────────────────────────────────────────────────────────────
const shootRay    = new THREE.Raycaster();
const muzzleLight = new THREE.PointLight(0xffaa00, 0, 4);
scene.add(muzzleLight);
const hitMarker = document.getElementById('hit-marker');

function showHitMarker() {
    hitMarker.classList.add('active');
    setTimeout(() => hitMarker.classList.remove('active'), 80);
}

function shoot() {
    if (!locked || player.ammo <= 0) return;
    player.ammo--;
    ammoEl.textContent = 'AMMO: ' + player.ammo;
    muzzleLight.intensity = 6;
    setTimeout(() => { muzzleLight.intensity = 0; }, 60);

    shootRay.setFromCamera({ x: 0, y: 0 }, camera);

    const targets = [];
    if (!greenDoor.leftShot)  targets.push(btnLeft);
    if (!greenDoor.rightShot) targets.push(btnRight);
    if (!blueState.leftShot)  targets.push(blueBtnLeft);
    if (!blueState.rightShot) targets.push(blueBtnRight);

    const hits = shootRay.intersectObjects(targets);
    if (hits.length === 0) return;

    showHitMarker();
    const hit = hits[0].object;

    if (hit === btnLeft && !greenDoor.leftShot) {
        greenDoor.leftShot = true;
        btnLeft.material = btnShotMat;
        btnGlowL.color.set(0xff4400);
    } else if (hit === btnRight && !greenDoor.rightShot) {
        greenDoor.rightShot = true;
        btnRight.material = btnShotMat;
        btnGlowR.color.set(0xff4400);
    } else if (hit === blueBtnLeft && !blueState.leftShot) {
        blueState.leftShot = true;
        blueBtnLeft.material = blueBtnShotMat;
        blueBtnGlowL.color.set(0xff4400);
    } else if (hit === blueBtnRight && !blueState.rightShot) {
        blueState.rightShot = true;
        blueBtnRight.material = blueBtnShotMat;
        blueBtnGlowR.color.set(0xff4400);
    }

    if (greenDoor.leftShot && greenDoor.rightShot && !greenDoor.open) {
        greenDoor.open = true;
        doorGlow.color.set(0xffffff);
        flash('DOOR OPEN');
    }

    if (blueState.leftShot && blueState.rightShot && !block.active) {
        block.active = true;
        hatch.visible = false;
        flash('PUSH THE BLOCK TO THE BLUE AREA!');
    }

    updateHUD();
}

function flash(msg) {
    statusEl.textContent = msg;
    setTimeout(() => { statusEl.textContent = ''; }, 2500);
}

document.addEventListener('mousedown', e => { if (e.button === 0) shoot(); });
document.addEventListener('keydown', e => {
    if (e.code === 'KeyR') {
        player.ammo = MAX_AMMO;
        ammoEl.textContent = 'AMMO: ' + player.ammo;
    }
});

// ── Door animations ───────────────────────────────────────────────────────────
function updateGreenDoor(dt) {
    if (!greenDoor.open || !door.visible) return;
    door.position.y += dt * 5;
    if (door.position.y > CH * 1.8) door.visible = false;
}

function updateBlueDoor(dt) {
    if (!blueState.open || !blueDoor.visible) return;
    blueDoor.position.y += dt * 5;
    if (blueDoor.position.y > CH * 1.8) blueDoor.visible = false;
}

// ── Block physics ─────────────────────────────────────────────────────────────
function updateBlock(dt) {
    if (!block.active) return;

    if (!block.onFloor) {
        block.velocityY -= GRAVITY * dt;
        blockMesh.position.y += block.velocityY * dt;
        if (blockMesh.position.y <= BLOCK_SIZE / 2) {
            blockMesh.position.y = BLOCK_SIZE / 2;
            block.velocityY = 0;
            block.onFloor   = true;
        }
    }

    // Constrain block inside corridor 2
    const hw = CW / 2 - BLOCK_SIZE / 2 - 0.05;
    blockMesh.position.x = Math.max(-hw, Math.min(hw, blockMesh.position.x));
    blockMesh.position.z = Math.max(BLUE_DOOR_Z + BLOCK_SIZE / 2 + 0.1,
                           Math.min(DOOR_Z  - BLOCK_SIZE / 2 - 0.1, blockMesh.position.z));

    // Check if block is over the blue target area
    if (block.onFloor && !blueState.open) {
        const dx = Math.abs(blockMesh.position.x - 0);
        const dz = Math.abs(blockMesh.position.z - BLUE_AREA_Z);
        if (dx < 0.75 && dz < 0.75) {
            blueState.open = true;
            blueDoorGlow.color.set(0xffffff);
        }
    }
}

// ── Player ↔ block push ───────────────────────────────────────────────────────
function applyBlockPush() {
    if (!block.active || !block.onFloor) return;

    const dx   = camera.position.x - blockMesh.position.x;
    const dz   = camera.position.z - blockMesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const min  = BLOCK_SIZE / 2 + 0.45;

    if (dist < min && dist > 0.001) {
        const nx = dx / dist;
        const nz = dz / dist;
        const ov = min - dist;
        // Push player out
        camera.position.x += nx * ov;
        camera.position.z += nz * ov;
        // Push block away
        blockMesh.position.x -= nx * ov;
        blockMesh.position.z -= nz * ov;
    }
}

// ── Player movement & physics ─────────────────────────────────────────────────
const _move  = new THREE.Vector3();
const _fwd   = new THREE.Vector3();
const _right = new THREE.Vector3();

function updatePlayer(dt) {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    _fwd.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    _right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

    _move.set(0, 0, 0);
    if (keys['KeyW'] || keys['ArrowUp'])    _move.addScaledVector(_fwd,    1);
    if (keys['KeyS'] || keys['ArrowDown'])  _move.addScaledVector(_fwd,   -1);
    if (keys['KeyA'] || keys['ArrowLeft'])  _move.addScaledVector(_right, -1);
    if (keys['KeyD'] || keys['ArrowRight']) _move.addScaledVector(_right,  1);
    if (_move.lengthSq() > 0) _move.normalize();

    camera.position.x += _move.x * PLAYER_SPEED * dt;
    camera.position.z += _move.z * PLAYER_SPEED * dt;

    if (keys['Space'] && player.onGround) {
        player.velocity.y = JUMP_VELOCITY;
        player.onGround   = false;
    }
    player.velocity.y -= GRAVITY * dt;
    camera.position.y += player.velocity.y * dt;

    if (camera.position.y <= PLAYER_HEIGHT) {
        camera.position.y = PLAYER_HEIGHT;
        player.velocity.y = 0;
        player.onGround   = true;
    }

    // X: corridor walls
    camera.position.x = Math.max(-CW / 2 + 0.45, Math.min(CW / 2 - 0.45, camera.position.x));

    // Z: gated by which doors are open
    let minZ = DOOR_Z + 0.5;
    if (greenDoor.open)  minZ = BLUE_DOOR_Z + 0.5;
    if (blueState.open)  minZ = BLUE_DOOR_Z - 5;
    camera.position.z = Math.max(minZ, Math.min(CL / 2 - 0.45, camera.position.z));

    applyBlockPush();
    muzzleLight.position.copy(camera.position);
}

// ── Resize ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Loop ──────────────────────────────────────────────────────────────────────
let last = performance.now();

function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    const dt  = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (locked) {
        updatePlayer(dt);
        updateGreenDoor(dt);
        updateBlueDoor(dt);
        updateBlock(dt);
    }
    renderer.render(scene, camera);
}

loop();

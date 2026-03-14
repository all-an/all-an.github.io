import * as THREE from 'three';

// ── Constants ────────────────────────────────────────────────────────────────
const PLAYER_SPEED     = 5;
const PLAYER_HEIGHT    = 1.7;
const GRAVITY          = 20;
const JUMP_VELOCITY    = 7;
const LOOK_SENSITIVITY = 0.002;

// Corridor 1
const CW     = 4;
const CH     = 3.8;
const CL     = 22;
const DOOR_Z = -CL / 2;              // green door  z = -11

// Corridor 2
const CL2         = 26;
const BLUE_DOOR_Z = DOOR_Z - CL2;    // z = -37
const C2_CENTER_Z = DOOR_Z - CL2 / 2;
const HATCH_Z     = C2_CENTER_Z;     // z = -24
const BLUE_AREA_Z = DOOR_Z - 4;      // z = -15
const BLOCK_SIZE  = 0.8;

// Corridor 3
const CL3         = 22;
const PINK_DOOR_Z = BLUE_DOOR_Z - CL3;   // z = -59
const C3_CENTER_Z = BLUE_DOOR_Z - CL3 / 2;
const PINK_BTN_Z  = BLUE_DOOR_Z - 2;     // z = -39, right after entering

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

// Corridor 1
for (let i = 0; i < 7; i++) {
    const pl = new THREE.PointLight(0xddeeff, 2.0, 10);
    pl.position.set(0, CH - 0.1, CL / 2 - 1.5 - i * (CL / 6));
    scene.add(pl);
}
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

// Corridor 2
for (let i = 0; i < 7; i++) {
    const pl = new THREE.PointLight(0xbbddff, 2.0, 10);
    pl.position.set(0, CH - 0.1, DOOR_Z - 1.5 - i * (CL2 / 6));
    scene.add(pl);
}
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
const blueAreaGlow = new THREE.PointLight(0x0088ff, 2.0, 4);
blueAreaGlow.position.set(0, 0.6, BLUE_AREA_Z);
scene.add(blueAreaGlow);

// Corridor 3
for (let i = 0; i < 6; i++) {
    const pl = new THREE.PointLight(0xffbbee, 2.0, 10);
    pl.position.set(0, CH - 0.1, BLUE_DOOR_Z - 1.5 - i * (CL3 / 5));
    scene.add(pl);
}
[-CW / 2 + 0.2, CW / 2 - 0.2].forEach(x =>
    [BLUE_DOOR_Z - 5, BLUE_DOOR_Z - 13].forEach(z => {
        const pl = new THREE.PointLight(0xff66cc, 1.2, 8);
        pl.position.set(x, 2, z);
        scene.add(pl);
    })
);
const pinkDoorGlow = new THREE.PointLight(0xff44aa, 2.0, 9);
pinkDoorGlow.position.set(0, 1.8, PINK_DOOR_Z + 2);
scene.add(pinkDoorGlow);
const pinkBtnGlow = new THREE.PointLight(0xff44aa, 1.2, 3);
pinkBtnGlow.position.set(-CW / 2 + 0.5, 1.35, PINK_BTN_Z);
scene.add(pinkBtnGlow);

// ── Materials ─────────────────────────────────────────────────────────────────
const wallMat          = new THREE.MeshLambertMaterial({ color: 0x1c1c2c });
const floorMat         = new THREE.MeshLambertMaterial({ color: 0x111118 });
const ceilMat          = new THREE.MeshLambertMaterial({ color: 0x16161f });
const panelMat         = new THREE.MeshLambertMaterial({ color: 0x222233 });
const doorMat          = new THREE.MeshLambertMaterial({ color: 0x006622, emissive: 0x001a08 });
const btnMat           = new THREE.MeshLambertMaterial({ color: 0x00ff66, emissive: 0x003311 });
const btnShotMat       = new THREE.MeshLambertMaterial({ color: 0xff4400, emissive: 0x330e00 });
const blueDoorMat      = new THREE.MeshLambertMaterial({ color: 0x001e88, emissive: 0x000822 });
const blueBtnMat       = new THREE.MeshLambertMaterial({ color: 0x2288ff, emissive: 0x001144 });
const blueBtnShotMat   = new THREE.MeshLambertMaterial({ color: 0xff4400, emissive: 0x330e00 });
const blockMat         = new THREE.MeshLambertMaterial({ color: 0x888899 });
const hatchMat         = new THREE.MeshLambertMaterial({ color: 0x333355 });
const blueAreaMat      = new THREE.MeshLambertMaterial({ color: 0x0055ff, emissive: 0x001144 });
const pinkDoorMat      = new THREE.MeshLambertMaterial({ color: 0x881155, emissive: 0x220010 });
const pinkBtnMat       = new THREE.MeshLambertMaterial({ color: 0xff44aa, emissive: 0x441133 });
const pinkBtnInactMat  = new THREE.MeshLambertMaterial({ color: 0x442233, emissive: 0x110008 });

// ── Geometry helper ───────────────────────────────────────────────────────────
function box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = m.castShadow = true;
    scene.add(m);
    return m;
}

// ── Corridor 1 ────────────────────────────────────────────────────────────────
box(CW, 0.2, CL, floorMat,  0,    -0.1,    0);
box(CW, 0.2, CL, ceilMat,   0,  CH+0.1,    0);
box(0.3, CH, CL, wallMat, -CW/2, CH/2,     0);
box(0.3, CH, CL, wallMat,  CW/2, CH/2,     0);
box(CW,  CH, 0.3, wallMat,  0,   CH/2,  CL/2);

const DOOR_W = 2.6;
const sideW  = (CW - DOOR_W) / 2;
box(sideW, CH, 0.3, wallMat, -(DOOR_W/2 + sideW/2), CH/2, DOOR_Z);
box(sideW, CH, 0.3, wallMat,  (DOOR_W/2 + sideW/2), CH/2, DOOR_Z);
const door = box(DOOR_W, CH, 0.2, doorMat, 0, CH/2, DOOR_Z);

const BTN_Y = 1.35;
const BTN_Z = DOOR_Z + 1.8;
box(0.08, 0.55, 0.55, panelMat, -CW/2+0.04, BTN_Y, BTN_Z);
box(0.08, 0.55, 0.55, panelMat,  CW/2-0.04, BTN_Y, BTN_Z);
const btnLeft  = box(0.18, 0.28, 0.28, btnMat, -CW/2+0.14, BTN_Y, BTN_Z);
const btnRight = box(0.18, 0.28, 0.28, btnMat,  CW/2-0.14, BTN_Y, BTN_Z);
const btnGlowL = new THREE.PointLight(0x00ff66, 1.0, 2.5);
btnGlowL.position.set(-CW/2+0.5, BTN_Y, BTN_Z); scene.add(btnGlowL);
const btnGlowR = new THREE.PointLight(0x00ff66, 1.0, 2.5);
btnGlowR.position.set(CW/2-0.5, BTN_Y, BTN_Z); scene.add(btnGlowR);

// ── Corridor 2 ────────────────────────────────────────────────────────────────
box(CW, 0.2, CL2, floorMat,  0,    -0.1,  C2_CENTER_Z);
box(CW, 0.2, CL2, ceilMat,   0,  CH+0.1,  C2_CENTER_Z);
box(0.3, CH, CL2, wallMat, -CW/2, CH/2,   C2_CENTER_Z);
box(0.3, CH, CL2, wallMat,  CW/2, CH/2,   C2_CENTER_Z);

const BLUE_DOOR_W = 2.6;
const blueSideW   = (CW - BLUE_DOOR_W) / 2;
box(blueSideW, CH, 0.3, wallMat, -(BLUE_DOOR_W/2+blueSideW/2), CH/2, BLUE_DOOR_Z);
box(blueSideW, CH, 0.3, wallMat,  (BLUE_DOOR_W/2+blueSideW/2), CH/2, BLUE_DOOR_Z);
const blueDoor = box(BLUE_DOOR_W, CH, 0.2, blueDoorMat, 0, CH/2, BLUE_DOOR_Z);

const BLUE_BTN_Z = BLUE_DOOR_Z + 1.8;
box(0.08, 0.55, 0.55, panelMat, -CW/2+0.04, BTN_Y, BLUE_BTN_Z);
box(0.08, 0.55, 0.55, panelMat,  CW/2-0.04, BTN_Y, BLUE_BTN_Z);
const blueBtnLeft  = box(0.18, 0.28, 0.28, blueBtnMat, -CW/2+0.14, BTN_Y, BLUE_BTN_Z);
const blueBtnRight = box(0.18, 0.28, 0.28, blueBtnMat,  CW/2-0.14, BTN_Y, BLUE_BTN_Z);
const blueBtnGlowL = new THREE.PointLight(0x2288ff, 1.0, 2.5);
blueBtnGlowL.position.set(-CW/2+0.5, BTN_Y, BLUE_BTN_Z); scene.add(blueBtnGlowL);
const blueBtnGlowR = new THREE.PointLight(0x2288ff, 1.0, 2.5);
blueBtnGlowR.position.set(CW/2-0.5, BTN_Y, BLUE_BTN_Z); scene.add(blueBtnGlowR);

box(1.5, 0.02, 1.5, blueAreaMat, 0, 0.01, BLUE_AREA_Z);
const hatch     = box(BLOCK_SIZE+0.3, 0.1, BLOCK_SIZE+0.3, hatchMat, 0, CH-0.01, HATCH_Z);
const blockMesh = box(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, blockMat, 0, CH-BLOCK_SIZE/2, HATCH_Z);

// ── Corridor 3 ────────────────────────────────────────────────────────────────
box(CW, 0.2, CL3, floorMat,  0,    -0.1,  C3_CENTER_Z);
box(CW, 0.2, CL3, ceilMat,   0,  CH+0.1,  C3_CENTER_Z);
box(0.3, CH, CL3, wallMat, -CW/2, CH/2,   C3_CENTER_Z);
box(0.3, CH, CL3, wallMat,  CW/2, CH/2,   C3_CENTER_Z);

const PINK_DOOR_W = 2.6;
const pinkSideW   = (CW - PINK_DOOR_W) / 2;
box(pinkSideW, CH, 0.3, wallMat, -(PINK_DOOR_W/2+pinkSideW/2), CH/2, PINK_DOOR_Z);
box(pinkSideW, CH, 0.3, wallMat,  (PINK_DOOR_W/2+pinkSideW/2), CH/2, PINK_DOOR_Z);
const pinkDoor = box(PINK_DOOR_W, CH, 0.2, pinkDoorMat, 0, CH/2, PINK_DOOR_Z);

// Pink button — on the left wall, just inside corridor 3
box(0.08, 0.55, 0.55, panelMat, -CW/2+0.04, BTN_Y, PINK_BTN_Z);
const pinkBtn = box(0.18, 0.28, 0.28, pinkBtnMat, -CW/2+0.14, BTN_Y, PINK_BTN_Z);

// ── Game state ────────────────────────────────────────────────────────────────
const greenDoor  = { leftShot: false, rightShot: false, open: false };
const blueState  = { leftShot: false, rightShot: false, open: false };
const block      = { active: false, onFloor: false, velocityY: 0 };
const pinkState  = { active: true, doorOpen: false, cycleShots: 0 };
let   blueButtonsReset = false; // true after pink button resets blue buttons

let playerMinZ = DOOR_Z + 0.5;
let playerMaxZ = CL / 2 - 0.45;

// ── Player state ──────────────────────────────────────────────────────────────
const player = {
    velocity: new THREE.Vector3(),
    onGround: false,
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
    if (!locked) return;
    muzzleLight.intensity = 6;
    setTimeout(() => { muzzleLight.intensity = 0; }, 60);

    shootRay.setFromCamera({ x: 0, y: 0 }, camera);

    const targets = [];
    if (!greenDoor.leftShot)              targets.push(btnLeft);
    if (!greenDoor.rightShot)             targets.push(btnRight);
    if (!blueState.leftShot)              targets.push(blueBtnLeft);
    if (!blueState.rightShot)             targets.push(blueBtnRight);
    if (pinkState.active && !pinkState.doorOpen) targets.push(pinkBtn);

    const hits = shootRay.intersectObjects(targets);
    if (hits.length === 0) return;

    showHitMarker();
    const hit = hits[0].object;

    // ── Green buttons ──
    if (hit === btnLeft && !greenDoor.leftShot) {
        greenDoor.leftShot = true;
        btnLeft.material = btnShotMat;
        btnGlowL.color.set(0xff4400);
    } else if (hit === btnRight && !greenDoor.rightShot) {
        greenDoor.rightShot = true;
        btnRight.material = btnShotMat;
        btnGlowR.color.set(0xff4400);
    }
    if (greenDoor.leftShot && greenDoor.rightShot && !greenDoor.open) {
        greenDoor.open = true;
        doorGlow.color.set(0xffffff);
        playerMinZ = BLUE_DOOR_Z + 0.5;
    }

    // ── Blue buttons ──
    if (hit === blueBtnLeft && !blueState.leftShot) {
        blueState.leftShot = true;
        blueBtnLeft.material = blueBtnShotMat;
        blueBtnGlowL.color.set(0xff4400);
    } else if (hit === blueBtnRight && !blueState.rightShot) {
        blueState.rightShot = true;
        blueBtnRight.material = blueBtnShotMat;
        blueBtnGlowR.color.set(0xff4400);
    }
    if (blueState.leftShot && blueState.rightShot) {
        // First cycle: drop the block
        if (!block.active && !blueButtonsReset) {
            block.active  = true;
            hatch.visible = false;
        }
        // Second cycle (after pink button reset): reactivate pink button + close blue door
        if (blueButtonsReset) {
            blueButtonsReset = false;
            pinkState.active = true;
            pinkBtn.material = pinkBtnMat;
            pinkBtnGlow.intensity = 1.2;

            // Close blue door
            blueState.open = false;
            blueDoor.visible = true;
            blueDoor.position.y = CH / 2;
            blueDoorGlow.color.set(0x0055ff);

            if (camera.position.z < BLUE_DOOR_Z) {
                // Player is in pink corridor — wall them off from behind
                playerMaxZ = BLUE_DOOR_Z - 0.5;
            } else {
                // Player is in blue corridor — block them from advancing
                playerMinZ = BLUE_DOOR_Z + 0.5;
            }
        }
    }

    // ── Pink button ──
    if (hit === pinkBtn && pinkState.active) {
        pinkState.cycleShots++;
        pinkState.active  = false;
        pinkBtn.material  = pinkBtnInactMat;
        pinkBtnGlow.intensity = 0;

        if (pinkState.cycleShots === 1) {
            // Put block back to roof first, before any door state changes
            block.active    = false;
            block.onFloor   = false;
            block.velocityY = 0;
            blockMesh.position.set(0, CH - BLOCK_SIZE / 2, HATCH_Z);
            hatch.visible = true;

            // Reset blue buttons
            blueState.leftShot  = false;
            blueState.rightShot = false;
            blueBtnLeft.material  = blueBtnMat;
            blueBtnRight.material = blueBtnMat;
            blueBtnGlowL.color.set(0x2288ff);
            blueBtnGlowR.color.set(0x2288ff);
            blueButtonsReset = true;
        } else {
            // Open pink door
            pinkState.doorOpen = true;
            pinkDoorGlow.color.set(0xffffff);
            playerMinZ = PINK_DOOR_Z - 5;
        }
    }

}

document.addEventListener('mousedown', e => { if (e.button === 0) shoot(); });

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

function updatePinkDoor(dt) {
    if (!pinkState.doorOpen || !pinkDoor.visible) return;
    pinkDoor.position.y += dt * 5;
    if (pinkDoor.position.y > CH * 1.8) pinkDoor.visible = false;
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

    const hw = CW / 2 - BLOCK_SIZE / 2 - 0.05;
    blockMesh.position.x = Math.max(-hw, Math.min(hw, blockMesh.position.x));
    blockMesh.position.z = Math.max(BLUE_DOOR_Z + BLOCK_SIZE/2 + 0.1,
                           Math.min(DOOR_Z - BLOCK_SIZE/2 - 0.1, blockMesh.position.z));

    if (block.onFloor && !blueState.open) {
        if (Math.abs(blockMesh.position.x) < 0.75 &&
            Math.abs(blockMesh.position.z - BLUE_AREA_Z) < 0.75) {
            blueState.open = true;
            blueDoorGlow.color.set(0xffffff);
            playerMinZ = PINK_DOOR_Z + 0.5;
        }
    }
}

// ── Player ↔ block push (AABB) ────────────────────────────────────────────────
function applyBlockPush() {
    if (!block.active || !block.onFloor) return;

    const r  = 0.45;
    const h  = BLOCK_SIZE / 2;
    const dx = camera.position.x - blockMesh.position.x;
    const dz = camera.position.z - blockMesh.position.z;
    const ox = (r + h) - Math.abs(dx);
    const oz = (r + h) - Math.abs(dz);

    if (ox <= 0 || oz <= 0) return;

    if (ox < oz) {
        camera.position.x += Math.sign(dx) * ox;
    } else {
        const sign = Math.sign(dz) || 1;
        camera.position.z  += sign * oz;
        blockMesh.position.z -= sign * oz;
        const hw = CW / 2 - BLOCK_SIZE / 2 - 0.05;
        blockMesh.position.x = Math.max(-hw, Math.min(hw, blockMesh.position.x));
        blockMesh.position.z = Math.max(BLUE_DOOR_Z + BLOCK_SIZE/2 + 0.1,
                               Math.min(DOOR_Z - BLOCK_SIZE/2 - 0.1, blockMesh.position.z));
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

    camera.position.x = Math.max(-CW/2 + 0.45, Math.min(CW/2 - 0.45, camera.position.x));

    camera.position.z = Math.max(playerMinZ, Math.min(playerMaxZ, camera.position.z));

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
        updatePinkDoor(dt);
        updateBlock(dt);
    }
    renderer.render(scene, camera);
}

loop();

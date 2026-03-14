import * as THREE from 'three';

// ── Constants ──────────────────────────────────────────────────────────────
const PLAYER_SPEED     = 8;
const PLAYER_HEIGHT    = 1.7;
const GRAVITY          = 20;
const JUMP_VELOCITY    = 8;
const LOOK_SENSITIVITY = 0.002;
const MAX_AMMO         = 30;
const ENEMY_SPEED      = 3;
const ENEMY_COUNT      = 8;
const MAP_SIZE         = 40;

// ── Scene setup ───────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0x111111, 15, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, PLAYER_HEIGHT, 0);

// ── Lighting ──────────────────────────────────────────────────────────────
const ambient = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambient);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
scene.add(sunLight);

// Ceiling lights
[-10, 0, 10].forEach(x => [-10, 0, 10].forEach(z => {
    const pl = new THREE.PointLight(0x00ff88, 0.4, 20);
    pl.position.set(x, 5, z);
    scene.add(pl);
}));

// ── Map geometry ──────────────────────────────────────────────────────────
const floorMat  = new THREE.MeshLambertMaterial({ color: 0x222222 });
const wallMat   = new THREE.MeshLambertMaterial({ color: 0x333344 });
const ceilMat   = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });
const crateMat  = new THREE.MeshLambertMaterial({ color: 0x5c4033 });

function box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    m.castShadow = true;
    scene.add(m);
    return m;
}

// Floor & ceiling
box(MAP_SIZE, 0.2, MAP_SIZE, floorMat, 0, -0.1, 0);
box(MAP_SIZE, 0.2, MAP_SIZE, ceilMat,  0, 6.1, 0);

// Outer walls
const H = 6, HS = MAP_SIZE / 2;
box(MAP_SIZE, H, 0.5, wallMat,  0,   H/2, -HS);
box(MAP_SIZE, H, 0.5, wallMat,  0,   H/2,  HS);
box(0.5, H, MAP_SIZE, wallMat, -HS,  H/2,   0);
box(0.5, H, MAP_SIZE, wallMat,  HS,  H/2,   0);

// Inner obstacles (crates & pillars)
const obstacles = [];
const cratePositions = [
    [5, 1, 5], [-5, 1, 5], [5, 1, -5], [-5, 1, -5],
    [12, 1, 0], [-12, 1, 0], [0, 1, 12], [0, 1, -12],
    [8, 1, -8], [-8, 1, 8], [15, 2, 15], [-15, 2, -15],
    [10, 0.5, -15], [-10, 0.5, 15],
];
cratePositions.forEach(([x, y, z]) => {
    const size = 1 + Math.random();
    obstacles.push(box(size, size * 2, size, crateMat, x, y, z));
});

// ── Player state ──────────────────────────────────────────────────────────
const player = {
    velocity: new THREE.Vector3(),
    onGround: false,
    health: 100,
    score: 0,
    ammo: MAX_AMMO,
    yaw: 0,
    pitch: 0,
};

// ── Input ─────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

// ── Pointer lock ──────────────────────────────────────────────────────────
const blocker     = document.getElementById('blocker');
const crosshair   = document.getElementById('crosshair');
const hud         = document.getElementById('hud');
let locked = false;

blocker.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

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

// ── Shooting ──────────────────────────────────────────────────────────────
const raycaster  = new THREE.Raycaster();
const hitMarker  = document.getElementById('hit-marker');
const scoreEl    = document.getElementById('score');
const ammoEl     = document.getElementById('ammo');
const healthEl   = document.getElementById('health');

function showHitMarker() {
    hitMarker.classList.add('active');
    setTimeout(() => hitMarker.classList.remove('active'), 80);
}

function shoot() {
    if (!locked || player.ammo <= 0) return;
    player.ammo--;
    ammoEl.textContent = 'AMMO: ' + player.ammo;

    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const hits = raycaster.intersectObjects(enemies.map(e => e.mesh));
    if (hits.length > 0) {
        const enemy = enemies.find(e => e.mesh === hits[0].object);
        if (enemy) killEnemy(enemy);
        showHitMarker();
    }

    // Muzzle flash
    muzzleFlash();
}

document.addEventListener('mousedown', e => { if (e.button === 0) shoot(); });
document.addEventListener('keydown', e => { if (e.code === 'KeyR') reload(); });

function reload() {
    player.ammo = MAX_AMMO;
    ammoEl.textContent = 'AMMO: ' + player.ammo;
}

// ── Muzzle flash ──────────────────────────────────────────────────────────
const muzzleLight = new THREE.PointLight(0xffaa00, 0, 3);
scene.add(muzzleLight);

function muzzleFlash() {
    muzzleLight.intensity = 5;
    setTimeout(() => { muzzleLight.intensity = 0; }, 60);
}

// ── Enemies ───────────────────────────────────────────────────────────────
const enemyMat  = new THREE.MeshLambertMaterial({ color: 0xff2222 });
const eyeMat    = new THREE.MeshLambertMaterial({ color: 0xffff00 });
const enemies   = [];

function spawnEnemy() {
    const group = new THREE.Group();

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 0.4), enemyMat);
    body.position.y = 0.7;
    group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), enemyMat);
    head.position.y = 1.65;
    group.add(head);

    // Eyes
    [-0.12, 0.12].forEach(dx => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), eyeMat);
        eye.position.set(dx, 1.65, 0.26);
        group.add(eye);
    });

    // Random spawn along edges, away from player start
    let x, z;
    do {
        x = (Math.random() - 0.5) * (MAP_SIZE - 4);
        z = (Math.random() - 0.5) * (MAP_SIZE - 4);
    } while (Math.sqrt(x * x + z * z) < 8);

    group.position.set(x, 0, z);

    const mesh = body; // use body for raycasting
    const enemy = { group, mesh: body, alive: true };
    enemies.push(enemy);
    scene.add(group);
    return enemy;
}

for (let i = 0; i < ENEMY_COUNT; i++) spawnEnemy();

function killEnemy(enemy) {
    enemy.alive = false;
    scene.remove(enemy.group);
    enemies.splice(enemies.indexOf(enemy), 1);
    player.score += 100;
    scoreEl.textContent = 'SCORE: ' + player.score;

    // Respawn after delay
    setTimeout(spawnEnemy, 3000);
}

// ── Collision (simple AABB sphere) ────────────────────────────────────────
function resolveCollisions() {
    const r = 0.4;
    const pos = camera.position;
    obstacles.forEach(obs => {
        const b = new THREE.Box3().setFromObject(obs);
        b.expandByScalar(r);
        if (b.containsPoint(pos)) {
            const center = new THREE.Vector3();
            b.getCenter(center);
            const dx = pos.x - center.x;
            const dz = pos.z - center.z;
            if (Math.abs(dx) > Math.abs(dz)) {
                pos.x = center.x + Math.sign(dx) * (b.max.x - b.min.x) / 2;
            } else {
                pos.z = center.z + Math.sign(dz) * (b.max.z - b.min.z) / 2;
            }
        }
    });
    // Outer walls
    const limit = MAP_SIZE / 2 - 0.6;
    pos.x = Math.max(-limit, Math.min(limit, pos.x));
    pos.z = Math.max(-limit, Math.min(limit, pos.z));
}

// ── Enemy AI ──────────────────────────────────────────────────────────────
const _enemyDir = new THREE.Vector3();

function updateEnemies(dt) {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        _enemyDir.set(
            camera.position.x - enemy.group.position.x,
            0,
            camera.position.z - enemy.group.position.z
        );
        const dist = _enemyDir.length();
        if (dist < 0.01) return;
        _enemyDir.normalize();
        enemy.group.position.addScaledVector(_enemyDir, ENEMY_SPEED * dt);
        enemy.group.lookAt(camera.position.x, enemy.group.position.y, camera.position.z);

        // Damage player on contact
        if (dist < 1.2) {
            player.health -= 10 * dt;
            player.health = Math.max(0, player.health);
            healthEl.textContent = 'HP: ' + Math.ceil(player.health);
        }
    });
}

// ── Movement ──────────────────────────────────────────────────────────────
const _move = new THREE.Vector3();
const _fwd  = new THREE.Vector3();
const _right = new THREE.Vector3();

function updatePlayer(dt) {
    // Camera rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    // Horizontal movement
    _fwd.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    _right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

    _move.set(0, 0, 0);
    if (keys['KeyW'] || keys['ArrowUp'])    _move.addScaledVector(_fwd,    1);
    if (keys['KeyS'] || keys['ArrowDown'])  _move.addScaledVector(_fwd,   -1);
    if (keys['KeyA'] || keys['ArrowLeft'])  _move.addScaledVector(_right, -1);
    if (keys['KeyD'] || keys['ArrowRight']) _move.addScaledVector(_right,  1);

    if (_move.lengthSq() > 0) _move.normalize();
    _move.multiplyScalar(PLAYER_SPEED * dt);

    camera.position.x += _move.x;
    camera.position.z += _move.z;

    // Gravity & jump
    if (keys['Space'] && player.onGround) {
        player.velocity.y = JUMP_VELOCITY;
        player.onGround = false;
    }
    player.velocity.y -= GRAVITY * dt;
    camera.position.y += player.velocity.y * dt;

    if (camera.position.y <= PLAYER_HEIGHT) {
        camera.position.y = PLAYER_HEIGHT;
        player.velocity.y = 0;
        player.onGround = true;
    }

    // Muzzle light follows camera
    muzzleLight.position.copy(camera.position);
    resolveCollisions();
}

// ── Resize ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Loop ──────────────────────────────────────────────────────────────────
let last = performance.now();

function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    const dt  = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (locked) {
        updatePlayer(dt);
        updateEnemies(dt);
    }
    renderer.render(scene, camera);
}

loop();

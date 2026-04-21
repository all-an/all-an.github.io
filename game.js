import * as THREE from 'three';
import { startAmbient } from './ambient-sound.js';

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

// Corridor 4
const CL4           = 20;
const YELLOW_DOOR_Z = PINK_DOOR_Z - CL4;    // z = -79
const C4_CENTER_Z   = PINK_DOOR_Z - CL4 / 2; // z = -69

// Corridor 5
const CL5         = 24;
const TEAL_DOOR_Z = YELLOW_DOOR_Z - CL5;    // z = -103
const C5_CENTER_Z = YELLOW_DOOR_Z - CL5 / 2; // z = -91

// Corridor 6
const CL6           = 20;
const ORANGE_DOOR_Z = TEAL_DOOR_Z - CL6;    // z = -123
const C6_CENTER_Z   = TEAL_DOOR_Z - CL6 / 2; // z = -113

// Corridor 7
const CL7           = 22;
const PURPLE_DOOR_Z = ORANGE_DOOR_Z - CL7;    // z = -145
const C7_CENTER_Z   = ORANGE_DOOR_Z - CL7 / 2; // z = -134
const C7_HOLE_Z     = PURPLE_DOOR_Z + 3;        // hole center z = -142
const C7_HOLE_S     = 1.8;                       // square hole side size
const RTOP_W        = CW + 0.6;                  // rooftop width including wall tops
const RTOP_Y        = CH + 0.225;                // slab center, slightly above the ceiling
const RTOP_TOP_Y    = CH + 0.25;                 // walkable top face of the rooftop slab
const RTOP_SIDE_W   = (RTOP_W - C7_HOLE_S) / 2;  // side strip width beside the hole
const OUTSIDE_GRID_STEP = 4;

// Corridor 6 crush section (between the two side lights at TEAL_DOOR_Z-5 and TEAL_DOOR_Z-13)
const C6_CRUSH_Z1     = TEAL_DOOR_Z - 5;
const C6_CRUSH_Z2     = TEAL_DOOR_Z - 13;
const C6_CRUSH_CTRZ   = (C6_CRUSH_Z1 + C6_CRUSH_Z2) / 2;
const C6_CRUSH_LEN    = C6_CRUSH_Z1 - C6_CRUSH_Z2;  // 8 units

// ── Renderer / Scene / Camera ────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);
scene.fog = new THREE.Fog(0x050508, 10, 55);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, PLAYER_HEIGHT, CL / 2 - 1.5);

const exteriorGridRay = new THREE.Raycaster();
exteriorGridRay.params.Points.threshold = 0.35;
const exteriorGridIds = [];

// Per-corridor scene groups for visibility culling.
// Only the active corridor and its immediate neighbours are rendered each frame.
const corridorGroups = [0,1,2,3,4,5,6].map(() => { const g = new THREE.Group(); scene.add(g); return g; });
let _cg = null; // active group — geometry/lights route here during scene setup

// ── Lighting ─────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x606880, 3.0));

// Corridor 1 — 2 ceiling strips (replaces 7 ceiling + 6 wall fill lights)
[-CL / 4, CL / 4].forEach(dz => {
    const pl = new THREE.PointLight(0xddeeff, 4.0, 22);
    pl.position.set(0, CH - 0.1, dz);
    corridorGroups[0].add(pl);
});
const doorGlow = new THREE.PointLight(0x00ff44, 2.5, 9);
doorGlow.position.set(0, 1.8, DOOR_Z + 2);
corridorGroups[0].add(doorGlow);

// Corridor 2 — 2 ceiling strips (replaces 7 ceiling + 6 wall fill lights)
[-CL2 / 4, CL2 / 4].forEach(dz => {
    const pl = new THREE.PointLight(0xbbddff, 4.0, 22);
    pl.position.set(0, CH - 0.1, C2_CENTER_Z + dz);
    corridorGroups[1].add(pl);
});
const blueDoorGlow = new THREE.PointLight(0x0055ff, 2.0, 9);
blueDoorGlow.position.set(0, 1.8, BLUE_DOOR_Z + 2);
corridorGroups[1].add(blueDoorGlow);
const blueAreaGlow = new THREE.PointLight(0x0088ff, 2.0, 4);
blueAreaGlow.position.set(0, 0.6, BLUE_AREA_Z);
corridorGroups[1].add(blueAreaGlow);

// Corridor 3 — 2 ceiling strips (replaces 6 ceiling + 4 wall fill lights)
[-CL3 / 4, CL3 / 4].forEach(dz => {
    const pl = new THREE.PointLight(0xffbbee, 4.0, 22);
    pl.position.set(0, CH - 0.1, C3_CENTER_Z + dz);
    corridorGroups[2].add(pl);
});
const pinkDoorGlow = new THREE.PointLight(0xff44aa, 2.0, 9);
pinkDoorGlow.position.set(0, 1.8, PINK_DOOR_Z + 2);
corridorGroups[2].add(pinkDoorGlow);
const pinkBtnGlow = new THREE.PointLight(0xff44aa, 1.2, 3);
pinkBtnGlow.position.set(-CW / 2 + 0.5, 1.35, PINK_BTN_Z);
corridorGroups[2].add(pinkBtnGlow);

// Corridor 4 — 2 ceiling strips (replaces 6 ceiling + 4 wall fill lights)
[-CL4 / 4, CL4 / 4].forEach(dz => {
    const pl = new THREE.PointLight(0xffeeaa, 4.0, 22);
    pl.position.set(0, CH - 0.1, C4_CENTER_Z + dz);
    corridorGroups[3].add(pl);
});
const yellowDoorGlow = new THREE.PointLight(0xffcc00, 2.0, 9);
yellowDoorGlow.position.set(0, 1.8, YELLOW_DOOR_Z + 2);
corridorGroups[3].add(yellowDoorGlow);
const sign4Glow = new THREE.PointLight(0xffdd44, 1.4, 3.5);
sign4Glow.position.set(-CW / 2 + 0.8, CH / 2, C4_CENTER_Z);
corridorGroups[3].add(sign4Glow);

// Corridor 5 — 2 ceiling strips (replaces 6 ceiling + 4 wall fill lights)
[-CL5 / 4, CL5 / 4].forEach(dz => {
    const pl = new THREE.PointLight(0xaaffee, 4.0, 22);
    pl.position.set(0, CH - 0.1, C5_CENTER_Z + dz);
    corridorGroups[4].add(pl);
});
const tealDoorGlow = new THREE.PointLight(0x00bbaa, 2.0, 9);
tealDoorGlow.position.set(0, 1.8, TEAL_DOOR_Z + 2);
corridorGroups[4].add(tealDoorGlow);

// Corridor 6 — 2 ceiling strips (replaces 6 ceiling + 4 wall fill lights)
[-CL6 / 4, CL6 / 4].forEach(dz => {
    const pl = new THREE.PointLight(0xffccaa, 4.0, 22);
    pl.position.set(0, CH - 0.1, C6_CENTER_Z + dz);
    corridorGroups[5].add(pl);
});
const orangeDoorGlow = new THREE.PointLight(0xff6600, 2.0, 9);
orangeDoorGlow.position.set(0, 1.8, ORANGE_DOOR_Z + 2);
corridorGroups[5].add(orangeDoorGlow);

// Corridor 7 — 2 ceiling strips (replaces 6 ceiling + 4 wall fill lights)
[-CL7 / 4, CL7 / 4].forEach(dz => {
    const pl = new THREE.PointLight(0xddaaff, 4.0, 22);
    pl.position.set(0, CH - 0.1, C7_CENTER_Z + dz);
    corridorGroups[6].add(pl);
});
const purpleDoorGlow = new THREE.PointLight(0x8800ff, 2.0, 9);
purpleDoorGlow.position.set(0, 1.8, PURPLE_DOOR_Z + 2);
corridorGroups[6].add(purpleDoorGlow);

// ── Materials ─────────────────────────────────────────────────────────────────
const wallMat          = new THREE.MeshLambertMaterial({ color: 0x1c1c2c });
const floorMat         = new THREE.MeshLambertMaterial({ color: 0x111118 });
const ceilMat          = new THREE.MeshLambertMaterial({ color: 0x16161f });
const rooftopMat       = new THREE.MeshLambertMaterial({ color: 0x1a2a3a, emissive: 0x06101e }); // highlighted exterior surface
const floorHighMat     = new THREE.MeshLambertMaterial({ color: 0x16161e, emissive: 0x05050e }); // highlighted interior floor surface
const panelMat         = new THREE.MeshLambertMaterial({ color: 0x222233 });
const doorMat          = new THREE.MeshLambertMaterial({ color: 0x006622, emissive: 0x001a08 });
const btnMat           = new THREE.MeshLambertMaterial({ color: 0x00ff66, emissive: 0x003311 });
const btnShotMat       = new THREE.MeshLambertMaterial({ color: 0xff4400, emissive: 0x330e00 });
const blueDoorMat      = new THREE.MeshLambertMaterial({ color: 0x001e88, emissive: 0x000822 });
const blueBtnMat       = new THREE.MeshLambertMaterial({ color: 0x2288ff, emissive: 0x001144 });
const blueBtnShotMat   = new THREE.MeshLambertMaterial({ color: 0xff4400, emissive: 0x330e00 });
const blockMat         = new THREE.MeshLambertMaterial({ color: 0x888899 });
const hatchMat         = new THREE.MeshLambertMaterial({ color: 0x333355 });
const blueAreaMat      = new THREE.MeshLambertMaterial({ color: 0x0055ff, emissive: 0x001144, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
const pinkDoorMat      = new THREE.MeshLambertMaterial({ color: 0x881155, emissive: 0x220010 });
const pinkBtnMat       = new THREE.MeshLambertMaterial({ color: 0xff44aa, emissive: 0x441133 });
const pinkBtnInactMat  = new THREE.MeshLambertMaterial({ color: 0x442233, emissive: 0x110008 });
const yellowDoorMat    = new THREE.MeshLambertMaterial({ color: 0xddaa00, emissive: 0x443300 });
const tealDoorMat      = new THREE.MeshLambertMaterial({ color: 0x007766, emissive: 0x001f1a });
const tealBtnMat       = new THREE.MeshLambertMaterial({ color: 0x00ddbb, emissive: 0x003322 });
const tealBtnShotMat   = new THREE.MeshLambertMaterial({ color: 0xff4400, emissive: 0x330e00 });
const orangeDoorMat    = new THREE.MeshLambertMaterial({ color: 0xcc5500, emissive: 0x331500 });
const c6BtnMat         = new THREE.MeshLambertMaterial({ color: 0xff6600, emissive: 0x331500 });
const c6BtnShotMat     = new THREE.MeshLambertMaterial({ color: 0x550000, emissive: 0x110000 });
const c6WallMoveMat    = new THREE.MeshLambertMaterial({ color: 0x1a0000, emissive: 0x110000 });
const purpleDoorMat    = new THREE.MeshLambertMaterial({ color: 0x5500aa, emissive: 0x150030 });
const c7BtnMat         = new THREE.MeshLambertMaterial({ color: 0xcc66ff, emissive: 0x220033 });
const c7BtnShotMat     = new THREE.MeshLambertMaterial({ color: 0x440066, emissive: 0x110011 });
const c7PlatformMat    = new THREE.MeshLambertMaterial({ color: 0x9955cc, emissive: 0x1a0033 });
const websiteBtnMat    = new THREE.MeshLambertMaterial({ color: 0x00ffee, emissive: 0x003333 }); // rooftop website redirect button

// ── Geometry helper ───────────────────────────────────────────────────────────
function box(w, h, d, mat, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = m.castShadow = false;
    (_cg || scene).add(m);
    return m;
}

// ── Corridor number signs ─────────────────────────────────────────────────────
function makeNumberSign(n, color = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width  = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 256, 256);
    ctx.font = 'bold 220px monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(String(n), 128, 140);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.FrontSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), mat);
    return mesh;
}

function makeFloorNumberLabel(text, color = '#7de7ff', size = 1.05) {
    const canvas = document.createElement('canvas');
    canvas.width  = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(6, 18, 28, 0.75)';
    ctx.fillRect(28, 40, 200, 176);
    ctx.strokeStyle = 'rgba(125, 231, 255, 0.6)';
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 40, 200, 176);
    ctx.font = 'bold 132px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(String(text), 128, 136);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
}

function makeTextPanelMaterial(text, {
    font = 'bold 42px monospace',
    textColor = '#000000',
    borderColor = '#7a5b10',
    fillColor = '#f4c44f',
    emissive = 0x2a1d00
} = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fillColor;
    ctx.fillRect(24, 24, canvas.width - 48, canvas.height - 48);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    const lines = Array.isArray(text) ? text : [text];
    const lineHeight = 72;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, idx) => {
        ctx.fillText(line, canvas.width / 2, startY + idx * lineHeight);
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive,
        map: tex,
        side: THREE.DoubleSide
    });
}

// Sign on left wall of corridor 1 (center z = 0)
{
    const s = makeNumberSign(1);
    s.position.set(-CW / 2 + 0.16, CH / 2, 0);
    s.rotation.y = Math.PI / 2;
    corridorGroups[0].add(s);
}
// Sign on left wall of corridor 2 (center z = C2_CENTER_Z)
{
    const s = makeNumberSign(2);
    s.position.set(-CW / 2 + 0.16, CH / 2, C2_CENTER_Z);
    s.rotation.y = Math.PI / 2;
    corridorGroups[1].add(s);
}
// Sign on left wall of corridor 3 (center z = C3_CENTER_Z)
{
    const s = makeNumberSign(3);
    s.position.set(-CW / 2 + 0.16, CH / 2, C3_CENTER_Z);
    s.rotation.y = Math.PI / 2;
    corridorGroups[2].add(s);
}
// Sign on left wall of corridor 5 (center z = C5_CENTER_Z)
{
    const s = makeNumberSign(5, '#00eedd');
    s.position.set(-CW / 2 + 0.16, CH / 2, C5_CENTER_Z);
    s.rotation.y = Math.PI / 2;
    corridorGroups[4].add(s);
}
// Sign on left wall of corridor 6 (center z = C6_CENTER_Z)
{
    const s = makeNumberSign(6, '#ff8833');
    s.position.set(-CW / 2 + 0.16, CH / 2, C6_CENTER_Z);
    s.rotation.y = Math.PI / 2;
    corridorGroups[5].add(s);
}
// Sign on left wall of corridor 7 (center z = C7_CENTER_Z)
{
    const s = makeNumberSign(7, '#cc66ff');
    s.position.set(-CW / 2 + 0.16, CH / 2, C7_CENTER_Z);
    s.rotation.y = Math.PI / 2;
    corridorGroups[6].add(s);
}

_cg = corridorGroups[0];
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
btnGlowL.position.set(-CW/2+0.5, BTN_Y, BTN_Z); _cg.add(btnGlowL);
const btnGlowR = new THREE.PointLight(0x00ff66, 1.0, 2.5);
btnGlowR.position.set(CW/2-0.5, BTN_Y, BTN_Z); _cg.add(btnGlowR);
const conceptsBtn = box(
    1.7, 0.62, 0.18,
    makeTextPanelMaterial(['Programming', 'Concepts']),
    0, 1.6, CL / 2 - 0.24
);
const conceptsBtnGlow = new THREE.PointLight(0xf4c44f, 1.2, 3.4);
conceptsBtnGlow.position.set(0, 1.6, CL / 2 - 0.8);
_cg.add(conceptsBtnGlow);

_cg = corridorGroups[1];
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
blueBtnGlowL.position.set(-CW/2+0.5, BTN_Y, BLUE_BTN_Z); _cg.add(blueBtnGlowL);
const blueBtnGlowR = new THREE.PointLight(0x2288ff, 1.0, 2.5);
blueBtnGlowR.position.set(CW/2-0.5, BTN_Y, BLUE_BTN_Z); _cg.add(blueBtnGlowR);

box(1.5, 0.02, 1.5, blueAreaMat, 0, 0.031, BLUE_AREA_Z);
const hatch     = box(BLOCK_SIZE+0.3, 0.1, BLOCK_SIZE+0.3, hatchMat, 0, CH-0.01, HATCH_Z);
const blockMesh = box(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, blockMat, 0, CH-BLOCK_SIZE/2, HATCH_Z);

_cg = corridorGroups[2];
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

_cg = corridorGroups[3];
// ── Corridor 4 ────────────────────────────────────────────────────────────────
box(CW, 0.2, CL4, floorMat,  0,    -0.1,  C4_CENTER_Z);
box(CW, 0.2, CL4, ceilMat,   0,  CH+0.1,  C4_CENTER_Z);
box(0.3, CH, CL4, wallMat, -CW/2, CH/2,   C4_CENTER_Z);
box(0.3, CH, CL4, wallMat,  CW/2, CH/2,   C4_CENTER_Z);

const YELLOW_DOOR_W = 2.6;
const yellowSideW   = (CW - YELLOW_DOOR_W) / 2;
box(yellowSideW, CH, 0.3, wallMat, -(YELLOW_DOOR_W/2+yellowSideW/2), CH/2, YELLOW_DOOR_Z);
box(yellowSideW, CH, 0.3, wallMat,  (YELLOW_DOOR_W/2+yellowSideW/2), CH/2, YELLOW_DOOR_Z);
const yellowDoor = box(YELLOW_DOOR_W, CH, 0.2, yellowDoorMat, 0, CH/2, YELLOW_DOOR_Z);

// Teal circle on floor just before yellow door.
// polygonOffset pulls the decal toward the camera in depth to prevent z-fighting with the floor.
{
    const circleGeo = new THREE.CircleGeometry(0.9, 48);
    const circleMat = new THREE.MeshBasicMaterial({
        color: 0x007766,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
    });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(0, 0.031, YELLOW_DOOR_Z + 2.5);
    _cg.add(circle);
}

_cg = corridorGroups[4];
// ── Corridor 5 ────────────────────────────────────────────────────────────────
box(CW, 0.2, CL5, floorMat,  0,    -0.1,  C5_CENTER_Z);
box(CW, 0.2, CL5, ceilMat,   0,  CH+0.1,  C5_CENTER_Z);
box(0.3, CH, CL5, wallMat, -CW/2, CH/2,   C5_CENTER_Z);
box(0.3, CH, CL5, wallMat,  CW/2, CH/2,   C5_CENTER_Z);

const TEAL_DOOR_W = 2.6;
const tealSideW   = (CW - TEAL_DOOR_W) / 2;
box(tealSideW, CH, 0.3, wallMat, -(TEAL_DOOR_W/2+tealSideW/2), CH/2, TEAL_DOOR_Z);
box(tealSideW, CH, 0.3, wallMat,  (TEAL_DOOR_W/2+tealSideW/2), CH/2, TEAL_DOOR_Z);
const tealDoor = box(TEAL_DOOR_W, CH, 0.2, tealDoorMat, 0, CH/2, TEAL_DOOR_Z);

// Teal button — right wall, opposite the number 5 sign
box(0.08, 0.55, 0.55, panelMat, CW/2-0.04, BTN_Y, C5_CENTER_Z);
const tealBtn = box(0.18, 0.28, 0.28, tealBtnMat, CW/2-0.14, BTN_Y, C5_CENTER_Z);
const tealBtnGlow = new THREE.PointLight(0x00ddbb, 1.0, 2.5);
tealBtnGlow.position.set(CW/2-0.5, BTN_Y, C5_CENTER_Z);
_cg.add(tealBtnGlow);

_cg = corridorGroups[5];
// ── Corridor 6 ────────────────────────────────────────────────────────────────
box(CW, 0.2, CL6, floorMat,  0,    -0.1,  C6_CENTER_Z);
box(CW, 0.2, CL6, ceilMat,   0,  CH+0.1,  C6_CENTER_Z);
box(0.3, CH, CL6, wallMat, -CW/2, CH/2,   C6_CENTER_Z);
box(0.3, CH, CL6, wallMat,  CW/2, CH/2,   C6_CENTER_Z);

const ORANGE_DOOR_W = 2.6;
const orangeSideW   = (CW - ORANGE_DOOR_W) / 2;
box(orangeSideW, CH, 0.3, wallMat, -(ORANGE_DOOR_W/2+orangeSideW/2), CH/2, ORANGE_DOOR_Z);
box(orangeSideW, CH, 0.3, wallMat,  (ORANGE_DOOR_W/2+orangeSideW/2), CH/2, ORANGE_DOOR_Z);
const orangeDoor = box(ORANGE_DOOR_W, CH, 0.2, orangeDoorMat, 0, CH/2, ORANGE_DOOR_Z);

_cg = corridorGroups[6];
// ── Corridor 7 ────────────────────────────────────────────────────────────────
box(CW, 0.2, CL7, floorMat,  0,    -0.1,  C7_CENTER_Z);
// Ceiling with square hole right before the purple door
{
    const sideW    = (CW - C7_HOLE_S) / 2;
    const frontLen = Math.abs(ORANGE_DOOR_Z - (C7_HOLE_Z + C7_HOLE_S / 2));
    const backLen  = Math.abs((C7_HOLE_Z - C7_HOLE_S / 2) - PURPLE_DOOR_Z);
    box(CW,      0.2, frontLen,  ceilMat, 0,                                 CH + 0.1, (ORANGE_DOOR_Z + C7_HOLE_Z + C7_HOLE_S / 2) / 2);
    box(CW,      0.2, backLen,   ceilMat, 0,                                 CH + 0.1, ((C7_HOLE_Z - C7_HOLE_S / 2) + PURPLE_DOOR_Z) / 2);
    box(sideW,   0.2, C7_HOLE_S, ceilMat, -(C7_HOLE_S / 2 + sideW / 2),    CH + 0.1, C7_HOLE_Z);
    box(sideW,   0.2, C7_HOLE_S, ceilMat,  (C7_HOLE_S / 2 + sideW / 2),    CH + 0.1, C7_HOLE_Z);
}
box(0.3, CH, CL7, wallMat, -CW/2, CH/2,   C7_CENTER_Z);
box(0.3, CH, CL7, wallMat,  CW/2, CH/2,   C7_CENTER_Z);
box(CW,  CH, 0.3, wallMat,  0,   CH/2,  PURPLE_DOOR_Z - 0.15);

// Button — left wall, below the 7 sign
box(0.08, 0.55, 0.55, panelMat, -CW/2+0.04, BTN_Y, C7_CENTER_Z);
const c7Btn = box(0.18, 0.28, 0.28, c7BtnMat, -CW/2+0.14, BTN_Y, C7_CENTER_Z);
const c7BtnGlow = new THREE.PointLight(0xcc66ff, 1.0, 2.5);
c7BtnGlow.position.set(-CW/2+0.5, BTN_Y, C7_CENTER_Z);
_cg.add(c7BtnGlow);

// Platform — starts on the floor under the hole, rises to fill it
const c7Platform = box(C7_HOLE_S, 0.2, C7_HOLE_S, c7PlatformMat, 0, 0.1, C7_HOLE_Z);

const PURPLE_DOOR_W = 2.6;
const purpleSideW   = (CW - PURPLE_DOOR_W) / 2;
box(purpleSideW, CH, 0.3, wallMat, -(PURPLE_DOOR_W/2+purpleSideW/2), CH/2, PURPLE_DOOR_Z);
box(purpleSideW, CH, 0.3, wallMat,  (PURPLE_DOOR_W/2+purpleSideW/2), CH/2, PURPLE_DOOR_Z);
const purpleDoor = box(PURPLE_DOOR_W, CH, 0.2, purpleDoorMat, 0, CH/2, PURPLE_DOOR_Z);

_cg = corridorGroups[5]; // crush walls and remaining C6 objects defined out-of-order
// Crush walls — giant blocks (width = CW) starting fully hidden inside the wall,
// sliding inward until their inner face meets at x = 0
const c6CrushLeft  = box(CW, CH, C6_CRUSH_LEN, wallMat, -CW, CH/2, C6_CRUSH_CTRZ);
const c6CrushRight = box(CW, CH, C6_CRUSH_LEN, wallMat,  CW, CH/2, C6_CRUSH_CTRZ);

_cg = null; // starfield and rooftop are global — not corridor-specific
// ── Starfield (visible from outside through roof hole) ────────────────────────
{
    const starArr = [];
    const rng = () => Math.random();
    for (let i = 0; i < 3000; i++) {
        starArr.push(
            (rng() - 0.5) * 120,                      // x: wide spread
            CH + 5 + rng() * 60,                       // y: above corridors
            CL / 2 - rng() * 220                       // z: along corridor strip + beyond
        );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starArr, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, sizeAttenuation: true })));
}

// ── Exterior reference grid ───────────────────────────────────────────────────
{
    const xMin = -40;
    const xMax = 40;
    const yMin = CH + 0.25;
    const yMax = CH + 24.25;
    const zMin = PURPLE_DOOR_Z - 6;
    const zMax = CL / 2 + 6;

    const xs = [];
    const ys = [];
    const zs = [];
    for (let x = xMin; x <= xMax + 0.001; x += OUTSIDE_GRID_STEP) xs.push(x);
    for (let y = yMin; y <= yMax + 0.001; y += OUTSIDE_GRID_STEP) ys.push(y);
    for (let z = zMin; z <= zMax + 0.001; z += OUTSIDE_GRID_STEP) zs.push(z);

    const linePos = [];
    xs.forEach(x => {
        ys.forEach(y => {
            linePos.push(x, y, zMin, x, y, zMax);
        });
        zs.forEach(z => {
            linePos.push(x, yMin, z, x, yMax, z);
        });
    });
    ys.forEach(y => {
        zs.forEach(z => {
            linePos.push(xMin, y, z, xMax, y, z);
        });
    });

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
        color: 0x8ceeff,
        transparent: true,
        opacity: 0.045,
        depthWrite: false
    });
    const gridLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(gridLines);

    const vertexPos = [];
    let vertexId = 1;
    xs.forEach(x => {
        ys.forEach(y => {
            zs.forEach(z => {
                vertexPos.push(x, y, z);
                exteriorGridIds.push(vertexId++);
            });
        });
    });

    const vertexGeo = new THREE.BufferGeometry();
    vertexGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertexPos, 3));
    const vertexMat = new THREE.PointsMaterial({
        color: 0xaef5ff,
        size: 0.12,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.09,
        depthWrite: false
    });
    const gridVertices = new THREE.Points(vertexGeo, vertexMat);
    scene.add(gridVertices);
    scene.userData.exteriorGridVertices = gridVertices;
}

// ── Rooftop surface (walkable exterior on top of all corridors) ───────────────
// Four-piece slab matching the ceiling hole gap in corridor 7 so the hole stays open.
// Slightly emissive to read clearly as a floor when the player is outside in the dark.
{
    const RTOP_W        = CW + 0.6;                        // covers wall tops too (total 4.6 units wide)
    const RTOP_Y        = CH + 0.225;                       // 0.025 above ceiling top at CH+0.2
    const RTOP_SIDE_W   = (RTOP_W - C7_HOLE_S) / 2;        // side strip width flanking the hole
    const frontLen      = CL / 2 - (C7_HOLE_Z + C7_HOLE_S / 2);
    const backLen       = (C7_HOLE_Z - C7_HOLE_S / 2) - PURPLE_DOOR_Z;
    // Front strip — corridor 1 start to just before the hole
    box(RTOP_W,      0.05, frontLen,  rooftopMat, 0,                                RTOP_Y, (CL / 2 + C7_HOLE_Z + C7_HOLE_S / 2) / 2);
    // Back strip — just after the hole to corridor 7 end
    box(RTOP_W,      0.05, backLen,   rooftopMat, 0,                                RTOP_Y, ((C7_HOLE_Z - C7_HOLE_S / 2) + PURPLE_DOOR_Z) / 2);
    // Side strips flanking the hole in Z
    box(RTOP_SIDE_W, 0.05, C7_HOLE_S, rooftopMat, -(C7_HOLE_S / 2 + RTOP_SIDE_W / 2), RTOP_Y, C7_HOLE_Z);
    box(RTOP_SIDE_W, 0.05, C7_HOLE_S, rooftopMat,  (C7_HOLE_S / 2 + RTOP_SIDE_W / 2), RTOP_Y, C7_HOLE_Z);
}

// ── Rooftop floating platform (midpoint of exterior vertices 2715 and 2415) ──
// Vertex 2715 is at (-4, RTOP_TOP_Y, -131) and 2415 at (-8, RTOP_TOP_Y, -127).
// Elevated 1 unit above the slab — reachable with a running jump from the rooftop edge.
const FLOAT_PLAT_X   = -6;    // midpoint between x=-4 (v2715) and x=-8 (v2415)
const FLOAT_PLAT_Z   = -129;  // midpoint between z=-131 (v2715) and z=-127 (v2415)
const FLOAT_PLAT_TOP = RTOP_TOP_Y + 1.0;  // walkable top face y
const FLOAT_PLAT_HW  = 2.0;               // half-width in x: spans x=-8 to x=-4
const FLOAT_PLAT_HD  = 2.0;               // half-depth in z: spans z=-131 to z=-127
box(FLOAT_PLAT_HW * 2, 0.25, FLOAT_PLAT_HD * 2,
    rooftopMat, FLOAT_PLAT_X, FLOAT_PLAT_TOP - 0.125, FLOAT_PLAT_Z);

// ── Rooftop website button ────────────────────────────────────────────────────
// Flat glowing panel on the rooftop — shooting it opens the personal website in a new tab.
const WEBSITE_BTN_Z  = C7_HOLE_Z + 5;                          // z ≈ -137, clear of the hole
{
    const gridMat      = new THREE.MeshBasicMaterial({ color: 0x7de7ff, transparent: true, opacity: 0.34 });
    const cellDepth    = 2.0;
    const cellWidth    = RTOP_W / 2;
    const lineT        = 0.03;
    const gridY        = RTOP_TOP_Y + 0.012;
    const labelY       = RTOP_TOP_Y + 0.02;
    const labelSize    = 0.68;
    let nextCellNumber = 1;

    function addGridLine(w, d, x, z) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), gridMat);
        line.position.set(x, gridY, z);
        scene.add(line);
    }

    function addCellLabel(x, z) {
        const label = makeFloorNumberLabel(nextCellNumber++, '#7de7ff', labelSize);
        label.rotation.x = -Math.PI / 2;
        label.position.set(x, labelY, z);
        scene.add(label);
    }

    function buildStripGrid(xMin, xMax, zStart, zEnd) {
        const width = xMax - xMin;
        const depth = zStart - zEnd;
        const cols = Math.max(1, Math.round(width / cellWidth));
        const rows = Math.max(1, Math.ceil(depth / cellDepth));
        const actualCellW = width / cols;
        const actualCellD = depth / rows;

        for (let c = 0; c <= cols; c++) {
            const x = xMin + c * actualCellW;
            addGridLine(lineT, depth, x, zStart - depth / 2);
        }
        for (let r = 0; r <= rows; r++) {
            const z = zStart - r * actualCellD;
            addGridLine(width, lineT, xMin + width / 2, z);
        }

        for (let r = 0; r < rows; r++) {
            const z = zStart - (r + 0.5) * actualCellD;
            for (let c = 0; c < cols; c++) {
                const x = xMin + (c + 0.5) * actualCellW;
                addCellLabel(x, z);
            }
        }
    }

    buildStripGrid(-RTOP_W / 2, RTOP_W / 2, CL / 2, C7_HOLE_Z + C7_HOLE_S / 2);
    buildStripGrid(-RTOP_W / 2, RTOP_W / 2, C7_HOLE_Z - C7_HOLE_S / 2, PURPLE_DOOR_Z);
    buildStripGrid(-RTOP_W / 2, -C7_HOLE_S / 2, C7_HOLE_Z + C7_HOLE_S / 2, C7_HOLE_Z - C7_HOLE_S / 2);
    buildStripGrid(C7_HOLE_S / 2, RTOP_W / 2, C7_HOLE_Z + C7_HOLE_S / 2, C7_HOLE_Z - C7_HOLE_S / 2);
}
const websiteBtn     = box(0.6, 0.08, 0.6, websiteBtnMat, 0, RTOP_TOP_Y + 0.05, WEBSITE_BTN_Z);
const websiteBtnGlow = new THREE.PointLight(0x00ffee, 1.5, 4.0);
websiteBtnGlow.position.set(0, RTOP_TOP_Y + 0.5, WEBSITE_BTN_Z);
scene.add(websiteBtnGlow);

// ── Interior floor highlight (thin slab over all corridor floors) ─────────────
// Slightly emissive layer sitting flush on top of the floor boxes so the ground
// reads more clearly in the dark corridor lighting.
{
    const FLOOR_LEN   = CL / 2 - PURPLE_DOOR_Z;           // full corridor strip length (156 units)
    const FLOOR_CTR_Z = (CL / 2 + PURPLE_DOOR_Z) / 2;     // z = -67
    box(CW, 0.03, FLOOR_LEN, floorHighMat, 0, 0.015, FLOOR_CTR_Z);
}

_cg = corridorGroups[5]; // C6 entrance button
// Button — left wall, right after teal door (beginning of corridor 6)
box(0.08, 0.55, 0.55, panelMat, -CW/2+0.04, BTN_Y, TEAL_DOOR_Z - 2);
const c6EntranceBtn = box(0.18, 0.28, 0.28, c6BtnMat, -CW/2+0.14, BTN_Y, TEAL_DOOR_Z - 2);
const c6EntranceBtnGlow = new THREE.PointLight(0xff6600, 1.0, 2.5);
c6EntranceBtnGlow.position.set(-CW/2+0.5, BTN_Y, TEAL_DOOR_Z - 2);
_cg.add(c6EntranceBtnGlow);

// Moving wall — starts at teal door, hidden until triggered
// Leaves a 0.7-unit gap on each side (near buttons); player can't fit through (needs 0.9)
const c6WallMesh = new THREE.Mesh(new THREE.BoxGeometry(CW - 1.4, CH, 0.5), c6WallMoveMat);
c6WallMesh.position.set(0, CH/2, TEAL_DOOR_Z);
c6WallMesh.visible = false;
_cg.add(c6WallMesh);
const c6WallLight = new THREE.PointLight(0xff1100, 0, 12);
c6WallLight.position.set(0, CH/2, TEAL_DOOR_Z);
_cg.add(c6WallLight);

_cg = corridorGroups[3]; // sign 4 belongs to corridor 4
// Sign "4" on left wall — this IS the button
const sign4      = makeNumberSign(4, '#ffdd44');
const sign4Shot  = makeNumberSign(4, '#ff4400');
sign4Shot.visible = false;
sign4.position.set(-CW / 2 + 0.16, CH / 2, C4_CENTER_Z);
sign4.rotation.y = Math.PI / 2;
sign4Shot.position.copy(sign4.position);
sign4Shot.rotation.copy(sign4.rotation);
_cg.add(sign4);
_cg.add(sign4Shot);
_cg = null; // end of per-corridor setup

// ── Game state ────────────────────────────────────────────────────────────────
const greenDoor  = { leftShot: false, rightShot: false, open: false };
const blueState  = { leftShot: false, rightShot: false, open: false };
const block      = { active: false, onFloor: false, velocityY: 0 };
const pinkState  = { active: true, doorOpen: false, cycleShots: 0 };
const yellowDoorState = { shot: false, open: false };
const tealDoorState   = { open: false };
const c6CrushState    = { active: false };
const c6OrangeDoor    = { open: false };
const c7State         = { up: false };
let   playerDead      = false;
let   playerOutside   = false;
const CIRCLE_Z = YELLOW_DOOR_Z + 2.5;
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

function applyRequestedSpawn() {
    const requestedSpawn = sessionStorage.getItem('haphazardSpawn');
    if (requestedSpawn !== 'rooftop') return;

    sessionStorage.removeItem('haphazardSpawn');
    respawnAtRooftop();
}

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true; });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

// ── Pointer lock ──────────────────────────────────────────────────────────────
const blocker   = document.getElementById('blocker');
const crosshair = document.getElementById('crosshair');
const hud       = document.getElementById('hud');
const vertexTooltip = document.getElementById('vertex-tooltip');
let locked = false;

blocker.addEventListener('click', () => renderer.domElement.requestPointerLock());
document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === renderer.domElement;
    blocker.classList.toggle('hidden', locked);
    crosshair.classList.toggle('visible', locked);
    hud.classList.toggle('visible', locked);
    vertexTooltip.classList.toggle('visible', false);
    if (locked) startAmbient();
});

if (sessionStorage.getItem('haphazardMusic')) {
    sessionStorage.removeItem('haphazardMusic');
    startAmbient();
}
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

function updateExteriorVertexTooltip() {
    if (!locked || !playerOutside || playerDead) {
        vertexTooltip.classList.remove('visible');
        return;
    }

    const gridVertices = scene.userData.exteriorGridVertices;
    if (!gridVertices) {
        vertexTooltip.classList.remove('visible');
        return;
    }

    exteriorGridRay.setFromCamera({ x: 0, y: 0 }, camera);
    const hits = exteriorGridRay.intersectObject(gridVertices);
    if (hits.length === 0 || hits[0].index == null) {
        vertexTooltip.classList.remove('visible');
        return;
    }

    const vertexId = exteriorGridIds[hits[0].index];
    if (vertexId == null) {
        vertexTooltip.classList.remove('visible');
        return;
    }

    vertexTooltip.textContent = `VERTEX ${vertexId}`;
    vertexTooltip.classList.add('visible');
}

const _audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playFootstep() {
    const buf  = _audioCtx.createBuffer(1, _audioCtx.sampleRate * 0.08, _audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    const src  = _audioCtx.createBufferSource();
    const gain = _audioCtx.createGain();
    const filt = _audioCtx.createBiquadFilter();
    src.buffer = buf;
    filt.type  = 'lowpass';
    filt.frequency.value = 300;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(_audioCtx.destination);
    gain.gain.value = 0.18;
    src.start();
}

// Heavy rock impact: low-frequency body thud, gritty mid crunch, and stone dust tail.
function playBlockLand() {
    const t      = _audioCtx.currentTime;
    const master = _audioCtx.createGain();
    master.gain.value = 0.12;
    master.connect(_audioCtx.destination);

    // ── Body thud (very low bandpass noise 40–90 Hz — mass of the rock hitting ground) ──
    const thudLen  = Math.floor(_audioCtx.sampleRate * 0.22);
    const thudBuf  = _audioCtx.createBuffer(1, thudLen, _audioCtx.sampleRate);
    const thudData = thudBuf.getChannelData(0);
    for (let i = 0; i < thudLen; i++) {
        thudData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / thudLen, 1.8);
    }
    const thudSrc  = _audioCtx.createBufferSource();
    const thudBp   = _audioCtx.createBiquadFilter();
    const thudGain = _audioCtx.createGain();
    thudSrc.buffer         = thudBuf;
    thudBp.type            = 'bandpass';
    thudBp.frequency.value = 60;
    thudBp.Q.value         = 0.8;
    thudGain.gain.setValueAtTime(2.5, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    thudSrc.connect(thudBp);
    thudBp.connect(thudGain);
    thudGain.connect(master);
    thudSrc.start(t);

    // ── Crunch (bandpass noise 300–900 Hz — rock surface grinding on floor) ──
    const crunchLen  = Math.floor(_audioCtx.sampleRate * 0.14);
    const crunchBuf  = _audioCtx.createBuffer(1, crunchLen, _audioCtx.sampleRate);
    const crunchData = crunchBuf.getChannelData(0);
    for (let i = 0; i < crunchLen; i++) {
        crunchData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / crunchLen, 1.2);
    }
    const crunchSrc  = _audioCtx.createBufferSource();
    const crunchBp   = _audioCtx.createBiquadFilter();
    const crunchGain = _audioCtx.createGain();
    crunchSrc.buffer         = crunchBuf;
    crunchBp.type            = 'bandpass';
    crunchBp.frequency.value = 550;
    crunchBp.Q.value         = 1.4;
    crunchGain.gain.setValueAtTime(1.0, t);
    crunchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    crunchSrc.connect(crunchBp);
    crunchBp.connect(crunchGain);
    crunchGain.connect(master);
    crunchSrc.start(t);

    // ── Dust tail (highpass noise >2 kHz — fine debris settling, very quiet) ──
    const dustLen  = Math.floor(_audioCtx.sampleRate * 0.35);
    const dustBuf  = _audioCtx.createBuffer(1, dustLen, _audioCtx.sampleRate);
    const dustData = dustBuf.getChannelData(0);
    for (let i = 0; i < dustLen; i++) {
        dustData[i] = Math.random() * 2 - 1;
    }
    const dustSrc  = _audioCtx.createBufferSource();
    const dustHp   = _audioCtx.createBiquadFilter();
    const dustGain = _audioCtx.createGain();
    dustSrc.buffer         = dustBuf;
    dustHp.type            = 'highpass';
    dustHp.frequency.value = 2200;
    dustGain.gain.setValueAtTime(0.0, t);
    dustGain.gain.linearRampToValueAtTime(0.18, t + 0.03);
    dustGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    dustSrc.connect(dustHp);
    dustHp.connect(dustGain);
    dustGain.connect(master);
    dustSrc.start(t);
}

let _stepTimer = 0;

function playShot() {
    const t      = _audioCtx.currentTime;
    const master = _audioCtx.createGain();
    master.gain.value = 0.22;
    master.connect(_audioCtx.destination);

    // ── Click transient (1.5 ms highpass noise — the hard contact of the switch) ─
    const tickLen  = Math.floor(_audioCtx.sampleRate * 0.0015);
    const tickBuf  = _audioCtx.createBuffer(1, tickLen, _audioCtx.sampleRate);
    const tickData = tickBuf.getChannelData(0);
    for (let i = 0; i < tickLen; i++) tickData[i] = Math.random() * 2 - 1;
    const tickSrc  = _audioCtx.createBufferSource();
    const tickHp   = _audioCtx.createBiquadFilter();
    const tickGain = _audioCtx.createGain();
    tickSrc.buffer      = tickBuf;
    tickHp.type         = 'highpass';
    tickHp.frequency.value = 3500;
    tickGain.gain.setValueAtTime(2.5, t);
    tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.0015);
    tickSrc.connect(tickHp);
    tickHp.connect(tickGain);
    tickGain.connect(master);
    tickSrc.start(t);

    // ── Body ring (sine at 1400 Hz, 30 ms — plastic/metal resonance of the switch) ─
    const ring     = _audioCtx.createOscillator();
    const ringGain = _audioCtx.createGain();
    ring.type = 'sine';
    ring.frequency.value = 1400;
    ringGain.gain.setValueAtTime(0.6, t);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    ring.connect(ringGain);
    ringGain.connect(master);
    ring.start(t);
    ring.stop(t + 0.03);

    // ── Thock body (bandpass noise 800–2000 Hz, 25 ms — the mechanical body thud) ─
    const thockLen  = Math.floor(_audioCtx.sampleRate * 0.025);
    const thockBuf  = _audioCtx.createBuffer(1, thockLen, _audioCtx.sampleRate);
    const thockData = thockBuf.getChannelData(0);
    for (let i = 0; i < thockLen; i++) thockData[i] = Math.random() * 2 - 1;
    const thockSrc  = _audioCtx.createBufferSource();
    const thockBp   = _audioCtx.createBiquadFilter();
    const thockGain = _audioCtx.createGain();
    thockSrc.buffer      = thockBuf;
    thockBp.type         = 'bandpass';
    thockBp.frequency.value = 1200;
    thockBp.Q.value         = 1.2;
    thockGain.gain.setValueAtTime(1.0, t);
    thockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    thockSrc.connect(thockBp);
    thockBp.connect(thockGain);
    thockGain.connect(master);
    thockSrc.start(t);
}

// Mechanical door-opening sound: initial clunk, motor whine sweep, low rumble, and metallic slide.
function playDoorOpen() {
    const t   = _audioCtx.currentTime;
    const dur = 1.5;
    const master = _audioCtx.createGain();
    master.gain.value = 0.10;
    master.connect(_audioCtx.destination);

    // ── Initial clunk (impact transient when mechanism engages) ──
    const clunkLen  = Math.floor(_audioCtx.sampleRate * 0.06);
    const clunkBuf  = _audioCtx.createBuffer(1, clunkLen, _audioCtx.sampleRate);
    const clunkData = clunkBuf.getChannelData(0);
    for (let i = 0; i < clunkLen; i++) {
        clunkData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / clunkLen, 2);
    }
    const clunkSrc  = _audioCtx.createBufferSource();
    const clunkLp   = _audioCtx.createBiquadFilter();
    const clunkGain = _audioCtx.createGain();
    clunkSrc.buffer      = clunkBuf;
    clunkLp.type         = 'lowpass';
    clunkLp.frequency.value = 380;
    clunkGain.gain.value = 1.8;
    clunkSrc.connect(clunkLp);
    clunkLp.connect(clunkGain);
    clunkGain.connect(master);
    clunkSrc.start(t);

    // ── Motor whine (sawtooth oscillator sweeping up as door rises) ──
    const motor     = _audioCtx.createOscillator();
    const motorGain = _audioCtx.createGain();
    motor.type = 'sawtooth';
    motor.frequency.setValueAtTime(70, t);
    motor.frequency.linearRampToValueAtTime(155, t + dur * 0.75);
    motor.frequency.linearRampToValueAtTime(110, t + dur);
    motorGain.gain.setValueAtTime(0.0, t);
    motorGain.gain.linearRampToValueAtTime(0.18, t + 0.08);
    motorGain.gain.setValueAtTime(0.18, t + dur - 0.35);
    motorGain.gain.linearRampToValueAtTime(0.0, t + dur);
    motor.connect(motorGain);
    motorGain.connect(master);
    motor.start(t);
    motor.stop(t + dur);

    // ── Low rumble (bandpass noise around 110 Hz — vibration of the door frame) ──
    const rumbleLen  = Math.floor(_audioCtx.sampleRate * dur);
    const rumbleBuf  = _audioCtx.createBuffer(1, rumbleLen, _audioCtx.sampleRate);
    const rumbleData = rumbleBuf.getChannelData(0);
    for (let i = 0; i < rumbleLen; i++) rumbleData[i] = Math.random() * 2 - 1;
    const rumbleSrc  = _audioCtx.createBufferSource();
    const rumbleBp   = _audioCtx.createBiquadFilter();
    const rumbleGain = _audioCtx.createGain();
    rumbleSrc.buffer       = rumbleBuf;
    rumbleBp.type          = 'bandpass';
    rumbleBp.frequency.value = 110;
    rumbleBp.Q.value         = 2.5;
    rumbleGain.gain.setValueAtTime(0.0, t);
    rumbleGain.gain.linearRampToValueAtTime(1.0, t + 0.12);
    rumbleGain.gain.setValueAtTime(1.0, t + dur - 0.4);
    rumbleGain.gain.linearRampToValueAtTime(0.0, t + dur);
    rumbleSrc.connect(rumbleBp);
    rumbleBp.connect(rumbleGain);
    rumbleGain.connect(master);
    rumbleSrc.start(t);

    // ── Metallic slide (bandpass noise around 550 Hz — sliding track friction) ──
    const slideLen  = Math.floor(_audioCtx.sampleRate * dur);
    const slideBuf  = _audioCtx.createBuffer(1, slideLen, _audioCtx.sampleRate);
    const slideData = slideBuf.getChannelData(0);
    for (let i = 0; i < slideLen; i++) slideData[i] = Math.random() * 2 - 1;
    const slideSrc  = _audioCtx.createBufferSource();
    const slideBp   = _audioCtx.createBiquadFilter();
    const slideGain = _audioCtx.createGain();
    slideSrc.buffer        = slideBuf;
    slideBp.type           = 'bandpass';
    slideBp.frequency.value  = 550;
    slideBp.Q.value          = 1.8;
    slideGain.gain.setValueAtTime(0.0, t);
    slideGain.gain.linearRampToValueAtTime(0.35, t + 0.18);
    slideGain.gain.setValueAtTime(0.35, t + dur - 0.4);
    slideGain.gain.linearRampToValueAtTime(0.0, t + dur);
    slideSrc.connect(slideBp);
    slideBp.connect(slideGain);
    slideGain.connect(master);
    slideSrc.start(t);
}

function shoot() {
    if (!locked) return;
    playShot();
    muzzleLight.intensity = 6;
    setTimeout(() => { muzzleLight.intensity = 0; }, 60);

    shootRay.setFromCamera({ x: 0, y: 0 }, camera);

    const targets = [];
    if (!greenDoor.leftShot)              targets.push(btnLeft);
    if (!greenDoor.rightShot)             targets.push(btnRight);
    if (!blueState.leftShot)              targets.push(blueBtnLeft);
    if (!blueState.rightShot)             targets.push(blueBtnRight);
    if (pinkState.active && !pinkState.doorOpen) targets.push(pinkBtn);
    if (!yellowDoorState.shot)                   targets.push(sign4);
    if (!tealDoorState.open)                     targets.push(tealBtn);
    targets.push(c6EntranceBtn);
    targets.push(c7Btn);
    targets.push(websiteBtn);
    targets.push(conceptsBtn);

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
        playDoorOpen();
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
            blueState.leftShot  = false;
            blueState.rightShot = false;
            blueDoor.visible = true;
            blueDoor.position.y = CH / 2;
            blueDoorGlow.color.set(0x0055ff);
            blueBtnLeft.material  = blueBtnMat;
            blueBtnRight.material = blueBtnMat;
            blueBtnGlowL.color.set(0x2288ff);
            blueBtnGlowR.color.set(0x2288ff);

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
            // Open pink door, allow full corridor 4
            pinkState.doorOpen = true;
            pinkDoorGlow.color.set(0xffffff);
            playerMinZ = YELLOW_DOOR_Z + 0.5;
            playDoorOpen();
        }
    }

    // ── Teal button (corridor 5 door) ──
    if (hit === tealBtn && !tealDoorState.open) {
        const onCircle = Math.abs(camera.position.z - CIRCLE_Z) < 1.0 &&
                         Math.abs(camera.position.x) < 1.0;
        if (onCircle) {
            tealDoorState.open = true;
            tealBtn.material = tealBtnShotMat;
            tealBtnGlow.color.set(0xff4400);
            tealDoorGlow.color.set(0xffffff);
            playerMinZ = ORANGE_DOOR_Z + 0.5;
            playDoorOpen();
        }
    }

    // ── C6 entrance button — toggle crush walls + orange door ──
    if (hit === c6EntranceBtn) {
        c6CrushState.active = !c6CrushState.active;
        if (c6CrushState.active) {
            c6EntranceBtn.material = c6BtnShotMat;
            c6EntranceBtnGlow.color.set(0xff4400);
        } else {
            c6EntranceBtn.material = c6BtnMat;
            c6EntranceBtnGlow.color.set(0xff6600);
        }
    }

    // ── C7 platform button ──
    if (hit === c7Btn) {
        c7State.up = !c7State.up;
        c7Btn.material = c7State.up ? c7BtnShotMat : c7BtnMat;
        c7BtnGlow.color.set(c7State.up ? 0x440066 : 0xcc66ff);
    }

    // ── Rooftop website button ──
    if (hit === websiteBtn) {
        window.location.href = 'archive/games/desktop-games/platforetris/index.html';
    }

    if (hit === conceptsBtn) {
        window.location.href = 'concepts/index.html';
    }

    // ── Yellow sign (corridor 4 button) ──
    if (hit === sign4 && !yellowDoorState.shot) {
        yellowDoorState.shot = true;
        sign4.visible     = false;
        sign4Shot.visible = true;
        sign4Glow.color.set(0xff4400);
        yellowDoorState.open = true;
        yellowDoorGlow.color.set(0xffffff);
        playerMinZ = TEAL_DOOR_Z + 0.5;
        playDoorOpen();
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

function updateYellowDoor(dt) {
    if (!yellowDoorState.open || !yellowDoor.visible) return;
    yellowDoor.position.y += dt * 5;
    if (yellowDoor.position.y > CH * 1.8) yellowDoor.visible = false;
}

function updateTealDoor(dt) {
    if (!tealDoorState.open || !tealDoor.visible) return;
    tealDoor.position.y += dt * 5;
    if (tealDoor.position.y > CH * 1.8) tealDoor.visible = false;
}

function updateC7Platform(dt) {
    if (c7State.up) {
        const target = CH + 0.1;
        if (c7Platform.position.y < target)
            c7Platform.position.y = Math.min(c7Platform.position.y + dt * 2.5, target);
    } else {
        if (c7Platform.position.y > 0.1)
            c7Platform.position.y = Math.max(c7Platform.position.y - dt * 2.5, 0.1);
    }
}

// ── C6 death + respawn ────────────────────────────────────────────────────────
const deathMsg = document.getElementById('death-msg');

function respawnAtC6Start() {
    camera.position.set(0, PLAYER_HEIGHT, TEAL_DOOR_Z - 1.5);
    player.velocity.y = 0;
    player.onGround   = false;
    player.yaw        = 0;     // face toward orange door (negative z)
    player.pitch      = 0;
    playerOutside     = false; // back inside the corridors

    // Retract walls and reset button
    c6CrushState.active      = false;
    c6CrushLeft.position.x   = -CW;
    c6CrushRight.position.x  =  CW;
    c6EntranceBtn.material   = c6BtnMat;
    c6EntranceBtnGlow.color.set(0xff6600);

    // Close orange door instantly
    orangeDoor.position.y = CH / 2;
    orangeDoor.visible    = true;
    c6OrangeDoor.open     = false;
}

function triggerDeath() {
    if (playerDead) return;
    playerDead = true;
    deathMsg.classList.add('visible');
    setTimeout(() => {
        deathMsg.classList.remove('visible');
        respawnAtC6Start();
        playerDead = false;
    }, 2000);
}

function respawnAtC7Start() {
    camera.position.set(0, PLAYER_HEIGHT, ORANGE_DOOR_Z - 1.5);
    player.velocity.y = 0;
    player.onGround   = false;
    player.yaw        = 0;
    player.pitch      = 0;
    playerOutside     = false;

    // Reset platform and button to initial state
    c7State.up             = false;
    c7Platform.position.y  = 0.1;
    c7Btn.material         = c7BtnMat;
    c7BtnGlow.color.set(0xcc66ff);
}

function respawnAtRooftop() {
    camera.position.set(0, RTOP_TOP_Y + PLAYER_HEIGHT, WEBSITE_BTN_Z + 1.8);
    player.velocity.set(0, 0, 0);
    player.onGround   = true;
    player.yaw        = Math.PI;
    player.pitch      = -0.08;
    playerOutside     = true;

    c7State.up            = false;
    c7Platform.position.y = 0.1;
    c7Btn.material        = c7BtnMat;
    c7BtnGlow.color.set(0xcc66ff);
}

// Same YOU DIED overlay as corridor 6, but falling deaths return to the rooftop.
function triggerDeathRooftop() {
    if (playerDead) return;
    playerDead = true;
    deathMsg.classList.add('visible');
    setTimeout(() => {
        deathMsg.classList.remove('visible');
        respawnAtRooftop();
        playerDead = false;
    }, 2000);
}

// ── C6 crush walls + orange door ──────────────────────────────────────────────
const C6_CRUSH_SPEED = 1.2; // units per second

function updateC6CrushWalls(dt) {
    if (c6CrushState.active) {
        // Close: inner face moves toward x = 0  →  center = ±CW/2
        c6CrushLeft.position.x  = Math.min(c6CrushLeft.position.x  + C6_CRUSH_SPEED * dt, -CW/2);
        c6CrushRight.position.x = Math.max(c6CrushRight.position.x - C6_CRUSH_SPEED * dt,  CW/2);
    } else {
        // Retract: blocks slide back into the walls
        c6CrushLeft.position.x  = Math.max(c6CrushLeft.position.x  - C6_CRUSH_SPEED * dt, -CW);
        c6CrushRight.position.x = Math.min(c6CrushRight.position.x + C6_CRUSH_SPEED * dt,  CW);
    }

    if (playerOutside) return;

    // AABB push-out (only while blocks are not fully retracted)
    const PR = 0.45;
    const HW = CW / 2;
    const HD = C6_CRUSH_LEN / 2;

    for (const wall of [c6CrushLeft, c6CrushRight]) {
        if (wall === c6CrushLeft  && wall.position.x <= -CW) continue;
        if (wall === c6CrushRight && wall.position.x >=  CW) continue;

        const dx = camera.position.x - wall.position.x;
        const dz = camera.position.z - C6_CRUSH_CTRZ;
        const ox = (PR + HW) - Math.abs(dx);
        const oz = (PR + HD) - Math.abs(dz);
        if (ox <= 0 || oz <= 0) continue;
        if (ox < oz) {
            camera.position.x += Math.sign(dx) * ox;
        } else {
            camera.position.z += Math.sign(dz) * oz;
        }
    }

    // Crush detection: player is in the zone and the gap is smaller than their body
    if (c6CrushState.active && !playerDead) {
        const pz = camera.position.z;
        if (pz <= C6_CRUSH_Z1 && pz >= C6_CRUSH_Z2) {
            const leftInner  = c6CrushLeft.position.x  + HW;
            const rightInner = c6CrushRight.position.x - HW;
            if (rightInner - leftInner < PR * 2) {
                triggerDeath();
            }
        }
    }
}

function updateOrangeDoor(dt) {
    if (c6CrushState.active) {
        // Open: slide door up
        if (orangeDoor.position.y < CH * 1.8) {
            orangeDoor.visible = true;
            orangeDoor.position.y = Math.min(orangeDoor.position.y + dt * 5, CH * 1.8);
            if (orangeDoor.position.y >= CH * 1.8) {
                orangeDoor.visible = false;
                c6OrangeDoor.open = true;
                playerMinZ = PURPLE_DOOR_Z + 0.5;
                playDoorOpen();
            }
        }
    } else {
        // Close: slide door back down
        if (c6OrangeDoor.open || orangeDoor.position.y > CH / 2) {
            orangeDoor.visible = true;
            orangeDoor.position.y = Math.max(orangeDoor.position.y - dt * 5, CH / 2);
            if (orangeDoor.position.y <= CH / 2) {
                c6OrangeDoor.open = false;
                orangeDoorGlow.color.set(0xff6600);
                playerMinZ = ORANGE_DOOR_Z + 0.5;
            }
        }
    }
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
            playBlockLand();
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
            playDoorOpen();
        }
    }
}

// ── Player ↔ block push (AABB) ────────────────────────────────────────────────
function applyBlockPush() {
    if (playerOutside || !block.active || !block.onFloor) return;

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

    // footstep sound
    if (_move.lengthSq() > 0 && player.onGround) {
        _stepTimer += dt;
        if (_stepTimer >= 0.38) {
            _stepTimer = 0;
            playFootstep();
        }
    } else {
        _stepTimer = 0.2; // next step comes quickly when movement resumes
    }

    if (keys['Space'] && player.onGround) {
        player.velocity.y = JUMP_VELOCITY;
        player.onGround   = false;
    }
    player.velocity.y -= GRAVITY * dt;
    camera.position.y += player.velocity.y * dt;

    // ── Platform collision ──
    const platTop   = c7Platform.position.y + 0.1;
    const onPlatXZ  = Math.abs(camera.position.x)              < C7_HOLE_S / 2 - 0.05
                   && Math.abs(camera.position.z - C7_HOLE_Z)  < C7_HOLE_S / 2 - 0.05;
    const feetAbovePlat = (camera.position.y - PLAYER_HEIGHT) - platTop;
    if (onPlatXZ && player.velocity.y <= 0 && feetAbovePlat >= -0.3 && feetAbovePlat <= 0.25) {
        camera.position.y = platTop + PLAYER_HEIGHT;
        player.velocity.y = 0;
        player.onGround   = true;
    }

    // ── Inside ↔ outside transition ──
    const overHole   = Math.abs(camera.position.x)             < C7_HOLE_S / 2
                    && Math.abs(camera.position.z - C7_HOLE_Z) < C7_HOLE_S / 2;
    const rooftopY   = CH + 0.25 + PLAYER_HEIGHT; // camera y when standing on rooftop slab (top at CH+0.25)

    if (!playerOutside && camera.position.y > CH + PLAYER_HEIGHT) playerOutside = true;
    if (playerOutside  && overHole && camera.position.y < CH)      playerOutside = false;

    // ── Floor / rooftop collision ──
    if (playerOutside) {
        // Only treat the roof as solid within the actual slab footprint.
        // Off the edge: gravity takes over, player falls to their death.
        const onRooftopSlab = Math.abs(camera.position.x) < (CW + 0.6) / 2
                           && camera.position.z > PURPLE_DOOR_Z
                           && camera.position.z < CL / 2;
        if (!overHole && onRooftopSlab && camera.position.y <= rooftopY) {
            camera.position.y = rooftopY;
            player.velocity.y = 0;
            player.onGround   = true;
        }
        // ── Floating platform collision ──
        const onFloatPlatXZ      = Math.abs(camera.position.x - FLOAT_PLAT_X) < FLOAT_PLAT_HW
                                && Math.abs(camera.position.z - FLOAT_PLAT_Z) < FLOAT_PLAT_HD;
        const feetAboveFloatPlat = (camera.position.y - PLAYER_HEIGHT) - FLOAT_PLAT_TOP;
        if (onFloatPlatXZ && player.velocity.y <= 0 && feetAboveFloatPlat >= -0.3 && feetAboveFloatPlat <= 0.25) {
            camera.position.y = FLOAT_PLAT_TOP + PLAYER_HEIGHT;
            player.velocity.y = 0;
            player.onGround   = true;
        }
        // Fell off the edge — die once the player drops below the ceiling line.
        if (!overHole && camera.position.y < CH) {
            triggerDeathRooftop();
        }
    } else {
        if (camera.position.y <= PLAYER_HEIGHT) {
            camera.position.y = PLAYER_HEIGHT;
            player.velocity.y = 0;
            player.onGround   = true;
        }
    }

    // ── X/Z constraints ──
    if (playerOutside) {
        camera.position.x = Math.max(-40, Math.min(40, camera.position.x));
        camera.position.z = Math.max(PURPLE_DOOR_Z - 6, Math.min(CL / 2 + 6, camera.position.z));
    } else {
        camera.position.x = Math.max(-CW/2 + 0.45, Math.min(CW/2 - 0.45, camera.position.x));
        camera.position.z = Math.max(playerMinZ, Math.min(playerMaxZ, camera.position.z));
    }

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
// ── Corridor culling ──────────────────────────────────────────────────────────
// Determines which corridor (0–6) the camera is currently in based on Z position.
function _corridorIdx() {
    const z = camera.position.z;
    if (z > DOOR_Z)         return 0;
    if (z > BLUE_DOOR_Z)    return 1;
    if (z > PINK_DOOR_Z)    return 2;
    if (z > YELLOW_DOOR_Z)  return 3;
    if (z > TEAL_DOOR_Z)    return 4;
    if (z > ORANGE_DOOR_Z)  return 5;
    return 6;
}
let _lastCorridor = -1;

// Shows only the current corridor and its immediate neighbours; hides all others.
// Only runs when the corridor index actually changes to avoid per-frame overhead.
function updateCorridorCulling() {
    const idx = _corridorIdx();
    if (idx === _lastCorridor) return;
    _lastCorridor = idx;
    corridorGroups.forEach((g, i) => { g.visible = Math.abs(i - idx) <= 1; });
}

function warmCorridorCulling() {
    const startZ = camera.position.z;
    const startLastCorridor = _lastCorridor;

    // Pre-render each corridor visibility set once so geometry, materials, and
    // light/shader combinations are prepared before the player reaches them.
    [
        CL / 2 - 1.5,
        DOOR_Z - 2,
        BLUE_DOOR_Z - 2,
        PINK_DOOR_Z - 2,
        YELLOW_DOOR_Z - 2,
        TEAL_DOOR_Z - 2,
        ORANGE_DOOR_Z - 2
    ].forEach(z => {
        camera.position.z = z;
        _lastCorridor = -1;
        updateCorridorCulling();
        renderer.compile(scene, camera);
        renderer.render(scene, camera);
    });

    camera.position.z = startZ;
    _lastCorridor = -1;
    updateCorridorCulling();
    _lastCorridor = startLastCorridor;
}

let last = performance.now();

function loop() {
    requestAnimationFrame(loop);
    const now = performance.now();
    const dt  = Math.min((now - last) / 1000, 0.05);
    last = now;

    updateCorridorCulling();
    if (locked && !playerDead) {
        updatePlayer(dt);
        updateGreenDoor(dt);
        updateBlueDoor(dt);
        updatePinkDoor(dt);
        updateYellowDoor(dt);
        updateTealDoor(dt);
        updateC6CrushWalls(dt);
        updateOrangeDoor(dt);
        updateBlock(dt);
        updateC7Platform(dt);
    }
    updateExteriorVertexTooltip();
    renderer.render(scene, camera);
}

//── Dev mode: set corridor number (1–7) to spawn there ───────────────────────
/*const DEV_CORRIDOR = 7;
(c => {
    const z = [CL/2-1.5, DOOR_Z-2, BLUE_DOOR_Z-2, PINK_DOOR_Z-2, YELLOW_DOOR_Z-2, TEAL_DOOR_Z-2, ORANGE_DOOR_Z-2][c-1];
    camera.position.z = z;
    if (c >= 2) { door.visible = false;      greenDoor.open = true;      playerMinZ = BLUE_DOOR_Z   + 0.5; }
    if (c >= 3) { blueDoor.visible = false;  blueState.open = true;      playerMinZ = PINK_DOOR_Z   + 0.5; }
    if (c >= 4) { pinkDoor.visible = false;  pinkState.doorOpen = true;  playerMinZ = YELLOW_DOOR_Z + 0.5; }
    if (c >= 5) { yellowDoor.visible = false; yellowDoorState.shot = true; yellowDoorState.open = true; playerMinZ = TEAL_DOOR_Z + 0.5; }
    if (c >= 6) { tealDoor.visible = false;  tealDoorState.open = true;  playerMinZ = ORANGE_DOOR_Z + 0.5; }
    if (c >= 7) { orangeDoor.visible = false; c6OrangeDoor.open = true;  playerMinZ = PURPLE_DOOR_Z + 0.5; }
})(DEV_CORRIDOR);*/

warmCorridorCulling();
applyRequestedSpawn();
loop();

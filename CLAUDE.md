# CLAUDE.md — all-an.github.io

Personal portfolio site for Allan Pereira Abrahão.
Combines a landing page, two browser games, and a full mathematics learning platform.
No build tools, no bundlers, no frameworks — pure HTML, CSS, and ES6 JavaScript.

---

## Code principles

- **Clean code always.** Every function, constant, and section must be named clearly and do one thing.
- **Comment all code.** Every function gets a comment explaining what it does and why.
  Every non-obvious block gets an inline comment. Magic numbers get a unit or meaning comment.
- **No dead code.** Remove unused variables, unreferenced classes, and leftover debug logs.
- **No premature abstractions.** Three similar lines are better than a helper that is only called twice.
- **No backwards-compatibility hacks.** If something is unused, delete it entirely.

---

## Repository layout

```
/
├── index.html              # Root landing page (LinkedIn, Games, Learn, Website buttons)
├── main-style.css          # Global dark theme + Matrix rain keyframe animations
├── main.js                 # Matrix digital-rain canvas background effect
│
├── games/
│   ├── games.html          # Game selector page (Haphazard, Platforetris)
│   ├── haphazard/
│   │   ├── index.html      # Game shell: HUD, blocker overlay, crosshair, death screen
│   │   ├── style.css       # Fullscreen UI: crosshair, hit-marker, blocker, death text
│   │   └── game.js         # All game logic (~1100 lines, Three.js ES6 module)
│   ├── platforetris/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── game.js         # Tetris-style platformer
│   └── music/
│       ├── retro-song.js   # 8-bit chiptune (Web Audio API, 140 BPM, D Dorian)
│       └── ambient-sound.js# Procedural drone atmosphere (Web Audio API, A Phrygian)
│
└── learn/
    ├── index.html          # Learn hub (single "Learn Math" button)
    └── learn-math/
        ├── index.html      # Math curriculum index (78 topics, 6 coloured sections)
        └── topics/
            ├── 001-counting-and-natural-numbers/
            │   ├── index.html   # Lesson page
            │   ├── script.js    # Interactive widgets
            │   ├── style.css    # Topic styles
            │   └── exercises/   # Coding exercises (index.html, script.js, style.css)
            ├── 002-addition-and-subtraction/   (same layout + exercises/)
            ├── 003-multiplication-and-division/ (same layout + exercises/)
            ├── 004-fractions-and-decimals/      (same layout + exercises/)
            └── 005-078/                         (lesson only — no exercises folder yet)
```

---

## Landing page (`index.html` + `main-style.css` + `main.js`)

### Visual design

- Background: `#0a0a0a`, animated Matrix digital rain on a full-screen `<canvas>`.
- Typography: monospace (`Consolas / Monaco / Courier New`).
- Accent gradient: `#00ff88` → `#00ccff`.
- Buttons are styled uniformly via `.linkedin-btn` (white border, transparent background, hover cyan glow).

### Matrix rain (`main.js`)

```
Characters: Kanji + A-Z + a-z + 0-9 + symbols
Font size : 10px
Columns   : Math.floor(canvas.width / fontSize)
Interval  : 35 ms per frame
Trail     : fillRect with rgba(0,0,0,0.04) each frame — produces the fade tail
Reset prob: 0.975 chance a column resets from top when it reaches the bottom
```

The canvas is position-fixed, behind all content (`z-index: 0`), pointer-events none.

### Navigation

| Button     | Destination                            |
|------------|----------------------------------------|
| LinkedIn   | https://www.linkedin.com/in/…          |
| Games      | `games/games.html`                     |
| Website    | https://allanpereiraabrahao.onrender.com |
| Learn      | `learn/index.html`                     |

---

## Games hub (`games/games.html`)

Single page listing both games. Reuses `main-style.css` for the Matrix background.
Buttons navigate to `haphazard/index.html` and `platforetris/index.html`.
A "← back" link returns to the root `index.html`.

---

## Haphazard (`games/haphazard/`)

A first-person 3D corridor maze built with **Three.js** (imported from CDN as an ES6 module).
The player shoots buttons with a raycaster to unlock doors and progress through 7 corridors.

### Entry point (`index.html`)

Loads `game.js` as `type="module"`. Contains HUD markup:

| Element ID      | Purpose                                         |
|-----------------|-------------------------------------------------|
| `#blocker`      | Full-screen overlay shown before pointer lock   |
| `#crosshair`    | Fixed `+` symbol at viewport centre            |
| `#hit-marker`   | Brief glow flash when a target is hit           |
| `#death-msg`    | Centred red text shown for 2 s on player death  |
| `#hud`          | Container for all above elements                |

### Spatial constants (`game.js`, top of file)

Every corridor's geometry is derived from constants so that moving one corridor
shifts every downstream coordinate automatically.

```
PLAYER_SPEED     = 5      units/s
PLAYER_HEIGHT    = 1.7    units (eye level above floor)
GRAVITY          = 20     units/s²
JUMP_VELOCITY    = 7      units/s
LOOK_SENSITIVITY = 0.002  radians per pixel

CW = 4     corridor width
CH = 3.8   corridor height
```

#### Z-axis layout (negative Z = deeper into the game)

```
Corridor 1   CL  = 22     z: +11  →  -11        DOOR_Z        = -11
Corridor 2   CL2 = 26     z: -11  →  -37        BLUE_DOOR_Z   = -37
Corridor 3   CL3 = 22     z: -37  →  -59        PINK_DOOR_Z   = -59
Corridor 4   CL4 = 20     z: -59  →  -79        YELLOW_DOOR_Z = -79
Corridor 5   CL5 = 24     z: -79  → -103        TEAL_DOOR_Z   = -103
Corridor 6   CL6 = 20     z:-103  → -123        ORANGE_DOOR_Z = -123
Corridor 7   CL7 = 22     z:-123  → -145        PURPLE_DOOR_Z = -145

C7 roof hole: C7_HOLE_Z = -142, C7_HOLE_S = 1.8 (square side length)
```

### Scene setup

```js
renderer  → WebGLRenderer, antialiased, fills viewport, no shadow map
scene     → background #050508, Fog(#050508, near=10, far=55)
camera    → PerspectiveCamera(75°, aspect, near=0.1, far=120)
           starts at (0, PLAYER_HEIGHT, CL/2 - 1.5)
```

### Materials

Each corridor / interactive element has its own named material constant:

| Constant          | Color          | Used for                                |
|-------------------|----------------|-----------------------------------------|
| `wallMat`         | `#1c1c2c`      | All corridor walls and ceiling          |
| `floorMat`        | `#111118`      | All corridor floors                     |
| `ceilMat`         | `#16161f`      | All corridor ceilings                   |
| `doorMat`         | Green          | Corridor 1 door                         |
| `btnMat`          | Bright green   | Corridor 1 buttons (inactive)           |
| `btnShotMat`      | Dark orange    | Corridor 1 buttons (after shot)         |
| `blueBtnMat`      | Blue           | Corridor 2 buttons (inactive)           |
| `blueBtnShotMat`  | Dark orange    | Corridor 2 buttons (after shot)         |
| `pinkBtnMat`      | Bright pink    | Corridor 3 button (inactive)            |
| `pinkBtnInactMat` | Dim pink       | Corridor 3 button (deactivated)         |
| `tealBtnMat`      | Teal           | Corridor 5 button (inactive)            |
| `tealBtnShotMat`  | Red-orange     | Corridor 5 button (after shot)          |
| `c6BtnMat`        | Orange         | Corridor 6 entrance button (inactive)   |
| `c6BtnShotMat`    | Dark red        | Corridor 6 entrance button (activated)  |
| `purpleDoorMat`   | Purple         | Corridor 7 door                         |
| `c7BtnMat`        | Bright purple  | Corridor 7 platform button (inactive)   |
| `c7BtnShotMat`    | Dark purple    | Corridor 7 platform button (activated)  |
| `c7PlatformMat`   | Mid purple     | Corridor 7 rising platform              |

### Geometry helper

```js
// Creates a BoxGeometry mesh, adds it to the scene, returns the mesh.
// x, y, z are the CENTRE of the box (Three.js convention).
function box(w, h, d, material, x, y, z)
```

All corridor geometry (floors, ceilings, walls, doors, buttons, panels) is built
with this helper. The return value is stored only when the mesh needs to be animated
or raycasted later.

### Corridor geometry (per corridor)

Each corridor is four calls to `box()`:

```
Floor   : box(CW, 0.2,  CL,  floorMat,  0,    -0.1,   centerZ)
Ceiling : box(CW, 0.2,  CL,  ceilMat,   0,  CH+0.1,   centerZ)
Left    : box(0.3, CH,  CL,  wallMat, -CW/2,  CH/2,   centerZ)
Right   : box(0.3, CH,  CL,  wallMat,  CW/2,  CH/2,   centerZ)
```

**Corridor 7 ceiling is split into 4 pieces** to leave a `C7_HOLE_S × C7_HOLE_S`
square hole at `C7_HOLE_Z`:
- Front piece (from orange door to hole front edge)
- Back piece  (from hole back edge to purple door)
- Left strip  (spans the hole in Z, left of hole in X)
- Right strip (symmetric)

### Number signs

Each corridor has a numeric sign on the left wall (corridor 7 on the left,
corridors 5 and 6 on the right/left respectively).

```js
// Generates a 256×256 Canvas texture with the number rendered in the given colour.
// Returns a Mesh (PlaneGeometry) with that texture applied.
function makeNumberSign(number, colour)
```

Sign 4 is special: it has two meshes (`sign4` / `sign4Shot`) that swap visibility
when shot — the normal sign hides and a dim "shot" version appears.

### Lighting

One `AmbientLight(0x606880, 3.0)` fills the whole scene.

Each corridor gets 6–7 `PointLight` fixtures mounted near the ceiling.
Every door has a coloured `PointLight` glow (matches door colour, intensity ~2, range 9).
Every button has a small `PointLight` glow at `BTN_Y` height.
A `muzzleLight` (yellow, intensity 0 at rest) flashes briefly on each shot.

### Starfield

3000 `THREE.Points` distributed above the corridor strip:

```
x : (random − 0.5) × 120   (wide spread)
y : CH + 5  +  random × 60  (above all ceilings)
z : CL/2  −  random × 220   (along and beyond the corridor strip)
```

Visible only once the player exits through the Corridor 7 roof hole.

### Player state

```js
const player = {
    velocity : new THREE.Vector3(),   // only y is used (gravity / jump)
    onGround : false,                 // true when feet touch floor or platform
    yaw      : 0,                     // horizontal look angle (radians)
    pitch    : 0,                     // vertical look angle (clamped ±π/2.2)
};
```

### Door & game states

```js
const greenDoor  = { leftShot, rightShot, open }   // Corridor 1
const blueState  = { leftShot, rightShot, open }   // Corridor 2
const block      = { active, onFloor, velocityY }  // Corridor 2 falling block
const pinkState  = { active, doorOpen, cycleShots }// Corridor 3
const yellowDoorState = { shot, open }             // Corridor 4
const tealDoorState   = { open }                   // Corridor 5
const c6CrushState    = { active }                 // Corridor 6 crush walls
const c6OrangeDoor    = { open }                   // Corridor 6 exit door
const c7State         = { up }                     // Corridor 7 platform direction
let playerDead    = false
let playerOutside = false                          // true when above the roof
let playerMinZ    = …   // updated as doors open (prevents backtracking)
let playerMaxZ    = …
let blueButtonsReset = false  // blue button cycle flag (corridor 2/3 interaction)
```

### Input & pointer lock

```js
const keys = {}
// keydown → keys[e.code] = true
// keyup   → keys[e.code] = false

// Pointer lock on blocker click.
// On lock: hide blocker, start ambient music (via sessionStorage flag).
// On unlock: show blocker.
```

### Shooting system

```js
function shoot()
// Called on every left mouse-button click (mousedown, button 0).
// 1. Plays laser sound (sawtooth oscillator sweep 1800→400 Hz, 120 ms, gain 0.04).
// 2. Flashes muzzle light for 60 ms.
// 3. Fires a Raycaster from camera centre.
// 4. Builds a dynamic targets[] array (only shootable objects for current state).
// 5. On hit: shows hit-marker for 80 ms, dispatches to per-button handlers.
```

Target conditions (only added when relevant):

| Target          | Added when                              |
|-----------------|-----------------------------------------|
| `btnLeft`       | Green door left button not yet shot     |
| `btnRight`      | Green door right button not yet shot    |
| `blueBtnLeft`   | Blue left button not yet shot           |
| `blueBtnRight`  | Blue right button not yet shot          |
| `pinkBtn`       | Pink button active and door not open    |
| `sign4`         | Yellow door not yet shot                |
| `tealBtn`       | Teal door not yet open                  |
| `c6EntranceBtn` | Always (it's a toggle)                  |
| `c7Btn`         | Always (it's a toggle)                  |

### Corridor puzzles in detail

#### Corridor 1 — Green door (dual buttons)

Two buttons on opposite walls at `BTN_Z = DOOR_Z + 1.8`.
Both must be shot. Order does not matter.
When both are shot: green door opens (slides up at 5 units/s, disappears above frame),
`playerMinZ` advances to `BLUE_DOOR_Z + 0.5`.

#### Corridor 2 — Blue door (block puzzle)

Two buttons on opposite walls. Both must be shot.
Shooting both triggers the **hatch** above `HATCH_Z` to open and a **block** to fall.

Block physics:
```
velocityY  starts at 0, gravity applies each frame
onFloor    true when block.y ≤ 0.4 (touches floor)
Confined   x ∈ [DOOR_Z − BLOCK/2, BLUE_DOOR_Z + BLOCK/2]
           z ∈ [−1.8, 1.8]
Player pushes block via AABB overlap in updatePlayer → applyBlockPush()
Blue area  flat marker at BLUE_AREA_Z — block on it opens the blue door
```

#### Corridor 3 — Pink button (2-cycle toggle)

One button on the left wall. First shot:
- Resets blue buttons to inactive state (allows second cycle).
- Returns block to ceiling position, re-shows hatch.

Second shot (after blue buttons re-shot):
- Opens the pink door.
- `playerMinZ` advances to `YELLOW_DOOR_Z + 0.5`.

#### Corridor 4 — Yellow sign (shoot the sign)

The number "4" sign on the left wall is the button.
Shot once: sign swaps to a dim variant, yellow door opens.

#### Corridor 5 — Teal button (location requirement)

A teal circle is painted on the floor at `CIRCLE_Z = YELLOW_DOOR_Z + 2.5`.
The teal button fires only if the player is within 1 unit of the circle centre.
Opens teal door → `playerMinZ` to `ORANGE_DOOR_Z + 0.5`.

#### Corridor 6 — Crush walls + orange door

**C6 entrance button** (left wall near teal door):
Toggles `c6CrushState.active`. Each toggle starts or stops the crush wall cycle.

Crush walls (`c6CrushLeft`, `c6CrushRight`):
```
Start position : x = ±CW (fully hidden inside side walls)
Close speed    : 1.2 units/s inward
Open speed     : 1.2 units/s outward
Death zone     : gap < 0.9 units (player radius 0.45 × 2) → player dies
```

Orange door opens via crush-wall logic — after a full inward cycle the door
slides up and `playerMinZ` advances to `PURPLE_DOOR_Z + 0.5`.

Respawn: 2-second death overlay, camera snaps to `TEAL_DOOR_Z − 1.5`, player state resets.

#### Corridor 7 — Platform (roof hole)

**Ceiling**: split into 4 pieces with a `1.8 × 1.8` hole at `C7_HOLE_Z = −142`.

**Platform** (`c7Platform`):
```
Size    : C7_HOLE_S × 0.2 × C7_HOLE_S
Start y : 0.1 (floor level)
End y   : CH + 0.1 (fills hole flush with ceiling)
Speed   : 2.5 units/s (up or down)
```

**Button** (left wall at `C7_CENTER_Z`, below the "7" sign):
Toggle — first shot raises platform, second shot lowers it.
Material and glow color flip with each toggle.

**Player riding the platform**:
Every frame, if the player's XZ falls within the platform footprint and their feet
are within `[platTop − 0.3, platTop + 0.25]`, they snap to `platTop + PLAYER_HEIGHT`.
This makes the player ride the platform up through the hole.

**Outside / rooftop**:
```
playerOutside = true  when camera.y > CH + PLAYER_HEIGHT
playerOutside = false when over hole AND camera.y < CH (fell back through)

Outside floor = CH + 0.2 + PLAYER_HEIGHT (top of all corridor ceilings)
Outside X     : clamped to ±40
Outside Z     : clamped to [PURPLE_DOOR_Z − 6, CL/2 + 6]
```

When outside and NOT over the hole, the rooftop acts as a solid floor.
When over the hole, there is no collision — the player can fall back inside.

### Player movement & physics (`updatePlayer`)

Called every frame when `locked && !playerDead`.

```
1. Set camera rotation from player.yaw / player.pitch.
2. Build _fwd and _right vectors from yaw.
3. Sum WASD input into _move, normalize if non-zero.
4. Translate camera X and Z by _move × PLAYER_SPEED × dt.
5. Footstep timer: tick _stepTimer while moving on ground;
   fire playFootstep() every 0.38 s; reset to 0.2 s on stop.
6. Space → set velocity.y = JUMP_VELOCITY if onGround.
7. Apply gravity: velocity.y -= GRAVITY × dt.
8. Apply vertical motion: camera.y += velocity.y × dt.
9. Platform collision snap (see Corridor 7 section).
10. Inside/outside transition check.
11. Floor or rooftop collision.
12. X/Z boundary clamp (corridor walls or outside bounds).
13. applyBlockPush() — AABB push from the Corridor 2 block.
14. Sync muzzleLight position to camera.
```

### Sound (`game.js`)

All sounds are synthesised with the **Web Audio API** — no audio files.

```js
const _audioCtx = new AudioContext()

// Laser (on every shot):
// Sawtooth oscillator, frequency 1800→400 Hz over 120 ms.
// Gain 0.04 → 0.0001 (exponential ramp). Very quiet.
function playLaser()

// Footstep (every 0.38 s while walking on ground):
// 80 ms noise buffer with exponential amplitude envelope × (1 − t/len)³.
// Lowpass filter at 300 Hz to produce a dull thud.
// Gain 0.18 (quiet but audible).
function playFootstep()
```

Ambient music starts via `startAmbient()` (from `music/ambient-sound.js`)
on the first pointer lock event. A `sessionStorage` flag propagates the
"play music on load" intent from `games.html` to `haphazard/index.html`.

### Game loop

```js
let last = performance.now()

function loop() {
    requestAnimationFrame(loop)
    const dt = Math.min((now − last) / 1000, 0.05)   // cap at 50 ms
    last = now

    if (locked && !playerDead) {
        updatePlayer(dt)
        updateGreenDoor(dt)
        updateBlueDoor(dt)
        updatePinkDoor(dt)
        updateYellowDoor(dt)
        updateTealDoor(dt)
        updateC6CrushWalls(dt)
        updateOrangeDoor(dt)
        updateBlock(dt)
        updateC7Platform(dt)
    }

    renderer.render(scene, camera)
}
```

### Development mode

```js
const DEV_CORRIDOR = 7    // set to 1–7 to spawn at that corridor

// On load: teleports camera to corridor entrance,
// pre-opens all doors up to DEV_CORRIDOR,
// advances playerMinZ accordingly.
// Set to 1 to play from the beginning.
```

---

## Music modules (`games/music/`)

### `retro-song.js`

Exports `startRetroSong()`. Plays a looping 8-bit chiptune.

```
Key/mode : D Dorian (minor feel with raised 6th)
BPM      : 140
Steps    : 64 per loop
```

Voices:
| Voice      | Oscillator  | Gain  | Notes                                |
|------------|-------------|-------|--------------------------------------|
| Melody     | square      | 0.14  | 64-step hook; 80% of step duration   |
| Bass       | triangle    | 0.20  | Root + fifth pattern; 90% duration   |
| Kick       | frequency sweep 160→40 Hz | — | exponential envelope 0.08 s |
| Snare      | noise + highpass @2000 Hz | — | on-beat 16th-note hits    |
| Hi-hat     | noise + highpass @8000 Hz | — | steady 8th-note pattern   |

First loop fades in over 1.5 s. Master gain settles at 0.15.
Recursive scheduler with look-ahead ensures gapless looping.

### `ambient-sound.js`

Exports `startAmbient()`. Procedural drone atmosphere.

```
Key/mode  : A Phrygian (dark, Eastern feel)
Reverb    : 4 s decay convolver — 55% wet / 45% dry
Lowpass   : 900 Hz cutoff, Q = 1.2
```

Drone oscillators:
| Freq     | Waveform  | Gain  | Role              |
|----------|-----------|-------|-------------------|
| A1 55 Hz | sine      | 0.30  | Deep root drone   |
| E2 82 Hz | sine      | 0.18  | Fifth             |
| A2 110 Hz| triangle  | 0.14  | Octave            |
| C3 131 Hz| sine      | 0.10  | Minor third       |
| E3 165 Hz| triangle  | 0.07  | Upper fifth       |

Each oscillator has random detuning (±5 cents) and a slow tremolo LFO.

Ghost tones: random notes from A4–A5 triggered at staggered intervals (0.8, 2.5, 4.2 s,
then randomly every 3–6 s). Each has a vibrato LFO (0.5–1 Hz, depth 1.5 Hz).

Texture: bandpass noise at 80 Hz with a slow 0.05 Hz "breathing" LFO.

---

## Learn platform (`learn/`)

### Hub (`learn/index.html`)

Minimal dark-themed page. One button: **Learn Math** → `learn-math/index.html`.
Back link → root `index.html`.

### Curriculum index (`learn/learn-math/index.html`)

Lists all 78 topics grouped into 6 coloured sections.
Each topic is a clickable link to `topics/NNN-slug/index.html`.

| Section                      | Topics   | Accent colour |
|------------------------------|----------|---------------|
| Foundations                  | 001–010  | Green         |
| Algebra & Pre-Calculus       | 011–025  | Blue          |
| Calculus                     | 026–037  | Red           |
| Linear Algebra & Geometry    | 038–048  | Cyan          |
| Advanced Pure Mathematics    | 049–063  | Purple        |
| AI & Machine Learning Math   | 064–078  | Gold          |

### Topic pages (`topics/NNN-slug/`)

Each topic has three files:

**`index.html`** — Lesson page structure:
```
<header>
  <div class="tag">Section · NN</div>
  <h1>Topic Title</h1>
  <p class="intro">…one-paragraph overview…</p>
</header>

<main class="content">
  <div class="section">
    <div class="section-label">Label</div>
    <h2>Heading</h2>
    <p>…</p>
    <!-- math-block, code-wrap, card-grid, callout, demo as needed -->
  </div>
  …
</main>

<div class="nav-footer">
  <a href="../NNN-prev/index.html">← NN Prev</a>
  <a href="exercises/index.html" class="exercises-link">exercises →</a>
  <a href="../NNN-next/index.html">NN+1 Next →</a>
</div>
```

**`style.css`** — All lesson pages share the same structure; copy from topic 003.
Key classes: `.section`, `.section-label`, `.math-block`, `.code-wrap`, `.card-grid`,
`.callout`, `.demo`, `.num-input`, `.nav-footer`, `.exercises-link`.

**`script.js`** — Interactive widgets (calculators, visualisations, copy buttons).
Copy buttons:
```js
// All .copy-btn elements: click → clipboard.writeText(pre.innerText)
// Button text changes to "copied" for 1.8 s.
```

Syntax highlighting in `<pre>` blocks uses span classes:
```
.kw   → #569cd6  (keywords: const, let, function, if, return, while)
.fn   → #dcdcaa  (function names)
.nm   → #b5cea8  (numbers)
.str  → #ce9178  (strings)
.cmt  → #3a3a3a  (comments, italic)
.op   → #d4d4d4  (operators)
.vr   → #9cdcfe  (variables)
.kw2  → #c586c0  (return keyword specifically)
```

### Exercise pages (`topics/NNN-slug/exercises/`)

Only topics 001–004 have exercises. The structure is identical across all four.

**`exercises/index.html`** — 8 coding challenges per topic.
Each exercise card:
```html
<div class="exercise" id="ex-N">
  <div class="ex-header">
    <span class="ex-num">0N</span>
    <span class="ex-title">…</span>
    <span class="ex-badge" id="badge-N"></span>
  </div>
  <p class="ex-desc">…description with inline <code>…</code>…</p>
  <button class="hint-toggle" data-hint="hint-N">▸ show hint</button>
  <div class="hint-box" id="hint-N">…</div>
  <div class="editor-wrap">
    <textarea class="code-editor" id="code-N" rows="…">…starter code…</textarea>
  </div>
  <div class="action-row">
    <button class="btn-run" id="run-N">▶ run</button>
    <button class="btn-reset" id="reset-N">reset</button>
    <span class="run-status" id="status-N"></span>
  </div>
  <div class="output-box" id="out-N"></div>
</div>
```

**`exercises/script.js`** — Test runner + starter code. Structure:

```js
// ── TESTS ──
// Maps exercise ID → { fn: 'functionName', cases: [{ args, expected }] }
const TESTS = { 1: { fn: '…', cases: […] }, … }

// ── STARTER ──
// Maps exercise ID → initial textarea code string
const STARTER = { 1: `function …`, … }

// ── Score tracking ──
const passed = {}
function updateScore()   // updates score display and progress bar

// ── Exercise runner ──
function runExercise(id)
// 1. Read textarea code.
// 2. Compile with new Function() in strict mode.
// 3. Extract the named function.
// 4. Run all test cases; compare JSON.stringify(result) === JSON.stringify(expected).
// 5. Render pass/fail lines in output-box with .pass-line / .fail-line spans.
// 6. Update badge, card border colour, and score.

// ── Button wiring ──
for (let id = 1; id <= 8; id++) {
    // run button → runExercise(id)
    // reset button → restore STARTER[id], clear output/badge/status
    // Tab key in textarea → insert 2 spaces
    // Ctrl/Cmd+Enter → runExercise(id)
}

// ── Hint toggles ──
// .hint-toggle click → toggle .show on hint-box, update button text
```

Test runner uses `new Function()` so the student's code executes in the browser
with no server round-trip. Arrays are compared via `JSON.stringify` for deep equality.

**`exercises/style.css`** — All exercise pages share identical CSS; copy from topic 003.
Key classes: `.score-bar`, `.exercise`, `.exercise.passed`, `.exercise.failed`,
`.ex-header`, `.ex-badge.ok`, `.ex-badge.err`, `.hint-box`, `.code-editor`,
`.btn-run`, `.btn-reset`, `.output-box`, `.pass-line`, `.fail-line`.

### Topics 001–004 exercise content

| Topic | Exercises                                                                          |
|-------|------------------------------------------------------------------------------------|
| 001   | Multiple-choice and fill-in-the-blank (no coding); different runner in script.js   |
| 002   | add, subtract, absDiff, sign, sumRange, countDown, clamp, isInRange                |
| 003   | multiply, mulRepeat, safeDivide, factorial, isDivisible, gcd, timesTable, primeFactors |
| 004   | simplify, addFractions, toDecimal, isProper, toMixed, multiplyFractions, roundTo, fractionToPercent |

---

## Conventions to follow when adding code

### General

- Always read existing files before editing them.
- Match the exact indentation style of the file being edited (4-space in game.js, 2-space in lesson HTML).
- Name new state variables with the corridor prefix (`c7`, `c6`, etc.) or topic slug.
- Place new constants at the top of `game.js` in the relevant corridor block.
- Place new materials directly after the existing material block.
- Place new geometry in the correct corridor section (search for the `// ── Corridor N ──` comment).

### Adding a new corridor mechanic

1. Add any new spatial constants in the constants block at the top.
2. Add new materials in the materials block.
3. Add geometry in the corridor section.
4. Add a state object near the other state objects (`const c7State = …`).
5. Add the button to the `targets[]` array in `shoot()`.
6. Add a handler block inside `shoot()` after the existing handlers.
7. Write an `updateX(dt)` function near the other update functions.
8. Call `updateX(dt)` inside the `if (locked && !playerDead)` block in `loop()`.

### Adding a new exercise topic

1. Create the folder: `learn/learn-math/topics/NNN-slug/`.
2. Copy `style.css` from topic 003 (lesson styles are identical).
3. Copy `exercises/style.css` from topic 003 exercises.
4. Write `index.html` following the lesson template (header, sections, nav-footer).
5. Write `script.js` with interactive widgets and copy-button wiring.
6. Write `exercises/index.html` with 8 exercise cards.
7. Write `exercises/script.js` with `TESTS`, `STARTER`, the runner, and hint wiring.
8. Update the `nav-footer` of the previous topic to link forward.
9. Update `learn-math/index.html` to link to the new topic.

### Syntax-highlighted code blocks in lessons

Wrap the raw `<pre>` text in spans manually:
```html
<pre id="code-example">
<span class="kw">function</span> <span class="fn">add</span>(<span class="vr">a</span>, <span class="vr">b</span>) {
    <span class="kw2">return</span> <span class="vr">a</span> <span class="op">+</span> <span class="vr">b</span>;
}
<span class="fn">console</span>.<span class="fn">log</span>(<span class="fn">add</span>(<span class="nm">1</span>, <span class="nm">2</span>)); <span class="cmt">// 3</span>
</pre>
```

Always pair the `<pre>` with a copy button:
```html
<div class="code-wrap">
  <div class="code-label">js</div>
  <button class="copy-btn" data-target="code-example">copy</button>
  <pre id="code-example">…</pre>
</div>
```

---

## Audio conventions

All sound effects and music use the **Web Audio API** exclusively.
No `<audio>` elements, no external audio files, no libraries.

- Laser: sawtooth oscillator, frequency sweep, very low gain (0.04).
- Footstep: noise buffer + lowpass filter, short envelope, gain 0.18.
- Ambient: multiple oscillators + reverb convolver, see `ambient-sound.js`.
- Chiptune: square/triangle/noise voices, see `retro-song.js`.

When adding new sounds:
- Reuse the existing `_audioCtx` in `game.js`.
- Keep gain values low (< 0.2) — sounds mix additively.
- Always stop oscillators/sources after they finish to avoid memory leaks.

---

## Deployment

Static site — no server required.
All pages are self-contained HTML files with relative asset paths.
Hosted on GitHub Pages from the `main` branch root.
Three.js is loaded from CDN inside `haphazard/index.html` as an importmap.

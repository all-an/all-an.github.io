// retro-song.js — 8-bit chiptune loop, dark arcade style (Dorian / minor)

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ac = null;

const BPM      = 140;
const BEAT     = 60 / BPM;
const S        = BEAT / 4; // sixteenth note duration
const R        = 0;        // rest

// ── Frequencies (D Dorian / dark arcade feel) ─────────────────────────────────
const D3  = 146.83;
const F3  = 174.61;
const A3  = 220.00;
const C4  = 261.63;
const D4  = 293.66;
const E4  = 329.63;
const F4  = 349.23;
const G4  = 392.00;
const A4  = 440.00;
const C5  = 523.25;
const D5  = 587.33;
const E5  = 659.25;
const F5  = 698.46;
const G5  = 783.99;
const A5  = 880.00;

// ── Melody — 64 steps (4 bars × 16 sixteenths) ───────────────────────────────
// Descending hook + ascending fill, no ascending C-E-G-C jumps
const MELODY = [
  A5, R,  G5, R,  F5, R,  E5, R,   D5, R,  C5, R,  R,  R,  R,  R,
  F5, R,  E5, R,  D5, R,  C5, R,   A4, R,  R,  R,  D5, R,  R,  R,
  G5, R,  A5, R,  G5, R,  F5, R,   E5, R,  D5, C5, R,  A4, R,  R,
  D5, F5, A5, R,  G5, R,  F5, E5,  D5, R,  C5, R,  D5, R,  R,  R,
];

// ── Bass line ──────────────────────────────────────────────────────────────────
const BASS = [
  D3, R,  D3, R,  A3, R,  A3, R,   F3, R,  F3, R,  C4, R,  R,  R,
  D3, R,  D3, R,  A3, R,  A3, R,   F3, R,  A3, R,  D4, R,  R,  R,
  D3, R,  D3, R,  A3, R,  A3, R,   G4, R,  F4, R,  E4, R,  R,  R,
  D3, R,  F3, R,  A3, R,  C4, R,   D4, R,  R,  R,  D3, R,  R,  R,
];

// ── Percussion ────────────────────────────────────────────────────────────────
const KICK  = [1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0,
               1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0, 1,0,0,0,1,0,0,0];
const SNARE = [0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0,
               0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,1,0,0,0];
const HIHAT = [1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0,
               1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0,1,0,1,0];

// ── Instrument helpers ────────────────────────────────────────────────────────
function square(freq, t, dur, out) {
  if (!freq) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'square';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.14, t);
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + dur + 0.01);
}

function triangle(freq, t, dur, out) {
  if (!freq) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.20, t);
  g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + dur + 0.01);
}

function kick(t, out) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.08);
  g.gain.setValueAtTime(0.28, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + 0.12);
}

function snare(t, out) {
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.09), ac.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
  src.buffer = buf;
  f.type = 'highpass'; f.frequency.value = 2000;
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  src.connect(f); f.connect(g); g.connect(out);
  src.start(t); src.stop(t + 0.1);
}

function hihat(t, out) {
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.03), ac.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
  src.buffer = buf;
  f.type = 'highpass'; f.frequency.value = 8000;
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  src.connect(f); f.connect(g); g.connect(out);
  src.start(t); src.stop(t + 0.04);
}

// ── Scheduler ─────────────────────────────────────────────────────────────────
function scheduleLoop(startTime) {
  const master = ac.createGain();
  master.gain.value = 0.15;
  master.connect(ac.destination);

  const len = MELODY.length;
  for (let i = 0; i < len; i++) {
    const t = startTime + i * S;
    square(MELODY[i],   t, S * 0.8, master);
    triangle(BASS[i],   t, S * 0.9, master);
    if (KICK[i])  kick(t, master);
    if (SNARE[i]) snare(t, master);
    if (HIHAT[i]) hihat(t, master);
  }

  const loopDur = len * S;
  setTimeout(() => scheduleLoop(startTime + loopDur), (loopDur - 0.2) * 1000);
}

export function startRetroSong() {
  if (ac) return;
  ac = new AudioCtx();
  scheduleLoop(ac.currentTime + 0.05);
}

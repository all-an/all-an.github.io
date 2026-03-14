// ambient-sound.js — Procedural mysterious ambient sound via Web Audio API

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function buildReverb(ac, seconds = 4, decay = 2.5) {
    const convolver = ac.createConvolver();
    const len       = ac.sampleRate * seconds;
    const buf       = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
        const ch = buf.getChannelData(c);
        for (let i = 0; i < len; i++) {
            ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
    }
    convolver.buffer = buf;
    return convolver;
}

function addLfo(ac, targetParam, rate, depth) {
    const lfo     = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = rate;
    lfoGain.gain.value  = depth;
    lfo.connect(lfoGain);
    lfoGain.connect(targetParam);
    lfo.start();
}

export function startAmbient() {
    if (ctx) return;          // already running
    ctx = new AudioCtx();

    // ── Master chain ──────────────────────────────────────────────────────────
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);

    const reverb = buildReverb(ctx);
    reverb.connect(master);

    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.55;
    wetGain.connect(reverb);

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.45;
    dryGain.connect(master);

    const filter = ctx.createBiquadFilter();
    filter.type            = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value         = 1.2;
    filter.connect(wetGain);
    filter.connect(dryGain);

    // ── Drone oscillators (A minor / Phrygian flavour) ────────────────────────
    const droneFreqs = [
        { freq: 55.00, type: 'sine',     vol: 0.30 },   // A1 — deep root
        { freq: 82.41, type: 'sine',     vol: 0.18 },   // E2 — fifth
        { freq: 110.0, type: 'triangle', vol: 0.14 },   // A2
        { freq: 130.81,type: 'sine',     vol: 0.10 },   // C3 — minor third
        { freq: 164.81,type: 'triangle', vol: 0.07 },   // E3
    ];

    droneFreqs.forEach(({ freq, type, vol }, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type            = type;
        osc.frequency.value = freq;
        osc.detune.value    = (Math.random() - 0.5) * 10; // slight detuning

        gain.gain.value = vol;

        // Slow tremolo per voice
        addLfo(ctx, gain.gain, 0.08 + i * 0.03, vol * 0.25);

        osc.connect(gain);
        gain.connect(filter);
        osc.start();
    });

    // ── Occasional ghostly high tones ─────────────────────────────────────────
    // A natural minor scale fragments
    const hiScale = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00];

    function ghostTone() {
        if (!ctx) return;
        const freq     = hiScale[Math.floor(Math.random() * hiScale.length)];
        const osc      = ctx.createOscillator();
        const env      = ctx.createGain();
        const duration = 4 + Math.random() * 5;
        const attack   = duration * 0.35;
        const peak     = 0.06 + Math.random() * 0.05;

        osc.type            = 'sine';
        osc.frequency.value = freq;
        addLfo(ctx, osc.frequency, 0.5 + Math.random() * 0.5, 1.5); // vibrato

        env.gain.setValueAtTime(0, ctx.currentTime);
        env.gain.linearRampToValueAtTime(peak,  ctx.currentTime + attack);
        env.gain.linearRampToValueAtTime(0,     ctx.currentTime + duration);

        osc.connect(env);
        env.connect(filter);
        osc.start();
        osc.stop(ctx.currentTime + duration + 0.1);

        // Stagger next ghost tone
        setTimeout(ghostTone, (3 + Math.random() * 6) * 1000);
    }

    // Seed a few staggered voices
    setTimeout(ghostTone, 800);
    setTimeout(ghostTone, 2500);
    setTimeout(ghostTone, 4200);

    // ── Slow low rumble / texture ─────────────────────────────────────────────
    const noiseBuffer = (() => {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const ch  = buf.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
        return buf;
    })();

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop   = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type            = 'bandpass';
    noiseFilter.frequency.value = 80;
    noiseFilter.Q.value         = 0.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.04;
    addLfo(ctx, noiseGain.gain, 0.05, 0.02); // breathing rumble

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
}

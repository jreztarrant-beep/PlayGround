// Tiny WebAudio synthesizer for hits, UI and a grim little battle loop.
let ctx = null;
let master = null;
let sfx = null;
let music = null;
let noiseBuf = null;
let enabled = true;
let musicOn = false;
let musicTimer = null;
let step = 0;
let drone = null;

function makeNoise() {
  const len = ctx.sampleRate * 1.2;
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function init() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = enabled ? 0.9 : 0;
  master.connect(ctx.destination);
  sfx = ctx.createGain();
  sfx.gain.value = 0.55;
  sfx.connect(master);
  music = ctx.createGain();
  music.gain.value = 0.3;
  music.connect(master);
  noiseBuf = makeNoise();
}

function env(node, gain, a, d, peak = 1) {
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(peak, t + a);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  node.start(t);
  node.stop(t + a + d + 0.02);
}

function noise(dur = 0.16, freq = 1800, q = 1, vol = 0.5, type = 'lowpass') {
  if (!ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  src.connect(f).connect(g).connect(sfx);
  env(src, g, 0.003, dur, vol);
}

function tone(freq, dur, type = 'sine', vol = 0.3, slide = 0, delay = 0) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), ctx.currentTime + delay + dur);
  o.connect(g).connect(sfx);
  const t = ctx.currentTime + delay;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sound = {
  init,
  get ready() { return !!ctx; },
  setEnabled(v) {
    enabled = v;
    if (master) master.gain.value = v ? 0.9 : 0;
  },
  get enabled() { return enabled; },
  toggle() {
    this.setEnabled(!enabled);
    return enabled;
  },
  play(name) {
    if (!ctx || !enabled) return;
    switch (name) {
      case 'hit':
        noise(0.12, 900, 0.8, 0.7);
        tone(150, 0.16, 'sine', 0.5, -95);
        break;
      case 'heavy':
        noise(0.22, 500, 0.7, 0.85);
        tone(95, 0.3, 'sine', 0.8, -55);
        tone(60, 0.35, 'triangle', 0.35, -20);
        break;
      case 'block':
        noise(0.07, 3200, 2, 0.35, 'bandpass');
        tone(880, 0.09, 'square', 0.12, -260);
        break;
      case 'swing':
        noise(0.12, 1500, 1.2, 0.25, 'bandpass');
        break;
      case 'special':
        tone(90, 0.5, 'sawtooth', 0.22, 320);
        noise(0.4, 2000, 0.7, 0.3, 'bandpass');
        break;
      case 'beam':
        tone(500, 0.5, 'sawtooth', 0.15, -380);
        noise(0.5, 2600, 1.4, 0.3, 'bandpass');
        break;
      case 'ko':
        noise(0.55, 320, 0.6, 0.9);
        tone(80, 0.7, 'sine', 0.8, -50);
        tone(160, 0.5, 'sawtooth', 0.15, -120);
        break;
      case 'bell':
        tone(220, 0.5, 'sine', 0.3);
        tone(440, 0.45, 'sine', 0.18);
        tone(660, 0.35, 'sine', 0.09);
        break;
      case 'select':
        tone(520, 0.07, 'square', 0.1, 120);
        break;
      case 'back':
        tone(320, 0.08, 'square', 0.08, -100);
        break;
      case 'win':
        [261, 329, 392, 523].forEach((f, i) => tone(f, 0.5, 'triangle', 0.15, 0, i * 0.11));
        break;
      case 'lose':
        tone(180, 0.4, 'sawtooth', 0.1, -60);
        break;
      default:
        break;
    }
  },
  startMusic() {
    if (!ctx || musicOn) return;
    musicOn = true;
    step = 0;
    // dark drone bed
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o1.type = 'sawtooth';
    o2.type = 'sawtooth';
    o1.frequency.value = 55;
    o2.frequency.value = 55.6;
    f.type = 'lowpass';
    f.frequency.value = 150;
    g.gain.value = 0.0001;
    g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
    o1.connect(f);
    o2.connect(f);
    f.connect(g).connect(music);
    o1.start();
    o2.start();
    drone = { o1, o2, g };
    const pattern = [55, 55, 65.41, 49, 55, 73.42, 65.41, 49];
    const ticks = 0.32;
    musicTimer = setInterval(() => {
      if (!musicOn || !ctx) return;
      const t = ctx.currentTime + 0.05;
      const base = pattern[step % pattern.length];
      const o = ctx.createOscillator();
      const gg = ctx.createGain();
      const ff = ctx.createBiquadFilter();
      o.type = 'triangle';
      o.frequency.value = base * 2;
      ff.type = 'lowpass';
      ff.frequency.value = 280;
      o.connect(ff).connect(gg).connect(music);
      gg.gain.setValueAtTime(0.0001, t);
      gg.gain.linearRampToValueAtTime(0.14, t + 0.008);
      gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.start(t);
      o.stop(t + 0.3);
      if (step % 4 === 0) {
        const k = ctx.createOscillator();
        const kg = ctx.createGain();
        k.type = 'sine';
        k.frequency.setValueAtTime(110, t);
        k.frequency.exponentialRampToValueAtTime(45, t + 0.16);
        k.connect(kg).connect(music);
        kg.gain.setValueAtTime(0.0001, t);
        kg.gain.linearRampToValueAtTime(0.22, t + 0.006);
        kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        k.start(t);
        k.stop(t + 0.22);
      }
      if (step % 2 === 1) {
        const h = ctx.createBufferSource();
        h.buffer = noiseBuf;
        const hg = ctx.createGain();
        const hf = ctx.createBiquadFilter();
        hf.type = 'highpass';
        hf.frequency.value = 5000;
        h.connect(hf).connect(hg).connect(music);
        hg.gain.setValueAtTime(0.0001, t);
        hg.gain.linearRampToValueAtTime(0.035, t + 0.005);
        hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        h.start(t);
        h.stop(t + 0.06);
      }
      step++;
    }, ticks * 1000);
  },
  stopMusic() {
    musicOn = false;
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
    if (drone) {
      try {
        drone.g.gain.cancelScheduledValues(ctx.currentTime);
        drone.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
        drone.o1.stop(ctx.currentTime + 0.8);
        drone.o2.stop(ctx.currentTime + 0.8);
      } catch (e) { /* already stopped */ }
      drone = null;
    }
  },
};

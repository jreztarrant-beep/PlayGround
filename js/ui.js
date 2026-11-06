// VILLAINS: RUMBLE — screen flow, roster selection, touch controls and results.
import { CHARACTERS, STAGES } from './characters.js';
import { FightGame } from './game.js';
import { makeCharacterCanvas, makeStageChip } from './portraits.js';
import { drawFighter, drawFighterShadow } from './art.js';
import { drawTitleBackdrop } from './stages.js';
import { seeded } from './draw-utils.js';
import { sound } from './audio.js';

const $ = (id) => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const screens = {
  title: $('screenTitle'),
  select: $('screenSelect'),
  fight: $('screenFight'),
};

const el = {
  titleCanvas: $('titleCanvas'),
  previewCanvas: $('previewCanvas'),
  rosterGrid: $('rosterGrid'),
  arenaList: $('arenaList'),
  fightBtn: $('fightBtn'),
  stepTabs: $('stepTabs'),
  modeTabs: $('modeTabs'),
  diffTabs: $('diffTabs'),
  pvOrigin: $('pvOrigin'),
  pvName: $('pvName'),
  pvTitle: $('pvTitle'),
  pvQuote: $('pvQuote'),
  pvStats: $('pvStats'),
  pvSpecial: $('pvSpecial'),
  pvSpecialDesc: $('pvSpecialDesc'),
  previewCount: $('previewCount'),
  previewVs: $('previewVs'),
  arenaName: $('arenaName'),
  pauseOverlay: $('pauseOverlay'),
  resultOverlay: $('resultOverlay'),
  helpModal: $('helpModal'),
  pauseFighters: $('pauseFighters'),
  resultCanvas: $('resultCanvas'),
  resultEyebrow: $('resultEyebrow'),
  resultName: $('resultName'),
  resultTitle: $('resultTitle'),
  resultQuote: $('resultQuote'),
  resultStats: $('resultStats'),
  soundBtns: [$('soundBtn'), $('soundBtn2')],
  fightHint: $('fightHint'),
  specialTouch: document.querySelector('.tbtn-special'),
};

const state = {
  screen: 'title',
  mode: 'cpu',
  difficulty: 'normal',
  step: 0,
  p1: null,
  p2: null,
  stageId: 'random',
  previewChar: CHARACTERS[0],
  focusIndex: 0,
  game: null,
  lastFight: null,
  activeStage: null,
  resultTimer: 0,
  resultInfo: null,
  helpOpen: false,
};

const cards = new Map();
const arenaButtons = new Map();
let previewLast = 0;
let titleLast = 0;

// ---------------------------------------------------------------- utilities
function hexA(hex, alpha) {
  if (!hex) return `rgba(255,255,255,${alpha})`;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return `rgba(255,255,255,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function shortName(char) {
  return char.name.split(' ').slice(-1)[0];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(name) {
  state.screen = name;
  for (const [key, node] of Object.entries(screens)) {
    node.classList.toggle('hidden', key !== name);
  }
  document.body.classList.toggle('in-select', name === 'select');
  document.body.classList.toggle('in-fight', name === 'fight');
  if (name === 'select') screens.select.scrollTop = 0;
}

function hideOverlays() {
  el.pauseOverlay.classList.add('hidden');
  el.resultOverlay.classList.add('hidden');
  el.helpModal.classList.add('hidden');
  state.helpOpen = false;
}

function clearResultTimer() {
  if (state.resultTimer) {
    clearTimeout(state.resultTimer);
    state.resultTimer = 0;
  }
}

function resetTouchButtons() {
  for (const btn of $$('[data-touch]')) btn.classList.remove('down');
  el.specialTouch?.classList.remove('ready');
}

function updateSoundButtons() {
  const on = sound.enabled;
  for (const btn of el.soundBtns) {
    if (!btn) continue;
    btn.textContent = on ? 'SOUND ON' : 'SOUND OFF';
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.toggle('muted', !on);
  }
}

// ---------------------------------------------------------------- title
function drawTitle(t) {
  const cv = el.titleCanvas;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const H = cv.height;

  drawTitleBackdrop(ctx, W, H, t);

  // red storm glow behind the line-up
  const storm = ctx.createRadialGradient(W * 0.52, H * 0.42, 60, W * 0.52, H * 0.52, W * 0.62);
  storm.addColorStop(0, 'rgba(225,40,40,.13)');
  storm.addColorStop(0.55, 'rgba(120,10,20,.06)');
  storm.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = storm;
  ctx.fillRect(0, 0, W, H);

  const cast = [
    { id: 'michael', x: 142, s: 1.25, facing: 1, a: 0.95 },
    { id: 'chucky', x: 292, s: 1.32, facing: 1, a: 0.92 },
    { id: 'vader', x: 502, s: 1.25, facing: 1, a: 0.94 },
    { id: 'bowser', x: 790, s: 1.42, facing: -1, a: 0.94 },
    { id: 'thanos', x: 992, s: 1.3, facing: -1, a: 0.92 },
    { id: 'pennywise', x: 1160, s: 1.15, facing: -1, a: 0.9 },
  ];

  // backlights
  for (const slot of cast) {
    const char = CHARACTERS.find((c) => c.id === slot.id);
    if (!char) continue;
    const glow = ctx.createRadialGradient(slot.x, 430, 20, slot.x, 440, 220);
    glow.addColorStop(0, hexA(char.special.color, 0.2));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(slot.x - 240, 190, 480, 460);
  }

  // embers
  for (let i = 0; i < 64; i++) {
    const speed = 18 + seeded(i * 5 + 2) * 44;
    const px = (seeded(i * 3 + 1) * W + Math.sin(t * 0.55 + i) * 24 + W) % W;
    const py = H - ((t * speed + seeded(i * 7 + 11) * (H + 120)) % (H + 120));
    const a = 0.2 + (Math.sin(t * 2.6 + i * 1.7) + 1) * 0.25;
    ctx.fillStyle = `rgba(255,${120 + (i % 4) * 24},58,${a})`;
    const r = 1 + seeded(i + 17) * 1.8;
    ctx.fillRect(px, py, r, r);
  }

  // fighters
  for (const slot of cast) {
    const char = CHARACTERS.find((c) => c.id === slot.id);
    if (!char) continue;
    const bob = Math.sin(t * 1.35 + slot.x * 0.014) * 1.6;
    ctx.save();
    ctx.globalAlpha = slot.a;
    drawFighterShadow(ctx, char, slot.x, 598, slot.s, 0.34);
    drawFighter(ctx, char, {
      x: slot.x,
      y: 598 + bob,
      facing: slot.facing,
      pose: 'preview',
      time: t + slot.x * 0.01,
      scale: slot.s,
      alpha: 1,
    });
    ctx.restore();
  }

  // foreground fog and hazard stripe
  const fog = ctx.createLinearGradient(0, H * 0.62, 0, H);
  fog.addColorStop(0, 'rgba(5,4,8,0)');
  fog.addColorStop(0.5, 'rgba(5,4,8,.34)');
  fog.addColorStop(1, 'rgba(5,4,8,.94)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#e12828';
  for (let x = -H; x < W + H; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 22, H);
    ctx.lineTo(x + 22 + H * 0.25, H - 26);
    ctx.lineTo(x + H * 0.25, H - 26);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // occasional lightning
  const flick = Math.max(0, Math.sin(t * 1.31) - 0.982) / 0.018;
  if (flick > 0) {
    ctx.fillStyle = `rgba(210,225,255,${0.05 * flick})`;
    ctx.fillRect(0, 0, W, H * 0.62);
  }

  // darken the centre so the DOM logo can breathe
  const mid = ctx.createLinearGradient(0, 0, W, 0);
  mid.addColorStop(0, 'rgba(4,3,7,.34)');
  mid.addColorStop(0.24, 'rgba(4,3,7,.08)');
  mid.addColorStop(0.44, 'rgba(4,3,7,.28)');
  mid.addColorStop(0.56, 'rgba(4,3,7,.28)');
  mid.addColorStop(0.76, 'rgba(4,3,7,.08)');
  mid.addColorStop(1, 'rgba(4,3,7,.34)');
  ctx.fillStyle = mid;
  ctx.fillRect(0, 0, W, H);
}

function titleLoop(ts) {
  if (state.screen === 'title' && ts - titleLast > 38) {
    titleLast = ts;
    drawTitle(ts / 1000);
  }
  requestAnimationFrame(titleLoop);
}

// ---------------------------------------------------------------- roster
function buildRoster() {
  el.rosterGrid.innerHTML = '';
  cards.clear();

  CHARACTERS.forEach((char, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fighter-card';
    btn.dataset.char = char.id;
    btn.setAttribute('aria-label', `Select ${char.name}, ${char.title}`);
    btn.setAttribute('aria-pressed', 'false');
    btn.title = `${char.name} — ${char.title}`;

    const art = makeCharacterCanvas(char, 176, 150, { dpr: 1.5, pose: 'preview' });
    btn.appendChild(art);

    const badgeP1 = document.createElement('span');
    badgeP1.className = 'card-badge p1 hidden';
    badgeP1.textContent = 'P1';
    btn.appendChild(badgeP1);

    const badgeP2 = document.createElement('span');
    badgeP2.className = 'card-badge p2 hidden';
    badgeP2.textContent = 'P2';
    btn.appendChild(badgeP2);

    const name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = char.name;
    btn.appendChild(name);

    const num = document.createElement('span');
    num.className = 'card-num';
    num.textContent = String(index + 1).padStart(2, '0');
    btn.appendChild(num);

    btn.addEventListener('click', () => selectCharacter(char));
    btn.addEventListener('pointerenter', () => setPreview(char));
    btn.addEventListener('focus', () => {
      state.focusIndex = index;
      setPreview(char);
    });

    cards.set(char.id, { btn, badgeP1, badgeP2, index });
    el.rosterGrid.appendChild(btn);
  });

  updateCardStates();
  setFocus(state.focusIndex, false);
}

function updateCardStates() {
  for (const char of CHARACTERS) {
    const entry = cards.get(char.id);
    if (!entry) continue;
    const isP1 = state.p1 === char;
    const isP2 = state.p2 === char;
    entry.btn.classList.toggle('is-p1', isP1);
    entry.btn.classList.toggle('is-p2', isP2);
    entry.badgeP1.classList.toggle('hidden', !isP1);
    entry.badgeP2.classList.toggle('hidden', !isP2);
    entry.btn.setAttribute('aria-pressed', String(isP1 || isP2));
  }
}

function setFocus(index, scroll = true) {
  const len = CHARACTERS.length;
  state.focusIndex = ((index % len) + len) % len;
  const char = CHARACTERS[state.focusIndex];
  for (const [id, entry] of cards) {
    entry.btn.classList.toggle('is-focus', id === char.id);
  }
  if (scroll) {
    const entry = cards.get(char.id);
    entry?.btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

function selectCharacter(char) {
  if (!char) return;
  sound.init();
  sound.play('select');
  state.previewChar = char;

  if (state.step === 0) {
    state.p1 = char;
    state.step = 1;
  } else {
    state.p2 = char;
  }

  syncSelect();
  const entry = cards.get(char.id);
  if (entry) setFocus(entry.index, false);
}

function randomizePicks() {
  const pool = shuffle(CHARACTERS);
  state.p1 = pool[0];
  state.p2 = pool[1] || pool[0];
  state.previewChar = state.p2;
  state.step = 1;
  sound.init();
  sound.play('select');
  syncSelect();
  const entry = cards.get(state.p2.id);
  if (entry) setFocus(entry.index);
}

function clearPicks() {
  state.p1 = null;
  state.p2 = null;
  state.step = 0;
  state.previewChar = CHARACTERS[0];
  sound.play('back');
  syncSelect();
  setFocus(0);
}

function setMode(mode) {
  state.mode = mode;
  sound.play('select');
  syncSelect();
}

function setDifficulty(diff) {
  state.difficulty = diff;
  sound.play('select');
  syncSelect();
}

function setStep(step) {
  state.step = step;
  const target = step === 0 ? (state.p1 || state.previewChar) : (state.p2 || state.p1 || state.previewChar);
  if (target) state.previewChar = target;
  sound.play('select');
  syncSelect();
}

// ---------------------------------------------------------------- preview
function setPreview(char) {
  if (!char) return;
  state.previewChar = char;
  drawPreview(char, performance.now() / 1000);
  updatePreviewMeta();
}

function drawPreview(char, t = 0) {
  const cv = el.previewCanvas;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const H = cv.height;
  const accent = char.special.color || char.colors.accent || '#e12828';

  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#09060b');
  bg.addColorStop(0.55, '#120b12');
  bg.addColorStop(1, '#070509');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, H * 0.5, 20, W / 2, H * 0.5, W * 0.56);
  glow.addColorStop(0, hexA(accent, 0.22));
  glow.addColorStop(0.48, hexA(accent, 0.07));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // angled warning stripes
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = accent;
  for (let x = -H; x < W + H; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 34, H);
    ctx.lineTo(x + 34 + H * 0.42, 0);
    ctx.lineTo(x + H * 0.42, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // halo ring
  ctx.save();
  ctx.translate(W / 2, H * 0.48);
  ctx.rotate(-0.11);
  ctx.strokeStyle = hexA(accent, 0.22);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, W * 0.32, H * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(244,237,220,.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, W * 0.38, H * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // floor
  const floor = ctx.createRadialGradient(W / 2, H * 0.94, 10, W / 2, H * 0.94, W * 0.45);
  floor.addColorStop(0, hexA(accent, 0.17));
  floor.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = floor;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // drifting motes
  for (let i = 0; i < 22; i++) {
    const px = (seeded(i * 4 + 2) * W + Math.sin(t * 0.7 + i) * 18 + W) % W;
    const py = H - ((t * (14 + seeded(i) * 22) + seeded(i * 9 + 4) * H) % H);
    const a = 0.15 + (Math.sin(t * 1.8 + i * 2.1) + 1) * 0.16;
    ctx.fillStyle = hexA(accent, a);
    ctx.fillRect(px, py, 1.6, 1.6);
  }

  const scale = (H * 0.82) / (215 * (char.scale || 1));
  ctx.save();
  ctx.translate(W / 2, H * 0.94);
  drawFighterShadow(ctx, char, 0, 0, scale, 0.48);
  drawFighter(ctx, char, {
    x: 0,
    y: 0,
    facing: 1,
    pose: 'preview',
    time: t * 0.85 + 0.5,
    scale,
    alpha: 1,
  });
  ctx.restore();

  // scan lines and framing
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#000';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  ctx.restore();

  ctx.strokeStyle = 'rgba(255,212,71,.16)';
  ctx.lineWidth = 1;
  ctx.strokeRect(14, 14, W - 28, H - 28);

  // huge index watermark
  const idx = CHARACTERS.indexOf(char) + 1;
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#f4eddc';
  ctx.font = '400 280px Anton, Impact, "Arial Black", sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(String(idx).padStart(2, '0'), W - 26, 18);
  ctx.restore();
}

function updatePreviewMeta() {
  const char = state.previewChar || CHARACTERS[0];
  const index = CHARACTERS.indexOf(char) + 1;
  el.pvOrigin.textContent = char.origin;
  el.pvName.textContent = char.name;
  el.pvTitle.textContent = char.title;
  el.pvQuote.textContent = `“${char.quote}”`;
  el.pvSpecial.textContent = char.special.name;
  el.pvSpecialDesc.textContent = char.special.desc;
  el.previewCount.textContent = `${String(index).padStart(2, '0')} / ${CHARACTERS.length}`;

  const statNames = [
    ['power', 'POWER'],
    ['speed', 'SPEED'],
    ['defense', 'DEFENSE'],
    ['reach', 'REACH'],
  ];
  el.pvStats.innerHTML = '';
  for (const [key, label] of statNames) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    const name = document.createElement('span');
    name.textContent = label;
    const segs = document.createElement('div');
    segs.className = 'stat-segs';
    for (let i = 1; i <= 5; i++) {
      const seg = document.createElement('i');
      seg.className = `stat-seg${i <= char.stats[key] ? ' on' : ''}${i >= 4 ? ' gold' : ''}`;
      segs.appendChild(seg);
    }
    row.appendChild(name);
    row.appendChild(segs);
    el.pvStats.appendChild(row);
  }

  if (state.p1 && state.p2) {
    el.previewVs.textContent = `${shortName(state.p1)}  VS  ${shortName(state.p2)}`;
  } else if (state.step === 1) {
    el.previewVs.textContent = state.mode === 'cpu' ? 'CHOOSE YOUR OPPONENT' : 'PLAYER 2 — CHOOSE';
  } else {
    el.previewVs.textContent = 'BROWSE THE ROSTER';
  }

  const style = el.previewCanvas.parentElement;
  if (style) style.style.setProperty('--fighter-accent', char.special.color || char.colors.accent);
}

// ---------------------------------------------------------------- arenas
function buildArenas() {
  el.arenaList.innerHTML = '';
  arenaButtons.clear();

  const randomBtn = document.createElement('button');
  randomBtn.type = 'button';
  randomBtn.className = 'arena-btn';
  randomBtn.dataset.stage = 'random';
  randomBtn.appendChild(makeRandomStageChip());
  const rndLabel = document.createElement('span');
  rndLabel.textContent = 'RANDOM';
  randomBtn.appendChild(rndLabel);
  randomBtn.addEventListener('click', () => setStage('random'));
  el.arenaList.appendChild(randomBtn);
  arenaButtons.set('random', randomBtn);

  for (const stage of STAGES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'arena-btn';
    btn.dataset.stage = stage.id;
    btn.title = `${stage.name} — ${stage.sub}`;
    btn.appendChild(makeStageChip(stage));
    const label = document.createElement('span');
    label.textContent = stage.name.split(' ').slice(-1)[0];
    btn.appendChild(label);
    btn.addEventListener('click', () => setStage(stage.id));
    el.arenaList.appendChild(btn);
    arenaButtons.set(stage.id, btn);
  }
  updateArenaStates();
}

function makeRandomStageChip() {
  const w = 150;
  const h = 54;
  const cv = document.createElement('canvas');
  cv.width = w * 2;
  cv.height = h * 2;
  const ctx = cv.getContext('2d');
  ctx.scale(2, 2);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#1a0d14');
  g.addColorStop(0.5, '#311019');
  g.addColorStop(1, '#0d0a10');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#ffd447';
  for (let i = -h; i < w + h; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, h);
    ctx.lineTo(i + 7, h);
    ctx.lineTo(i + 7 + h, 0);
    ctx.lineTo(i + h, 0);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#ffd447';
  ctx.font = '400 27px Anton, Impact, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', w / 2, h / 2 + 1);
  return cv;
}

function setStage(id) {
  state.stageId = id;
  sound.play('select');
  updateArenaStates();
}

function updateArenaStates() {
  for (const [id, btn] of arenaButtons) {
    btn.classList.toggle('active', id === state.stageId);
    btn.setAttribute('aria-pressed', String(id === state.stageId));
  }
  if (state.stageId === 'random') {
    el.arenaName.textContent = 'RANDOM';
  } else {
    const stage = STAGES.find((s) => s.id === state.stageId);
    el.arenaName.textContent = stage ? stage.name : 'RANDOM';
  }
}

// ---------------------------------------------------------------- selection UI sync
function syncSelect() {
  for (const btn of $$('button', el.modeTabs)) {
    btn.classList.toggle('active', btn.dataset.mode === state.mode);
  }
  for (const btn of $$('button', el.diffTabs)) {
    btn.classList.toggle('active', btn.dataset.diff === state.difficulty);
    btn.disabled = state.mode === 'local';
  }

  const stepLabels = state.mode === 'cpu'
    ? ['YOUR FIGHTER', 'OPPONENT']
    : ['PLAYER 1', 'PLAYER 2'];
  for (const btn of $$('button', el.stepTabs)) {
    const step = Number(btn.dataset.step);
    btn.classList.toggle('active', step === state.step);
    btn.innerHTML = `<span>${step + 1}</span> ${stepLabels[step]}`;
  }

  updateCardStates();
  updateArenaStates();
  updatePreviewMeta();

  const ready = Boolean(state.p1 && state.p2);
  el.fightBtn.disabled = !ready;
  el.fightBtn.innerHTML = ready
    ? `${shortName(state.p1)} VS ${shortName(state.p2)} <span>→</span>`
    : 'FIGHT <span>→</span>';

  el.fightHint.textContent = state.mode === 'local'
    ? 'P1: A/D · W · S · J/K/L      P2: ARROWS · , . /'
    : 'ESC / P — PAUSE';

  const entry = cards.get((state.previewChar || CHARACTERS[0]).id);
  if (entry) setFocus(entry.index, false);
}

function showSelect() {
  hideOverlays();
  clearResultTimer();
  resetTouchButtons();
  state.step = state.p1 ? 1 : 0;
  const pick = state.p1 || state.p2 || state.previewChar || CHARACTERS[0];
  state.previewChar = pick;
  showScreen('select');
  setPreview(pick);
  syncSelect();
  const entry = cards.get(pick.id);
  if (entry) setFocus(entry.index, false);
  updateSoundButtons();
}

// ---------------------------------------------------------------- fight flow
function beginFight(rematch = false) {
  const p1 = rematch && state.lastFight ? state.lastFight.p1 : state.p1;
  const p2 = rematch && state.lastFight ? state.lastFight.p2 : state.p2;
  if (!p1 || !p2) return;

  const mode = rematch && state.lastFight ? state.lastFight.mode : state.mode;
  const difficulty = rematch && state.lastFight ? state.lastFight.difficulty : state.difficulty;

  let stage;
  if (rematch && state.lastFight) {
    stage = state.lastFight.stage;
  } else if (state.stageId === 'random') {
    stage = STAGES[Math.floor(Math.random() * STAGES.length)];
  } else {
    stage = STAGES.find((s) => s.id === state.stageId) || STAGES[0];
  }

  state.lastFight = { p1, p2, stage, mode, difficulty };
  state.activeStage = stage;
  state.resultInfo = null;

  clearResultTimer();
  if (state.game) {
    state.game.destroy();
    state.game = null;
  }
  hideOverlays();
  resetTouchButtons();
  showScreen('fight');

  sound.init();
  sound.startMusic();

  try {
    state.game = new FightGame({
      canvas: $('gameCanvas'),
      p1,
      p2,
      mode,
      difficulty,
      stage,
      onPause: (paused) => {
        if (paused) openPause();
        else el.pauseOverlay.classList.add('hidden');
      },
      onMatchEnd: (info) => {
        state.resultInfo = info;
        clearResultTimer();
        state.resultTimer = setTimeout(() => showResult(info), 1350);
      },
    });
  } catch (err) {
    console.error('Fight failed to start:', err);
    showSelect();
    return;
  }

  window.__villainsGame = state.game;
  updateSoundButtons();
  el.pauseOverlay.classList.add('hidden');
  el.resultOverlay.classList.add('hidden');
}

function pauseFighterCard(char) {
  const wrap = document.createElement('div');
  wrap.className = 'pause-fighter';
  wrap.appendChild(makeCharacterCanvas(char, 140, 162, { dpr: 1.6, pose: 'preview' }));
  const name = document.createElement('span');
  name.textContent = char.name;
  wrap.appendChild(name);
  return wrap;
}

function openPause() {
  if (!state.game) return;
  el.pauseFighters.innerHTML = '';
  el.pauseFighters.appendChild(pauseFighterCard(state.game.p1char));
  const vs = document.createElement('span');
  vs.className = 'pause-vs';
  vs.textContent = 'VS';
  el.pauseFighters.appendChild(vs);
  el.pauseFighters.appendChild(pauseFighterCard(state.game.p2char));
  el.pauseOverlay.classList.remove('hidden');
}

function exitFight(target) {
  clearResultTimer();
  if (state.game) {
    state.game.destroy();
    state.game = null;
  }
  window.__villainsGame = null;
  sound.stopMusic();
  resetTouchButtons();
  hideOverlays();
  if (target === 'select') showSelect();
  else showTitle();
}

function showResult(info) {
  if (!info) return;
  state.resultTimer = 0;
  sound.stopMusic();

  const winner = info.winner;
  const loser = info.loser;
  const winnerSide = info.winnerSide;

  el.resultName.textContent = winner.name;
  el.resultTitle.textContent = winner.title;
  el.resultQuote.textContent = `“${winner.quote}”`;

  if (info.mode === 'cpu') {
    el.resultEyebrow.textContent = winnerSide === 0 ? 'VICTORY · MATCH OVER' : 'DEFEAT · MATCH OVER';
  } else {
    el.resultEyebrow.textContent = `PLAYER ${winnerSide + 1} WINS · MATCH OVER`;
  }

  el.resultStats.innerHTML = '';
  const diffLabel = { rookie: 'ROOKIE', normal: 'STANDARD', nightmare: 'NIGHTMARE' };
  const chips = [
    [`WINS ${info.wins[winnerSide]}–${info.wins[1 - winnerSide]}`, true],
    [`ROUND ${info.round}`, false],
    [info.mode === 'cpu' ? 'VS CPU' : 'LOCAL 2P', false],
    [info.mode === 'cpu' ? diffLabel[state.lastFight?.difficulty] || 'STANDARD' : `${loser.name} DOWN`, false],
  ];
  for (const [text, hot] of chips) {
    const chip = document.createElement('span');
    chip.className = `meta-chip${hot ? ' hot' : ''}`;
    chip.textContent = text;
    el.resultStats.appendChild(chip);
  }

  drawResultPortrait(winner);
  el.resultOverlay.classList.remove('hidden');
}

function drawResultPortrait(char) {
  const cv = el.resultCanvas;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const H = cv.height;
  ctx.clearRect(0, 0, W, H);

  const accent = char.special.color || char.colors.accent;
  const glow = ctx.createRadialGradient(W / 2, H * 0.5, 20, W / 2, H * 0.55, W * 0.55);
  glow.addColorStop(0, hexA(accent, 0.2));
  glow.addColorStop(0.6, hexA(accent, 0.05));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const art = makeCharacterCanvas(char, 260, 288, { dpr: 2, pose: 'win' });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(art, 20, 22, W - 40, H - 32);
}

// ---------------------------------------------------------------- help / sound
function showHelp() {
  sound.play('select');
  state.helpOpen = true;
  el.helpModal.classList.remove('hidden');
}

function closeHelp() {
  if (!state.helpOpen) return;
  state.helpOpen = false;
  el.helpModal.classList.add('hidden');
  sound.play('back');
}

function toggleSound() {
  sound.init();
  const on = sound.toggle();
  updateSoundButtons();
  try {
    localStorage.setItem('villains-sound', on ? 'on' : 'off');
  } catch (err) { /* private mode */ }
  if (on) sound.play('select');
}

// ---------------------------------------------------------------- title flow
function showTitle() {
  clearResultTimer();
  if (state.game) {
    state.game.destroy();
    state.game = null;
  }
  window.__villainsGame = null;
  clearTimeout(state.resultTimer);
  sound.stopMusic();
  resetTouchButtons();
  hideOverlays();
  showScreen('title');
  updateSoundButtons();
}

// ---------------------------------------------------------------- events
function bindEvents() {
  $('startBtn').addEventListener('click', () => {
    sound.init();
    sound.play('select');
    showSelect();
  });
  $('backTitle').addEventListener('click', () => {
    sound.play('back');
    showTitle();
  });
  $('helpBtn').addEventListener('click', showHelp);
  $('helpClose').addEventListener('click', closeHelp);
  $('helpDone').addEventListener('click', closeHelp);
  el.helpModal.addEventListener('click', (e) => {
    if (e.target === el.helpModal) closeHelp();
  });

  for (const btn of $$('button', el.modeTabs)) {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  }
  for (const btn of $$('button', el.diffTabs)) {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
  }
  for (const btn of $$('button', el.stepTabs)) {
    btn.addEventListener('click', () => setStep(Number(btn.dataset.step)));
  }

  $('randomBtn').addEventListener('click', randomizePicks);
  $('clearBtn').addEventListener('click', clearPicks);
  el.fightBtn.addEventListener('click', () => {
    if (el.fightBtn.disabled) return;
    sound.init();
    beginFight(false);
  });

  for (const btn of el.soundBtns) btn?.addEventListener('click', toggleSound);

  $('pauseBtn').addEventListener('click', () => {
    if (state.game) state.game.togglePause();
  });
  $('resumeBtn').addEventListener('click', () => {
    if (state.game && state.game.paused) state.game.togglePause(false);
    else el.pauseOverlay.classList.add('hidden');
  });
  $('pauseRestartBtn').addEventListener('click', () => beginFight(true));
  $('pauseSelectBtn').addEventListener('click', () => exitFight('select'));
  $('pauseTitleBtn').addEventListener('click', () => exitFight('title'));

  $('rematchBtn').addEventListener('click', () => beginFight(true));
  $('changeBtn').addEventListener('click', () => exitFight('select'));
  $('resultTitleBtn').addEventListener('click', () => exitFight('title'));

  window.addEventListener('keydown', onUiKeydown);

  // Touch / pointer fight controls.
  for (const btn of $$('[data-touch]')) {
    const action = btn.dataset.touch;
    const hold = action === 'left' || action === 'right' || action === 'block';
    const mapped = action === 'block' ? 'down' : action;

    const down = (e) => {
      e.preventDefault();
      if (!state.game || state.game.paused) return;
      sound.init();
      btn.classList.add('down');
      if (hold) state.game.setTouchHeld(mapped, true);
      else state.game.touchAction(action);
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    };
    const up = (e) => {
      e.preventDefault();
      btn.classList.remove('down');
      if (state.game && hold) state.game.setTouchHeld(mapped, false);
    };

    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('lostpointercapture', up);
    btn.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse' && e.buttons) up(e);
    });
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Special button glows when the meter is ready.
  setInterval(() => {
    if (!el.specialTouch) return;
    const g = state.game;
    const ready = Boolean(g && !g.paused && g.phase === 'fight' && g.fighters[0].meter >= 50);
    el.specialTouch.classList.toggle('ready', ready);
  }, 140);

  // First gesture unlocks WebAudio on mobile.
  const unlock = () => sound.init();
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.game && !state.game.paused && state.game.phase === 'fight') {
      state.game.togglePause(true);
    }
  });

  window.addEventListener('pagehide', () => sound.stopMusic());
}

function onUiKeydown(e) {
  const key = e.key;
  const code = e.code;
  const helpOpen = !el.helpModal.classList.contains('hidden');
  const resultOpen = !el.resultOverlay.classList.contains('hidden');
  const pauseOpen = !el.pauseOverlay.classList.contains('hidden');

  if (helpOpen) {
    if (key === 'Escape' || key === 'Enter') {
      e.preventDefault();
      closeHelp();
    }
    return;
  }

  if (resultOpen) {
    if (key === 'Enter' || code === 'KeyR') {
      e.preventDefault();
      beginFight(true);
    } else if (key === 'Escape') {
      e.preventDefault();
      exitFight('title');
    } else if (code === 'KeyC') {
      e.preventDefault();
      exitFight('select');
    }
    return;
  }

  if (pauseOpen) {
    if (key === 'Enter') {
      e.preventDefault();
      if (state.game && state.game.paused) state.game.togglePause(false);
    } else if (code === 'KeyR') {
      e.preventDefault();
      beginFight(true);
    } else if (code === 'KeyQ') {
      e.preventDefault();
      exitFight('title');
    }
    // Escape / P stays with the game's own pause handler.
    return;
  }

  if (state.screen === 'select') {
    if (key === 'ArrowRight') {
      e.preventDefault();
      setFocus(state.focusIndex + 1);
      setPreview(CHARACTERS[state.focusIndex]);
    } else if (key === 'ArrowLeft') {
      e.preventDefault();
      setFocus(state.focusIndex - 1);
      setPreview(CHARACTERS[state.focusIndex]);
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      setFocus(state.focusIndex + 7);
      setPreview(CHARACTERS[state.focusIndex]);
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      setFocus(state.focusIndex - 7);
      setPreview(CHARACTERS[state.focusIndex]);
    } else if (key === 'Home') {
      e.preventDefault();
      setFocus(0);
      setPreview(CHARACTERS[0]);
    } else if (key === 'End') {
      e.preventDefault();
      setFocus(CHARACTERS.length - 1);
      setPreview(CHARACTERS[CHARACTERS.length - 1]);
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      const char = CHARACTERS[state.focusIndex];
      if (char) selectCharacter(char);
    } else if (key === 'Escape' || key === 'Backspace') {
      e.preventDefault();
      sound.play('back');
      showTitle();
    } else if (code === 'KeyR') {
      e.preventDefault();
      randomizePicks();
    } else if (code === 'KeyF' && state.p1 && state.p2) {
      e.preventDefault();
      beginFight(false);
    }
    return;
  }

  if (state.screen === 'title') {
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      sound.init();
      sound.play('select');
      showSelect();
    } else if (code === 'KeyH') {
      e.preventDefault();
      showHelp();
    } else if (code === 'KeyM') {
      e.preventDefault();
      toggleSound();
    }
  }
}

// ---------------------------------------------------------------- preview loop
function previewLoop(ts) {
  if (state.screen === 'select' && ts - previewLast > 34) {
    previewLast = ts;
    const char = state.previewChar;
    if (char) drawPreview(char, ts / 1000);
  }
  requestAnimationFrame(previewLoop);
}

// ---------------------------------------------------------------- boot
function boot() {
  try {
    const stored = localStorage.getItem('villains-sound');
    if (stored === 'off') sound.setEnabled(false);
  } catch (err) { /* private mode */ }

  const isTouch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  if (isTouch) document.body.classList.add('touch');

  buildRoster();
  buildArenas();
  bindEvents();
  updateSoundButtons();
  showTitle();
  setPreview(CHARACTERS[0]);
  syncSelect();
  updateSoundButtons();

  // debug / screenshot hooks
  window.__villains = {
    state,
    CHARACTERS,
    STAGES,
    showTitle,
    showSelect,
    beginFight,
    showResult,
    selectCharacter,
  };

  drawTitle(0);
  requestAnimationFrame(titleLoop);
  requestAnimationFrame(previewLoop);
}

boot();

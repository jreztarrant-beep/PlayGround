// Character portrait rendering for the roster, HUD and result screens.
import { drawFighter, drawFighterShadow } from './art.js';
import { ell } from './draw-utils.js';

const cache = new Map();

export function makeCharacterCanvas(char, w = 300, h = 360, opts = {}) {
  const key = `${char.id}:${w}x${h}:${opts.pose || 'preview'}:${opts.dpr || 2}:${opts.bg ? 'bg' : ''}`;
  if (!opts.time && cache.has(key)) return cache.get(key);

  const dpr = opts.dpr ?? 2;
  const cv = document.createElement('canvas');
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  if (opts.bg) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, opts.bg[0]);
    g.addColorStop(1, opts.bg[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const r = ctx.createRadialGradient(w / 2, h * 0.58, 10, w / 2, h * 0.6, w * 0.72);
    r.addColorStop(0, 'rgba(255,255,255,.08)');
    r.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, w, h);
  }

  const bodyH = 215;
  const scale = (h * 0.9) / (bodyH * (char.scale || 1));
  ctx.save();
  ctx.translate(w / 2, h * 0.94);
  drawFighterShadow(ctx, char, 0, 0, scale, 0.5);
  drawFighter(ctx, char, {
    x: 0, y: 0, facing: 1, pose: opts.pose || 'preview',
    time: opts.time || 0, scale, alpha: 1,
  });
  ctx.restore();

  if (!opts.time) cache.set(key, cv);
  return cv;
}

// Close-up cropped avatar for the in-game HUD.
export function makeHudAvatar(char, w = 150, h = 170) {
  const key = `hud:${char.id}:${w}x${h}`;
  if (cache.has(key)) return cache.get(key);
  const full = makeCharacterCanvas(char, 240, 300, { dpr: 1, pose: 'preview' });
  const cv = document.createElement('canvas');
  cv.width = w * 2;
  cv.height = h * 2;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  // crop the top of the full-body render (head and torso)
  const sx = 42;
  const sy = 12;
  const sw = 156;
  const sh = 176;
  ctx.drawImage(full, sx, sy, sw, sh, 0, 0, w * 2, h * 2);
  cache.set(key, cv);
  return cv;
}

export function makeStageChip(stage, w = 150, h = 54) {
  const cv = document.createElement('canvas');
  cv.width = w * 2;
  cv.height = h * 2;
  const ctx = cv.getContext('2d');
  ctx.scale(2, 2);
  const cols = {
    haddonfield: ['#101d36', '#3a4552'],
    carnival: ['#2a0b1c', '#3c1720'],
    throne: ['#171019', '#241a20'],
    infernal: ['#3d0e10', '#c04a1c'],
  }[stage.id];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, cols[0]);
  g.addColorStop(1, cols[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const accent = { haddonfield: '#9fb6d8', carnival: '#ffd45c', throne: '#d94a5c', infernal: '#ff8a2a' }[stage.id];
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `${accent}${i % 2 ? '22' : '11'}`;
    ctx.fillRect(0, 10 + i * 4, w, 1);
  }
  ell(ctx, w * 0.8, 16, 7, 7, `${accent}99`, null);
  return cv;
}

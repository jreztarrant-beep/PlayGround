// Painted arenas. All procedural, 1280x720 coordinate space.
import { TAU, ell, line, poly, seeded, rr, dark, light } from './draw-utils.js';

const GROUND = 596;

function vignette(ctx, w, h, strength = 0.7) {
  const g = ctx.createRadialGradient(w / 2, h * 0.48, h * 0.2, w / 2, h * 0.5, h * 0.82);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.72, `rgba(0,0,0,${strength * 0.25})`);
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function haze(ctx, x, y, w, h, color, time, speed = 1) {
  const g = ctx.createRadialGradient(x, y, 10, x, y, w);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = 0.25 + Math.sin(time * speed) * 0.05;
  ctx.fillStyle = g;
  ctx.fillRect(x - w, y - h, w * 2, h * 2);
  ctx.restore();
}

function stageHaddonfield(ctx, w, h, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#050a18');
  sky.addColorStop(0.45, '#101d36');
  sky.addColorStop(0.8, '#25344b');
  sky.addColorStop(1, '#3a4552');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, GROUND);

  // stars
  for (let i = 0; i < 90; i++) {
    const sx = seeded(i * 3 + 1) * w;
    const sy = seeded(i * 7 + 3) * GROUND * 0.55;
    const a = 0.25 + seeded(i * 11) * 0.6;
    ctx.fillStyle = `rgba(220,235,255,${a})`;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // moon
  ctx.save();
  ctx.shadowColor = 'rgba(200,220,255,.65)';
  ctx.shadowBlur = 70;
  ell(ctx, 1010, 128, 57, 57, '#e6ecdf', null);
  ctx.restore();
  ell(ctx, 990, 112, 13, 9, 'rgba(150,160,150,.35)', null);
  ell(ctx, 1020, 146, 18, 12, 'rgba(150,160,150,.25)', null);
  ell(ctx, 996, 150, 7, 5, 'rgba(150,160,150,.3)', null);

  // clouds
  for (let i = 0; i < 5; i++) {
    const cx = 150 + i * 270 + Math.sin(t * 0.05 + i) * 18;
    const cy = 90 + (i % 3) * 55;
    ctx.fillStyle = 'rgba(20,32,54,.55)';
    ell(ctx, cx, cy, 100, 22, 'rgba(22,34,56,.55)', null);
    ell(ctx, cx + 40, cy - 10, 70, 20, 'rgba(25,38,62,.45)', null);
  }

  // distant tree line
  ctx.fillStyle = '#0a1220';
  for (let i = 0; i < 9; i++) {
    const bx = -20 + i * 160;
    ctx.beginPath();
    ctx.moveTo(bx, GROUND - 120);
    ctx.lineTo(bx + 40, GROUND - 185 - (i % 3) * 20);
    ctx.lineTo(bx + 90, GROUND - 120);
    ctx.fill();
  }

  // houses
  const houses = [
    { x: 40, y: GROUND - 150, w: 260, h: 150, roof: 80 },
    { x: 330, y: GROUND - 185, w: 210, h: 185, roof: 70 },
    { x: 900, y: GROUND - 165, w: 300, h: 165, roof: 95 },
  ];
  for (const ho of houses) {
    ctx.fillStyle = '#111a26';
    ctx.fillRect(ho.x, ho.y, ho.w, ho.h);
    ctx.beginPath();
    ctx.moveTo(ho.x - 18, ho.y);
    ctx.lineTo(ho.x + ho.w / 2, ho.y - ho.roof);
    ctx.lineTo(ho.x + ho.w + 18, ho.y);
    ctx.closePath();
    ctx.fillStyle = '#0b131d';
    ctx.fill();
    // windows
    for (let ix = 0; ix < 3; ix++) {
      for (let iy = 0; iy < 2; iy++) {
        const lit = (ix + iy + ho.x) % 3 === 0;
        const wx = ho.x + 30 + ix * (ho.w / 3.2);
        const wy = ho.y + 26 + iy * 56;
        ctx.fillStyle = lit ? 'rgba(255,190,90,.72)' : 'rgba(15,24,36,.9)';
        ctx.fillRect(wx, wy, 24, 30);
        ctx.strokeStyle = '#0a111a';
        ctx.lineWidth = 3;
        ctx.strokeRect(wx, wy, 24, 30);
        line(ctx, wx + 12, wy, wx + 12, wy + 30, '#0a111a', 2);
        line(ctx, wx, wy + 15, wx + 24, wy + 15, '#0a111a', 2);
        if (lit) {
          ctx.fillStyle = 'rgba(255,190,90,.08)';
          ctx.fillRect(wx - 10, wy - 8, 44, 48);
        }
      }
    }
  }

  // road / sidewalk
  ctx.fillStyle = '#2c323c';
  ctx.fillRect(0, GROUND, w, h - GROUND);
  ctx.fillStyle = '#3b424c';
  ctx.fillRect(0, GROUND, w, 30);
  ctx.fillStyle = '#454d57';
  for (let i = 0; i < 12; i++) ctx.fillRect(i * 120 - 10, GROUND + 9, 60, 3);
  ctx.fillStyle = '#242a33';
  ctx.fillRect(0, GROUND + 62, w, h - GROUND - 62);
  ctx.fillStyle = 'rgba(210,180,120,.18)';
  ctx.fillRect(0, GROUND + 92, w, 3);
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `rgba(255,235,170,${0.32 + seeded(i * 9) * 0.2})`;
    ctx.fillRect(90 + i * 175, GROUND + 101, 56, 3.4);
  }

  // picket fence
  ctx.fillStyle = '#8d8f83';
  for (let i = 0; i < 34; i++) {
    const fx = -5 + i * 40;
    if (fx > 240 && fx < 330) continue;
    ctx.beginPath();
    ctx.moveTo(fx, GROUND - 6);
    ctx.lineTo(fx + 8, GROUND - 20);
    ctx.lineTo(fx + 16, GROUND - 6);
    ctx.lineTo(fx + 16, GROUND - 56);
    ctx.lineTo(fx, GROUND - 56);
    ctx.closePath();
    ctx.fillStyle = i % 5 === 0 ? '#6c6e64' : '#83857a';
    ctx.fill();
  }
  ctx.fillStyle = '#9a9c90';
  ctx.fillRect(0, GROUND - 40, 240, 4);
  ctx.fillRect(330, GROUND - 40, 300, 4);

  // street lamp
  const lampX = 790;
  ctx.strokeStyle = '#0d131c';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(lampX, GROUND);
  ctx.lineTo(lampX, GROUND - 230);
  ctx.quadraticCurveTo(lampX, GROUND - 255, lampX + 35, GROUND - 252);
  ctx.stroke();
  ell(ctx, lampX + 42, GROUND - 246, 11, 14, 'rgba(255,215,130,.9)', null);
  ctx.save();
  const cone = ctx.createLinearGradient(lampX + 42, GROUND - 240, lampX + 42, GROUND);
  cone.addColorStop(0, 'rgba(255,210,130,.2)');
  cone.addColorStop(1, 'rgba(255,210,130,0)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(lampX + 34, GROUND - 240);
  ctx.lineTo(lampX + 50, GROUND - 240);
  ctx.lineTo(lampX + 155, GROUND);
  ctx.lineTo(lampX - 80, GROUND);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // pumpkins
  const pumpkins = [[185, GROUND + 36, 25], [1080, GROUND + 60, 32], [1180, GROUND + 34, 19]];
  for (const [px, py, pr] of pumpkins) {
    ell(ctx, px, py, pr, pr * 0.78, '#b4561c', '#5f2a0c', 2);
    ell(ctx, px - pr * 0.38, py + 1, pr * 0.3, pr * 0.68, '#c96a24', null);
    ell(ctx, px + pr * 0.38, py + 1, pr * 0.3, pr * 0.68, '#9e4716', null);
    line(ctx, px, py - pr * 0.7, px + 3, py - pr * 1.05, '#3e5a24', 3);
    poly(ctx, [[px - pr * 0.4, py - pr * 0.05], [px - pr * 0.15, py - pr * 0.25], [px - pr * 0.1, py - pr * 0.02]], 'rgba(255,190,60,.9)');
    poly(ctx, [[px + pr * 0.15, py - pr * 0.25], [px + pr * 0.4, py - pr * 0.02], [px + pr * 0.1, py - pr * 0.02]], 'rgba(255,190,60,.9)');
    ctx.fillStyle = 'rgba(255,170,50,.75)';
    ctx.beginPath();
    ctx.moveTo(px - pr * 0.3, py + pr * 0.16);
    ctx.quadraticCurveTo(px, py + pr * 0.4, px + pr * 0.3, py + pr * 0.14);
    ctx.quadraticCurveTo(px, py + pr * 0.28, px - pr * 0.3, py + pr * 0.16);
    ctx.fill();
  }

  // low fog
  for (let i = 0; i < 4; i++) {
    const fx = ((t * (9 + i * 3) + i * 380) % (w + 500)) - 250;
    haze(ctx, fx, GROUND - 15 - i * 8, 230, 52, 'rgba(190,205,225,.35)', t, 0.6 + i * 0.2);
  }

  // trees at edges
  ctx.strokeStyle = '#070c14';
  ctx.lineWidth = 16;
  for (const [tx, s] of [[70, 1], [1210, 1.1]]) {
    ctx.beginPath();
    ctx.moveTo(tx, GROUND + 20);
    ctx.lineTo(tx + 6 * s, GROUND - 190);
    ctx.stroke();
    ctx.lineWidth = 6;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(tx + i * 2, GROUND - 100 - i * 18);
      ctx.lineTo(tx + (i % 2 ? 55 : -55) * s, GROUND - 175 - i * 20);
      ctx.stroke();
    }
    ctx.lineWidth = 16;
  }

  vignette(ctx, w, h, 0.82);
}

function stageCarnival(ctx, w, h, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#120613');
  sky.addColorStop(0.55, '#2a0b1c');
  sky.addColorStop(1, '#3c1720');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, GROUND);

  // distant big top
  const tentX = 640;
  const tentW = 760;
  const tentH = 360;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tentX - tentW / 2, GROUND - 60);
  ctx.quadraticCurveTo(tentX - tentW * 0.28, GROUND - tentH * 0.8, tentX, GROUND - tentH);
  ctx.quadraticCurveTo(tentX + tentW * 0.28, GROUND - tentH * 0.8, tentX + tentW / 2, GROUND - 60);
  ctx.closePath();
  ctx.clip();
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? '#d9c6ae' : '#8e2632';
    ctx.beginPath();
    ctx.moveTo(tentX, GROUND - tentH);
    ctx.lineTo(tentX - tentW / 2 + i * (tentW / 10), GROUND - 40);
    ctx.lineTo(tentX - tentW / 2 + (i + 1) * (tentW / 10), GROUND - 40);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(20,6,12,.5)';
  ctx.fillRect(0, GROUND - 180, w, 180);
  ctx.restore();
  // tent trim
  ctx.strokeStyle = '#e8c24a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(tentX - tentW / 2, GROUND - 62);
  ctx.quadraticCurveTo(tentX, GROUND - 240, tentX + tentW / 2, GROUND - 62);
  ctx.stroke();
  // flag
  line(ctx, tentX, GROUND - tentH, tentX, GROUND - tentH - 60, '#d9c6ae', 4);
  poly(ctx, [[tentX, GROUND - tentH - 60], [tentX + 50, GROUND - tentH - 45], [tentX, GROUND - tentH - 28]], '#c22c2c');

  // entrance arch
  const archX = 640;
  ctx.fillStyle = '#1c0a10';
  ctx.beginPath();
  ctx.moveTo(archX - 120, GROUND);
  ctx.lineTo(archX - 120, GROUND - 150);
  ctx.quadraticCurveTo(archX, GROUND - 235, archX + 120, GROUND - 150);
  ctx.lineTo(archX + 120, GROUND);
  ctx.closePath();
  ctx.fill();
  // bulbs around arch
  for (let i = 0; i < 14; i++) {
    const a = Math.PI + (i / 13) * Math.PI;
    const bx = archX + Math.cos(a) * 128;
    const by = GROUND - 150 + Math.sin(a) * 120;
    const pulse = 0.55 + Math.sin(t * 3 + i * 0.9) * 0.35;
    ctx.save();
    ctx.shadowColor = '#ffd45c';
    ctx.shadowBlur = 9;
    ell(ctx, bx, by, 4, 4, `rgba(255,212,92,${pulse})`, null);
    ctx.restore();
  }

  // ferris wheel
  const fx = 180;
  const fy = 250;
  const fr = 150;
  ctx.strokeStyle = 'rgba(25,15,25,.85)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(fx, fy, fr, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(fx, fy, fr - 12, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + t * 0.05;
    line(ctx, fx, fy, fx + Math.cos(a) * fr, fy + Math.sin(a) * fr, 'rgba(50,35,45,.8)', 2);
    const cx = fx + Math.cos(a) * fr;
    const cy = fy + Math.sin(a) * fr;
    ctx.fillStyle = i % 3 === 0 ? '#7d2c3c' : '#2c2430';
    ctx.fillRect(cx - 9, cy + 3, 18, 14);
    const blink = Math.sin(t * 2 + i) > 0.3;
    if (blink) {
      ctx.fillStyle = 'rgba(255,210,120,.8)';
      ctx.fillRect(cx - 2, cy + 7, 4, 4);
    }
  }
  ell(ctx, fx, fy, 14, 14, '#38283a', '#e8c24a', 2);
  ctx.strokeStyle = '#241a26';
  ctx.lineWidth = 8;
  line(ctx, fx - 60, GROUND, fx, fy, '#241a26', 7);
  line(ctx, fx + 60, GROUND, fx, fy, '#241a26', 7);

  // string lights
  for (let row = 0; row < 2; row++) {
    const y = 70 + row * 48;
    ctx.beginPath();
    ctx.moveTo(0, y + 20);
    for (let i = 0; i <= 8; i++) {
      const px = (i / 8) * w;
      const py = y + Math.sin((i / 8) * Math.PI * 3) * 22;
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(15,10,15,.8)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    for (let i = 0; i < 18; i++) {
      const px = (i / 17) * w;
      const py = y + Math.sin((i / 17) * Math.PI * 3) * 22 + 6;
      const colors = ['#ffd45c', '#ff6a6a', '#7dff6a', '#6ac9ff'];
      const pulse = 0.4 + Math.sin(t * 3 + i * 1.7) * 0.3;
      ctx.save();
      ctx.shadowColor = colors[i % 4];
      ctx.shadowBlur = 8;
      ell(ctx, px, py, 3.4, 3.4, `${colors[i % 4]}${Math.round((0.4 + pulse) * 255).toString(16).padStart(2, '0')}`, null);
      ctx.restore();
    }
  }

  // side spotlights
  for (const [sx, dir] of [[-40, 1], [w + 40, -1]]) {
    const g = ctx.createLinearGradient(sx, 80, sx + dir * 500, GROUND);
    g.addColorStop(0, 'rgba(255,220,150,.22)');
    g.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx, 30);
    ctx.lineTo(sx + dir * 60, 30);
    ctx.lineTo(sx + dir * 620, GROUND);
    ctx.lineTo(sx + dir * 260, GROUND);
    ctx.closePath();
    ctx.fill();
  }

  // ground
  const gg = ctx.createLinearGradient(0, GROUND, 0, h);
  gg.addColorStop(0, '#3a242b');
  gg.addColorStop(1, '#1a1016');
  ctx.fillStyle = gg;
  ctx.fillRect(0, GROUND, w, h - GROUND);
  ctx.fillStyle = 'rgba(30,16,22,.6)';
  for (let i = 0; i < 9; i++) ctx.fillRect(i * 150 - 20, GROUND + 30, 80, 4);
  // sawdust ring
  ctx.strokeStyle = 'rgba(200,160,100,.25)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(w / 2, GROUND + 74, 430, 60, 0, 0, TAU);
  ctx.stroke();

  // confetti
  for (let i = 0; i < 26; i++) {
    const px = (seeded(i + 20) * w + t * (12 + seeded(i) * 20)) % w;
    const py = (seeded(i + 41) * (h - 100) + t * (20 + seeded(i + 2) * 30)) % (h - 90);
    const a = 0.3 + Math.sin(t * 2 + i) * 0.2;
    ctx.fillStyle = i % 3 === 0 ? `rgba(255,90,90,${a})` : i % 3 === 1 ? `rgba(255,210,80,${a})` : `rgba(120,255,120,${a})`;
    ctx.fillRect(px, py, 3, 6);
  }

  vignette(ctx, w, h, 0.85);
}

function stageThrone(ctx, w, h, t) {
  const bg = ctx.createLinearGradient(0, 0, 0, GROUND);
  bg.addColorStop(0, '#09070c');
  bg.addColorStop(0.5, '#171019');
  bg.addColorStop(1, '#241a20');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, GROUND);

  // giant arched window
  const wx = 640;
  const wy = 360;
  ctx.beginPath();
  ctx.moveTo(wx - 220, GROUND);
  ctx.lineTo(wx - 220, wy - 200);
  ctx.quadraticCurveTo(wx, wy - 380, wx + 220, wy - 200);
  ctx.lineTo(wx + 220, GROUND);
  ctx.closePath();
  const wg = ctx.createLinearGradient(0, 120, 0, GROUND);
  wg.addColorStop(0, '#5c1b2e');
  wg.addColorStop(0.5, '#941f33');
  wg.addColorStop(1, '#3a111d');
  ctx.fillStyle = wg;
  ctx.fill();
  ctx.strokeStyle = '#3a2a30';
  ctx.lineWidth = 14;
  ctx.stroke();
  // window tracery
  ctx.strokeStyle = 'rgba(20,12,18,.8)';
  ctx.lineWidth = 5;
  line(ctx, wx, 160, wx, GROUND, 'rgba(20,12,18,.8)', 5);
  for (let i = 1; i < 4; i++) {
    const yy = 300 + i * 90;
    line(ctx, wx - 215, yy, wx + 215, yy, 'rgba(20,12,18,.55)', 3);
  }
  ctx.beginPath();
  ctx.arc(wx, wy - 170, 90, Math.PI, TAU);
  ctx.strokeStyle = 'rgba(20,12,18,.6)';
  ctx.lineWidth = 4;
  ctx.stroke();
  // moon in window
  ell(ctx, wx + 40, 240, 48, 48, 'rgba(240,220,190,.75)', null);

  // pillars
  for (const px of [80, 1200]) {
    ctx.fillStyle = '#191319';
    ctx.fillRect(px - 70, 0, 140, GROUND);
    const pg = ctx.createLinearGradient(px - 70, 0, px + 70, 0);
    pg.addColorStop(0, 'rgba(255,255,255,.03)');
    pg.addColorStop(0.5, 'rgba(255,255,255,.09)');
    pg.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = pg;
    ctx.fillRect(px - 70, 0, 140, GROUND);
    ctx.fillStyle = '#221a21';
    ctx.fillRect(px - 90, 0, 180, 36);
    ctx.fillRect(px - 90, GROUND - 52, 180, 52);
    for (let i = 0; i < 4; i++) line(ctx, px - 40 + i * 27, 40, px - 40 + i * 27, GROUND - 60, 'rgba(0,0,0,.35)', 3);
    // candle sconce
    for (const cy of [180, 380]) {
      ctx.fillStyle = '#2a2028';
      ctx.fillRect(px + 70, cy, 22, 8);
      for (let i = 0; i < 2; i++) {
        ctx.fillStyle = '#d9c9a3';
        ctx.fillRect(px + 76 + i * 9, cy - 16, 4, 16);
        const flick = 0.7 + Math.sin(t * 9 + i * 2 + px) * 0.25;
        ell(ctx, px + 78 + i * 9, cy - 21, 3, 6 * flick, 'rgba(255,190,90,.95)', null);
      }
    }
  }

  // throne
  const thx = 640;
  ctx.fillStyle = '#241722';
  ctx.beginPath();
  ctx.moveTo(thx - 100, GROUND - 90);
  ctx.lineTo(thx - 100, GROUND - 300);
  ctx.quadraticCurveTo(thx, GROUND - 420, thx + 100, GROUND - 300);
  ctx.lineTo(thx + 100, GROUND - 90);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = '#3d1a26';
  ctx.fillRect(thx - 75, GROUND - 250, 150, 160);
  ctx.fillStyle = '#c9a44a';
  for (let i = 0; i < 5; i++) poly(ctx, [[thx - 70 + i * 35, GROUND - 300], [thx - 55 + i * 35, GROUND - 340], [thx - 40 + i * 35, GROUND - 300]], '#c9a44a');
  // skull on throne
  ell(ctx, thx, GROUND - 316, 20, 22, '#d9d2c0', null);
  ell(ctx, thx - 7, GROUND - 320, 5, 6, '#1a1418', null);
  ell(ctx, thx + 7, GROUND - 320, 5, 6, '#1a1418', null);
  for (let i = 0; i < 4; i++) line(ctx, thx - 8 + i * 5, GROUND - 304, thx - 8 + i * 5, GROUND - 295, '#8a8270', 1.5);

  // banners
  for (const bx of [300, 980]) {
    ctx.fillStyle = 'rgba(110,20,34,.85)';
    ctx.beginPath();
    ctx.moveTo(bx - 55, 30);
    ctx.lineTo(bx + 55, 30);
    ctx.lineTo(bx + 55, 240);
    ctx.lineTo(bx, 270);
    ctx.lineTo(bx - 55, 240);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9a44a';
    ctx.lineWidth = 3;
    ctx.stroke();
    // emblem
    ctx.strokeStyle = 'rgba(220,180,100,.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(bx, 140, 34, 0, TAU);
    ctx.stroke();
    line(ctx, bx - 24, 140, bx + 24, 140, 'rgba(220,180,100,.55)', 3);
    line(ctx, bx, 116, bx, 164, 'rgba(220,180,100,.55)', 3);
  }

  // carpet
  ctx.beginPath();
  ctx.moveTo(420, GROUND);
  ctx.lineTo(860, GROUND);
  ctx.lineTo(1010, h);
  ctx.lineTo(270, h);
  ctx.closePath();
  const cg = ctx.createLinearGradient(0, GROUND, 0, h);
  cg.addColorStop(0, '#5c1826');
  cg.addColorStop(1, '#260b12');
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.strokeStyle = '#c9a44a';
  ctx.lineWidth = 3;
  ctx.stroke();
  line(ctx, 440, GROUND + 20, 480, h, 'rgba(220,180,100,.3)', 2);
  line(ctx, 840, GROUND + 20, 800, h, 'rgba(220,180,100,.3)', 2);

  // floor
  ctx.fillStyle = '#140f13';
  ctx.fillRect(0, GROUND, w, h - GROUND);
  for (let i = 0; i < 8; i++) {
    line(ctx, 0, GROUND + 18 + i * 18, w, GROUND + 18 + i * 18, 'rgba(255,255,255,.03)', 1);
  }

  // embers
  for (let i = 0; i < 30; i++) {
    const px = (seeded(i + 5) * w + Math.sin(t * 0.7 + i) * 30) % w;
    const py = 720 - ((t * (18 + seeded(i) * 20) + seeded(i + 9) * 720) % 720);
    const a = 0.25 + (Math.sin(t * 3 + i) + 1) * 0.2;
    ell(ctx, px, py, 1.8, 1.8, `rgba(255,150,70,${a})`, null);
  }

  vignette(ctx, w, h, 0.85);
}

function stageInfernal(ctx, w, h, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#160609');
  sky.addColorStop(0.45, '#3d0e10');
  sky.addColorStop(0.75, '#7d2214');
  sky.addColorStop(1, '#c04a1c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, GROUND);

  // smoke clouds
  for (let i = 0; i < 7; i++) {
    const cx = (seeded(i) * w + t * (4 + i)) % w;
    const cy = 70 + seeded(i + 4) * 220;
    ctx.fillStyle = `rgba(20,8,9,${0.25 + seeded(i + 8) * 0.2})`;
    ell(ctx, cx, cy, 150, 35, ctx.fillStyle, null);
  }

  // volcano glow
  haze(ctx, 640, 300, 420, 220, 'rgba(255,120,30,.5)', t, 0.8);
  haze(ctx, 250, 330, 260, 200, 'rgba(255,80,20,.3)', t, 0.5);

  // mountains
  const ranges = [
    { color: '#240b0c', y: GROUND - 140, peaks: [[-50, 500], [120, 300], [290, 430], [430, 250], [590, 390], [760, 240], [940, 400], [1090, 260], [1330, 470]] },
    { color: '#170708', y: GROUND - 80, peaks: [[-50, 470], [180, 370], [340, 460], [520, 320], [720, 450], [900, 350], [1080, 450], [1250, 360], [1330, 440]] },
  ];
  for (const r of ranges) {
    ctx.fillStyle = r.color;
    ctx.beginPath();
    ctx.moveTo(-60, GROUND);
    for (const [px, py] of r.peaks) ctx.lineTo(px, r.y - (470 - py));
    ctx.lineTo(1330, GROUND);
    ctx.closePath();
    ctx.fill();
  }

  // lava cracks in mountains
  ctx.strokeStyle = 'rgba(255,120,30,.55)';
  ctx.lineWidth = 3;
  ctx.save();
  ctx.shadowColor = '#ff6a1a';
  ctx.shadowBlur = 10;
  for (let i = 0; i < 5; i++) {
    const bx = 160 + i * 230;
    ctx.beginPath();
    ctx.moveTo(bx, GROUND - 120);
    ctx.lineTo(bx + 30, GROUND - 190);
    ctx.lineTo(bx + 16, GROUND - 240);
    ctx.stroke();
  }
  ctx.restore();

  // giant rock arch
  ctx.fillStyle = '#180909';
  ctx.beginPath();
  ctx.moveTo(-40, GROUND);
  ctx.lineTo(-40, 160);
  ctx.quadraticCurveTo(250, 40, 470, 250);
  ctx.lineTo(430, 430);
  ctx.quadraticCurveTo(250, 260, 80, 340);
  ctx.lineTo(80, GROUND);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1320, GROUND);
  ctx.lineTo(1320, 140);
  ctx.quadraticCurveTo(1050, 40, 820, 260);
  ctx.lineTo(860, 440);
  ctx.quadraticCurveTo(1060, 270, 1230, 350);
  ctx.lineTo(1230, GROUND);
  ctx.closePath();
  ctx.fill();

  // lava river
  const lavaY = GROUND - 48;
  const lg = ctx.createLinearGradient(0, lavaY, 0, lavaY + 48);
  lg.addColorStop(0, '#ffb03a');
  lg.addColorStop(0.4, '#e2571a');
  lg.addColorStop(1, '#7d1f0e');
  ctx.fillStyle = lg;
  ctx.fillRect(0, lavaY, w, 46);
  ctx.save();
  ctx.shadowColor = '#ff7a20';
  ctx.shadowBlur = 30;
  ctx.fillStyle = 'rgba(255,140,40,.5)';
  ctx.fillRect(0, lavaY - 6, w, 8);
  ctx.restore();
  // lava highlights
  for (let i = 0; i < 14; i++) {
    const lx = (seeded(i) * w + t * 14) % w;
    ell(ctx, lx, lavaY + 12 + seeded(i + 1) * 24, 20 + seeded(i + 2) * 40, 3, 'rgba(255,220,130,.5)', null);
  }

  // ground
  ctx.fillStyle = '#1a0b0a';
  ctx.fillRect(0, GROUND, w, h - GROUND);
  ctx.fillStyle = '#24100d';
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  for (let i = 0; i <= 12; i++) {
    ctx.lineTo(i * 116, GROUND + Math.sin(i * 1.7) * 4);
  }
  ctx.lineTo(w, GROUND + 26);
  ctx.lineTo(0, GROUND + 26);
  ctx.closePath();
  ctx.fill();
  // glowing cracks
  ctx.save();
  ctx.shadowColor = '#ff6a1a';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = 'rgba(255,110,30,.7)';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 7; i++) {
    const cx = 100 + i * 170;
    ctx.beginPath();
    ctx.moveTo(cx, GROUND + 6);
    ctx.lineTo(cx + 18, GROUND + 30);
    ctx.lineTo(cx + 6, GROUND + 48);
    ctx.lineTo(cx + 30, GROUND + 80);
    ctx.stroke();
  }
  ctx.restore();

  // stalagmites / rocks
  for (const [rx, rw, rh] of [[120, 60, 100], [1120, 72, 130], [310, 30, 60], [980, 34, 70]]) {
    poly(ctx, [[rx - rw / 2, GROUND], [rx - rw * 0.2, GROUND - rh], [rx + rw * 0.15, GROUND - rh * 0.8], [rx + rw / 2, GROUND]], '#170a09', '#0c0505', 2);
  }

  // skulls
  for (const [sx, sy, ss] of [[430, GROUND + 44, 1], [860, GROUND + 62, 1.2], [250, GROUND + 78, 0.8]]) {
    ell(ctx, sx, sy, 13 * ss, 11 * ss, '#c9bda1', null);
    ell(ctx, sx - 5 * ss, sy - 2 * ss, 3 * ss, 3 * ss, '#1a0f0d', null);
    ell(ctx, sx + 5 * ss, sy - 2 * ss, 3 * ss, 3 * ss, '#1a0f0d', null);
    line(ctx, sx - 4 * ss, sy + 5 * ss, sx + 4 * ss, sy + 5 * ss, '#6b5f4a', 1.5);
  }

  // chains hanging
  ctx.strokeStyle = 'rgba(25,15,14,.9)';
  ctx.lineWidth = 3;
  for (const cx of [520, 800]) {
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(cx + Math.sin(i * 1.7) * 3, i * 18, 5, 0, TAU);
      ctx.stroke();
    }
  }

  // embers
  for (let i = 0; i < 42; i++) {
    const px = (seeded(i + 3) * w + Math.sin(t * 0.6 + i) * 26) % w;
    const py = 720 - ((t * (24 + seeded(i) * 34) + seeded(i + 7) * 720) % 760);
    const a = 0.3 + (Math.sin(t * 3.4 + i) + 1) * 0.25;
    ell(ctx, px, py, 1.4 + seeded(i + 2) * 1.8, 1.4 + seeded(i + 2) * 1.8, `rgba(255,${120 + (i % 5) * 15},50,${a})`, null);
  }

  vignette(ctx, w, h, 0.88);
}

export function drawStage(ctx, id, w, h, time) {
  ctx.save();
  if (id === 'carnival') stageCarnival(ctx, w, h, time);
  else if (id === 'throne') stageThrone(ctx, w, h, time);
  else if (id === 'infernal') stageInfernal(ctx, w, h, time);
  else stageHaddonfield(ctx, w, h, time);
  ctx.restore();
}

export function drawTitleBackdrop(ctx, w, h, time) {
  drawStage(ctx, 'haddonfield', w, h, time);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(5,4,8,.55)');
  g.addColorStop(0.55, 'rgba(5,4,8,.72)');
  g.addColorStop(1, 'rgba(5,4,8,.9)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export const GROUND_Y = GROUND;

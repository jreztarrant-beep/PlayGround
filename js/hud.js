// In-canvas fighting HUD and announcements.
import { TAU, rr, ell, line, poly, dark } from './draw-utils.js';

function font(size, weight = 900) {
  return `${weight} ${size}px Anton, Impact, "Arial Black", "Franklin Gothic Heavy", sans-serif`;
}

function txt(ctx, text, x, y, size, o = {}) {
  const { align = 'left', color = '#f5efe2', stroke = '#0a0709', lw = 7, weight = 900, alpha = 1 } = o;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = font(size, weight);
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  if (lw > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function skewBarPath(ctx, x, y, w, h, mirror) {
  const s = 9;
  ctx.beginPath();
  if (!mirror) {
    ctx.moveTo(x + s, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - s, y + h);
    ctx.lineTo(x, y + h);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - s, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + s, y + h);
  }
  ctx.closePath();
}

function bar(ctx, x, y, w, h, ratio, ghost, mirror, color, accent) {
  const r = Math.max(0, Math.min(1, ratio));
  const g = Math.max(0, Math.min(1, ghost));
  skewBarPath(ctx, x, y, w, h, mirror);
  ctx.fillStyle = 'rgba(8,6,9,.9)';
  ctx.fill();
  ctx.save();
  skewBarPath(ctx, x, y, w, h, mirror);
  ctx.clip();
  if (g > r) {
    if (!mirror) ctx.fillStyle = 'rgba(255,205,80,.55)';
    else ctx.fillStyle = 'rgba(255,205,80,.55)';
    if (!mirror) ctx.fillRect(x, y, w * g, h);
    else ctx.fillRect(x + w * (1 - g), y, w * g, h);
  }
  if (!mirror) ctx.fillStyle = color;
  else ctx.fillStyle = color;
  if (!mirror) {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, accent || color);
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w * r, h);
  } else {
    const grad = ctx.createLinearGradient(x + w, y, x + w, y + h);
    grad.addColorStop(0, accent || color);
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fillRect(x + w * (1 - r), y, w * r, h);
  }
  // shine
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  if (!mirror) ctx.fillRect(x, y + 2, w * r, 3);
  else ctx.fillRect(x + w * (1 - r), y + 2, w * r, 3);
  ctx.restore();
  skewBarPath(ctx, x, y, w, h, mirror);
  ctx.strokeStyle = 'rgba(240,230,210,.28)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function portrait(ctx, cv, x, y, w, h, mirror) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  if (mirror) ctx.scale(-1, 1);
  ctx.translate(-w / 2, -h / 2);
  rr(ctx, 0, 0, w, h, 5);
  ctx.fillStyle = '#171217';
  ctx.fill();
  ctx.save();
  rr(ctx, 0, 0, w, h, 5);
  ctx.clip();
  ctx.globalAlpha = 0.96;
  ctx.drawImage(cv, 0, 0, w, h);
  const g = ctx.createLinearGradient(0, h * 0.5, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  rr(ctx, 0.5, 0.5, w - 1, h - 1, 5);
  ctx.strokeStyle = '#5a4a3c';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function pips(ctx, x, y, wins, mirror) {
  for (let i = 0; i < 2; i++) {
    const px = x + (mirror ? -1 : 1) * i * 17;
    ctx.save();
    ctx.translate(px, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = i < wins ? '#ffd447' : 'rgba(255,255,255,.14)';
    if (i < wins) {
      ctx.shadowColor = '#ffd447';
      ctx.shadowBlur = 8;
    }
    ctx.fillRect(-5, -5, 10, 10);
    ctx.strokeStyle = i < wins ? '#fff2b0' : 'rgba(255,255,255,.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-5, -5, 10, 10);
    ctx.restore();
  }
}

function meterBar(ctx, f, x, y, w, mirror) {
  const ratio = f.meter / 100;
  const ready = f.meter >= 50;
  const h = 9;
  skewBarPath(ctx, x, y, w, h, mirror);
  ctx.fillStyle = 'rgba(8,6,9,.85)';
  ctx.fill();
  ctx.save();
  skewBarPath(ctx, x, y, w, h, mirror);
  ctx.clip();
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  if (ready) {
    grad.addColorStop(0, '#fff08a');
    grad.addColorStop(1, '#ffb02a');
  } else {
    grad.addColorStop(0, '#4a86c9');
    grad.addColorStop(1, '#6ac9ff');
  }
  ctx.fillStyle = grad;
  if (!mirror) ctx.fillRect(x, y, w * ratio, h);
  else ctx.fillRect(x + w * (1 - ratio), y, w * ratio, h);
  // cost notch at 50%
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(x + w * 0.5, y, 2, h);
  ctx.restore();
  skewBarPath(ctx, x, y, w, h, mirror);
  ctx.strokeStyle = ready ? 'rgba(255,220,90,.75)' : 'rgba(240,230,210,.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  if (ready) {
    const pulse = 0.6 + Math.sin(performance.now() / 240) * 0.3;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.shadowColor = '#ffd447';
    ctx.shadowBlur = 8;
    txt(ctx, ratio >= 1 ? 'SPECIAL READY!' : 'SPECIAL', mirror ? x - 8 : x + w + 10, y + 9, 12, {
      align: mirror ? 'right' : 'left', color: '#ffd447', lw: 4,
    });
    ctx.restore();
  } else {
    txt(ctx, 'SPECIAL', mirror ? x - 8 : x + w + 10, y + 9, 11, {
      align: mirror ? 'right' : 'left', color: 'rgba(220,214,200,.4)', lw: 3,
    });
  }
}

function timerPlate(ctx, timeLeft) {
  ctx.save();
  ctx.translate(640, 78);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * TAU;
    const px = Math.cos(a) * 62;
    const py = Math.sin(a) * 44;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -44, 0, 44);
  g.addColorStop(0, '#2a1e20');
  g.addColorStop(1, '#120c0e');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,205,90,.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  const t = Math.max(0, Math.ceil(timeLeft));
  const low = t <= 10;
  txt(ctx, String(t).padStart(2, '0'), 640, 96, 50, {
    align: 'center', color: low ? '#ff4a3a' : '#f6efdd', lw: 6,
  });
  txt(ctx, 'TIME', 640, 112, 10, {
    align: 'center', color: low ? '#ff9a8a' : 'rgba(230,220,200,.55)', lw: 2,
  });
}

export function drawHud(ctx, game) {
  const w = game.w;
  const h = game.h;
  const [a, b] = game.fighters;
  const aw = game.avatars[0];
  const bw = game.avatars[1];

  // top gradient
  const g = ctx.createLinearGradient(0, 0, 0, 160);
  g.addColorStop(0, 'rgba(6,4,7,.92)');
  g.addColorStop(0.7, 'rgba(6,4,7,.62)');
  g.addColorStop(1, 'rgba(6,4,7,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, 178);

  // portrait plates
  portrait(ctx, aw, 26, 22, 72, 84, false);
  portrait(ctx, bw, w - 98, 22, 72, 84, true);

  // P1 name
  const aName = a.char.name;
  const bName = b.char.name;
  const aSize = aName.length > 15 ? 22 : aName.length > 12 ? 26 : 30;
  const bSize = bName.length > 15 ? 22 : bName.length > 12 ? 26 : 30;
  txt(ctx, aName, 112, 47, aSize, { color: '#f6efdd', lw: 6 });
  txt(ctx, bName, w - 112, 47, bSize, { align: 'right', color: '#f6efdd', lw: 6 });

  // health
  const p1Low = a.hp <= 30;
  const p2Low = b.hp <= 30;
  bar(ctx, 112, 56, 442, 27, a.hp / 100, a.displayHp / 100, false, p1Low ? '#e12828' : '#b8e64a', p1Low ? '#ff6a4a' : '#ecff8a');
  bar(ctx, w - 112 - 442, 56, 442, 27, b.hp / 100, b.displayHp / 100, true, p2Low ? '#e12828' : '#b8e64a', p2Low ? '#ff6a4a' : '#ecff8a');

  // pips + round text
  pips(ctx, 508, 108, game.wins[0], false);
  pips(ctx, w - 508, 108, game.wins[1], true);
  txt(ctx, `ROUND ${game.round}`, 640, 141, 13, { align: 'center', color: 'rgba(235,225,205,.5)', lw: 3 });
  txt(ctx, 'BEST OF 3', 640, 155, 9, { align: 'center', color: 'rgba(235,225,205,.26)', lw: 2 });

  meterBar(ctx, a, 112, 92, 312, false);
  meterBar(ctx, b, w - 112 - 312, 92, 312, true);

  timerPlate(ctx, game.roundTime);

  // stage label
  txt(ctx, game.stage.name, 22, h - 12, 12, { color: 'rgba(240,230,210,.32)', lw: 3 });
  txt(ctx, 'VILLAINS: RUMBLE', w - 22, h - 12, 12, { align: 'right', color: 'rgba(240,230,210,.2)', lw: 3 });

  // combo counters
  for (let i = 0; i < 2; i++) {
    const f = game.fighters[i];
    if (f.combo >= 2 && f.comboTimer > 0) {
      const x = i === 0 ? 250 : w - 250;
      const align = i === 0 ? 'left' : 'right';
      const bounce = 1 + Math.min(0.25, f.comboTimer * 0.02);
      ctx.save();
      ctx.translate(x, 200);
      ctx.scale(bounce, bounce);
      txt(ctx, `${f.combo} HIT`, 0, 0, 40, { align, color: '#ffd447', lw: 7 });
      txt(ctx, 'COMBO', 0, 22, 15, { align, color: '#f6efdd', lw: 4 });
      ctx.restore();
    }
  }

  // control hint during opening seconds
  if (game.phase === 'fight' && game.time < 9 && game.mode !== 'local') {
    const alpha = Math.min(1, Math.max(0, (9 - game.time) / 2)) * 0.5;
    txt(ctx, 'A / D  MOVE      W  JUMP      S  BLOCK      J  PUNCH      K  KICK      L  SPECIAL', 640, 696, 14, {
      align: 'center', color: '#e8dfcc', lw: 3, alpha,
    });
    txt(ctx, 'GET CLOSE. HIT HARD. DON’T GET GROUNDED.', 640, 676, 10, {
      align: 'center', color: '#ffd447', lw: 2, alpha: alpha * 0.8,
    });
  } else if (game.mode === 'local' && game.phase === 'fight' && game.time < 9) {
    const alpha = Math.min(1, Math.max(0, (9 - game.time) / 2)) * 0.5;
    txt(ctx, 'P1: A/D MOVE · W JUMP · S BLOCK · J/K/L ATTACK', 640, 688, 13, {
      align: 'center', color: '#e8dfcc', lw: 3, alpha,
    });
    txt(ctx, 'P2: ARROWS MOVE · UP JUMP · DOWN BLOCK · , . / ATTACK', 640, 704, 12, {
      align: 'center', color: '#ffd447', lw: 3, alpha,
    });
  }

  // low health warning tint
  const low = Math.min(a.hp, b.hp);
  if (low <= 25 && game.phase !== 'intro') {
    const pulse = 0.16 + Math.sin(game.time * 6) * 0.06;
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.32, w / 2, h / 2, h * 0.8);
    vg.addColorStop(0, 'rgba(120,0,0,0)');
    vg.addColorStop(1, `rgba(150,0,0,${pulse})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }

  drawAnnouncement(ctx, game);
}

export function drawAnnouncement(ctx, game) {
  const a = game.announcement;
  if (!a) return;
  const p = a.t / a.dur;
  if (p >= 1) return;
  const pop = p < 0.16 ? 0.55 + (p / 0.16) * 0.55 : 1 + Math.sin(Math.min(1, (p - 0.16) / 0.3) * Math.PI) * 0.05;
  const fade = p > 0.82 ? 1 - (p - 0.82) / 0.18 : 1;
  const styles = {
    fight: { color: '#ff3b2e', size: 120, sub: '#ffd447' },
    ko: { color: '#ff1e14', size: 158, sub: '#f6efdd' },
    round: { color: '#ffd447', size: 92, sub: '#f6efdd' },
    time: { color: '#ffd447', size: 108, sub: '#f6efdd' },
    win: { color: '#b8ff6a', size: 92, sub: '#f6efdd' },
    draw: { color: '#c9c4b8', size: 106, sub: '#f6efdd' },
    default: { color: '#f6efdd', size: 92, sub: '#ffd447' },
  };
  const st = styles[a.style] || styles.default;

  // band behind big callouts
  if (a.style === 'fight' || a.style === 'ko' || a.style === 'time') {
    ctx.save();
    ctx.globalAlpha = fade * 0.6;
    const g = ctx.createLinearGradient(0, 250, 0, 390);
    g.addColorStop(0, 'rgba(8,4,6,0)');
    g.addColorStop(0.2, 'rgba(8,4,6,.78)');
    g.addColorStop(0.8, 'rgba(8,4,6,.78)');
    g.addColorStop(1, 'rgba(8,4,6,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 250, game.w, 150);
    ctx.strokeStyle = a.style === 'ko' ? 'rgba(225,40,40,.55)' : 'rgba(255,212,71,.35)';
    ctx.lineWidth = 2;
    line(ctx, 0, 300, game.w, 300, ctx.strokeStyle, 2);
    line(ctx, 0, 390, game.w, 390, ctx.strokeStyle, 2);
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(game.w / 2, a.style === 'ko' ? 342 : 340);
  ctx.scale(pop, pop);
  ctx.rotate(-0.025);
  const grad = ctx.createLinearGradient(0, -st.size / 2, 0, st.size / 2);
  grad.addColorStop(0, '#fff7df');
  grad.addColorStop(0.42, st.color);
  grad.addColorStop(1, dark(st.color, 0.18));
  txt(ctx, a.text, 0, 0, st.size, { align: 'center', color: st.color, lw: 13, stroke: '#080507' });
  // colored inner highlight
  ctx.save();
  ctx.globalAlpha *= 0.85;
  ctx.font = font(st.size);
  ctx.textAlign = 'center';
  ctx.fillStyle = grad;
  ctx.fillText(a.text, 0, 0);
  ctx.restore();
  if (a.sub) {
    txt(ctx, a.sub, 0, st.size * 0.55 + 18, 24, { align: 'center', color: st.sub, lw: 5 });
  }
  ctx.restore();
}

export function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.3, w / 2, h * 0.5, h * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.8, 'rgba(0,0,0,.18)');
  g.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

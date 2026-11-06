// Hit sparks, projectiles, beams and shockwaves.
import { TAU, ell, line, poly, dark } from './draw-utils.js';
import { GROUND_Y } from './stages.js';

function lookFor(char) {
  if (char.id === 'vader') return 'wave';
  if (char.id === 'bowser' || char.id === 'elmer') return 'fire';
  if (char.id === 'pennywise') return 'balloon';
  if (char.id === 'pinhead') return 'chain';
  if (char.id === 'dracula') return 'bats';
  if (['jafar', 'lilith', 'killjoy'].includes(char.id)) return 'magic';
  return 'orb';
}

export function spawnProjectile(game, ownerIndex) {
  const f = game.fighters[ownerIndex];
  const c = f.char;
  const color = c.special.color;
  const scale = c.scale;
  const p = {
    owner: ownerIndex,
    x: f.x + f.facing * (42 * scale + 10),
    y: f.y - 112 * scale,
    vx: f.facing * (540 + c.stats.speed * 26),
    r: 16 + c.stats.power * 1.8,
    color,
    look: lookFor(c),
    life: 1.7,
    damage: 15 * f.powerFactor,
    trail: 0,
  };
  game.projectiles.push(p);
  game.shake(3, 0.12);
  game.sound.play('special');
  game.burst(p.x, p.y, color, 14, 3);
  game.flash(color, 0.1);
}

export function spawnBeam(game, ownerIndex) {
  const f = game.fighters[ownerIndex];
  const c = f.char;
  const scale = c.scale;
  const isEye = c.id === 'cyclops' || c.id === 'bill';
  const origin = {
    x: f.x + f.facing * (isEye ? 16 : 34) * scale,
    y: f.y - (isEye ? 138 : 96) * scale,
  };
  const beam = {
    owner: ownerIndex,
    x: origin.x,
    y: origin.y,
    dir: f.facing,
    len: 900,
    color: c.special.color,
    t: 0,
    dur: 0.42,
    thick: c.id === 'cyclops' ? 16 : 9,
  };
  game.beams.push(beam);
  // immediate damage check
  const d = game.fighters[1 - ownerIndex];
  if (!d.ko) {
    const horizontal = (d.x - origin.x) * f.facing;
    const vertical = Math.abs((d.y - 90 * d.char.scale) - origin.y);
    if (horizontal > 0 && horizontal < 900 && vertical < 95 * d.char.scale) {
      game.hitFighter(ownerIndex, 1 - ownerIndex, {
        damage: 17 * f.powerFactor,
        knockback: 420,
        vy: -160,
        hitstun: 0.5,
        type: 'special',
        contact: { x: d.x, y: origin.y },
        color: c.special.color,
      });
    }
  }
  game.sound.play('beam');
  game.shake(10, 0.3);
  game.flash(c.special.color, 0.24);
  for (let i = 0; i < 24; i++) {
    game.burst(origin.x + f.facing * (40 + i * 30), origin.y + (Math.random() - 0.5) * 40, c.special.color, 2, 2);
  }
}

export function spawnShockwave(game, ownerIndex) {
  const f = game.fighters[ownerIndex];
  const c = f.char;
  const big = c.id === 'thanos';
  const maxR = big ? 290 : 190 + f.char.fat * 60;
  game.waves.push({
    owner: ownerIndex, x: f.x, t: 0, dur: 0.75, maxR,
    color: c.special.color,
  });
  const d = game.fighters[1 - ownerIndex];
  if (!d.ko) {
    const dist = Math.abs(d.x - f.x);
    if (dist < maxR + 20 && d.y > GROUND_Y - 90) {
      game.hitFighter(ownerIndex, 1 - ownerIndex, {
        damage: (big ? 20 : 16) * f.powerFactor,
        knockback: 380 + (maxR - 190),
        vy: -360,
        hitstun: 0.6,
        type: 'special',
        contact: { x: d.x, y: d.y - 40 },
        color: c.special.color,
      });
    }
  }
  game.sound.play('heavy');
  game.shake(big ? 22 : 14, 0.4);
  game.flash(c.special.color, big ? 0.22 : 0.14);
  game.burst(f.x, f.y - 20, c.special.color, 30, 7, 'dust');
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * TAU;
    game.particles.push({
      x: f.x + Math.cos(a) * 14, y: f.y - 8 + Math.sin(a) * 8,
      vx: Math.cos(a) * (120 + Math.random() * 140), vy: -Math.random() * 220 - 40,
      life: 0.7, maxLife: 0.7, size: 3 + Math.random() * 5, color: c.special.color,
      grav: 900, additive: true, shape: 'spark',
    });
  }
}

export function updateEffects(game, dt) {
  const { particles, projectiles, beams, waves, floats } = game;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.vy += (p.grav ?? 750) * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y > GROUND_Y && p.grav !== 0) {
      p.y = GROUND_Y;
      p.vy *= -0.35;
      p.vx *= 0.7;
    }
    p.vx *= 0.99;
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.trail -= dt;
    if (p.trail <= 0) {
      p.trail = 0.035;
      game.particles.push({
        x: p.x + (Math.random() - 0.5) * 10, y: p.y + (Math.random() - 0.5) * 10,
        vx: -p.vx * 0.08 + (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
        life: 0.3, maxLife: 0.3, size: 3 + Math.random() * 4, color: p.color,
        grav: 0, additive: true, shape: 'circle',
      });
    }
    const d = game.fighters[1 - p.owner];
    if (!d.ko) {
      const width = 25 * d.char.scale + d.char.fat * 25;
      if (Math.abs(p.x - d.x) < width + p.r && p.y > d.y - 180 * d.char.scale && p.y < d.y + 2) {
        game.hitFighter(p.owner, 1 - p.owner, {
          damage: p.damage, knockback: 420, vy: -160, hitstun: 0.46, type: 'special',
          contact: { x: p.x, y: p.y }, color: p.color,
        });
        game.burst(p.x, p.y, p.color, 26, 6);
        projectiles.splice(i, 1);
        continue;
      }
    }
    // projectile clash
    let clashed = false;
    for (const q of projectiles) {
      if (q === p || q.owner === p.owner) continue;
      if (Math.abs(q.x - p.x) < 44 && Math.abs(q.y - p.y) < 44) {
        game.burst((p.x + q.x) / 2, (p.y + q.y) / 2, '#fff2c0', 30, 7);
        projectiles.splice(projectiles.indexOf(q), 1);
        clashed = true;
        break;
      }
    }
    if (clashed) { projectiles.splice(i, 1); continue; }
    if (p.life <= 0 || p.x < -120 || p.x > game.w + 120) projectiles.splice(i, 1);
  }

  for (let i = beams.length - 1; i >= 0; i--) {
    beams[i].t += dt;
    if (beams[i].t >= beams[i].dur) beams.splice(i, 1);
  }
  for (let i = waves.length - 1; i >= 0; i--) {
    waves[i].t += dt;
    if (waves[i].t >= waves[i].dur) waves.splice(i, 1);
  }
  for (let i = floats.length - 1; i >= 0; i--) {
    floats[i].t += dt;
    floats[i].y -= 36 * dt;
    if (floats[i].t >= floats[i].dur) floats.splice(i, 1);
  }
  if (game.flashAlpha > 0) game.flashAlpha = Math.max(0, game.flashAlpha - dt * 2.4);
}

function drawOrb(ctx, p, time) {
  const glow = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r * 2.6);
  glow.addColorStop(0, '#ffffff');
  glow.addColorStop(0.18, p.color);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r * 2.6, 0, TAU);
  ctx.fill();
  ell(ctx, p.x, p.y, p.r * 0.82, p.r * 0.82, p.color, null);
  ell(ctx, p.x - p.r * 0.15, p.y - p.r * 0.2, p.r * 0.28, p.r * 0.24, 'rgba(255,255,255,.85)', null);
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r * 1.35 + Math.sin(time * 10) * 2, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawProjectile(ctx, p, time) {
  const dir = Math.sign(p.vx) || 1;
  ctx.save();
  if (p.look === 'fire') {
    ctx.save();
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 24;
    for (let i = 0; i < 4; i++) {
      const rr = p.r * (1.5 - i * 0.28);
      ell(ctx, p.x - dir * i * 7, p.y + Math.sin(time * 20 + i) * 3, rr, rr * 0.9, i === 0 ? p.color : i === 1 ? '#ffd24a' : '#fff2c8', null);
    }
    ctx.restore();
    // flame tail
    for (let i = 0; i < 5; i++) {
      ell(ctx, p.x - dir * (20 + i * 14), p.y + Math.sin(time * 24 + i) * 8, 10 - i * 1.4, 7 - i, `rgba(255,${130 - i * 16},40,${0.4 - i * 0.06})`, null);
    }
  } else if (p.look === 'wave') {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(dir, 1);
    ctx.strokeStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 15;
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = 0.7 - i * 0.13;
      ctx.lineWidth = 5 - i;
      ctx.beginPath();
      ctx.arc(0, 0, 16 + i * 9, -1.1, 1.1);
      ctx.stroke();
    }
    ctx.restore();
  } else if (p.look === 'balloon') {
    const bob = Math.sin(time * 3) * 4;
    ctx.strokeStyle = 'rgba(230,220,210,.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(p.x - dir * 30, p.y + 14);
    ctx.quadraticCurveTo(p.x - dir * 12, p.y + 30, p.x, p.y + 14 + bob);
    ctx.stroke();
    ctx.save();
    ctx.shadowColor = '#ff3b3b';
    ctx.shadowBlur = 18;
    ell(ctx, p.x, p.y + bob, p.r, p.r * 1.25, '#d92b2b', '#7d1212', 1.5);
    ell(ctx, p.x - p.r * 0.3, p.y - p.r * 0.35 + bob, p.r * 0.22, p.r * 0.4, 'rgba(255,255,255,.35)', null);
    poly(ctx, [[p.x - 4, p.y + p.r * 1.2 + bob], [p.x + 4, p.y + p.r * 1.2 + bob], [p.x, p.y + p.r * 1.4 + bob]], '#7d1212');
    ctx.restore();
  } else if (p.look === 'bats') {
    ctx.save();
    ctx.translate(p.x, p.y);
    for (let i = 0; i < 4; i++) {
      const a = time * 5 + i * 1.7;
      const bx = Math.cos(a) * 22;
      const by = Math.sin(a * 1.3) * 16;
      ctx.fillStyle = i % 2 ? '#1a0d12' : '#2b1218';
      poly(ctx, [[bx - 10, by], [bx - 3, by - 6], [bx, by - 1], [bx + 3, by - 6], [bx + 10, by], [bx + 3, by + 2], [bx, by + 5], [bx - 3, by + 2]], i % 2 ? '#1a0d12' : '#2b1218');
      ell(ctx, bx, by - 1, 2, 2.4, '#c93a3a', null);
    }
    ell(ctx, p.x, p.y, p.r * 0.55, p.r * 0.55, 'rgba(255,40,60,.5)', null);
    ctx.restore();
  } else if (p.look === 'chain') {
    ctx.strokeStyle = '#8b8b96';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(p.x - dir * i * 9, p.y + Math.sin(time * 8 + i) * 2, 5, 0.2, 5.9);
      ctx.stroke();
    }
    ell(ctx, p.x, p.y, p.r * 0.5, p.r * 0.5, '#b9c4d9', null);
    ctx.save();
    ctx.translate(p.x + dir * 16, p.y);
    ctx.rotate(time * 8);
    poly(ctx, [[-6, -10], [10, 0], [-6, 10], [-2, 0]], '#b9c4d9');
    ctx.restore();
  } else if (p.look === 'magic') {
    const glow = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r * 3);
    glow.addColorStop(0, '#fff');
    glow.addColorStop(0.3, p.color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(time * 3 + i);
      ctx.beginPath();
      for (let j = 0; j < 3; j++) {
        const a = (j / 3) * TAU;
        const x = Math.cos(a) * p.r * 1.5;
        const y = Math.sin(a) * p.r * 1.5;
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    ell(ctx, p.x, p.y, p.r * 0.55, p.r * 0.55, '#fff', null);
  } else {
    drawOrb(ctx, p, time);
  }
  ctx.restore();
}

function drawBeam(ctx, b) {
  const fade = Math.sin(Math.min(1, b.t / b.dur) * Math.PI) * 0.9 + 0.1;
  const flick = 0.85 + Math.random() * 0.3;
  const x2 = b.x + b.dir * b.len;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = fade;
  ctx.lineCap = 'round';
  ctx.shadowColor = b.color;
  ctx.shadowBlur = 30;
  const g = ctx.createLinearGradient(b.x, b.y, x2, b.y);
  g.addColorStop(0, b.color);
  g.addColorStop(0.15, '#ffffff');
  g.addColorStop(0.7, b.color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.strokeStyle = g;
  ctx.lineWidth = b.thick * 2.6 * flick;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(x2, b.y);
  ctx.stroke();
  ctx.strokeStyle = '#fffbe8';
  ctx.lineWidth = b.thick * flick;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y);
  ctx.lineTo(x2, b.y);
  ctx.stroke();
  // muzzle flare
  const mg = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, 60);
  mg.addColorStop(0, '#fff');
  mg.addColorStop(0.3, b.color);
  mg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(b.x, b.y, 60, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawWave(ctx, wv, time) {
  const p = wv.t / wv.dur;
  const r = 20 + p * wv.maxR;
  const alpha = (1 - p) * 0.85;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = wv.color;
  ctx.shadowColor = wv.color;
  ctx.shadowBlur = 18;
  ctx.lineWidth = 6 * (1 - p) + 1.5;
  ctx.beginPath();
  ctx.ellipse(wv.x, GROUND_Y + 4, r, r * 0.22, 0, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(wv.x, GROUND_Y + 4, r * 0.74, r * 0.17, 0, 0, TAU);
  ctx.stroke();
  // cracks
  ctx.globalAlpha = alpha * 0.8;
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    const len = r * (0.45 + (i % 3) * 0.18);
    line(ctx, wv.x + Math.cos(a) * 20, GROUND_Y + 2 + Math.sin(a) * 6, wv.x + Math.cos(a) * len, GROUND_Y + 2 + Math.sin(a) * len * 0.2, wv.color, 2);
  }
  ctx.restore();
}

export function drawEffects(ctx, game, time) {
  const { particles, projectiles, beams, waves, floats } = game;

  // projectiles under the fighters' sparks but above ground
  for (const p of projectiles) drawProjectile(ctx, p, time);
  for (const b of beams) drawBeam(ctx, b);
  for (const wv of waves) drawWave(ctx, wv, time);

  ctx.save();
  for (const p of particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = a;
    if (p.additive) ctx.globalCompositeOperation = 'lighter';
    else ctx.globalCompositeOperation = 'source-over';
    if (p.shape === 'dust') {
      ell(ctx, p.x, p.y, p.size * (1.6 - a * 0.6), p.size * (1.6 - a * 0.6), p.color, null);
    } else if (p.shape === 'spark') {
      line(ctx, p.x, p.y, p.x - p.vx * 0.02, p.y - p.vy * 0.02, p.color, Math.max(1, p.size * 0.4));
    } else {
      ell(ctx, p.x, p.y, p.size * a, p.size * a, p.color, null);
    }
  }
  ctx.restore();

  for (const f of floats) {
    const a = Math.max(0, 1 - f.t / f.dur);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = '900 22px Impact, "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#0a0709';
    ctx.lineWidth = 5;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

export function drawFlash(ctx, game) {
  if (game.flashAlpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(0.65, game.flashAlpha);
  ctx.fillStyle = game.flashColor;
  ctx.fillRect(0, 0, game.w, game.h);
  ctx.restore();
}

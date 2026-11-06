// Fighters: skeleton, outfits, weapons, poses.
import { TAU, rr, ell, line, poly, limb, dark, light } from './draw-utils.js';
import { drawHead } from './heads.js';

const BARE_CHEST = new Set(['cyclops', 'rawhead', 'ogre', 'bowser', 'krool', 'ren']);
const BARE_LEGS = new Set(['cyclops', 'rawhead', 'ogre', 'bowser', 'krool', 'ren']);
const ROBED = new Set(['jafar', 'lilith']);

function torsoPath(ctx, hw, sw, hipY, sy) {
  ctx.beginPath();
  ctx.moveTo(-hw, hipY);
  ctx.bezierCurveTo(-hw - 6, hipY - 18, -sw - 2, sy + 18, -sw, sy);
  ctx.quadraticCurveTo(0, sy - 7, sw, sy);
  ctx.bezierCurveTo(sw + 2, sy + 18, hw + 6, hipY - 18, hw, hipY);
  ctx.closePath();
}

function drawCape(ctx, char, sy, hipY, time) {
  if (!char.cape) return;
  const sway = Math.sin(time * 2.2) * 4;
  ctx.beginPath();
  ctx.moveTo(-10, sy - 2);
  ctx.quadraticCurveTo(-48, sy + 18, -58 + sway, hipY + 28);
  ctx.quadraticCurveTo(-66, hipY + 55, -50 + sway, 0);
  ctx.lineTo(-10, -2);
  ctx.quadraticCurveTo(-20, hipY + 20, -6, hipY - 6);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, sy, -50, 0);
  g.addColorStop(0, dark(char.cape, 0.32));
  g.addColorStop(1, dark(char.cape, 0.52));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = dark(char.cape, 0.6);
  ctx.lineWidth = 1.2;
  ctx.stroke();
  line(ctx, -14, sy + 6, -34, hipY + 34, light(char.cape, 0.1), 1.2);
  // high collar
  poly(ctx, [[-6, sy - 2], [-20, sy - 15], [2, sy - 20], [10, sy - 4]], dark(char.cape, 0.4));
}

function drawShell(ctx, char, hipY, sy, time) {
  if (!char.shell) return;
  const cy = (hipY + sy) / 2 - 2;
  ell(ctx, -18, cy, 42, 50, '#3f7a2c', '#244d19', 3);
  ell(ctx, -18, cy, 31, 39, '#5d9a3d', null);
  ctx.strokeStyle = '#2f5a24';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const a = -1.1 + i * 0.55;
    line(ctx, -18 + Math.cos(a) * 15, cy + Math.sin(a) * 20, -18 + Math.cos(a) * 35, cy + Math.sin(a) * 43, '#2f5a24', 3);
  }
  for (let i = 0; i < 5; i++) {
    const a = -2.4 + i * 0.72 + Math.sin(time * 1.5) * 0.02;
    poly(ctx, [[-18 + Math.cos(a) * 44, cy + Math.sin(a) * 52], [-18 + Math.cos(a) * 58, cy + Math.sin(a) * 62], [-18 + Math.cos(a) * 40, cy + Math.sin(a) * 58]], '#e8e2c8', '#8a8468', 2);
  }
}

function drawTail(ctx, char, hipY, time) {
  if (!char.tail) return;
  ctx.save();
  ctx.strokeStyle = char.tail;
  ctx.lineWidth = char.id === 'krool' ? 14 : 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, hipY - 2);
  ctx.bezierCurveTo(-42, hipY + 12, -58, hipY - 20, -50 + Math.sin(time * 3) * 4, hipY - 46);
  ctx.stroke();
  if (char.id === 'ren') {
    ell(ctx, -50 + Math.sin(time * 3) * 4, hipY - 48, 5, 9, '#f2a7c3', null);
    ctx.strokeStyle = '#d98aa8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) line(ctx, -28 - i * 8, hipY + 8 - i * 2, -30 - i * 8, hipY + 15 - i * 2, '#d98aa8', 1.5);
  }
  ctx.restore();
}

function drawLeg(ctx, hip, knee, foot, pants, shoe, size, bare, char) {
  limb(ctx, hip, knee, foot, 14 + size * 7, pants);
  if (bare) {
    ell(ctx, foot[0] + 5, foot[1] + 1, 12 + size * 3, 5.5 + size, shoe, dark(shoe, 0.22), 1.2);
    if (char && (char.id === 'ogre' || char.id === 'cyclops' || char.id === 'rawhead')) {
      for (let i = 0; i < 3; i++) ell(ctx, foot[0] + 10 + i * 2.5, foot[1] - 1, 1.6, 1.2, dark(shoe, 0.35), null);
    }
  } else {
    ell(ctx, foot[0] + 4, foot[1] + 1.5, 12 + size * 2.5, 5.5 + size, shoe, dark(shoe, 0.3), 1.2);
    line(ctx, foot[0] - 5, foot[1] + 5, foot[0] + 15, foot[1] + 5, dark(shoe, 0.5), 2.5);
  }
}

function drawArm(ctx, shoulder, elbow, hand, colorSleeve, colorFore, skin, sleeves, width) {
  limb(ctx, shoulder, elbow, hand, width, sleeves === 'long' ? colorSleeve : colorFore);
  if (sleeves === 'short') {
    const mid = [(shoulder[0] + elbow[0]) / 2, (shoulder[1] + elbow[1]) / 2];
    limb(ctx, shoulder, mid, mid, width, colorSleeve);
  }
  ell(ctx, hand[0], hand[1], 5.6, 5.4, skin, dark(skin, 0.28), 1.1);
}

function outfitDetails(ctx, char, hipY, sy, hw, time) {
  const c = char.colors;
  const id = char.id;
  const tx = (v) => sy + v;
  switch (id) {
    case 'michael':
      line(ctx, 2, sy + 4, 2, hipY - 5, 'rgba(180,190,210,.35)', 1.4);
      line(ctx, -8, sy + 3, 2, sy + 16, dark(c.primary, 0.3), 2);
      line(ctx, 12, sy + 3, 2, sy + 16, dark(c.primary, 0.3), 2);
      line(ctx, -hw + 3, hipY - 24, hw - 3, hipY - 24, 'rgba(10,15,25,.3)', 2);
      break;
    case 'chucky': {
      // red-and-rust striped shirt under the overalls
      ctx.save();
      torsoPath(ctx, hw, 14, hipY, sy);
      ctx.clip();
      for (let x = -hw - 6; x < hw + 6; x += 11) {
        ctx.fillStyle = 'rgba(72,18,20,.42)';
        ctx.fillRect(x, sy - 4, 4, hipY - sy + 20);
      }
      ctx.restore();
      // overalls bib + straps
      ctx.save();
      torsoPath(ctx, hw, 14, hipY, sy);
      ctx.clip();
      ctx.fillStyle = c.secondary;
      ctx.fillRect(-hw - 8, hipY - 34, hw * 2 + 16, 40);
      ctx.restore();
      ctx.strokeStyle = c.secondary;
      ctx.lineWidth = 5;
      line(ctx, -8, sy + 2, -4, hipY - 30, c.secondary, 5);
      line(ctx, 11, sy + 2, 9, hipY - 30, c.secondary, 5);
      ell(ctx, 2, hipY - 24, 3, 3, c.accent, null);
      ell(ctx, -6, hipY - 24, 2.6, 2.6, c.accent, null);
      break;
    }
    case 'vader':
      ctx.fillStyle = '#2a2c34';
      ctx.fillRect(4, sy + 16, 18, 12);
      ctx.strokeStyle = '#4a4d58';
      ctx.lineWidth = 1;
      ctx.strokeRect(4, sy + 16, 18, 12);
      ell(ctx, 10, sy + 22, 2, 2, '#e12828', null);
      ell(ctx, 16, sy + 22, 2, 2, '#63d463', null);
      line(ctx, -hw + 2, sy + 38, hw - 2, sy + 38, '#0c0d11', 5);
      ctx.fillStyle = '#3a3d48';
      ctx.fillRect(-4, sy + 33, 10, 9);
      break;
    case 'boris':
      rr(ctx, 1, hipY - 22, 25, 13, 5);
      ctx.fillStyle = dark(c.primary, 0.18);
      ctx.fill();
      line(ctx, 3, sy + 6, 2, hipY - 20, '#c33b34', 2);
      line(ctx, 11, sy + 6, 12, hipY - 20, '#c33b34', 2);
      ell(ctx, 3, sy + 6, 2.2, 2.2, c.accent, null);
      ell(ctx, 11, sy + 6, 2.2, 2.2, c.accent, null);
      break;
    case 'bowser':
      ell(ctx, 7, hipY - 16, 21 + char.fat * 8, 25, c.secondary, dark(c.secondary, 0.22), 1.6);
      for (let i = 0; i < 3; i++) line(ctx, -10, hipY - 26 + i * 8, 24, hipY - 28 + i * 8, dark(c.secondary, 0.12), 1.2);
      // spiked collar
      line(ctx, -14, sy + 2, 16, sy + 2, '#2c2c33', 5);
      for (let i = 0; i < 4; i++) poly(ctx, [[-10 + i * 7, sy], [-7 + i * 7, sy - 6], [-4 + i * 7, sy]], '#d9d5c4');
      break;
    case 'bison':
      poly(ctx, [[-14, sy + 1], [-4, sy + 1], [-6, sy + 8], [-16, sy + 7]], c.accent);
      poly(ctx, [[6, sy + 1], [16, sy + 1], [18, sy + 7], [8, sy + 8]], c.accent);
      line(ctx, 2, sy + 10, 2, hipY - 4, c.accent, 2);
      line(ctx, -hw, hipY - 6, hw, hipY - 6, c.accent, 5);
      ell(ctx, 2, hipY - 6, 4, 4, c.primary, c.accent, 1.5);
      break;
    case 'concussion':
      ell(ctx, 5, sy + 4, 15, 5, c.accent, null);
      line(ctx, 3, sy + 8, 2, hipY - 5, dark(c.primary, 0.18), 1.4);
      line(ctx, -9, hipY - 8, 14, hipY - 8, dark(c.primary, 0.2), 2);
      break;
    case 'plankton':
      poly(ctx, [[-9, sy + 3], [-2, sy + 13], [2, sy + 3]], c.secondary);
      line(ctx, 0, sy + 15, 0, hipY - 4, dark(c.primary, 0.25), 1.2);
      break;
    case 'bigbabytom':
      ell(ctx, 6, hipY - 18, 19 + char.fat * 9, 24, 'rgba(255,255,255,.12)', null);
      line(ctx, -10, sy + 4, -4, hipY - 3, c.primary, 2);
      line(ctx, 12, sy + 4, 8, hipY - 3, c.primary, 2);
      break;
    case 'jafar':
      line(ctx, 1, sy + 10, 1, hipY - 4, c.detail, 2.2);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-hw, hipY - 2);
      ctx.quadraticCurveTo(-20, hipY + 40, -14, 0);
      ctx.lineTo(22, 0);
      ctx.quadraticCurveTo(12, hipY - 6, hw, hipY - 2);
      ctx.closePath();
      ctx.fillStyle = c.primary;
      ctx.fill();
      ctx.strokeStyle = dark(c.primary, 0.25);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-12, sy + 6);
      ctx.lineTo(13, hipY + 4);
      ctx.stroke();
      ctx.restore();
      break;
    case 'ren':
      ell(ctx, 3, hipY - 24, 11, 17, light(c.skin, 0.16), null);
      for (let i = 0; i < 4; i++) line(ctx, -8 + i * 5, sy + 10, -11 + i * 5, sy + 26, dark(c.skin, 0.2), 1.2);
      break;
    case 'elmer': {
      ctx.save();
      torsoPath(ctx, hw, 16, hipY, sy);
      ctx.clip();
      ctx.strokeStyle = 'rgba(30,30,36,.4)';
      ctx.lineWidth = 2;
      for (let i = -2; i < 4; i++) line(ctx, -20 + i * 12, sy, -20 + i * 12, hipY, 'rgba(30,30,36,.4)', 2);
      for (let i = 0; i < 3; i++) line(ctx, -hw - 4, sy + 20 + i * 14, hw + 4, sy + 20 + i * 14, 'rgba(30,30,36,.4)', 2);
      ctx.restore();
      for (let i = 0; i < 3; i++) ell(ctx, 4, sy + 24 + i * 15, 2.2, 2.2, '#2b2d33', null);
      break;
    }
    case 'killjoy':
      line(ctx, -hw, hipY - 4, hw, hipY - 4, c.accent, 7);
      ell(ctx, 2, hipY - 4, 4, 4, c.detail, c.primary, 1.5);
      for (let i = 0; i < 3; i++) ell(ctx, 3, sy + 20 + i * 14, 3.4, 3.4, i % 2 ? c.accent : c.detail, dark(c.primary, 0.2), 1);
      for (let i = 0; i < 5; i++) poly(ctx, [[-12 + i * 5, sy + 4], [-10 + i * 5, sy - 4], [-8 + i * 5, sy + 4]], i % 2 ? c.accent : c.detail);
      break;
    case 'lilith':
      poly(ctx, [[-8, sy + 8], [10, sy + 8], [6, hipY - 18], [-4, hipY - 18]], c.accent);
      for (let i = 0; i < 3; i++) line(ctx, -6 + i * 4, sy + 14 + i * 8, 8 - i * 4, sy + 18 + i * 8, '#1a1218', 1.2);
      ctx.beginPath();
      ctx.moveTo(-hw, hipY - 1);
      ctx.quadraticCurveTo(-22, hipY + 45, -13, 0);
      ctx.lineTo(24, 0);
      ctx.quadraticCurveTo(12, hipY + 10, hw, hipY - 1);
      ctx.closePath();
      ctx.fillStyle = c.primary;
      ctx.fill();
      break;
    case 'cyclops':
      line(ctx, -10, sy + 14, 16, sy + 10, dark(c.skin, 0.28), 2);
      line(ctx, 2, sy + 12, 2, hipY - 10, dark(c.skin, 0.24), 2);
      for (let i = 0; i < 3; i++) line(ctx, -8, sy + 26 + i * 9, 15, sy + 24 + i * 9, dark(c.skin, 0.16), 1.2);
      rr(ctx, -hw - 2, hipY - 18, hw * 2 + 4, 24, 7);
      ctx.fillStyle = c.primary;
      ctx.fill();
      ctx.strokeStyle = dark(c.primary, 0.28);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ell(ctx, 2, hipY - 6, 2.4, 2.4, c.accent, null);
      break;
    case 'jason':
      poly(ctx, [[-9, sy + 2], [7, sy + 2], [8, hipY - 2], [-8, hipY - 2]], c.accent);
      poly(ctx, [[-16, sy + 2], [-6, sy + 2], [-8, hipY - 2], [-17, hipY - 2]], c.primary);
      poly(ctx, [[6, sy + 2], [17, sy + 2], [18, hipY - 2], [8, hipY - 2]], c.primary);
      line(ctx, -15, sy + 20, -7, sy + 20, dark(c.primary, 0.3), 1.5);
      line(ctx, 8, sy + 20, 16, sy + 20, dark(c.primary, 0.3), 1.5);
      line(ctx, -14, hipY - 3, 15, hipY - 3, dark(c.secondary, 0.2), 4);
      break;
    case 'freddy': {
      ctx.save();
      torsoPath(ctx, hw, 15, hipY, sy);
      ctx.clip();
      ctx.fillStyle = c.primary;
      ctx.fillRect(-25, sy - 5, 50, hipY - sy + 10);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = c.accent;
        ctx.fillRect(-25, sy + 6 + i * 14, 50, 7);
      }
      ctx.restore();
      break;
    }
    case 'drunkbill':
      ell(ctx, 7, hipY - 20, 17 + char.fat * 8, 20, 'rgba(255,255,255,.13)', null);
      for (let i = 0; i < 3; i++) ell(ctx, 4, sy + 18 + i * 15, 1.8, 1.8, '#5b5f66', null);
      line(ctx, -hw, hipY - 3, hw, hipY - 3, '#3b332a', 4);
      break;
    case 'rawhead':
      // exposed chest, armor shoulders and belt
      poly(ctx, [[-20, sy + 2], [-6, sy + 2], [-8, sy + 16], [-20, sy + 12]], c.primary);
      poly(ctx, [[8, sy + 2], [20, sy + 2], [22, sy + 12], [10, sy + 16]], c.primary);
      line(ctx, -10, sy + 20, 18, sy + 18, dark(c.skin, 0.3), 1.6);
      for (let i = 0; i < 3; i++) {
        ell(ctx, -6 + i * 7, sy + 30, 2.4, 2.4, dark(c.skin, 0.22), null);
        ell(ctx, -6 + i * 7, sy + 40, 2.4, 2.4, dark(c.skin, 0.22), null);
      }
      line(ctx, -hw, hipY - 8, hw, hipY - 8, c.primary, 8);
      line(ctx, -hw, hipY - 8, hw, hipY - 8, dark(c.primary, 0.25), 2);
      break;
    case 'ogre':
      ell(ctx, 8, hipY - 18, 20 + char.fat * 9, 22, 'rgba(90,100,92,.35)', null);
      line(ctx, -12, sy + 18, 18, sy + 16, dark(c.skin, 0.22), 2);
      for (let i = 0; i < 2; i++) line(ctx, -8, sy + 30 + i * 9, 15, sy + 29 + i * 9, dark(c.skin, 0.14), 1.4);
      rr(ctx, -hw - 3, hipY - 16, hw * 2 + 6, 22, 5);
      ctx.fillStyle = c.primary;
      ctx.fill();
      line(ctx, -hw, hipY - 13, hw, hipY - 13, dark(c.primary, 0.35), 2);
      break;
    case 'thanos':
      poly(ctx, [[-14, sy + 4], [-2, sy + 4], [-4, hipY - 18], [-14, hipY - 12]], c.primary);
      poly(ctx, [[4, sy + 4], [15, sy + 4], [16, hipY - 14], [6, hipY - 18]], c.primary);
      line(ctx, 2, sy + 8, 2, hipY - 4, dark(c.primary, 0.3), 2);
      for (let i = 0; i < 3; i++) line(ctx, -12 + i * 5, sy + 16, 12 + i * 2, sy + 14, dark(c.primary, 0.2), 1.5);
      line(ctx, -hw, hipY - 6, hw, hipY - 6, c.primary, 6);
      break;
    case 'krool':
      ell(ctx, 6, hipY - 18, 26 + char.fat * 7, 26, c.secondary, dark(c.secondary, 0.2), 1.6);
      line(ctx, -12, sy + 2, 18, sy + 2, '#3f5a2a', 2);
      break;
    case 'pennywise':
      for (let i = 0; i < 4; i++) ell(ctx, 2, sy + 18 + i * 16, 4, 4, c.accent, null);
      for (let i = 0; i < 5; i++) poly(ctx, [[-12 + i * 6, sy + 4], [-9 + i * 6, sy - 5], [-6 + i * 6, sy + 4]], c.primary);
      line(ctx, -hw, hipY - 4, hw, hipY - 4, c.accent, 4);
      break;
    case 'leatherface':
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-13, sy + 2);
      ctx.lineTo(9, sy + 2);
      ctx.lineTo(14, hipY);
      ctx.lineTo(-18, hipY);
      ctx.closePath();
      ctx.fillStyle = '#b89a7a';
      ctx.fill();
      ctx.strokeStyle = '#7d6449';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      for (const [dx, dy, rx, ry] of [[-6, sy + 26, 7, 4], [3, sy + 48, 5, 6], [-10, hipY - 20, 4, 3]]) {
        ell(ctx, dx, dy, rx, ry, 'rgba(120,30,24,.5)', null);
      }
      line(ctx, -11, sy + 2, -7, sy - 6, '#f0e4cc', 2);
      line(ctx, 7, sy + 2, 3, sy - 6, '#f0e4cc', 2);
      ctx.restore();
      break;
    case 'ghostface':
      line(ctx, -hw, hipY - 7, hw, hipY - 7, c.accent, 4);
      line(ctx, 0, sy + 4, 0, hipY - 7, dark(c.primary, 0.35), 1.4);
      break;
    case 'pinhead':
      line(ctx, 0, sy + 4, 0, hipY - 5, dark(c.primary, 0.35), 1.2);
      for (let i = 0; i < 4; i++) {
        ell(ctx, -10 + i * 7, sy + 16, 1.6, 1.6, '#8b8b96', null);
        ell(ctx, -10 + i * 7, sy + 36, 1.6, 1.6, '#8b8b96', null);
      }
      line(ctx, -hw, hipY - 5, hw, hipY - 5, c.accent, 3);
      break;
    case 'dracula':
      poly(ctx, [[-11, sy + 2], [10, sy + 2], [7, hipY - 14], [-8, hipY - 14]], c.accent);
      poly(ctx, [[-3, sy + 2], [4, sy + 2], [1, sy + 16], [-6, sy + 16]], '#e9e2d2');
      line(ctx, -10, sy + 3, 2, sy + 16, c.primary, 4);
      line(ctx, 10, sy + 3, 2, sy + 16, c.primary, 4);
      ell(ctx, 0, sy + 26, 4, 4, c.detail, '#5a4a30', 1.2);
      break;
    default:
      break;
  }
  // belt for most characters
  if (!['michael', 'chucky', 'vader', 'jafar', 'lilith', 'cyclops', 'ogre', 'krool', 'rawhead', 'pennywise', 'leatherface', 'ghostface', 'pinhead', 'thanos'].includes(id)) {
    line(ctx, -hw + 1, hipY - 3, hw - 1, hipY - 3, dark(c.secondary, 0.2), 3.5);
  }
  if (ROBED.has(id)) {
    // hanging robe panels in front of legs
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-hw, hipY - 2);
    ctx.quadraticCurveTo(-20, hipY + 22, -15, 0);
    ctx.lineTo(-3, 0);
    ctx.quadraticCurveTo(-4, hipY + 6, 4, hipY - 2);
    ctx.closePath();
    ctx.fillStyle = dark(c.primary, 0.08);
    ctx.fill();
    ctx.strokeStyle = dark(c.primary, 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

function drawWeapon(ctx, char, hand, angle, pose, time) {
  const c = char.colors;
  const w = char.weapon;
  if (!w || w === 'fists' || w === 'none' || w === 'gauntlet' || w === 'balloon') return;
  ctx.save();
  ctx.translate(hand[0], hand[1]);
  ctx.rotate(angle);
  const metal = '#c8ced7';
  const metalDark = '#7d8592';
  switch (w) {
    case 'knife':
      ctx.fillStyle = '#4a3526';
      rr(ctx, -7, -2.6, 9, 5.2, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1, -3.4);
      ctx.lineTo(26, -2);
      ctx.quadraticCurveTo(31, 0, 25, 2.4);
      ctx.lineTo(1, 3.4);
      ctx.closePath();
      ctx.fillStyle = metal;
      ctx.fill();
      ctx.strokeStyle = metalDark;
      ctx.lineWidth = 0.9;
      ctx.stroke();
      line(ctx, 3, 0, 23, 0.5, '#eef2f6', 1);
      break;
    case 'axe':
      ctx.fillStyle = '#6b4a2c';
      rr(ctx, -6, -2.8, 38, 5.6, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(27, -3);
      ctx.quadraticCurveTo(41, -19, 44, -3);
      ctx.lineTo(42, 2);
      ctx.quadraticCurveTo(38, 11, 26, 6);
      ctx.closePath();
      ctx.fillStyle = '#c0392b';
      ctx.fill();
      ctx.strokeStyle = '#7d2118';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(43, -8);
      ctx.quadraticCurveTo(49, -2, 44, 5);
      ctx.strokeStyle = '#e8edf2';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    case 'saber':
      ctx.fillStyle = '#2b2d34';
      rr(ctx, -7, -3.2, 17, 6.4, 2);
      ctx.fill();
      line(ctx, -4, 0, 8, 0, '#8b919e', 1.5);
      ctx.save();
      ctx.shadowColor = '#ff2a1a';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(220,30,20,.55)';
      rr(ctx, 10, -3.6, 50, 7.2, 3.6);
      ctx.fill();
      ctx.fillStyle = '#ff6a58';
      rr(ctx, 11, -2.1, 48, 4.2, 2.1);
      ctx.fill();
      ctx.fillStyle = '#ffe7e0';
      rr(ctx, 12, -1, 46, 2, 1);
      ctx.fill();
      ctx.restore();
      break;
    case 'machete':
      ctx.fillStyle = '#3f2e22';
      rr(ctx, -8, -2.5, 10, 5, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(30, -5);
      ctx.quadraticCurveTo(39, 0, 29, 6);
      ctx.lineTo(0, 4.5);
      ctx.closePath();
      ctx.fillStyle = '#aab2ba';
      ctx.fill();
      ctx.strokeStyle = '#5f6874';
      ctx.lineWidth = 1;
      ctx.stroke();
      line(ctx, 2, 3, 28, 3.5, '#e6ebef', 1);
      break;
    case 'ruler':
      ctx.fillStyle = '#e8c24a';
      rr(ctx, -5, -3, 34, 6, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#9c7a1c';
      ctx.lineWidth = 1;
      ctx.stroke();
      for (let i = 0; i < 5; i++) line(ctx, 5 + i * 5.5, -3, 5 + i * 5.5, -0.5, '#6b5210', 1);
      break;
    case 'staff':
      line(ctx, -34, 1, 36, -1, '#4a2e1d', 4.5);
      line(ctx, -34, 1, 36, -1, '#7a5130', 1.6);
      ctx.save();
      ctx.shadowColor = c.detail;
      ctx.shadowBlur = 12;
      ell(ctx, 38, -1, 7, 7, c.detail, null);
      ell(ctx, 36, -3, 2.6, 2.6, '#eafbe6', null);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(36, 1, 9, -1.2, 1.2);
      ctx.strokeStyle = dark(c.detail, 0.25);
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    case 'shotgun':
      ctx.fillStyle = '#5a3d28';
      poly(ctx, [[-15, 1], [-4, -3], [-4, 3]], '#5a3d28');
      ctx.fillStyle = '#343a42';
      rr(ctx, -4, -2.6, 34, 5.2, 2);
      ctx.fill();
      rr(ctx, 28, -3.4, 17, 6.8, 2);
      ctx.fillStyle = '#2a2f36';
      ctx.fill();
      line(ctx, -2, -2, 30, -2, '#8c96a3', 1.2);
      line(ctx, 8, 2, 20, 2, '#565f6a', 1.6);
      break;
    case 'bottle':
      ctx.fillStyle = 'rgba(80,150,80,.85)';
      rr(ctx, 0, -4.5, 15, 9, 3);
      ctx.fill();
      rr(ctx, 14, -2.2, 8, 4.4, 2);
      ctx.fill();
      ctx.fillStyle = '#d9d0b0';
      rr(ctx, 20, -2.4, 4, 4.8, 1);
      ctx.fill();
      line(ctx, 2, -2.5, 12, -2.5, 'rgba(230,255,230,.6)', 1.4);
      break;
    case 'claw': {
      if (char.id === 'freddy') {
        ctx.fillStyle = '#5a4030';
        rr(ctx, -6, -4, 12, 8, 3);
        ctx.fill();
        for (let i = 0; i < 4; i++) {
          const yy = -4 + i * 2.6;
          ctx.beginPath();
          ctx.moveTo(5, yy);
          ctx.quadraticCurveTo(17, yy - 2, 26, yy - 1);
          ctx.strokeStyle = metal;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          line(ctx, 24, yy - 1, 28, yy - 5, '#e8eef2', 1.2);
        }
      } else {
        for (let i = 0; i < 4; i++) {
          poly(ctx, [[-2 + i * 3, -4], [9 + i * 3, -7 + i * 0.5], [6 + i * 3, 3 - i * 1.2]], char.id === 'bowser' ? '#efe8d2' : '#e0d6c2');
        }
      }
      break;
    }
    case 'chainsaw':
      ctx.fillStyle = '#8b5a2b';
      rr(ctx, -7, -5, 17, 10, 2);
      ctx.fill();
      ctx.fillStyle = '#c4682c';
      rr(ctx, 3, -4.2, 12, 8.4, 2);
      ctx.fill();
      ctx.fillStyle = '#9aa2ac';
      rr(ctx, 14, -6.5, 31, 13, 3);
      ctx.fill();
      ctx.fillStyle = '#4a5058';
      rr(ctx, 16, -4.5, 27, 3, 1);
      ctx.fill();
      for (let i = 0; i < 8; i++) poly(ctx, [[15 + i * 3.7, 6.4], [17 + i * 3.7, 10], [19 + i * 3.7, 6.4]], '#dbe1e6');
      line(ctx, 19, -6.5, 19, 6.5, '#5a6068', 1);
      break;
    case 'blade':
      ctx.fillStyle = '#3a2a24';
      rr(ctx, -7, -3, 10, 6, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, -3.6);
      ctx.lineTo(26, -5);
      ctx.quadraticCurveTo(32, -1, 25, 5);
      ctx.lineTo(2, 3.4);
      ctx.closePath();
      ctx.fillStyle = '#d9dee4';
      ctx.fill();
      ctx.strokeStyle = '#8a929c';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(23, -3, 4, -1.4, 1.4);
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    case 'raygun':
      ctx.fillStyle = '#7d838d';
      rr(ctx, -4, -5, 14, 8, 3);
      ctx.fill();
      rr(ctx, 8, -3, 11, 5, 2.5);
      ctx.fill();
      ctx.save();
      ctx.shadowColor = c.detail;
      ctx.shadowBlur = 10;
      ell(ctx, 20, -0.5, 3.6, 3.6, c.detail, null);
      ctx.restore();
      line(ctx, 1, 2, 3, 8, '#4a4f58', 3);
      break;
    case 'chains':
      ctx.strokeStyle = '#8b8b96';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(4 + i * 7, i % 2 ? -2 : 2, 4, 0.3, 5.6);
        ctx.stroke();
      }
      line(ctx, 30, 0, 38, -4, '#b9c4d9', 1.6);
      poly(ctx, [[34, -4], [42, -8], [40, -1], [45, 2], [36, 2]], '#b9c4d9');
      break;
    default: break;
  }
  ctx.restore();
}

function drawGauntlet(ctx, char, hand, time) {
  if (char.weapon !== 'gauntlet') return;
  ctx.save();
  ctx.translate(hand[0], hand[1]);
  ctx.fillStyle = '#d9b95a';
  rr(ctx, -8, -7, 16, 15, 5);
  ctx.fill();
  ctx.strokeStyle = '#8a6a1f';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  const gems = ['#b34cff', '#4cc9ff', '#ff4c4c', '#ffb347', '#7dff6a'];
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.shadowColor = gems[i];
    ctx.shadowBlur = 6;
    ell(ctx, -5 + i * 2.6, -4 + (i % 2) * 8, 1.6, 1.6, gems[i], null);
    ctx.restore();
  }
  ctx.restore();
}

function drawBalloon(ctx, char, hand, head, time) {
  if (char.weapon !== 'balloon') return;
  const bx = head[0] + 30;
  const by = head[1] - 52 + Math.sin(time * 1.6) * 5;
  ctx.beginPath();
  ctx.moveTo(hand[0], hand[1]);
  ctx.quadraticCurveTo(hand[0] + 20, head[1] - 10, bx, by + 20);
  ctx.strokeStyle = 'rgba(230,225,215,.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  ctx.shadowColor = '#ff3b3b';
  ctx.shadowBlur = 12;
  ell(ctx, bx, by, 13, 17, '#d92b2b', '#8e1515', 1.2);
  ctx.restore();
  poly(ctx, [[bx - 4, by + 16], [bx + 4, by + 16], [bx, by + 21]], '#8e1515');
  ell(ctx, bx - 4, by - 5, 3.2, 5, 'rgba(255,255,255,.3)', null);
}

function drawSlashArc(ctx, char, pose, progress, sy, hipY) {
  if (!['punch', 'kick', 'special'].includes(pose)) return;
  const a = Math.max(0, Math.min(1, progress));
  if (a < 0.04 || a > 0.62) return;
  const fade = Math.min(1, (a - 0.04) * 6) * Math.min(1, (0.62 - a) * 3.2);
  const color = char.special.color || '#ffffff';
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = fade * 0.55;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  if (pose === 'kick') {
    ctx.arc(0, hipY + 8, 56, -0.15, 0.9);
  } else {
    ctx.arc(6, sy + 8, 46, -0.75, 0.55);
  }
  ctx.stroke();
  ctx.globalAlpha = fade * 0.9;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (pose === 'kick') ctx.arc(0, hipY + 8, 50, -0.1, 0.85);
  else ctx.arc(6, sy + 8, 40, -0.7, 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawBill(ctx, char, o) {
  const { time, pose } = o;
  const bob = Math.sin(time * 2.4) * 3;
  const spin = pose === 'win' ? Math.sin(time * 8) * 0.12 : 0;
  ctx.save();
  ctx.translate(0, bob);
  ctx.rotate(spin);
  // stick legs
  ctx.strokeStyle = '#14121a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 12, -38);
    ctx.quadraticCurveTo(side * 16, -20, side * 15, -3);
    ctx.stroke();
    ell(ctx, side * 16, -2, 9, 4.5, '#14121a', null);
  }
  // arms
  ctx.lineWidth = 5;
  const armSwing = pose === 'punch' ? -26 : Math.sin(time * 2) * 4;
  ctx.beginPath();
  ctx.moveTo(-34, -88);
  ctx.lineTo(-56, -80 + armSwing);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(34, -88);
  ctx.lineTo(56, -96 - armSwing);
  ctx.stroke();
  ell(ctx, -57, -80 + armSwing, 5, 5, '#14121a', null);
  ell(ctx, 57, -96 - armSwing, 5, 5, '#14121a', null);
  // triangle body
  ctx.beginPath();
  ctx.moveTo(0, -170);
  ctx.lineTo(-46, -42);
  ctx.lineTo(46, -42);
  ctx.closePath();
  const g = ctx.createLinearGradient(-30, -160, 30, -40);
  g.addColorStop(0, '#ffe75c');
  g.addColorStop(0.55, '#f2d33c');
  g.addColorStop(1, '#d9b82a');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#3a2e0a';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // brick lines
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(120,90,10,.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) line(ctx, -50, -160 + i * 18, 50, -160 + i * 18, 'rgba(120,90,10,.22)', 1);
  for (let i = 0; i < 5; i++) line(ctx, -30 + i * 14, -150, -20 + i * 14, -50, 'rgba(120,90,10,.16)', 1);
  ctx.restore();
  // bow tie
  poly(ctx, [[-8, -42], [0, -36], [8, -42], [8, -30], [0, -36], [-8, -30]], '#14121a');
  // eye
  ell(ctx, 0, -108, 24, 21, '#f7f2df', '#2a2410', 2);
  ell(ctx, 4, -107, 7.5, 9, '#14121a', null);
  ell(ctx, 7, -111, 2.2, 2.2, '#fff', null);
  line(ctx, -19, -120, 16, -123, '#14121a', 2.4);
  // top hat
  ell(ctx, 0, -168, 30, 5, '#14121a', null);
  ctx.fillStyle = '#14121a';
  ctx.fillRect(-17, -205, 34, 38);
  ctx.fillStyle = '#3a3446';
  ctx.fillRect(-17, -181, 34, 5);
  ctx.restore();
}

export function drawFighter(ctx, char, o = {}) {
  const {
    x = 0, y = 0, facing = 1, pose = 'idle', time = 0, progress = 0,
    alpha = 1, scale = 1, flash = 0,
  } = o;
  const c = char.colors;
  const fat = char.fat || 0;
  const s = (char.scale || 1) * scale;
  const isBill = char.body === 'triangle';

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(facing * s, s);
  if (flash > 0) ctx.filter = `brightness(${1 + flash * 1.8}) saturate(${1 - flash * 0.4})`;
  if (pose === 'ko') {
    ctx.rotate(-1.32);
    ctx.translate(-4, -4);
  }

  if (isBill) {
    drawBill(ctx, char, o);
    ctx.restore();
    return;
  }

  const hunch = char.body === 'hunch';
  let crouch = pose === 'block' ? 7 : 0;
  let bob = 0;
  if (pose === 'idle' || pose === 'preview') bob = Math.sin(time * 2.2) * 1.2;
  else if (pose === 'walk') bob = Math.abs(Math.sin(time * 9)) * 1.8;
  else if (pose === 'win') bob = Math.sin(time * 6) * 2;

  const hipY = -50 + crouch;
  const sy = (hunch ? -101 : -110) + crouch + bob;
  const headR = 20 * char.headScale;
  const headX = 4 + (hunch ? 9 : 0) + (pose === 'hit' ? -5 : 0);
  const headY = sy - 27 - (char.headScale - 1) * 3 + (hunch ? 2 : 0);
  const head = [headX, headY];

  // pose body
  let fF = [16, -4];
  let fB = [-16, -4];
  let handF = [24, sy + 46];
  let elbowF = [18, sy + 24];
  let handB = [-20, sy + 43];
  let elbowB = [-16, sy + 22];
  const stride = Math.sin(time * 9);

  if (pose === 'walk') {
    fF = [16 + stride * 14, -4 - Math.max(0, stride) * 7];
    fB = [-16 - stride * 14, -4 - Math.max(0, -stride) * 7];
    handF = [24 - stride * 10, sy + 44];
    elbowF = [18 - stride * 6, sy + 24];
    handB = [-20 + stride * 10, sy + 42];
    elbowB = [-16 + stride * 6, sy + 23];
  } else if (pose === 'jump') {
    fF = [10, -22];
    fB = [-14, -14];
    handF = [20, sy + 12];
    elbowF = [26, sy + 23];
    handB = [-18, sy + 10];
    elbowB = [-24, sy + 21];
  } else if (pose === 'kick') {
    fF = [52, -52];
    fB = [-18, -4];
    handF = [34, sy + 4];
    elbowF = [28, sy + 24];
    handB = [-28, sy + 14];
    elbowB = [-24, sy + 20];
  } else if (pose === 'punch') {
    fF = [22, -4];
    fB = [-20, -4];
    handF = [58 + (char.stats.reach || 3) * 2, sy + 2];
    elbowF = [34, sy + 2];
    handB = [-24, sy + 26];
    elbowB = [-20, sy + 20];
  } else if (pose === 'special') {
    fF = [26, -4];
    fB = [-24, -4];
    handF = [46, sy - 12];
    elbowF = [30, sy + 8];
    handB = [14, sy - 26];
    elbowB = [-6, sy - 2];
  } else if (pose === 'block') {
    fF = [24, -4];
    fB = [-24, -4];
    handF = [26, sy + 4];
    elbowF = [24, sy + 22];
    handB = [12, sy - 2];
    elbowB = [2, sy + 18];
  } else if (pose === 'hit') {
    fF = [24, -4];
    fB = [-22, -4];
    handF = [38, sy + 10];
    elbowF = [30, sy + 22];
    handB = [-30, sy + 6];
    elbowB = [-24, sy + 18];
  } else if (pose === 'win') {
    fF = [18, -4];
    fB = [-20, -4];
    handF = [28, sy - 24];
    elbowF = [28, sy + 6];
    handB = [-26, sy - 28];
    elbowB = [-24, sy + 2];
  }

  const footSpread = fat * 5;
  fF[0] += footSpread;
  fB[0] -= footSpread;

  const kneeF = [(0 + fF[0]) / 2 + 8 + fat * 4, (hipY + fF[1]) / 2 + 2];
  const kneeB = [(0 + fB[0]) / 2 - 8 - fat * 4, (hipY + fB[1]) / 2 + 2];

  // 1. cape / shell / tail behind
  drawCape(ctx, char, sy, hipY, time);
  drawShell(ctx, char, hipY, sy, time);
  drawTail(ctx, char, hipY, time);

  const pants = BARE_LEGS.has(char.id) ? c.skin : c.secondary;
  const sleeve = char.sleeveColor || c.primary;
  const forearm = char.sleeves === 'short' ? c.skin : sleeve;

  // 2. back leg
  drawLeg(ctx, [0, hipY - 2], kneeB, fB, dark(pants, 0.18), c.shoes, fat, BARE_LEGS.has(char.id), char);
  // 3. back arm
  drawArm(ctx, [-4, sy + 6], elbowB, handB, dark(sleeve, 0.18), dark(forearm, 0.18), dark(c.skin, 0.12), char.sleeves, 9 + fat * 4);

  // 4. torso
  const hw = 12 + fat * 17 + (char.id === 'ren' ? -3 : 0);
  const sw = 14 + fat * 7;
  const torsoColor = BARE_CHEST.has(char.id) ? c.skin : c.primary;
  torsoPath(ctx, hw, sw, hipY, sy);
  const tg = ctx.createLinearGradient(-sw, sy, sw, hipY);
  tg.addColorStop(0, light(torsoColor, 0.1));
  tg.addColorStop(0.6, torsoColor);
  tg.addColorStop(1, dark(torsoColor, 0.2));
  ctx.fillStyle = tg;
  ctx.fill();
  ctx.strokeStyle = dark(torsoColor, 0.35);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  outfitDetails(ctx, char, hipY, sy, hw, time);

  // 5. front leg
  drawLeg(ctx, [2, hipY - 2], kneeF, fF, pants, c.shoes, fat, BARE_LEGS.has(char.id), char);

  // 6. neck
  ell(ctx, headX - 2, sy - 4, 7, 6, c.skin, null);

  // 7. front arm + weapon slash
  drawSlashArc(ctx, char, pose, progress, sy, hipY);
  drawArm(ctx, [4, sy + 4], elbowF, handF, sleeve, forearm, c.skin, char.sleeves, 10 + fat * 4);

  let weaponAngle = 1.12;
  if (char.weapon === 'staff') weaponAngle = -1.32;
  else if (char.weapon === 'saber') weaponAngle = -1.15;
  else if (char.weapon === 'shotgun') weaponAngle = 0.35;
  else if (char.weapon === 'chainsaw') weaponAngle = 0.5;
  if (pose === 'walk') weaponAngle += Math.sin(time * 9) * 0.08;
  if (pose === 'jump') weaponAngle = 1.35;
  if (pose === 'punch') weaponAngle = 0.02;
  if (pose === 'kick') weaponAngle = 0.9;
  if (pose === 'special') weaponAngle = -0.38;
  if (pose === 'block') weaponAngle = 0.65;
  if (pose === 'hit') weaponAngle = 1.5;
  if (pose === 'win') weaponAngle = -1.15;
  if (pose === 'ko') weaponAngle = 1.5;

  drawWeapon(ctx, char, handF, weaponAngle, pose, time);
  // hand over the grip
  ell(ctx, handF[0], handF[1], 5.6, 5.4, c.skin, dark(c.skin, 0.28), 1.1);
  drawGauntlet(ctx, char, handF, time);

  // 8. head
  drawHead(ctx, char, { headX, headY, headR, time, pose });

  // 9. prop extras
  drawBalloon(ctx, char, handF, head, time);

  // back hand for forms where it reads
  ctx.restore();
}

export function drawFighterShadow(ctx, char, x, y, scale = 1, alpha = 0.45) {
  const s = (char.scale || 1) * scale;
  const fat = char.fat || 0;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, y + 2, (26 + fat * 20) * s, 8 * s, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

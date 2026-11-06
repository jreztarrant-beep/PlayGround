// Heads, faces, hair, masks and headgear.
import { TAU, rr, ell, line, poly, dark, light } from './draw-utils.js';

function headPath(ctx, x, y, r, shape) {
  ctx.beginPath();
  if (shape === 'square') {
    rr(ctx, x - r, y - r * 1.05, r * 2, r * 2.08, r * 0.42);
  } else if (shape === 'angular') {
    ctx.moveTo(x - r * 0.92, y - r * 0.8);
    ctx.quadraticCurveTo(x, y - r * 1.18, x + r * 0.9, y - r * 0.82);
    ctx.quadraticCurveTo(x + r * 1.08, y - r * 0.2, x + r * 0.92, y + r * 0.35);
    ctx.quadraticCurveTo(x + r * 0.7, y + r * 1.02, x + r * 0.1, y + r * 1.1);
    ctx.quadraticCurveTo(x - r * 0.7, y + r * 1.02, x - r * 0.95, y + r * 0.32);
    ctx.quadraticCurveTo(x - r * 1.08, y - r * 0.2, x - r * 0.92, y - r * 0.8);
  } else if (shape === 'long') {
    ctx.ellipse(x, y, r * 0.93, r * 1.25, 0, 0, TAU);
  } else {
    ctx.ellipse(x, y, r, r * 1.1, 0, 0, TAU);
  }
  ctx.closePath();
}

function drawEar(ctx, char, x, y, r) {
  const c = char.colors;
  if (char.ears === 'none') return;
  if (char.ears === 'pointy') {
    poly(ctx, [[x - r * 0.55, y - r * 0.15], [x - r * 1.45, y - r * 0.95], [x - r * 0.92, y + r * 0.38]], c.skin, dark(c.skin, 0.3), 1.5);
    line(ctx, x - r * 0.9, y - r * 0.2, x - r * 1.2, y - r * 0.6, dark(c.skin, 0.18), 1.2);
    return;
  }
  if (char.ears === 'long') {
    for (const [ex, rot, sc] of [[x - r * 0.4, -0.28, 1], [x + r * 0.25, 0.34, 0.85]]) {
      ctx.save();
      ctx.translate(ex, y - r * 0.7);
      ctx.rotate(rot);
      ell(ctx, 0, -r * 0.55, r * 0.27 * sc, r * 1.02 * sc, c.skin, dark(c.skin, 0.28), 1.6);
      ell(ctx, 0, -r * 0.55, r * 0.12 * sc, r * 0.72 * sc, light(c.accent, 0.1), null);
      ctx.restore();
    }
    return;
  }
  ell(ctx, x - r * 0.97, y, r * 0.23, r * 0.3, c.skin, dark(c.skin, 0.22), 1.4);
}

function drawEye(ctx, x, y, r, style, color) {
  if (style === 'blank') {
    ell(ctx, x, y, r * 0.23, r * 0.2, color, dark(color, 0.4), 1);
    ell(ctx, x + r * 0.09, y - r * 0.03, r * 0.05, r * 0.05, 'rgba(0,0,0,.35)', null);
    return;
  }
  if (style === 'neon') {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 9;
    ell(ctx, x, y, r * 0.23, r * 0.2, color, '#2a0b1d', 1.2);
    ell(ctx, x + r * 0.05, y, r * 0.1, r * 0.15, '#e0203f', null);
    ctx.restore();
    return;
  }
  if (style === 'glow') {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ell(ctx, x, y, r * 0.22, r * 0.18, color, null);
    ell(ctx, x + r * 0.02, y, r * 0.04, r * 0.13, '#1a0505', null);
    ctx.restore();
    return;
  }
  if (style === 'small') {
    ell(ctx, x, y, r * 0.11, r * 0.1, color, null);
    ell(ctx, x + r * 0.03, y, r * 0.04, r * 0.04, '#111', null);
    return;
  }
  // normal cartoon eye
  ell(ctx, x, y, r * 0.23, r * 0.195, '#f8f4e8', '#241f1c', 1.2);
  ell(ctx, x + r * 0.06, y + r * 0.005, r * 0.105, r * 0.115, color, null);
  ell(ctx, x + r * 0.075, y - r * 0.03, r * 0.035, r * 0.035, '#101010', null);
  ell(ctx, x + r * 0.13, y - r * 0.05, r * 0.025, r * 0.025, 'rgba(255,255,255,.85)', null);
}

function drawBrows(ctx, char, headX, headY, r, col) {
  const backX = headX - r * 0.2;
  const frontX = headX + r * 0.48;
  const y = headY - r * 0.32;
  const c = col || char.brow || dark(char.colors.hair, 0.2);
  const raise = char.id === 'elmer' ? -r * 0.12 : 0;
  if (char.id === 'boris') {
    line(ctx, backX - r * 0.14, y - r * 0.02, backX + r * 0.16, y + r * 0.04, c, 1.5);
    line(ctx, frontX - r * 0.16, y + r * 0.03, frontX + r * 0.18, y - r * 0.03, c, 1.5);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(frontX - r * 0.2, y + r * 0.1);
  ctx.lineTo(frontX + r * 0.2, y - r * 0.06 + raise);
  ctx.moveTo(backX - r * 0.16, y + r * 0.03 + raise);
  ctx.lineTo(backX + r * 0.19, y + r * 0.13);
  ctx.strokeStyle = c;
  ctx.lineWidth = Math.max(1.7, r * 0.12);
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawMouth(ctx, char, headX, headY, r) {
  const mx = headX + r * 0.3;
  const my = headY + r * 0.52;
  const c = char.colors;
  const lip = dark(c.skin, 0.55);
  switch (char.mouth) {
    case 'shout': {
      ell(ctx, mx, my + r * 0.05, r * 0.3, r * 0.26, '#3a1414', lip, 1.4);
      ell(ctx, mx, my + r * 0.16, r * 0.18, r * 0.1, '#8c2b2b', null);
      for (let i = 0; i < 4; i++) {
        poly(ctx, [[mx - r * 0.24 + i * r * 0.13, my - r * 0.16], [mx - r * 0.17 + i * r * 0.13, my - r * 0.04], [mx - r * 0.1 + i * r * 0.13, my - r * 0.16]], '#f3ead8');
      }
      break;
    }
    case 'grin': {
      ctx.beginPath();
      ctx.moveTo(mx - r * 0.34, my - r * 0.02);
      ctx.quadraticCurveTo(mx, my + r * 0.3, mx + r * 0.34, my - r * 0.06);
      ctx.quadraticCurveTo(mx, my + r * 0.05, mx - r * 0.34, my - r * 0.02);
      ctx.fillStyle = '#2a1111';
      ctx.fill();
      ctx.strokeStyle = lip;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        poly(ctx, [[mx - r * 0.26 + i * r * 0.11, my - r * 0.01], [mx - r * 0.2 + i * r * 0.11, my + r * 0.09], [mx - r * 0.14 + i * r * 0.11, my - r * 0.01]], '#f5ecd8');
      }
      break;
    }
    case 'evil': {
      ctx.beginPath();
      ctx.moveTo(mx - r * 0.3, my - r * 0.02);
      ctx.quadraticCurveTo(mx + r * 0.02, my + r * 0.24, mx + r * 0.36, my - r * 0.08);
      ctx.strokeStyle = lip;
      ctx.lineWidth = Math.max(1.6, r * 0.09);
      ctx.stroke();
      line(ctx, mx + r * 0.4, my - r * 0.2, mx + r * 0.44, my - r * 0.34, lip, 1.2);
      break;
    }
    case 'flat': {
      line(ctx, mx - r * 0.22, my, mx + r * 0.24, my - r * 0.02, lip, Math.max(1.6, r * 0.08));
      break;
    }
    case 'fangs': {
      ell(ctx, mx, my, r * 0.3, r * 0.15, '#2b0d0d', lip, 1.2);
      poly(ctx, [[mx - r * 0.24, my - r * 0.08], [mx - r * 0.18, my + r * 0.12], [mx - r * 0.12, my - r * 0.08]], '#f1e8d2');
      poly(ctx, [[mx + r * 0.12, my - r * 0.08], [mx + r * 0.18, my + r * 0.12], [mx + r * 0.24, my - r * 0.08]], '#f1e8d2');
      break;
    }
    case 'underbite': {
      ell(ctx, mx, my + r * 0.05, r * 0.32, r * 0.18, '#3a1a12', lip, 1.4);
      ctx.fillStyle = '#d9c5a2';
      ctx.beginPath();
      ctx.moveTo(mx - r * 0.28, my + r * 0.16);
      ctx.quadraticCurveTo(mx, my + r * 0.05, mx + r * 0.28, my + r * 0.16);
      ctx.quadraticCurveTo(mx, my + r * 0.3, mx - r * 0.28, my + r * 0.16);
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        poly(ctx, [[mx - r * 0.18 + i * r * 0.15, my + r * 0.12], [mx - r * 0.12 + i * r * 0.15, my + r * 0.0], [mx - r * 0.06 + i * r * 0.15, my + r * 0.12]], '#f0e6cc');
      }
      break;
    }
    default: {
      ctx.beginPath();
      ctx.moveTo(mx - r * 0.24, my - r * 0.02);
      ctx.quadraticCurveTo(mx, my + r * 0.12, mx + r * 0.26, my - r * 0.04);
      ctx.strokeStyle = lip;
      ctx.lineWidth = Math.max(1.5, r * 0.075);
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }
}

function drawHairBack(ctx, char, headX, headY, r) {
  const c = char.colors;
  if (char.hair === 'longred' || char.hair === 'longbangs') {
    const col = c.hair;
    ctx.beginPath();
    ctx.moveTo(headX - r * 0.95, headY - r * 0.75);
    ctx.quadraticCurveTo(headX - r * 1.45, headY + r * 0.7, headX - r * 1.2, headY + r * 2.9);
    ctx.quadraticCurveTo(headX - r * 1.3, headY + r * 3.3, headX - r * 0.72, headY + r * 2.7);
    ctx.quadraticCurveTo(headX - r * 0.65, headY + r * 1.6, headX - r * 0.68, headY + r * 0.9);
    ctx.lineTo(headX - r * 0.2, headY - r * 0.8);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + r * 0.7, headY - r * 0.7);
    ctx.quadraticCurveTo(headX + r * 1.45, headY + r * 0.4, headX + r * 1.2, headY + r * 2.4);
    ctx.quadraticCurveTo(headX + r * 0.95, headY + r * 1.5, headX + r * 0.82, headY + r * 0.5);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      line(ctx, headX - r * (1.0 - i * 0.08), headY + r * 0.5 + i * r * 0.35, headX - r * (0.8 - i * 0.05), headY + r * 2.6, dark(col, 0.2), 1.2);
    }
  } else if (char.hair === 'clownfrizz') {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        const px = headX + side * r * 1.0 + Math.cos(a) * r * 0.55 * (i % 2 ? 1 : 0.75);
        const py = headY + r * 0.1 + Math.sin(a) * r * 0.7 * (i % 2 ? 1 : 0.7);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = c.hair;
      ctx.fill();
    }
  } else if (char.hair === 'hood' || char.mask === 'ghostface') {
    ctx.beginPath();
    ctx.ellipse(headX - r * 0.12, headY + r * 0.05, r * 1.35, r * 1.5, 0, 0, TAU);
    ctx.fillStyle = dark(c.primary, 0.35);
    ctx.fill();
  } else if (char.hair === 'jasonhair' || char.hair === 'leatherhair') {
    ell(ctx, headX - r * 0.1, headY - r * 0.25, r * 1.12, r * 1.05, c.hair, null);
    ell(ctx, headX - r * 0.75, headY - r * 0.1, r * 0.3, r * 0.5, c.hair, null);
  } else if (char.hair === 'clownhorn') {
    ctx.beginPath();
    ctx.moveTo(headX - r * 0.5, headY - r * 0.7);
    ctx.bezierCurveTo(headX - r * 0.6, headY - r * 2.2, headX + r * 0.1, headY - r * 3.6, headX + r * 0.75, headY - r * 4.1);
    ctx.bezierCurveTo(headX + r * 0.05, headY - r * 3.0, headX + r * 0.35, headY - r * 1.7, headX + r * 0.45, headY - r * 0.75);
    ctx.closePath();
    ctx.fillStyle = c.hair;
    ctx.fill();
  } else if (char.hair === 'bowser') {
    ctx.beginPath();
    ctx.arc(headX - r * 0.2, headY - r * 0.9, r * 0.55, Math.PI, TAU);
    ctx.fillStyle = c.hair;
    ctx.fill();
  }
}

function drawHairFront(ctx, char, headX, headY, r, time) {
  const c = char.colors;
  switch (char.hair) {
    case 'tufts': {
      for (const [dx, dy, w] of [[-0.65, -1.0, 0.3], [-0.2, -1.12, 0.26], [0.3, -1.06, 0.22]]) {
        ctx.beginPath();
        ctx.moveTo(headX + r * (dx - w / 2), headY + r * (dy + 0.12));
        ctx.quadraticCurveTo(headX + r * (dx + 0.03), headY + r * (dy - 0.35), headX + r * (dx + w / 2), headY + r * (dy + 0.1));
        ctx.closePath();
        ctx.fillStyle = c.hair;
        ctx.fill();
      }
      break;
    }
    case 'cowlick': {
      poly(ctx, [[headX - r * 0.8, headY - r * 0.75], [headX - r * 0.15, headY - r * 1.5], [headX + r * 0.1, headY - r * 0.82]], c.hair);
      poly(ctx, [[headX - r * 0.35, headY - r * 0.95], [headX + r * 0.35, headY - r * 1.55], [headX + r * 0.65, headY - r * 0.85]], c.hair);
      ctx.beginPath();
      ctx.moveTo(headX + r * 0.55, headY - r * 0.85);
      ctx.quadraticCurveTo(headX + r * 1.2, headY - r * 1.45, headX + r * 0.95, headY - r * 1.85);
      ctx.quadraticCurveTo(headX + r * 1.3, headY - r * 1.35, headX + r * 0.8, headY - r * 0.78);
      ctx.closePath();
      ctx.fillStyle = c.hair;
      ctx.fill();
      line(ctx, headX + r * 0.1, headY - r * 1.0, headX + r * 0.8, headY - r * 0.9, dark(c.hair, 0.25), 1.5);
      break;
    }
    case 'longbangs': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 1.0, headY - r * 0.8);
      ctx.quadraticCurveTo(headX - r * 0.2, headY - r * 1.25, headX + r * 1.0, headY - r * 0.72);
      ctx.lineTo(headX + r * 0.85, headY - r * 0.35);
      ctx.lineTo(headX + r * 0.35, headY - r * 0.55);
      ctx.lineTo(headX + r * 0.1, headY - r * 0.3);
      ctx.lineTo(headX - r * 0.4, headY - r * 0.55);
      ctx.lineTo(headX - r * 0.75, headY - r * 0.3);
      ctx.closePath();
      ctx.fillStyle = c.hair;
      ctx.fill();
      line(ctx, headX - r * 0.6, headY - r * 0.7, headX - r * 0.5, headY + r * 1.1, dark(c.hair, 0.2), 1.2);
      break;
    }
    case 'slickwhite': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.9, headY - r * 0.55);
      ctx.quadraticCurveTo(headX - r * 0.85, headY - r * 1.12, headX + r * 0.1, headY - r * 1.12);
      ctx.quadraticCurveTo(headX + r * 0.85, headY - r * 1.05, headX + r * 0.9, headY - r * 0.5);
      ctx.quadraticCurveTo(headX + r * 0.35, headY - r * 0.82, headX - r * 0.9, headY - r * 0.55);
      ctx.closePath();
      ctx.fillStyle = c.hair;
      ctx.fill();
      break;
    }
    case 'spikyblond': {
      for (let i = 0; i < 6; i++) {
        const bx = headX - r * 0.95 + i * r * 0.36;
        poly(ctx, [[bx - r * 0.16, headY - r * 0.82], [bx + r * 0.02, headY - r * 1.42 - (i % 2) * r * 0.2], [bx + r * 0.19, headY - r * 0.8]], c.hair);
      }
      ctx.beginPath();
      ctx.ellipse(headX - r * 0.05, headY - r * 0.7, r * 0.98, r * 0.42, 0, Math.PI, TAU);
      ctx.fillStyle = c.hair;
      ctx.fill();
      break;
    }
    case 'threehairs': {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(headX - r * 0.5 + i * r * 0.32, headY - r * 1.02);
        ctx.quadraticCurveTo(headX - r * 0.45 + i * r * 0.35, headY - r * 1.55, headX - r * 0.15 + i * r * 0.35, headY - r * 1.75);
        ctx.strokeStyle = c.hair;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }
      ell(ctx, headX - r * 0.85, headY - r * 0.1, r * 0.22, r * 0.4, c.hair, null);
      ell(ctx, headX + r * 0.85, headY - r * 0.15, r * 0.2, r * 0.35, c.hair, null);
      for (const [sx, sy] of [[-0.3, -0.75], [0.35, -0.5], [-0.1, 0.4]]) {
        ell(ctx, headX + r * sx, headY + r * sy, r * 0.08, r * 0.06, 'rgba(90,55,35,.35)', null);
      }
      break;
    }
    case 'balding': {
      ell(ctx, headX - r * 0.92, headY - r * 0.05, r * 0.24, r * 0.42, c.hair, null);
      ell(ctx, headX + r * 0.92, headY - r * 0.05, r * 0.22, r * 0.38, c.hair, null);
      ctx.beginPath();
      ctx.ellipse(headX - r * 0.15, headY - r * 0.88, r * 0.4, r * 0.12, -0.2, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,.13)';
      ctx.fill();
      break;
    }
    case 'longred': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.95, headY - r * 0.7);
      ctx.quadraticCurveTo(headX + r * 0.2, headY - r * 1.3, headX + r * 0.95, headY - r * 0.55);
      ctx.lineTo(headX + r * 0.65, headY - r * 0.35);
      ctx.quadraticCurveTo(headX - r * 0.1, headY - r * 0.7, headX - r * 0.9, headY - r * 0.25);
      ctx.closePath();
      ctx.fillStyle = c.hair;
      ctx.fill();
      line(ctx, headX - r * 0.4, headY - r * 0.8, headX - r * 0.1, headY + r * 0.1, dark(c.hair, 0.2), 1.4);
      break;
    }
    case 'mohawk': {
      for (let i = 0; i < 7; i++) {
        const bx = headX - r * 0.85 + i * r * 0.28;
        poly(ctx, [[bx - r * 0.13, headY - r * 0.9], [bx + r * 0.02, headY - r * 1.55 - (i % 3) * r * 0.12], [bx + r * 0.16, headY - r * 0.88]], c.hair, dark(c.hair, 0.4), 1);
      }
      break;
    }
    case 'clownhorn': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.65, headY - r * 0.6);
      ctx.quadraticCurveTo(headX - r * 0.9, headY - r * 1.2, headX - r * 0.2, headY - r * 1.1);
      ctx.quadraticCurveTo(headX - r * 0.55, headY - r * 0.95, headX - r * 0.2, headY - r * 0.7);
      ctx.closePath();
      ctx.fillStyle = c.hair;
      ctx.fill();
      break;
    }
    case 'clownfrizz': {
      for (const [dx, w] of [[-0.9, 0.4], [0.9, 0.4], [-0.35, 0.3], [0.35, 0.3]]) {
        ell(ctx, headX + r * dx, headY - r * 0.85, r * w, r * 0.35, c.hair, null);
      }
      break;
    }
    case 'slick': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.95, headY - r * 0.5);
      ctx.quadraticCurveTo(headX - r * 0.6, headY - r * 1.2, headX + r * 0.2, headY - r * 1.12);
      ctx.quadraticCurveTo(headX + r * 0.9, headY - r * 1.0, headX + r * 0.95, headY - r * 0.42);
      ctx.lineTo(headX + r * 0.2, headY - r * 0.82);
      ctx.lineTo(headX - r * 0.05, headY - r * 0.55);
      ctx.closePath();
      ctx.fillStyle = c.hair;
      ctx.fill();
      break;
    }
    case 'bowser': {
      poly(ctx, [[headX - r * 0.2, headY - r * 1.05], [headX + r * 0.5, headY - r * 1.45], [headX + r * 0.55, headY - r * 0.95]], c.hair);
      break;
    }
    case 'bald': {
      ctx.beginPath();
      ctx.ellipse(headX - r * 0.2, headY - r * 0.85, r * 0.45, r * 0.14, -0.15, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,.16)';
      ctx.fill();
      break;
    }
    case 'antenna': {
      for (const dx of [-0.25, 0.4]) {
        ctx.beginPath();
        ctx.moveTo(headX + r * dx, headY - r * 1.05);
        ctx.quadraticCurveTo(headX + r * (dx + 0.05), headY - r * 1.7, headX + r * (dx + 0.35), headY - r * 1.9);
        ctx.strokeStyle = c.hair;
        ctx.lineWidth = 2;
        ctx.stroke();
        ell(ctx, headX + r * (dx + 0.35), headY - r * 1.9, r * 0.11, r * 0.11, c.hair, null);
      }
      break;
    }
    default: break;
  }
}

function drawHeadgear(ctx, char, headX, headY, r, time) {
  const c = char.colors;
  switch (char.headgear) {
    case 'fedora': {
      ell(ctx, headX - r * 0.12, headY - r * 0.78, r * 1.4, r * 0.3, '#5a402e', '#2c1f16', 2);
      poly(ctx, [[headX - r * 0.75, headY - r * 0.9], [headX - r * 0.55, headY - r * 1.62], [headX + r * 0.75, headY - r * 1.58], [headX + r * 0.92, headY - r * 0.85]], '#4a3425', '#2c1f16', 2);
      ctx.fillStyle = '#2a1d14';
      ctx.fillRect(headX - r * 0.6, headY - r * 1.18, r * 1.45, r * 0.18);
      break;
    }
    case 'cap': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.95, headY - r * 0.5);
      ctx.quadraticCurveTo(headX - r * 0.95, headY - r * 1.3, headX + r * 0.2, headY - r * 1.28);
      ctx.quadraticCurveTo(headX + r * 0.95, headY - r * 1.2, headX + r * 1.0, headY - r * 0.55);
      ctx.closePath();
      ctx.fillStyle = c.primary;
      ctx.fill();
      ctx.fillStyle = c.accent;
      ctx.fillRect(headX - r * 0.9, headY - r * 0.62, r * 1.9, r * 0.14);
      ell(ctx, headX + r * 0.25, headY - r * 0.95, r * 0.16, r * 0.2, c.accent, null);
      ell(ctx, headX + r * 0.25, headY - r * 0.95, r * 0.08, r * 0.1, dark(c.primary, 0.4), null);
      poly(ctx, [[headX + r * 0.55, headY - r * 0.62], [headX + r * 1.55, headY - r * 0.5], [headX + r * 0.9, headY - r * 0.35], [headX + r * 0.55, headY - r * 0.42]], '#171013');
      break;
    }
    case 'huntcap': {
      ctx.beginPath();
      ctx.arc(headX, headY - r * 0.55, r * 0.98, Math.PI, TAU);
      ctx.fillStyle = '#a63a34';
      ctx.fill();
      ctx.fillStyle = '#8a2c28';
      ctx.fillRect(headX - r * 0.98, headY - r * 0.6, r * 1.96, r * 0.16);
      poly(ctx, [[headX + r * 0.2, headY - r * 0.55], [headX + r * 1.4, headY - r * 0.48], [headX + r * 0.3, headY - r * 0.36]], '#2b2d33');
      ell(ctx, headX - r * 0.92, headY + r * 0.05, r * 0.22, r * 0.35, '#a63a34', null);
      ell(ctx, headX + r * 0.92, headY + r * 0.05, r * 0.22, r * 0.35, '#a63a34', null);
      break;
    }
    case 'turban': {
      ell(ctx, headX - r * 0.05, headY - r * 0.75, r * 1.2, r * 0.62, '#e3d9b8', '#9c8f68', 2);
      ell(ctx, headX - r * 0.05, headY - r * 0.98, r * 0.92, r * 0.4, '#efe6c9', null);
      line(ctx, headX - r * 0.9, headY - r * 0.6, headX + r * 0.9, headY - r * 0.68, '#b6a77c', 2);
      ell(ctx, headX + r * 0.35, headY - r * 0.8, r * 0.14, r * 0.18, c.primary, c.accent, 3);
      poly(ctx, [[headX + r * 0.35, headY - r * 1.0], [headX + r * 0.9, headY - r * 2.25], [headX + r * 0.52, headY - r * 1.05]], c.accent);
      break;
    }
    case 'crown': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.85, headY - r * 0.75);
      ctx.lineTo(headX - r * 0.95, headY - r * 1.5);
      ctx.lineTo(headX - r * 0.45, headY - r * 1.02);
      ctx.lineTo(headX - r * 0.05, headY - r * 1.65);
      ctx.lineTo(headX + r * 0.4, headY - r * 1.0);
      ctx.lineTo(headX + r * 0.9, headY - r * 1.5);
      ctx.lineTo(headX + r * 0.85, headY - r * 0.7);
      ctx.closePath();
      ctx.fillStyle = '#e8c24a';
      ctx.fill();
      ctx.strokeStyle = '#9a7420';
      ctx.lineWidth = 2;
      ctx.stroke();
      for (const dx of [-0.6, 0, 0.6]) ell(ctx, headX + r * dx, headY - r * 0.88, r * 0.1, r * 0.12, dx === 0 ? '#e12828' : '#5ec4e8', null);
      break;
    }
    case 'tophat': {
      ell(ctx, headX, headY - r * 1.15, r * 1.3, r * 0.2, '#14121a', null);
      ctx.fillStyle = '#14121a';
      ctx.fillRect(headX - r * 0.7, headY - r * 2.4, r * 1.4, r * 1.3);
      ctx.fillStyle = '#3a3446';
      ctx.fillRect(headX - r * 0.7, headY - r * 1.35, r * 1.4, r * 0.18);
      break;
    }
    case 'bowser': {
      poly(ctx, [[headX - r * 0.55, headY - r * 0.6], [headX - r * 0.7, headY - r * 1.55], [headX - r * 0.12, headY - r * 0.85]], '#efe8d2', '#8a7a58', 1.5);
      poly(ctx, [[headX + r * 0.3, headY - r * 0.85], [headX + r * 0.65, headY - r * 1.6], [headX + r * 0.8, headY - r * 0.7]], '#efe8d2', '#8a7a58', 1.5);
      break;
    }
    default: break;
  }
}

function drawMask(ctx, char, headX, headY, r) {
  const c = char.colors;
  switch (char.mask) {
    case 'chucky': {
      // Scarred Good Guy doll face, circa Seed of Chucky (2004).
      headPath(ctx, headX, headY, r, 'round');
      const g = ctx.createLinearGradient(headX - r, headY - r, headX + r, headY + r);
      g.addColorStop(0, '#f4cda7');
      g.addColorStop(0.5, '#e8b98f');
      g.addColorStop(1, '#c78d65');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#a76f4f';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // glossy plastic sheen
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.ellipse(headX - r * 0.32, headY - r * 0.44, r * 0.34, r * 0.16, -0.52, 0, TAU);
      ctx.fillStyle = '#fff8ec';
      ctx.fill();
      ctx.restore();
      // sunken doll eye sockets
      ell(ctx, headX - r * 0.22, headY - r * 0.02, r * 0.28, r * 0.2, 'rgba(112,58,44,.1)', null);
      ell(ctx, headX + r * 0.46, headY - r * 0.04, r * 0.26, r * 0.19, 'rgba(112,58,44,.1)', null);
      // eyes
      ell(ctx, headX - r * 0.2, headY - r * 0.02, r * 0.22, r * 0.17, '#faf3e5', '#4b2c25', 1.2);
      ell(ctx, headX + r * 0.48, headY - r * 0.04, r * 0.21, r * 0.16, '#faf3e5', '#4b2c25', 1.2);
      ell(ctx, headX - r * 0.14, headY, r * 0.1, r * 0.11, '#3f7ed6', null);
      ell(ctx, headX + r * 0.53, headY - r * 0.02, r * 0.095, r * 0.105, '#3f7ed6', null);
      ell(ctx, headX - r * 0.12, headY - r * 0.01, r * 0.047, r * 0.058, '#12100f', null);
      ell(ctx, headX + r * 0.55, headY - r * 0.03, r * 0.045, r * 0.055, '#12100f', null);
      ell(ctx, headX - r * 0.08, headY - r * 0.05, r * 0.026, r * 0.03, '#fff', null);
      ell(ctx, headX + r * 0.59, headY - r * 0.07, r * 0.025, r * 0.029, '#fff', null);
      // bloodshot lower rims
      line(ctx, headX - r * 0.33, headY + r * 0.13, headX - r * 0.08, headY + r * 0.15, 'rgba(150,40,40,.5)', 1.1);
      line(ctx, headX + r * 0.36, headY + r * 0.1, headX + r * 0.6, headY + r * 0.08, 'rgba(150,40,40,.45)', 1);
      // angry brows
      ctx.strokeStyle = '#9e3823';
      ctx.lineWidth = Math.max(1.7, r * 0.11);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.5, headY - r * 0.23);
      ctx.lineTo(headX - r * 0.02, headY - r * 0.35);
      ctx.moveTo(headX + r * 0.26, headY - r * 0.33);
      ctx.lineTo(headX + r * 0.72, headY - r * 0.17);
      ctx.stroke();
      // button nose
      poly(ctx, [[headX + r * 0.2, headY + r * 0.18], [headX + r * 0.29, headY + r * 0.33], [headX + r * 0.13, headY + r * 0.34]], 'rgba(150,86,62,.4)');
      ell(ctx, headX + r * 0.22, headY + r * 0.33, r * 0.04, r * 0.028, 'rgba(90,45,35,.7)', null);
      // wide stitched grin
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.18, headY + r * 0.5);
      ctx.quadraticCurveTo(headX + r * 0.18, headY + r * 0.84, headX + r * 0.68, headY + r * 0.46);
      ctx.quadraticCurveTo(headX + r * 0.22, headY + r * 0.58, headX - r * 0.18, headY + r * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#481316';
      ctx.fill();
      ctx.strokeStyle = '#7d2d2c';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const tx = headX - r * 0.1 + i * r * 0.16;
        poly(ctx, [[tx, headY + r * 0.515], [tx + r * 0.07, headY + r * 0.6], [tx + r * 0.14, headY + r * 0.505]], '#f2e7cf');
      }
      // stitches clamping the grin shut
      for (const [sx, sy, ang] of [[-0.18, 0.5, 0.5], [0.67, 0.47, -0.4]]) {
        const x1 = headX + r * sx;
        const y1 = headY + r * sy;
        line(ctx, x1 - r * 0.02, y1 - r * 0.2, x1 + r * 0.02, y1 + r * 0.2, '#7d2d2c', 1.2);
        for (let i = 0; i < 3; i++) {
          const yy = y1 - r * 0.14 + i * r * 0.14;
          line(ctx, x1 - r * 0.09, yy - r * 0.02, x1 + r * 0.09, yy + r * 0.03, '#7d2d2c', 1.1);
        }
      }
      // forehead and cheek scars
      line(ctx, headX - r * 0.46, headY - r * 0.62, headX - r * 0.08, headY - r * 0.82, '#a3513d', 1.5);
      for (let i = 0; i < 3; i++) {
        line(ctx, headX - r * 0.35 + i * r * 0.12, headY - r * 0.66 - i * r * 0.04, headX - r * 0.33 + i * r * 0.12, headY - r * 0.78 - i * r * 0.04, '#8d4334', 1.2);
      }
      line(ctx, headX + r * 0.5, headY + r * 0.08, headX + r * 0.66, headY + r * 0.32, '#9e4c3a', 1.2);
      line(ctx, headX + r * 0.58, headY + r * 0.08, headX + r * 0.51, headY + r * 0.16, '#8d4334', 1.1);
      line(ctx, headX + r * 0.62, headY + r * 0.2, headX + r * 0.53, headY + r * 0.28, '#8d4334', 1.1);
      break;
    }
    case 'michael': {
      // weathered, slightly asymmetric 2002 mask
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.98, headY - r * 0.82);
      ctx.quadraticCurveTo(headX - r * 0.2, headY - r * 1.22, headX + r * 0.92, headY - r * 0.86);
      ctx.quadraticCurveTo(headX + r * 1.12, headY - r * 0.1, headX + r * 0.9, headY + r * 0.45);
      ctx.quadraticCurveTo(headX + r * 0.62, headY + r * 1.08, headX + r * 0.02, headY + r * 1.15);
      ctx.quadraticCurveTo(headX - r * 0.72, headY + r * 1.06, headX - r * 1.0, headY + r * 0.38);
      ctx.quadraticCurveTo(headX - r * 1.1, headY - r * 0.25, headX - r * 0.98, headY - r * 0.82);
      ctx.closePath();
      const g = ctx.createLinearGradient(headX - r, headY - r, headX + r, headY + r);
      g.addColorStop(0, '#d7d2c3');
      g.addColorStop(0.55, '#efeadc');
      g.addColorStop(1, '#c9c3b3');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#8d8779';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // eye holes
      ell(ctx, headX - r * 0.28, headY - r * 0.13, r * 0.24, r * 0.19, '#141312', null);
      ell(ctx, headX + r * 0.46, headY - r * 0.16, r * 0.21, r * 0.17, '#141312', null);
      // nose shadow
      poly(ctx, [[headX + r * 0.12, headY + r * 0.12], [headX + r * 0.2, headY + r * 0.3], [headX + r * 0.02, headY + r * 0.32]], '#a8a294');
      ell(ctx, headX + r * 0.06, headY + r * 0.31, r * 0.045, r * 0.035, '#3a3734', null);
      ell(ctx, headX + r * 0.2, headY + r * 0.3, r * 0.045, r * 0.035, '#3a3734', null);
      // thin mouth
      line(ctx, headX - r * 0.07, headY + r * 0.62, headX + r * 0.34, headY + r * 0.58, '#7a7267', 1.6);
      // cracks / weathering
      line(ctx, headX - r * 0.62, headY - r * 0.48, headX - r * 0.5, headY - r * 0.12, 'rgba(110,102,88,.6)', 1);
      line(ctx, headX - r * 0.5, headY - r * 0.12, headX - r * 0.58, headY + r * 0.02, 'rgba(110,102,88,.5)', 1);
      line(ctx, headX + r * 0.72, headY + r * 0.35, headX + r * 0.6, headY + r * 0.5, 'rgba(110,102,88,.55)', 1);
      line(ctx, headX + r * 0.3, headY + r * 0.82, headX + r * 0.48, headY + r * 0.7, 'rgba(110,102,88,.5)', 1);
      ell(ctx, headX + r * 0.55, headY + r * 0.3, r * 0.08, r * 0.05, 'rgba(120,110,90,.3)', null);
      break;
    }
    case 'jason': {
      ctx.beginPath();
      ctx.ellipse(headX + r * 0.03, headY + r * 0.02, r * 0.94, r * 1.08, 0, 0, TAU);
      const g = ctx.createLinearGradient(headX - r, headY - r, headX + r, headY + r);
      g.addColorStop(0, '#d9d4bd');
      g.addColorStop(0.6, '#f2eeda');
      g.addColorStop(1, '#c4bfa8');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#7d7a68';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ell(ctx, headX - r * 0.3, headY - r * 0.12, r * 0.22, r * 0.17, '#16150f', null);
      ell(ctx, headX + r * 0.45, headY - r * 0.14, r * 0.2, r * 0.15, '#16150f', null);
      // nose and mouth holes
      poly(ctx, [[headX + r * 0.1, headY + r * 0.12], [headX + r * 0.2, headY + r * 0.3], [headX + r * 0.04, headY + r * 0.3]], '#4a4637');
      for (let i = 0; i < 4; i++) ell(ctx, headX - r * 0.12 + i * r * 0.1, headY + r * 0.62, r * 0.035, r * 0.09, '#4a4637', null);
      // red triangles
      poly(ctx, [[headX - r * 0.08, headY - r * 0.55], [headX + r * 0.12, headY - r * 0.24], [headX - r * 0.28, headY - r * 0.24]], '#c0392b');
      poly(ctx, [[headX - r * 0.6, headY + r * 0.3], [headX - r * 0.44, headY + r * 0.5], [headX - r * 0.7, headY + r * 0.52]], '#b7332a');
      poly(ctx, [[headX + r * 0.55, headY + r * 0.4], [headX + r * 0.72, headY + r * 0.56], [headX + r * 0.48, headY + r * 0.62]], '#b7332a');
      // straps
      line(ctx, headX - r * 0.85, headY - r * 0.35, headX - r * 1.15, headY - r * 0.45, '#39352b', 3);
      line(ctx, headX - r * 0.82, headY + r * 0.42, headX - r * 1.1, headY + r * 0.42, '#39352b', 3);
      for (const [dx, dy] of [[-0.7, -0.7], [0.75, -0.7], [-0.78, 0.68], [0.78, 0.7], [0.05, 0.9]]) {
        ell(ctx, headX + r * dx, headY + r * dy, r * 0.035, r * 0.035, 'rgba(70,66,52,.55)', null);
      }
      break;
    }
    case 'vader': {
      // flared helmet + faceplate
      ctx.beginPath();
      ctx.moveTo(headX - r * 1.12, headY + r * 0.65);
      ctx.quadraticCurveTo(headX - r * 1.25, headY - r * 0.1, headX - r * 1.1, headY - r * 0.9);
      ctx.quadraticCurveTo(headX, headY - r * 1.55, headX + r * 1.1, headY - r * 0.9);
      ctx.quadraticCurveTo(headX + r * 1.25, headY - r * 0.1, headX + r * 1.12, headY + r * 0.65);
      ctx.quadraticCurveTo(headX + r * 0.9, headY + r * 0.95, headX + r * 0.55, headY + r * 0.78);
      ctx.lineTo(headX - r * 0.55, headY + r * 0.78);
      ctx.quadraticCurveTo(headX - r * 0.9, headY + r * 0.95, headX - r * 1.12, headY + r * 0.65);
      ctx.closePath();
      ctx.fillStyle = '#17181d';
      ctx.fill();
      ctx.strokeStyle = '#3c3f49';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // brow / faceplate
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.8, headY - r * 0.45);
      ctx.quadraticCurveTo(headX + r * 0.1, headY - r * 0.68, headX + r * 0.85, headY - r * 0.3);
      ctx.lineTo(headX + r * 0.66, headY + r * 0.62);
      ctx.quadraticCurveTo(headX, headY + r * 0.88, headX - r * 0.66, headY + r * 0.55);
      ctx.closePath();
      ctx.fillStyle = '#22242b';
      ctx.fill();
      // red lenses
      ctx.save();
      ctx.shadowColor = '#ff2a1a';
      ctx.shadowBlur = 10;
      for (const dx of [-0.3, 0.42]) {
        ctx.beginPath();
        ctx.ellipse(headX + r * dx, headY - r * 0.13, r * 0.19, r * 0.12, dx > 0 ? 0.18 : -0.12, 0, TAU);
        ctx.fillStyle = '#d92d20';
        ctx.fill();
      }
      ctx.restore();
      // nose ridge
      poly(ctx, [[headX + r * 0.05, headY - r * 0.1], [headX + r * 0.16, headY + r * 0.25], [headX - r * 0.02, headY + r * 0.25], [headX - r * 0.08, headY - r * 0.08]], '#3d404a');
      // grille
      poly(ctx, [[headX - r * 0.14, headY + r * 0.38], [headX + r * 0.24, headY + r * 0.36], [headX + r * 0.18, headY + r * 0.68], [headX - r * 0.08, headY + r * 0.7]], '#111216', '#4a4e5a', 1.2);
      for (let i = 0; i < 4; i++) line(ctx, headX - r * 0.05 + i * r * 0.075, headY + r * 0.4, headX - r * 0.03 + i * r * 0.06, headY + r * 0.67, '#5c606d', 1.4);
      // helmet cheeks
      line(ctx, headX - r * 0.7, headY + r * 0.25, headX - r * 0.52, headY + r * 0.8, '#3c3f49', 1.5);
      line(ctx, headX + r * 0.72, headY + r * 0.2, headX + r * 0.55, headY + r * 0.78, '#3c3f49', 1.5);
      // neck collar
      poly(ctx, [[headX - r * 0.85, headY + r * 0.8], [headX + r * 0.85, headY + r * 0.8], [headX + r * 1.15, headY + r * 1.2], [headX - r * 1.15, headY + r * 1.2]], '#191a20', '#353843', 1.5);
      break;
    }
    case 'clown': {
      // white greasepaint, green eyelids, red grin
      ctx.save();
      headPath(ctx, headX, headY, r, char.headShape);
      ctx.fillStyle = '#f3efe8';
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = dark(c.skin, 0.15);
      ctx.lineWidth = 1;
      headPath(ctx, headX, headY, r, char.headShape);
      ctx.stroke();
      // eye makeup
      ell(ctx, headX - r * 0.28, headY - r * 0.16, r * 0.36, r * 0.3, 'rgba(80,190,80,.45)', null);
      ell(ctx, headX + r * 0.44, headY - r * 0.18, r * 0.34, r * 0.28, 'rgba(80,190,80,.45)', null);
      ell(ctx, headX - r * 0.26, headY - r * 0.16, r * 0.18, r * 0.15, '#1a1114', null);
      ell(ctx, headX + r * 0.44, headY - r * 0.17, r * 0.16, r * 0.14, '#1a1114', null);
      ell(ctx, headX - r * 0.24, headY - r * 0.17, r * 0.09, r * 0.09, '#ef2a2a', null);
      ell(ctx, headX + r * 0.42, headY - r * 0.18, r * 0.08, r * 0.08, '#ef2a2a', null);
      // red nose
      ctx.save();
      ctx.shadowColor = '#ff2a2a';
      ctx.shadowBlur = 5;
      ell(ctx, headX + r * 0.14, headY + r * 0.25, r * 0.17, r * 0.15, '#e12828', '#9e1a1a', 1.2);
      ctx.restore();
      // giant grin
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.3, headY + r * 0.46);
      ctx.quadraticCurveTo(headX + r * 0.15, headY + r * 0.98, headX + r * 0.72, headY + r * 0.38);
      ctx.quadraticCurveTo(headX + r * 0.2, headY + r * 0.55, headX - r * 0.3, headY + r * 0.46);
      ctx.fillStyle = '#b51e26';
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        poly(ctx, [[headX - r * 0.2 + i * r * 0.14, headY + r * 0.5], [headX - r * 0.12 + i * r * 0.14, headY + r * 0.66], [headX - r * 0.04 + i * r * 0.14, headY + r * 0.5]], '#f6efdd');
      }
      break;
    }
    case 'pennywise': {
      headPath(ctx, headX, headY, r, 'long');
      ctx.fillStyle = '#f6f2ec';
      ctx.fill();
      // eye lines
      for (const dx of [-0.28, 0.44]) {
        line(ctx, headX + r * dx, headY + r * 0.02, headX + r * (dx + 0.03), headY + r * 0.55, '#c0392b', 2);
        line(ctx, headX + r * (dx - 0.1), headY + r * 0.5, headX + r * (dx + 0.16), headY + r * 0.62, '#c0392b', 1.5);
      }
      ell(ctx, headX + r * 0.12, headY + r * 0.22, r * 0.15, r * 0.13, '#e12828', null);
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.3, headY + r * 0.45);
      ctx.quadraticCurveTo(headX + r * 0.1, headY + r * 0.9, headX + r * 0.7, headY + r * 0.4);
      ctx.quadraticCurveTo(headX + r * 0.1, headY + r * 0.58, headX - r * 0.3, headY + r * 0.45);
      ctx.fillStyle = '#b51e26';
      ctx.fill();
      for (let i = 0; i < 4; i++) poly(ctx, [[headX - r * 0.14 + i * r * 0.14, headY + r * 0.5], [headX - r * 0.07 + i * r * 0.14, headY + r * 0.66], [headX + i * r * 0.14, headY + r * 0.5]], '#f6efdd');
      break;
    }
    case 'leather': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 1.0, headY - r * 0.85);
      ctx.quadraticCurveTo(headX, headY - r * 1.3, headX + r * 1.0, headY - r * 0.82);
      ctx.lineTo(headX + r * 1.05, headY + r * 0.55);
      ctx.quadraticCurveTo(headX + r * 0.7, headY + r * 1.15, headX, headY + r * 1.15);
      ctx.quadraticCurveTo(headX - r * 0.75, headY + r * 1.12, headX - r * 1.02, headY + r * 0.5);
      ctx.closePath();
      ctx.fillStyle = '#d9b394';
      ctx.fill();
      ctx.strokeStyle = '#a17a5d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ell(ctx, headX - r * 0.28, headY - r * 0.1, r * 0.2, r * 0.17, '#1e1512', null);
      ell(ctx, headX + r * 0.44, headY - r * 0.12, r * 0.18, r * 0.16, '#1e1512', null);
      ell(ctx, headX + r * 0.18, headY + r * 0.55, r * 0.14, r * 0.1, '#3a2018', null);
      // stitches
      for (const [sx, sy, ang] of [[-0.55, 0.25, 0.4], [0.4, 0.52, -0.2], [0.05, -0.55, 0.1]]) {
        const x1 = headX + r * sx;
        const y1 = headY + r * sy;
        line(ctx, x1 - r * 0.16, y1 - r * 0.06, x1 + r * 0.16, y1 + r * 0.06, '#6b3f2c', 1.4);
        for (let i = 0; i < 3; i++) line(ctx, x1 - r * 0.12 + i * r * 0.11, y1 - r * 0.06, x1 - r * 0.14 + i * r * 0.11, y1 + r * 0.07, '#6b3f2c', 1);
      }
      ell(ctx, headX + r * 0.62, headY + r * 0.34, r * 0.12, r * 0.08, 'rgba(120,30,25,.5)', null);
      break;
    }
    case 'ghostface': {
      ctx.beginPath();
      ctx.moveTo(headX - r * 0.85, headY - r * 0.9);
      ctx.quadraticCurveTo(headX, headY - r * 1.38, headX + r * 0.9, headY - r * 0.9);
      ctx.quadraticCurveTo(headX + r * 1.02, headY + r * 0.2, headX + r * 0.55, headY + r * 1.0);
      ctx.quadraticCurveTo(headX, headY + r * 1.45, headX - r * 0.6, headY + r * 0.95);
      ctx.quadraticCurveTo(headX - r * 1.02, headY + r * 0.15, headX - r * 0.85, headY - r * 0.9);
      ctx.closePath();
      const g = ctx.createLinearGradient(headX - r, headY - r, headX + r, headY + r);
      g.addColorStop(0, '#eae7df');
      g.addColorStop(0.65, '#f7f4ec');
      g.addColorStop(1, '#c9c5bb');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = '#8a877e';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // black eyes
      ell(ctx, headX - r * 0.27, headY - r * 0.18, r * 0.22, r * 0.25, '#111116', null);
      ell(ctx, headX + r * 0.46, headY - r * 0.2, r * 0.2, r * 0.23, '#111116', null);
      // nose slit
      poly(ctx, [[headX + r * 0.1, headY + r * 0.12], [headX + r * 0.23, headY + r * 0.24], [headX + r * 0.08, headY + r * 0.26]], '#3a393e');
      // screaming mouth
      ctx.beginPath();
      ctx.ellipse(headX + r * 0.15, headY + r * 0.58, r * 0.16, r * 0.26, -0.15, 0, TAU);
      ctx.fillStyle = '#15151a';
      ctx.fill();
      // hood edge
      ctx.strokeStyle = '#2a2a33';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(headX - r * 0.05, headY, r * 1.36, Math.PI * 0.75, Math.PI * 2.25);
      ctx.stroke();
      break;
    }
    case 'pinhead': {
      headPath(ctx, headX, headY, r, char.headShape);
      ctx.fillStyle = '#e3dcd2';
      ctx.fill();
      // grid pins
      ctx.strokeStyle = '#7a7a86';
      ctx.lineWidth = 1.2;
      for (let ix = -2; ix <= 2; ix++) {
        for (let iy = -2; iy <= 2; iy++) {
          if (ix === 0 && iy === 0) continue;
          const px = headX + ix * r * 0.33 + r * 0.08;
          const py = headY - r * 0.05 + iy * r * 0.3;
          line(ctx, px, py, px + ix * r * 0.11, py + iy * r * 0.11, '#7a7a86', 1.2);
          ell(ctx, px + ix * r * 0.12, py + iy * r * 0.12, r * 0.025, r * 0.025, '#c9c4bb', null);
        }
      }
      ell(ctx, headX - r * 0.26, headY - r * 0.16, r * 0.16, r * 0.1, '#1a171c', null);
      ell(ctx, headX + r * 0.44, headY - r * 0.17, r * 0.14, r * 0.09, '#1a171c', null);
      line(ctx, headX - r * 0.02, headY + r * 0.52, headX + r * 0.34, headY + r * 0.5, '#6d5f57', 1.8);
      break;
    }
    default: break;
  }
}

export function drawHead(ctx, char, o) {
  const { headX, headY, headR, time = 0 } = o;
  const r = headR;
  const c = char.colors;

  drawHairBack(ctx, char, headX, headY, r);
  if (char.mask === 'ghostface') {
    // hood goes behind the mask (already drawn by hair back)
  }
  drawEar(ctx, char, headX, headY, r);

  if (!char.mask || char.mask === 'burn') {
    headPath(ctx, headX, headY, r, char.headShape);
    const g = ctx.createLinearGradient(headX - r, headY - r, headX + r, headY + r);
    g.addColorStop(0, light(c.skin, 0.08));
    g.addColorStop(0.7, c.skin);
    g.addColorStop(1, dark(c.skin, 0.18));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = dark(c.skin, 0.3);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  if (char.mask) {
    drawMask(ctx, char, headX, headY, r);
  }

  const faceVisible = !char.mask || char.mask === 'burn';
  if (faceVisible) {
    if (char.eyeStyle === 'oneeye') {
      // single central eye
      ell(ctx, headX + r * 0.18, headY - r * 0.12, r * 0.34, r * 0.3, '#f2ead2', '#2b231c', 1.6);
      ell(ctx, headX + r * 0.24, headY - r * 0.12, r * 0.16, r * 0.17, c.eye, null);
      ell(ctx, headX + r * 0.26, headY - r * 0.12, r * 0.075, r * 0.085, '#111', null);
      ell(ctx, headX + r * 0.31, headY - r * 0.18, r * 0.04, r * 0.04, 'rgba(255,255,255,.9)', null);
      // heavy brow
      line(ctx, headX - r * 0.2, headY - r * 0.45, headX + r * 0.62, headY - r * 0.36, char.brow || dark(c.skin, 0.4), r * 0.13);
    } else if (char.eyeStyle === 'small') {
      drawEye(ctx, headX - r * 0.2, headY - r * 0.05, r, 'small', c.eye);
      drawEye(ctx, headX + r * 0.48, headY - r * 0.06, r, 'small', c.eye);
    } else {
      drawEye(ctx, headX - r * 0.2, headY - r * 0.03, r, char.eyeStyle, c.eye);
      drawEye(ctx, headX + r * 0.48, headY - r * 0.05, r, char.eyeStyle, c.eye);
    }
    if (char.eyeStyle !== 'oneeye') drawBrows(ctx, char, headX, headY, r);

    // nose
    if (!char.snout && char.mask !== 'burn') {
      if (char.id === 'ogre' || char.id === 'cyclops' || char.id === 'rawhead' || char.id === 'bigbabytom') {
        ell(ctx, headX + r * 0.2, headY + r * 0.3, r * 0.2, r * 0.13, dark(c.skin, 0.15), null);
        ell(ctx, headX + r * 0.11, headY + r * 0.31, r * 0.04, r * 0.03, dark(c.skin, 0.45), null);
        ell(ctx, headX + r * 0.28, headY + r * 0.31, r * 0.04, r * 0.03, dark(c.skin, 0.45), null);
      } else {
        line(ctx, headX + r * 0.14, headY + r * 0.1, headX + r * 0.2, headY + r * 0.27, dark(c.skin, 0.35), 1.4);
        line(ctx, headX + r * 0.06, headY + r * 0.28, headX + r * 0.28, headY + r * 0.27, dark(c.skin, 0.35), 1.3);
      }
    }

    // muzzles
    if (char.snout === 'dog' && char.mask !== 'burn') {
      ell(ctx, headX + r * 0.55, headY + r * 0.34, r * 0.58, r * 0.3, c.skin, dark(c.skin, 0.3), 1.5);
      ell(ctx, headX + r * 1.02, headY + r * 0.25, r * 0.12, r * 0.09, '#201812', null);
      ctx.beginPath();
      ctx.moveTo(headX + r * 0.35, headY + r * 0.58);
      ctx.quadraticCurveTo(headX + r * 0.7, headY + r * 0.9, headX + r * 1.05, headY + r * 0.5);
      ctx.strokeStyle = '#3a2018';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      for (let i = 0; i < 3; i++) poly(ctx, [[headX + r * 0.56 + i * r * 0.13, headY + r * 0.62], [headX + r * 0.62 + i * r * 0.13, headY + r * 0.76], [headX + r * 0.68 + i * r * 0.13, headY + r * 0.6]], '#f6eedb');
    } else if (char.snout === 'croc' && char.mask !== 'burn') {
      ctx.beginPath();
      ctx.moveTo(headX + r * 0.1, headY + r * 0.15);
      ctx.quadraticCurveTo(headX + r * 1.05, headY + r * 0.1, headX + r * 1.35, headY + r * 0.35);
      ctx.quadraticCurveTo(headX + r * 1.1, headY + r * 0.68, headX + r * 0.3, headY + r * 0.62);
      ctx.closePath();
      ctx.fillStyle = c.skin;
      ctx.fill();
      ctx.strokeStyle = dark(c.skin, 0.3);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        poly(ctx, [[headX + r * 0.35 + i * r * 0.17, headY + r * 0.58], [headX + r * 0.41 + i * r * 0.17, headY + r * 0.7], [headX + r * 0.47 + i * r * 0.17, headY + r * 0.57]], '#f3ead6');
      }
      ell(ctx, headX + r * 0.95, headY + r * 0.2, r * 0.05, r * 0.035, '#20301c', null);
    } else if (char.snout === 'pig' && char.mask !== 'burn') {
      ell(ctx, headX + r * 0.52, headY + r * 0.36, r * 0.5, r * 0.34, c.skin, dark(c.skin, 0.28), 1.3);
      ell(ctx, headX + r * 0.62, headY + r * 0.28, r * 0.09, r * 0.06, dark(c.skin, 0.45), null);
      ell(ctx, headX + r * 0.48, headY + r * 0.29, r * 0.08, r * 0.055, dark(c.skin, 0.45), null);
      drawMouth(ctx, char, headX + r * 0.05, headY, r);
    }

    if (char.id === 'bowser') {
      ell(ctx, headX + r * 0.5, headY + r * 0.42, r * 0.52, r * 0.26, '#e8d08a', null);
      drawMouth(ctx, { ...char, mouth: 'fangs' }, headX, headY + r * 0.12, r);
      ell(ctx, headX + r * 0.68, headY + r * 0.32, r * 0.05, r * 0.035, '#6b5a2a', null);
      ell(ctx, headX + r * 0.48, headY + r * 0.34, r * 0.045, r * 0.03, '#6b5a2a', null);
    } else if (char.id === 'thanos') {
      line(ctx, headX + r * 0.0, headY + r * 0.55, headX + r * 0.45, headY + r * 0.5, dark(c.skin, 0.4), 1.6);
      for (let i = 0; i < 3; i++) line(ctx, headX + r * (0.08 + i * 0.12), headY + r * 0.42, headX + r * (0.1 + i * 0.12), headY + r * 0.62, dark(c.skin, 0.28), 1.3);
    } else if (char.mouth !== 'fangs' && char.snout !== 'croc' && char.snout !== 'pig') {
      drawMouth(ctx, char, headX, headY, r);
    } else if (char.snout === 'pig' && char.mask !== 'burn') {
      // mouth already drawn above
    } else {
      drawMouth(ctx, char, headX, headY, r);
    }

    // facial damage / details
    if (char.stitches) {
      const sx = headX + r * 0.05;
      const sy = headY + r * 0.2;
      line(ctx, sx - r * 0.35, sy - r * 0.25, sx + r * 0.25, sy + r * 0.3, '#8e2b25', 1.8);
      for (let i = 0; i < 4; i++) {
        const px = sx - r * 0.27 + i * r * 0.15;
        const py = sy - r * 0.18 + i * r * 0.13;
        line(ctx, px - r * 0.06, py - r * 0.07, px + r * 0.07, py + r * 0.08, '#5e1e1b', 1.2);
      }
      line(ctx, headX + r * 0.5, headY + r * 0.15, headX + r * 0.78, headY + r * 0.4, '#8e2b25', 1.4);
    }
    if (char.wrinkles) {
      line(ctx, headX - r * 0.35, headY - r * 0.48, headX + r * 0.25, headY - r * 0.52, 'rgba(90,55,55,.45)', 1.2);
      line(ctx, headX + r * 0.3, headY + r * 0.2, headX + r * 0.5, headY + r * 0.25, 'rgba(90,55,55,.4)', 1);
      line(ctx, headX - r * 0.35, headY + r * 0.1, headX - r * 0.45, headY + r * 0.28, 'rgba(90,55,55,.4)', 1);
    }
    if (char.id === 'jafar') {
      poly(ctx, [[headX + r * 0.05, headY + r * 0.98], [headX + r * 0.28, headY + r * 0.68], [headX + r * 0.44, headY + r * 1.32]], c.hair);
      line(ctx, headX + r * 0.05, headY + r * 0.68, headX + r * 0.45, headY + r * 0.66, c.hair, 2.4);
    }
    if (char.mask === 'burn') {
      // burned patches & scars
      ctx.save();
      ctx.globalAlpha = 0.85;
      for (const [dx, dy, rx, ry] of [[-0.55, -0.55, 0.3, 0.18], [0.25, 0.62, 0.35, 0.15], [0.55, -0.4, 0.22, 0.2], [-0.1, 0.15, 0.14, 0.1]]) {
        ell(ctx, headX + r * dx, headY + r * dy, r * rx, r * ry, 'rgba(95,40,30,.55)', null);
      }
      for (let i = 0; i < 3; i++) line(ctx, headX - r * 0.65 + i * r * 0.2, headY - r * 0.75, headX - r * 0.3 + i * r * 0.2, headY + r * 0.85, 'rgba(70,30,24,.45)', 1.4);
      ctx.restore();
    }
  }

  // hair / headgear on top
  if (!['vader', 'ghostface', 'pinhead', 'michael', 'jason', 'leather', 'pennywise', 'clown'].includes(char.mask)) {
    drawHairFront(ctx, char, headX, headY, r);
  } else if (char.hair === 'tufts' || char.hair === 'jasonhair' || char.hair === 'leatherhair' || char.hair === 'cowlick' || char.hair === 'clownhorn' || char.hair === 'clownfrizz' || char.hair === 'slick' || char.hair === 'longred') {
    drawHairFront(ctx, char, headX, headY, r);
  }
  drawHeadgear(ctx, char, headX, headY, r, time);
}

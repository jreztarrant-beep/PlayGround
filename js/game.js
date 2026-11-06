// Core fighting game: physics, rounds, AI, input, drawing.
import { drawFighter, drawFighterShadow } from './art.js';
import { drawStage, GROUND_Y } from './stages.js';
import { makeHudAvatar } from './portraits.js';
import { drawHud, drawVignette } from './hud.js';
import { updateEffects, drawEffects, drawFlash, spawnProjectile, spawnBeam, spawnShockwave } from './fx.js';
import { sound } from './audio.js';

const W = 1280;
const H = 720;
const GRAVITY = 2400;

const DIFFICULTY = {
  rookie: { think: 0.5, block: 0.16, aggr: 0.55, special: 0.32, jump: 0.12, speed: 0.82 },
  normal: { think: 0.32, block: 0.34, aggr: 0.76, special: 0.58, jump: 0.18, speed: 0.94 },
  nightmare: { think: 0.18, block: 0.55, aggr: 0.96, special: 0.86, jump: 0.24, speed: 1.04 },
};

const KEYMAP = {
  KeyA: [0, 'left'], KeyD: [0, 'right'], KeyW: [0, 'jump'], KeyS: [0, 'down'],
  KeyJ: [0, 'punch'], KeyK: [0, 'kick'], KeyL: [0, 'special'],
  ArrowLeft: [1, 'left'], ArrowRight: [1, 'right'], ArrowUp: [1, 'jump'], ArrowDown: [1, 'down'],
  Comma: [1, 'punch'], Period: [1, 'kick'], Slash: [1, 'special'],
};

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export class FightGame {
  constructor(opts) {
    this.canvas = opts.canvas;
    this.canvas.width = W;
    this.canvas.height = H;
    this.ctx = this.canvas.getContext('2d');
    this.p1char = opts.p1;
    this.p2char = opts.p2;
    this.mode = opts.mode || 'cpu';
    this.difficulty = opts.difficulty || 'normal';
    this.stage = opts.stage;
    this.onMatchEnd = opts.onMatchEnd || (() => {});
    this.onPause = opts.onPause || (() => {});
    this.onHud = opts.onHud || (() => {});

    this.w = W;
    this.h = H;
    this.time = 0;
    this.paused = false;
    this.destroyed = false;
    this.phase = 'intro';
    this.round = 1;
    this.wins = [0, 0];
    this.roundTime = 60;
    this.introTime = 0;
    this.roundEndTime = 0;
    this.matchEndTime = 0;
    this.fightAnnounced = false;
    this.roundWinner = -1;
    this.matchOver = false;
    this.matchSent = false;
    this.hitStop = 0;
    this.shakeMag = 0;
    this.shakeTime = 0;
    this.flashAlpha = 0;
    this.flashColor = '#ffffff';
    this.announcement = null;

    this.fighters = [this.makeFighter(this.p1char, 0), this.makeFighter(this.p2char, 1)];
    this.avatars = [makeHudAvatar(this.p1char), makeHudAvatar(this.p2char)];
    this.particles = [];
    this.projectiles = [];
    this.beams = [];
    this.waves = [];
    this.floats = [];

    this.held = [{ left: false, right: false, down: false }, { left: false, right: false, down: false }];
    this.aiHeld = { left: false, right: false, down: false };
    this.ai = { timer: 0.5, blockTimer: 0, cool: 0.4, initialized: false };
    this.last = 0;
    this.sound = sound;

    this._keydown = (e) => this.handleKey(e, true);
    this._keyup = (e) => this.handleKey(e, false);
    this._blur = () => this.clearHeld();
    this._vis = () => { if (document.hidden && !this.paused) this.togglePause(true); };
    window.addEventListener('keydown', this._keydown);
    window.addEventListener('keyup', this._keyup);
    window.addEventListener('blur', this._blur);
    document.addEventListener('visibilitychange', this._vis);

    this.startRound(true);
    this._frame = (ts) => this.frame(ts);
    this.raf = requestAnimationFrame(this._frame);
  }

  makeFighter(char, side) {
    const fat = char.fat || 0;
    return {
      char, side,
      x: side === 0 ? 420 : 860,
      y: GROUND_Y, vx: 0, vy: 0,
      facing: side === 0 ? 1 : -1,
      hp: 100, maxHp: 100, displayHp: 100, meter: 0,
      state: 'idle', animTime: 0,
      attack: null, special: null, dash: null,
      blocking: false, hitstun: 0, invuln: 0,
      ko: false, win: false,
      combo: 0, comboTimer: 0, cooldown: 0, hitFlash: 0,
      buffer: { jump: 0, punch: 0, kick: 0, special: 0 },
      grounded: true,
      speed: 178 + char.stats.speed * 17 - fat * 18,
      powerFactor: 0.8 + char.stats.power * 0.075,
      weight: 1 + fat * 0.5,
      width: (25 + fat * 25) * char.scale,
      height: (170 + fat * 12) * char.scale,
      spawnX: side === 0 ? 420 : 860,
    };
  }

  startRound(first = false) {
    this.phase = 'intro';
    this.introTime = 0;
    this.roundEndTime = 0;
    this.fightAnnounced = false;
    this.roundWinner = -1;
    this.roundTime = 60;
    for (let i = 0; i < 2; i++) {
      const f = this.fighters[i];
      f.x = f.side === 0 ? 420 : 860;
      f.y = GROUND_Y; f.vx = 0; f.vy = 0;
      f.facing = f.side === 0 ? 1 : -1;
      f.hp = 100; f.displayHp = 100;
      f.grounded = true;
      f.state = 'idle';
      f.attack = null; f.special = null; f.dash = null;
      f.blocking = false; f.hitstun = 0; f.invuln = 0;
      f.ko = false; f.win = false;
      f.combo = 0; f.comboTimer = 0; f.cooldown = 0; f.hitFlash = 0;
      f.buffer = { jump: 0, punch: 0, kick: 0, special: 0 };
      if (first) f.meter = 0;
    }
    this.projectiles.length = 0;
    this.beams.length = 0;
    this.waves.length = 0;
    this.particles.length = 0;
    this.floats.length = 0;
    this.announce(`ROUND ${this.round}`, this.stage.name, 'round', 1.15);
    sound.play('bell');
  }

  clearHeld() {
    for (const h of this.held) { h.left = false; h.right = false; h.down = false; }
    this.aiHeld.left = false; this.aiHeld.right = false; this.aiHeld.down = false;
  }

  handleKey(e, down) {
    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (down && !e.repeat) this.togglePause();
      e.preventDefault();
      return;
    }
    const map = KEYMAP[e.code];
    if (!map) return;
    const [side, action] = map;
    if (side === 1 && this.mode !== 'local') return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Slash', 'Comma', 'Period'].includes(e.code)) e.preventDefault();
    const f = this.fighters[side];
    if (action === 'left' || action === 'right' || action === 'down') {
      this.held[side][action] = down;
      if (!down) return;
      return;
    }
    if (!down) return;
    if (e.repeat) return;
    this.pressAction(side, action);
  }

  pressAction(side, action) {
    if (this.paused || this.destroyed) return;
    if (this.phase !== 'fight') return;
    const f = this.fighters[side];
    if (f.ko) return;
    const canAct = !f.attack && !f.special && f.hitstun <= 0 && f.state !== 'ko';
    if (action === 'special') {
      if (f.meter < 50) return;
      if (canAct) this.startSpecial(f);
      else f.buffer.special = 0.15;
      return;
    }
    if (action === 'jump') {
      if (canAct && f.grounded) this.jump(f);
      else f.buffer.jump = 0.13;
      return;
    }
    if (canAct) this.startAttack(f, action);
    else f.buffer[action] = 0.15;
  }

  setTouchHeld(action, down) {
    if (['left', 'right', 'down'].includes(action)) this.held[0][action] = down;
  }

  touchAction(action) {
    this.pressAction(0, action);
  }

  jump(f) {
    f.vy = -730;
    f.grounded = false;
    f.state = 'jump';
    f.blocking = false;
    sound.play('swing');
  }

  startAttack(f, type) {
    if (type === 'special') return this.startSpecial(f);
    f.attack = { type, elapsed: 0, dur: type === 'punch' ? 0.32 : 0.48, hit: false };
    f.state = 'attack';
    f.blocking = false;
    sound.play('swing');
  }

  startSpecial(f) {
    if (f.meter < 50) return;
    f.meter -= 50;
    f.attack = null;
    f.special = {
      type: f.char.special.type, elapsed: 0, dur: f.char.special.type === 'dash' ? 0.8 : 1.0,
      fired: false, dashStarted: false,
    };
    f.state = 'special';
    f.blocking = false;
    f.vx = 0;
    sound.play('special');
    this.burst(f.x, f.y - 90 * f.char.scale, f.char.special.color, 18, 5);
    this.addFloat(f.char.special.name, f.x, f.y - 205 * f.char.scale, f.char.special.color, 20);
  }

  togglePause(force) {
    if (this.phase === 'matchEnd') return;
    this.paused = force === true ? true : !this.paused;
    this.onPause(this.paused);
    if (this.paused) this.clearHeld();
  }

  announce(text, sub, style = 'default', dur = 1.2) {
    this.announcement = { text, sub, style, dur, t: 0 };
  }

  flash(color, alpha) {
    if (alpha >= this.flashAlpha) {
      this.flashColor = color;
      this.flashAlpha = alpha;
    }
  }

  shake(mag, time) {
    if (mag >= this.shakeMag || this.shakeTime <= 0) {
      this.shakeMag = mag;
      this.shakeTime = time;
    }
  }

  burst(x, y, color, count = 12, size = 4, shape = 'spark') {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 340;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80,
        life: 0.35 + Math.random() * 0.4, maxLife: 0.75,
        size: size * (0.6 + Math.random() * 0.8), color,
        grav: shape === 'dust' ? 500 : 900, additive: shape !== 'dust',
        shape,
      });
    }
  }

  addFloat(text, x, y, color, size = 20) {
    this.floats.push({ text, x, y, color, size, t: 0, dur: 0.9 });
  }

  frame(ts) {
    if (this.destroyed) return;
    if (!this.last) this.last = ts;
    let dt = (ts - this.last) / 1000;
    this.last = ts;
    dt = Math.min(0.034, Math.max(0.001, dt));
    if (!this.paused) this.update(dt);
    this.draw(ts / 1000);
    this.raf = requestAnimationFrame(this._frame);
  }

  update(dt) {
    this.time += dt;
    if (this.announcement) {
      this.announcement.t += dt;
      if (this.announcement.t > this.announcement.dur) this.announcement = null;
    }
    if (this.shakeTime > 0) this.shakeTime -= dt;
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }

    if (this.phase === 'intro') {
      this.introTime += dt;
      for (const f of this.fighters) f.animTime += dt;
      if (this.introTime > 1.05 && !this.fightAnnounced) {
        this.fightAnnounced = true;
        this.announce('FIGHT!', '', 'fight', 0.75);
        sound.play('bell');
        this.flash('#fff', 0.05);
      }
      if (this.introTime > 1.65) this.phase = 'fight';
      return;
    }

    if (this.phase === 'fight') {
      this.roundTime -= dt;
      if (this.mode === 'cpu') this.updateAI(dt);
      for (let i = 0; i < 2; i++) {
        const f = this.fighters[i];
        const o = this.fighters[1 - i];
        this.updateFighter(f, o, dt, true);
        this.separate(f, o);
      }
      updateEffects(this, dt);
      if (this.roundTime <= 0) {
        const r0 = this.fighters[0].hp / 100;
        const r1 = this.fighters[1].hp / 100;
        let winner = -1;
        if (r0 > r1 + 0.001) winner = 0;
        else if (r1 > r0 + 0.001) winner = 1;
        this.endRound(winner, 'time');
      }
      return;
    }

    if (this.phase === 'roundEnd') {
      this.roundEndTime += dt;
      for (let i = 0; i < 2; i++) {
        const f = this.fighters[i];
        const o = this.fighters[1 - i];
        this.updateFighter(f, o, dt, false);
      }
      updateEffects(this, dt);
      if (this.roundEndTime > 0.9 && this.roundWinner >= 0) {
        const w = this.fighters[this.roundWinner];
        if (!w.ko) { w.state = 'win'; w.win = true; }
      }
      if (this.roundEndTime > 2.55) this.resolveRound();
      return;
    }

    if (this.phase === 'matchEnd') {
      this.matchEndTime += dt;
      for (const f of this.fighters) f.animTime += dt;
      updateEffects(this, dt);
    }
  }

  resolveRound() {
    if (this.matchOver) {
      this.phase = 'matchEnd';
      const winner = this.roundWinner >= 0 ? this.roundWinner : (this.wins[0] >= this.wins[1] ? 0 : 1);
      if (this.roundWinner < 0) { /* draw edge case */ }
      this.fighters[winner].state = 'win';
      this.fighters[winner].win = true;
      sound.play(this.mode === 'cpu' && winner === 1 ? 'lose' : 'win');
      if (!this.matchSent) {
        this.matchSent = true;
        this.onMatchEnd({
          winnerSide: winner,
          winner: this.fighters[winner].char,
          loser: this.fighters[1 - winner].char,
          wins: [...this.wins],
          round: this.round,
          mode: this.mode,
        });
      }
      return;
    }
    this.round += 1;
    this.startRound(false);
  }

  endRound(winner, reason) {
    if (this.phase !== 'fight') return;
    this.phase = 'roundEnd';
    this.roundEndTime = 0;
    this.roundWinner = winner;
    if (winner >= 0) this.wins[winner] += 1;
    this.matchOver = this.wins[0] >= 2 || this.wins[1] >= 2;
    if (reason === 'time') {
      if (winner >= 0) {
        this.announce('TIME UP', `${this.fighters[winner].char.name} TAKES THE ROUND`, 'time', 1.9);
        sound.play('bell');
      } else {
        this.announce('DRAW', 'NOBODY WINS THIS ONE', 'draw', 1.9);
        sound.play('bell');
        this.round = Math.max(1, this.round - 1);
      }
    }
  }

  updateFighter(f, o, dt, allowInput) {
    f.animTime += dt;
    f.hitFlash = Math.max(0, f.hitFlash - dt * 5);
    f.displayHp += (f.hp - f.displayHp) * Math.min(1, dt * 5.5);
    if (Math.abs(f.displayHp - f.hp) < 0.15) f.displayHp = f.hp;
    f.cooldown = Math.max(0, f.cooldown - dt);
    f.invuln = Math.max(0, f.invuln - dt);
    f.comboTimer = Math.max(0, f.comboTimer - dt);
    if (f.comboTimer <= 0) f.combo = 0;
    for (const k of Object.keys(f.buffer)) f.buffer[k] = Math.max(0, f.buffer[k] - dt);

    if (f.ko) {
      this.physics(f, dt);
      f.vx *= 0.94;
      f.state = 'ko';
      return;
    }

    if (f.hitstun > 0) {
      f.hitstun -= dt;
      f.state = 'hit';
      this.physics(f, dt);
      f.vx *= 0.9;
      return;
    }

    if (f.attack) {
      f.attack.elapsed += dt;
      const at = f.attack;
      const activeStart = at.type === 'punch' ? 0.075 : 0.145;
      const activeEnd = at.type === 'punch' ? 0.19 : 0.3;
      if (!at.hit && at.elapsed >= activeStart && at.elapsed <= activeEnd) {
        this.checkAttack(f, o, at.type);
      }
      f.state = 'attack';
      this.physics(f, dt);
      f.vx *= f.grounded ? 0.82 : 0.99;
      if (at.elapsed >= at.dur) {
        f.attack = null;
        f.state = f.grounded ? 'idle' : 'jump';
        f.cooldown = 0.06;
      }
      if (allowInput) f.facing = o.x >= f.x ? 1 : -1;
      return;
    }

    if (f.special) {
      this.updateSpecial(f, o, dt);
      if (allowInput && !f.special) f.facing = o.x >= f.x ? 1 : -1;
      return;
    }

    if (f.state === 'win' && !allowInput) {
      this.physics(f, dt);
      return;
    }

    if (allowInput && this.phase === 'fight') {
      const canAct = f.hitstun <= 0;
      if (canAct && f.buffer.special > 0 && f.meter >= 50) {
        f.buffer.special = 0;
        this.startSpecial(f);
        return;
      }
      if (canAct && f.buffer.kick > 0) {
        f.buffer.kick = 0;
        this.startAttack(f, 'kick');
        return;
      }
      if (canAct && f.buffer.punch > 0) {
        f.buffer.punch = 0;
        this.startAttack(f, 'punch');
        return;
      }
      if (canAct && f.buffer.jump > 0 && f.grounded) {
        f.buffer.jump = 0;
        this.jump(f);
      }
    }

    if (allowInput) {
      const held = this.getHeld(f.side);
      const axis = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      f.blocking = held.down && f.grounded;
      if (f.blocking) {
        f.vx *= 0.6;
        f.state = 'block';
      } else if (axis !== 0) {
        if (f.grounded) {
          f.vx = axis * f.speed;
          f.state = 'walk';
        } else {
          f.vx = clamp(f.vx + axis * 500 * dt, -f.speed * 1.15, f.speed * 1.15);
        }
      } else {
        f.vx *= f.grounded ? 0.72 : 1;
        if (f.grounded) f.state = 'idle';
      }
      f.facing = o.x >= f.x ? 1 : -1;
    } else {
      f.blocking = false;
      f.vx *= 0.85;
      if (f.grounded && f.state !== 'win') f.state = 'idle';
    }

    this.physics(f, dt);
  }

  physics(f, dt) {
    if (f.grounded && f.y === GROUND_Y) f.vy = 0;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    if (!f.grounded || f.y < GROUND_Y) {
      f.vy += GRAVITY * dt;
      f.grounded = false;
    }
    if (f.y >= GROUND_Y) {
      f.y = GROUND_Y;
      f.vy = 0;
      if (!f.grounded) {
        f.grounded = true;
        if (f.state === 'jump') f.state = 'idle';
      }
    }
    f.x = clamp(f.x, 60, this.w - 60);
  }

  updateSpecial(f, o, dt) {
    const sp = f.special;
    sp.elapsed += dt;
    const char = f.char;
    if (sp.type === 'dash') {
      if (!sp.dashStarted && sp.elapsed > 0.15) {
        sp.dashStarted = true;
        f.dash = { time: 0.34, hit: false };
        f.vx = f.facing * 670;
        this.shake(5, 0.15);
      }
      if (f.dash) {
        f.dash.time -= dt;
        f.vx = f.facing * (440 + 260 * Math.max(0, f.dash.time / 0.34));
        if (Math.random() < 0.7) {
          this.particles.push({
            x: f.x - f.facing * 10, y: f.y - Math.random() * 120 * char.scale,
            vx: -f.facing * 40, vy: -20 + Math.random() * 40,
            life: 0.25, maxLife: 0.25, size: 4 + Math.random() * 5,
            color: char.special.color, grav: 0, additive: true, shape: 'spark',
          });
        }
        if (!f.dash.hit) {
          const dist = Math.abs(o.x - f.x);
          if (!o.ko && dist < f.width + o.width + 34) {
            f.dash.hit = true;
            this.hitFighter(f.side, 1 - f.side, {
              damage: 16 * f.powerFactor, knockback: 480, vy: -140, hitstun: 0.6, type: 'special',
              contact: { x: (f.x + o.x) / 2, y: o.y - 100 * o.char.scale },
              color: char.special.color,
            });
          }
        }
        if (f.dash.time <= 0) f.dash = null;
      }
    } else if (sp.type === 'projectile') {
      if (!sp.fired && sp.elapsed > 0.24) {
        sp.fired = true;
        spawnProjectile(this, f.side);
      }
    } else if (sp.type === 'beam') {
      if (!sp.fired && sp.elapsed > 0.26) {
        sp.fired = true;
        spawnBeam(this, f.side);
      }
    } else if (sp.type === 'slam') {
      if (!sp.fired && sp.elapsed > 0.34) {
        sp.fired = true;
        spawnShockwave(this, f.side);
      }
    }
    this.physics(f, dt);
    if (sp.elapsed >= sp.dur) {
      f.special = null;
      f.dash = null;
      f.state = f.grounded ? 'idle' : 'jump';
      f.cooldown = 0.15;
    }
  }

  checkAttack(f, o, type) {
    if (o.ko) return;
    const s = f.char.scale;
    const fat = f.char.fat || 0;
    const reach = f.char.stats.reach;
    const range = type === 'punch' ? (54 + reach * 6 + fat * 8) * s : (74 + reach * 7 + fat * 6) * s;
    const dx = (o.x - f.x) * f.facing;
    if (dx < -12 || dx > range + o.width * 0.8) return;
    const hy = f.y - (type === 'punch' ? 102 : 76) * s;
    if (hy < o.y - o.height - 20 || hy > o.y + 10) return;
    f.attack.hit = true;
    const contact = {
      x: f.x + f.facing * Math.min(range * 0.9, dx + o.width * 0.4),
      y: type === 'punch' ? hy : f.y - 80 * s,
    };
    this.hitFighter(f.side, 1 - f.side, {
      damage: (type === 'punch' ? 5.6 : 8.6) * f.powerFactor,
      knockback: type === 'punch' ? 170 : 300,
      vy: type === 'kick' ? -130 : 0,
      hitstun: type === 'punch' ? 0.3 : 0.4,
      type,
      contact,
      color: type === 'punch' ? '#ffe6a8' : '#ffd45c',
    });
  }

  hitFighter(ai, di, spec) {
    const attacker = this.fighters[ai];
    const defender = this.fighters[di];
    if (defender.ko || this.phase !== 'fight') return;
    const blocked = defender.blocking && defender.hitstun <= 0;
    let dmg = spec.damage * (1 - (defender.char.stats.defense - 1) * 0.045);
    if (blocked) dmg *= 0.18;
    if (!blocked && spec.type !== 'special' && attacker.combo > 0) {
      dmg *= Math.max(0.55, 1 - attacker.combo * 0.07);
    }
    defender.hp = Math.max(0, defender.hp - dmg);
    defender.hitFlash = 1;

    if (blocked) {
      defender.vx = attacker.facing * (spec.knockback || 180) * 0.32;
      defender.hitstun = 0.14;
      attacker.meter = Math.min(100, attacker.meter + 4);
      defender.meter = Math.min(100, defender.meter + 5);
      this.hitStop = 0.03;
      this.shake(2, 0.1);
      sound.play('block');
      this.burst(spec.contact.x, spec.contact.y, '#d6e4ff', 8, 3);
      this.addFloat('BLOCKED', spec.contact.x, spec.contact.y - 26, '#d6e4ff');
    } else {
      defender.hitstun = spec.hitstun || 0.3;
      defender.invuln = 0.05;
      defender.blocking = false;
      defender.state = 'hit';
      defender.vx = attacker.facing * (spec.knockback || 220) / defender.weight;
      if (spec.vy) { defender.vy = spec.vy; defender.grounded = false; }
      attacker.combo += 1;
      attacker.comboTimer = 1.3;
      attacker.meter = Math.min(100, attacker.meter + 9);
      defender.meter = Math.min(100, defender.meter + 7);
      this.hitStop = spec.type === 'special' ? 0.09 : 0.05;
      this.shake(spec.type === 'special' ? 9 : 5, 0.18);
      sound.play(spec.type === 'special' ? 'heavy' : 'hit');
      this.burst(spec.contact.x, spec.contact.y, spec.color || '#ffd45c', spec.type === 'special' ? 26 : 14, spec.type === 'special' ? 6 : 4);
      if (spec.type === 'special') this.flash(spec.color || '#fff', 0.13);
      if (defender.hp <= 0) this.onKO(attacker, defender);
    }
  }

  onKO(attacker, defender) {
    defender.ko = true;
    defender.hp = 0;
    defender.state = 'ko';
    defender.hitstun = 0;
    defender.vy = -380;
    defender.vx = attacker.facing * 280;
    defender.grounded = false;
    this.hitStop = 0.16;
    this.shake(24, 0.55);
    this.flash('#ffffff', 0.36);
    sound.play('ko');
    this.burst(defender.x, defender.y - 120 * defender.char.scale, '#e12828', 40, 7);
    this.burst(defender.x, defender.y - 100 * defender.char.scale, '#ffd45c', 24, 5);
    this.announce('K.O.', `${defender.char.name} IS DOWN`, 'ko', 2.1);
    this.endRound(attacker.side, 'ko');
  }

  separate(a, b) {
    if (a.ko && b.ko) return;
    const min = a.width + b.width + 6;
    const dx = b.x - a.x;
    if (Math.abs(dx) < min) {
      const push = (min - Math.abs(dx)) / 2;
      const dir = Math.sign(dx) || 1;
      a.x = clamp(a.x - dir * push, 60, this.w - 60);
      b.x = clamp(b.x + dir * push, 60, this.w - 60);
    }
  }

  getHeld(side) {
    if (side === 1 && this.mode === 'cpu') return this.aiHeld;
    return this.held[side];
  }

  updateAI(dt) {
    const f = this.fighters[1];
    const o = this.fighters[0];
    if (f.ko) return;
    const cfg = DIFFICULTY[this.difficulty] || DIFFICULTY.normal;
    const ai = this.ai;
    ai.timer -= dt;
    ai.cool = Math.max(0, ai.cool - dt);
    ai.blockTimer = Math.max(0, ai.blockTimer - dt);

    if ((o.attack || o.special) && ai.blockTimer <= 0) {
      const dist = Math.abs(o.x - f.x);
      if (dist < 230 && Math.random() < cfg.block * dt * 10) {
        ai.blockTimer = 0.34 + Math.random() * 0.25;
      }
    }
    this.aiHeld.down = ai.blockTimer > 0;

    if (ai.timer <= 0) {
      ai.timer = cfg.think * (0.65 + Math.random() * 0.7);
      this.aiHeld.left = false;
      this.aiHeld.right = false;
      const dx = o.x - f.x;
      const dist = Math.abs(dx);
      const dir = Math.sign(dx) || 1;
      const specialRange = f.char.special.type === 'dash' || f.char.special.type === 'slam' ? 260 : 980;
      const atkRange = 70 + f.char.stats.reach * 22 + f.char.scale * 18;

      if (ai.cool <= 0 && f.meter >= 50 && dist < specialRange && Math.random() < cfg.special) {
        this.pressAction(1, 'special');
        ai.cool = 0.9;
      } else if (ai.cool <= 0 && dist < atkRange && Math.random() < cfg.aggr) {
        this.pressAction(1, dist > atkRange * 0.7 ? 'kick' : (Math.random() < 0.58 ? 'punch' : 'kick'));
        ai.cool = 0.26 + Math.random() * 0.45;
      } else if (dist > 150) {
        if (dir > 0) this.aiHeld.right = true;
        else this.aiHeld.left = true;
        if (Math.random() < cfg.jump && f.grounded && dist < 340) this.pressAction(1, 'jump');
      } else if (dist < 62 && Math.random() < 0.34) {
        if (dir > 0) this.aiHeld.left = true;
        else this.aiHeld.right = true;
      }
    }
    if (f.x < 100) this.aiHeld.left = false;
    if (f.x > this.w - 100) this.aiHeld.right = false;
    if (f.blocking) {
      if (ai.blockTimer > 0) this.aiHeld.down = true;
      else this.aiHeld.down = false;
    }
  }

  draw(ts) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    let ox = 0, oy = 0;
    if (this.shakeTime > 0) {
      const m = this.shakeMag * Math.max(0, this.shakeTime / 0.3);
      ox = (Math.random() - 0.5) * m;
      oy = (Math.random() - 0.5) * m;
    }
    ctx.save();
    ctx.translate(ox, oy);
    drawStage(ctx, this.stage.id, W, H, this.time);

    const order = this.fighters[0].attack || this.fighters[0].special ? [1, 0] : [0, 1];
    for (const i of order) {
      const f = this.fighters[i];
      drawFighterShadow(ctx, f.char, f.x, GROUND_Y, 1, f.ko ? 0.2 : 0.42);
    }
    for (const i of order) {
      const f = this.fighters[i];
      this.drawFighter(ctx, f);
    }
    drawEffects(ctx, this, this.time);
    ctx.restore();

    drawFlash(ctx, this);
    drawVignette(ctx, W, H);
    drawHud(ctx, this);

    if (this.phase === 'intro') {
      const names = `${this.p1char.name}  VS  ${this.p2char.name}`;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.font = '900 15px Anton, Impact, "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e8dfcc';
      ctx.fillText(names, W / 2, 560);
      ctx.restore();
    }
  }

  drawFighter(ctx, f) {
    let pose = 'idle';
    let progress = 0;
    if (f.ko) pose = 'ko';
    else if (f.attack) { pose = f.attack.type; progress = f.attack.elapsed / f.attack.dur; }
    else if (f.special) { pose = 'special'; progress = f.special.elapsed / f.special.dur; }
    else if (f.hitstun > 0) pose = 'hit';
    else if (f.state === 'block') pose = 'block';
    else if (f.state === 'walk') pose = 'walk';
    else if (f.state === 'win') pose = 'win';
    else if (!f.grounded) pose = 'jump';
    drawFighter(ctx, f.char, {
      x: f.x, y: f.y, facing: f.facing, pose, progress,
      time: f.animTime, flash: f.hitFlash, alpha: 1,
    });
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this._keydown);
    window.removeEventListener('keyup', this._keyup);
    window.removeEventListener('blur', this._blur);
    document.removeEventListener('visibilitychange', this._vis);
    this.matchSent = true;
  }
}

export { W as GAME_W, H as GAME_H, GROUND_Y };

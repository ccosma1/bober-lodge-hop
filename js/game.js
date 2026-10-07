/* Bober Burrow Hop lh12 — original bank hop. No borrowed characters or tunes. */
const BUILD = 'lh12';
const TILE = 32;
let VIEW_W = 224;
let VIEW_H = 360;
let pixelScale = 2;
let animT = 0;
let panelReturn = 'title';
let storyIndex = 0;
const STEP = 1 / 60;
const GRAV = 2100;
const JUMP_V = -680;
const JUMP_CUT = -280;
const RUN = 176;
const ACC = 1280;
const FRIC = 1700;
const MAX_FALL = 860;
const SAVE_KEY = 'bober-lodge-hop-v1';
const SOLID = new Set(['#', 'B', '?', '!', 'S', 'u', 'X']);

const THEMES = {
  bank: { sky: ['#8fd4f8', '#e7f7ff'], hill: '#67b85a', hill2: '#3e8f4a', water: '#3aa0c8', night: false, tree: 'pine' },
  mill: { sky: ['#f2c48a', '#f8e2c4'], hill: '#c4845a', hill2: '#8a5a3a', water: '#3a88a8', night: false, tree: 'pine' },
  spill: { sky: ['#7ec8d4', '#d7f4ef'], hill: '#3e8f78', hill2: '#1f6a62', water: '#1a7e96', night: false, tree: 'pine' },
  night: { sky: ['#14243c', '#3d5c7a'], hill: '#1b3a38', hill2: '#122828', water: '#14384a', night: true, tree: 'pine' },
  cedar: { sky: ['#6ea8c4', '#d5ead0'], hill: '#2f6a48', hill2: '#1d4a34', water: '#2a7a78', night: false, tree: 'cedar' },
  reed: { sky: ['#9fd4c8', '#e7f6ea'], hill: '#3e8f55', hill2: '#2a6a40', water: '#3aa0c8', night: false, tree: 'reed' },
  kiln: { sky: ['#e7b07a', '#f6ddb8'], hill: '#a86848', hill2: '#6a4030', water: '#3a88a8', night: false, tree: 'pine' },
  rope: { sky: ['#e7b07a', '#f8e6c8'], hill: '#8a5a3a', hill2: '#5c3a2a', water: '#2a6a78', night: false, tree: 'pine' },
  frost: { sky: ['#c5dff2', '#f4f7fb'], hill: '#d5e4ee', hill2: '#8fb4c8', water: '#7eb6d4', night: false, tree: 'frost', snow: true },
  dam: { sky: ['#e39b78', '#f6d2b4'], hill: '#8a4030', hill2: '#5c2a22', water: '#2a6890', night: false, tree: 'cedar' },
  source: { sky: ['#f2c48a', '#8fd4f8'], hill: '#2f6a48', hill2: '#1a3a28', water: '#3aa0c8', night: false, tree: 'pine' },
  burrow: { sky: ['#2a2118', '#5a4030'], hill: '#3a2a1c', hill2: '#24180f', water: '#1d3a38', night: false, tree: 'pine', burrow: true }
};

const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d');

const ART = {};
const FOOT = {
  bober: 0.629, cap: 0.629, sap: 0.629, kit: 0.594, duck: 0.417, lockjaw: 0.522,
  leaper: 0.329, goose: 0.409, nipper: 0.601, icer: 0.541, mason: 0.600
};
// Tail strip ends before the rump, the hat, or the back. hipX/hipY are the joint.
const RIG = {
  bober: { cut: 0.442, hipX: 0.448, hipY: 0.855 },
  sap: { cut: 0.442, hipX: 0.448, hipY: 0.855 },
  cap: { cut: 0.422, hipX: 0.424, hipY: 0.871 },
  kit: { cut: 0.302, hipX: 0.306, hipY: 0.748 },
  lockjaw: { cut: 0.302, hipX: 0.306, hipY: 0.845 },
  mason: { cut: 0.302, hipX: 0.306, hipY: 0.749 }
};
// Drop the painted bubble so the live bubble is the one that grows and leaves.
const TRIM = { duck: 0.70, goose: 0.70 };
// Head strip ends in the neck, so a nod does not swing the feet.
const NECK = {
  duck: { cut: 0.37, hx: 0.48, hy: 0.36 },
  goose: { cut: 0.47, hx: 0.48, hy: 0.45 }
};

function loadArt() {
  ['bober', 'cap', 'sap', 'kit', 'loghead', 'duck', 'lockjaw', 'pine', 'acorn', 'bell', 'grass', 'brick', 'bark',
    'leaper', 'goose', 'nipper', 'tumbler', 'icer', 'mason', 'cedar', 'reed', 'frost'].forEach((name) => {
    const img = new Image();
    img.src = 'assets/sprites/' + name + '.png?v=' + BUILD;
    ART[name] = img;
  });
}

function artReady(img) {
  return !!(img && img.complete && img.naturalWidth > 0);
}

function drawSlice(img, fx0, fx1, fy0, fy1, foot, dw, dh) {
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  const sx = Math.max(0, Math.round(fx0 * sw));
  const ex = Math.min(sw, Math.round(fx1 * sw));
  const sy = Math.max(0, Math.round(fy0 * sh));
  const ey = Math.min(sh, Math.round(fy1 * sh));
  const sww = Math.max(1, ex - sx);
  const shh = Math.max(1, ey - sy);
  ctx.drawImage(img, sx, sy, sww, shh, (sx / sw - foot) * dw, (sy / sh) * dh - dh, (sww / sw) * dw, (shh / sh) * dh);
}

function blit(name, cx, footY, dw, dh, face, squash, motion) {
  const img = ART[name];
  if (!artReady(img)) return false;
  const foot = FOOT[name] || 0.5;
  const m = motion || {};
  const lift = Math.max(0, -(m.bob || 0));
  const shadow = Math.max(0.42, 1 - lift / 10);
  const rig = RIG[name];
  const trim = TRIM[name];
  // Poses store a lift as a negative angle. After the facing flip, the
  // image-left tail only rises when the rotation matches the facing.
  let tail = -(m.tail || 0);
  if (tail > 0.55) tail = 0.55;
  if (tail < -0.05) tail = -0.05;
  ctx.save();
  ctx.translate(cx, footY);
  ctx.fillStyle = 'rgba(26,16,40,' + (0.16 * shadow) + ')';
  ctx.beginPath();
  ctx.ellipse(0, -1, Math.min(12, dw * 0.18) * shadow, 2.2 * shadow, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(m.sway || 0, m.bob || 0);
  ctx.rotate(m.lean || 0);
  ctx.scale(face || 1, 1);
  ctx.rotate(m.pitch || 0);
  const s = squash || 0;
  ctx.scale(1 + s * 0.35, 1 - s * 0.22);
  const neck = NECK[name];
  if (rig) {
    const hx = (rig.hipX - foot) * dw;
    const hy = (rig.hipY - 1) * dh;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(tail * (face || 1));
    ctx.translate(-hx, -hy);
    drawSlice(img, 0, rig.cut + 0.004, 0, 1, foot, dw, dh);
    ctx.restore();
    drawSlice(img, rig.cut - 0.018, trim || 1, 0, 1, foot, dw, dh);
  } else if (neck) {
    const ang = m.neck || 0;
    const nx = (neck.hx - foot) * dw;
    const ny = (neck.hy - 1) * dh;
    drawSlice(img, 0, trim || 1, neck.cut - 0.02, 1, foot, dw, dh);
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(ang * (face || 1));
    ctx.translate(-nx, -ny);
    drawSlice(img, 0, trim || 1, 0, neck.cut + 0.02, foot, dw, dh);
    ctx.restore();
  } else {
    drawSlice(img, 0, trim || 1, 0, 1, foot, dw, dh);
  }
  ctx.restore();
  return true;
}

function beaverPose(p) {
  const face = p.face || 1;
  const moving = p.grounded && Math.abs(p.vx) > 20;
  let bob = 0;
  let sway = 0;
  let lean = (p.pose || 0) * 0.07;
  let squash = 0;
  let pitch = 0;
  let tail = -0.08;
  if (!p.grounded) {
    if (p.vy < -220) {
      bob = -1.2;
      squash = -0.14;
      pitch = -0.045;
      tail = -0.34;
    } else if (p.vy < 50) {
      squash = -0.04;
      pitch = -0.012;
      tail = -0.14;
    } else {
      squash = 0.06;
      pitch = 0.03;
      tail = -0.06;
    }
    sway = (p.pose || 0) * 0.45;
  } else if (moving) {
    const u = Math.sin(p.run);
    const lift = Math.pow(Math.max(0, -u), 1.15);
    bob = -lift * 4.6;
    sway = Math.sin(p.run * 2) * 1.05;
    squash = (1 - lift) * 0.08 - lift * 0.07;
    pitch = u * 0.028;
    tail = -0.02 - lift * 0.42;
    lean += face * lift * 0.02;
  } else {
    const breath = Math.sin(animT * 2.1);
    bob = -Math.max(0, breath) * 1.1;
    sway = Math.sin(animT * 1.15) * 0.35;
    squash = Math.max(0, breath) * 0.03;
    pitch = breath * 0.01;
    tail = -0.1 + Math.sin(animT * 1.45) * 0.16;
  }
  if (p.grounded && p.squash > 0.02) {
    squash = p.squash;
    pitch += 0.04;
    tail = Math.min(tail, -0.16);
  }
  return { bob: bob, sway: sway, lean: lean, squash: squash, pitch: pitch, tail: tail };
}

function layoutView() {
  const rect = document.getElementById('stage').getBoundingClientRect();
  const w = rect.width || 390;
  const h = rect.height || 520;
  const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 2));
  const nextW = 224;
  const nextH = Math.max(240, Math.round(nextW * (h / Math.max(1, w))));
  const bw = Math.max(2, Math.round(w * dpr));
  const bh = Math.max(2, Math.round(h * dpr));
  if (nextW === VIEW_W && nextH === VIEW_H && canvas.width === bw && canvas.height === bh) return;
  VIEW_W = nextW;
  VIEW_H = nextH;
  canvas.width = bw;
  canvas.height = bh;
  pixelScale = bw / VIEW_W;
}

const held = { left: false, right: false, jump: false, spit: false, down: false };
const pressed = { jump: false, spit: false };
let lastDir = 1;
let dirGrace = 0;
let audioCtx = null;
let soundOn = true;
let save = { v: 1, unlocked: 0, cleared: {}, bank: 0, sound: true };
let live = null;
let paused = false;
let latch = '';
let lastT = 0;
let acc = 0;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function themeFor(def) {
  if (def.theme && THEMES[def.theme]) return THEMES[def.theme];
  if (def.id === '3-2') return THEMES.night;
  if (def.id === '3-1') return THEMES.spill;
  if (def.world === 2) return THEMES.mill;
  return THEMES.bank;
}

function hostileShot(s) {
  return s.from === 'duck' || s.from === 'goose' || s.from === 'mason';
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return;
    save = {
      v: 1,
      unlocked: data.unlocked | 0,
      cleared: data.cleared || {},
      bank: data.bank | 0,
      sound: data.sound !== false
    };
  } catch (err) { /* keep defaults */ }
  soundOn = save.sound;
}

function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (err) { /* private mode */ }
}

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function tone(freq, dur, type, vol, slide) {
  if (!soundOn || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function sfxJump() { tone(520, 0.08, 'square', 0.04, 760); }
function sfxCoin() { tone(880, 0.07, 'square', 0.045, 1320); }
function sfxStomp() { tone(200, 0.08, 'square', 0.05, 90); }
function sfxHurt() { tone(220, 0.14, 'sawtooth', 0.04, 80); }
function sfxBreak() { tone(160, 0.07, 'square', 0.05, 70); }
function sfxBubble() { tone(680, 0.06, 'sine', 0.035, 920); }

function sfxBell() {
  tone(523, 0.18, 'sine', 0.06, 523);
  setTimeout(() => tone(659, 0.2, 'sine', 0.05, 784), 120);
}

function tileAt(state, tx, ty) {
  if (ty < 0) return '.';
  if (ty >= state.h) return '.';
  if (tx < 0 || tx >= state.w) return '#';
  return state.rows[ty][tx];
}

function rectTiles(x, y, w, h) {
  const list = [];
  const x0 = Math.floor(x / TILE);
  const y0 = Math.floor(y / TILE);
  const x1 = Math.floor((x + w - 0.001) / TILE);
  const y1 = Math.floor((y + h - 0.001) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) list.push([tx, ty]);
  }
  return list;
}

function isSolidPoint(state, x, y) {
  return SOLID.has(tileAt(state, Math.floor(x / TILE), Math.floor(y / TILE)));
}

function hasSupport(state, x, y) {
  const tx = Math.floor(x / TILE);
  const ty = Math.floor(y / TILE);
  const t = tileAt(state, tx, ty);
  if (SOLID.has(t) || t === '=') return true;
  for (let i = 0; i < state.logs.length; i++) {
    const log = state.logs[i];
    if (x >= log.x && x <= log.x + log.w && y >= log.y - 2 && y <= log.y + log.h + 10) return true;
  }
  return false;
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function resolveX(state, body) {
  let hit = false;
  for (let pass = 0; pass < 4; pass++) {
    let found = false;
    const tiles = rectTiles(body.x, body.y, body.w, body.h);
    for (let i = 0; i < tiles.length; i++) {
      const tx = tiles[i][0];
      const ty = tiles[i][1];
      if (!SOLID.has(tileAt(state, tx, ty))) continue;
      const left = tx * TILE;
      const right = left + TILE;
      const penL = body.x + body.w - left;
      const penR = right - body.x;
      if (penL < penR) body.x = left - body.w;
      else body.x = right;
      body.vx = 0;
      hit = true;
      found = true;
      break;
    }
    if (!found) break;
  }
  return hit;
}

function resolveY(state, body, vy) {
  let grounded = false;
  let ceiling = null;
  const prevBottom = body.y + body.h - vy * STEP;
  for (let pass = 0; pass < 4; pass++) {
    let found = false;
    const tiles = rectTiles(body.x, body.y, body.w, body.h);
    for (let i = 0; i < tiles.length; i++) {
      const tx = tiles[i][0];
      const ty = tiles[i][1];
      const t = tileAt(state, tx, ty);
      const top = ty * TILE;
      const bottom = top + TILE;
      if (SOLID.has(t)) {
        const penTop = body.y + body.h - top;
        const penBot = bottom - body.y;
        if (penTop < penBot) {
          body.y = top - body.h;
          body.vy = 0;
          grounded = true;
        } else {
          body.y = bottom;
          body.vy = 0;
          ceiling = { tx: tx, ty: ty };
        }
        found = true;
        break;
      }
      if (t === '=' && vy >= 0 && prevBottom <= top + 10 && body.y + body.h >= top) {
        body.y = top - body.h;
        body.vy = 0;
        grounded = true;
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  return { grounded: grounded, ceiling: ceiling };
}

function makePlayer(x, foot) {
  const h = 28;
  return {
    x: x, y: foot - h, w: 20, h: h,
    vx: 0, vy: 0, face: 1, form: 'small',
    grounded: false, coyote: 0, buffer: 0, invuln: 0,
    run: 0, squash: 0, pose: 0, ride: -1, prevBottom: foot,
    falling: false, spitCool: 0, wasGround: false, hop: 0, dustMark: -1, stones: 0
  };
}

function makeEnemy(kind, x, foot) {
  const spec = {
    kit: { w: 26, h: 26, speed: 46 },
    roller: { w: 30, h: 26, speed: 40 },
    duck: { w: 30, h: 28, speed: 0 },
    leaper: { w: 26, h: 26, speed: 62 },
    goose: { w: 34, h: 34, speed: 0 },
    nipper: { w: 26, h: 24, speed: 78 },
    tumbler: { w: 30, h: 26, speed: 36 },
    icer: { w: 26, h: 24, speed: 90 },
    mason: { w: 28, h: 28, speed: 0 },
    grub: { w: 30, h: 16, speed: 34 },
    drip: { w: 22, h: 18, speed: 0 },
    boss: { w: 52, h: 56, speed: 52 }
  }[kind];
  const still = kind === 'duck' || kind === 'goose' || kind === 'mason';
  let cool = 1.6;
  if (kind === 'duck') cool = 1.4;
  else if (kind === 'goose') cool = 0.9;
  else if (kind === 'mason') cool = 1.3;
  else if (kind === 'leaper') cool = 0.7;
  return {
    kind: kind,
    x: x,
    y: foot - spec.h,
    w: spec.w,
    h: spec.h,
    vx: still ? 0 : spec.speed,
    vy: 0,
    speed: spec.speed,
    face: still ? -1 : 1,
    alive: true,
    state: 'walk',
    hp: kind === 'boss' ? 3 : 1,
    maxHp: kind === 'boss' ? 3 : 1,
    cool: cool,
    arm: 0,
    hopV: -380,
    hopEvery: 2.6,
    invuln: 0,
    grounded: false
  };
}

function createState(id, opts) {
  const options = opts || {};
  const def = LEVELS.find((lv) => lv.id === id);
  if (!def) throw new Error('missing ' + id);
  const rows = def.rows.map((row) => row.split(''));
  const enemies = [];
  const logs = [];
  const items = [];
  let player = null;
  let pole = null;
  for (let y = 0; y < def.h; y++) {
    for (let x = 0; x < def.w; x++) {
      const c = rows[y][x];
      const px = x * TILE;
      const foot = (y + 1) * TILE;
      if (c === 'P') {
        player = makePlayer(px + 4, foot);
        rows[y][x] = '.';
      } else if (c === 'K') {
        enemies.push(makeEnemy('kit', px + 3, foot));
        rows[y][x] = '.';
      } else if (c === 'R') {
        enemies.push(makeEnemy('roller', px + 1, foot));
        rows[y][x] = '.';
      } else if (c === 'D') {
        enemies.push(makeEnemy('duck', px + 1, foot));
        rows[y][x] = '.';
      } else if (c === 'L') {
        enemies.push(makeEnemy('leaper', px + 3, foot));
        rows[y][x] = '.';
      } else if (c === 'G') {
        enemies.push(makeEnemy('goose', px + 1, foot));
        rows[y][x] = '.';
      } else if (c === 'N') {
        enemies.push(makeEnemy('nipper', px + 2, foot));
        rows[y][x] = '.';
      } else if (c === 'T') {
        enemies.push(makeEnemy('tumbler', px + 1, foot));
        rows[y][x] = '.';
      } else if (c === 'I') {
        enemies.push(makeEnemy('icer', px + 1, foot));
        rows[y][x] = '.';
      } else if (c === 'Q') {
        enemies.push(makeEnemy('mason', px + 1, foot));
        rows[y][x] = '.';
      } else if (c === 'U') {
        enemies.push(makeEnemy('grub', px + 1, foot));
        rows[y][x] = '.';
      } else if (c === 'V') {
        const drip = makeEnemy('drip', px + 4, foot);
        drip.state = 'hang';
        drip.y = y * TILE + 2;
        drip.vx = 0;
        drip.vy = 0;
        enemies.push(drip);
        rows[y][x] = '.';
      } else if (c === 'J') {
        const boss = makeEnemy('boss', px - 10, foot);
        boss.hp = def.bossHp || 3;
        boss.maxHp = boss.hp;
        if (def.bossSpeed) {
          boss.speed = def.bossSpeed;
          boss.vx = def.bossSpeed;
        }
        if (def.bossHop) boss.hopV = def.bossHop;
        if (def.bossEvery) boss.hopEvery = def.bossEvery;
        enemies.push(boss);
        rows[y][x] = '.';
      } else if (c === 'F') {
        pole = { x: px + 4, y: foot - TILE * 5, w: 24, h: TILE * 5 };
        rows[y][x] = '.';
      } else if (c === 'M') {
        logs.push({
          id: logs.length,
          x: px, y: pyTop(y),
          w: TILE * 5, h: 16,
          baseX: px, baseY: pyTop(y),
          amp: TILE * 2,
          t: 0, dx: 0
        });
        rows[y][x] = '.';
      } else if (c === 'H' || c === 'A') {
        items.push({
          kind: c === 'H' ? 'cap' : 'sap',
          x: px + 7, y: foot - 18, w: 18, h: 16,
          vx: 0, vy: 0, still: true, dead: false
        });
        rows[y][x] = '.';
      }
    }
  }
  if (!player) throw new Error('no player ' + id);
  const state = {
    def: def,
    rows: rows,
    w: def.w,
    h: def.h,
    player: player,
    enemies: enemies,
    logs: logs,
    items: items,
    shots: [],
    parts: [],
    bumps: {},
    pole: pole,
    mode: 'play',
    clock: def.time,
    lives: options.lives != null ? options.lives : 5,
    acorns: options.acorns != null ? options.acorns : (options.sim ? 0 : save.bank),
    bannerT: 2.5,
    sim: !!options.sim,
    bot: !!options.bot,
    botJump: 0,
    botStill: 0,
    botX: player.x,
    camX: 0,
    camY: 0,
    shake: 0,
    dieT: 0,
    clearT: 0,
    theme: themeFor(def)
  };
  updateCamera(state, true);
  return state;
}

function pyTop(y) { return y * TILE; }

function grant(state, n) {
  state.acorns += n;
  sfxCoin();
  burst(state, state.player.x + 8, state.player.y, '#f2c14e', 4);
}

function burst(state, x, y, color, n) {
  for (let i = 0; i < n; i++) {
    state.parts.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 180,
      vy: -60 - Math.random() * 140,
      life: 0.35 + Math.random() * 0.25,
      color: color,
      r: 2 + Math.random() * 2
    });
  }
}

function solidOverlap(state, x, y, w, h) {
  const tiles = rectTiles(x, y, w, Math.max(1, h - 0.5));
  for (let i = 0; i < tiles.length; i++) {
    if (SOLID.has(tileAt(state, tiles[i][0], tiles[i][1]))) return true;
  }
  return false;
}

function setForm(state, form) {
  const p = state.player;
  const foot = p.y + p.h;
  const h = form === 'small' ? 28 : 44;
  const w = form === 'small' ? 20 : 24;
  if (h > p.h && solidOverlap(state, p.x, foot - h, w, h)) {
    grant(state, 8);
    return;
  }
  p.form = form;
  p.h = h;
  p.w = w;
  p.y = foot - h;
  burst(state, p.x + w / 2, foot - h / 2, form === 'sap' ? '#7dce6a' : '#f2c14e', 8);
}

function kill(state) {
  if (state.mode !== 'play') return;
  state.mode = 'dying';
  state.dieT = 0.75;
  state.lives -= 1;
  state.player.vy = -380;
  state.player.vx = 0;
  state.player.ride = -1;
  sfxHurt();
}

function hurt(state) {
  const p = state.player;
  if (p.invuln > 0 || state.mode !== 'play') return;
  if (p.form === 'sap') setForm(state, 'cap');
  else if (p.form === 'cap') setForm(state, 'small');
  else { kill(state); return; }
  p.invuln = 1.35;
  p.vy = -320;
  p.vx = -p.face * 140;
  p.grounded = false;
  p.ride = -1;
  state.shake = 0.16;
  sfxHurt();
}

function beginClear(state) {
  if (state.mode !== 'play') return;
  state.mode = 'clearing';
  state.clearT = 1.05;
  state.player.vx = 0;
  state.player.ride = -1;
  sfxBell();
}

function tryHit(state, tx, ty) {
  if (ty < 0 || ty >= state.h || tx < 0 || tx >= state.w) return;
  const t = state.rows[ty][tx];
  const key = tx + ',' + ty;
  if (t !== 'B' && t !== '?' && t !== '!' && t !== 'S') return;
  state.bumps[key] = 0.14;
  const p = state.player;
  if (t === 'B') {
    if (p.form === 'small') return;
    state.rows[ty][tx] = '.';
    burst(state, tx * TILE + 16, ty * TILE + 16, '#c46a45', 8);
    sfxBreak();
    return;
  }
  state.rows[ty][tx] = 'u';
  if (t === '?') {
    grant(state, 1);
    return;
  }
  if (t === '!') {
    if (p.form === 'small') spawnItem(state, 'cap', tx, ty);
    else grant(state, 8);
    return;
  }
  if (p.form !== 'sap') spawnItem(state, 'sap', tx, ty);
  else grant(state, 8);
}

function spawnItem(state, kind, tx, ty) {
  state.items.push({
    kind: kind,
    x: tx * TILE + 7,
    y: ty * TILE - 18,
    w: 18, h: 16,
    vx: 55, vy: -30,
    still: false, dead: false
  });
}

function breakCrate(state, tx, ty) {
  if (ty < 0 || tx < 0 || ty >= state.h || tx >= state.w) return;
  if (state.rows[ty][tx] !== 'X') return;
  state.rows[ty][tx] = '.';
  const drop = (state.def.drops && state.def.drops[tx + ',' + ty]) || 'stone';
  burst(state, tx * TILE + 16, ty * TILE + 16, '#c4a574', 8);
  sfxBreak();
  if (drop === 'life') {
    state.lives = Math.min(9, state.lives + 1);
    burst(state, tx * TILE + 16, ty * TILE, '#f2c14e', 6);
    return;
  }
  if (drop === 'coin') {
    grant(state, 8);
    return;
  }
  spawnItem(state, drop, tx, ty);
}

function doSpit(state) {
  const p = state.player;
  if (p.spitCool > 0) return;
  if ((p.stones || 0) > 0) {
    p.stones -= 1;
    p.spitCool = 0.42;
    state.shots.push({
      x: p.face > 0 ? p.x + p.w - 2 : p.x - 14,
      y: p.y + 10,
      w: 14, h: 14,
      vx: p.face * 230,
      vy: -30,
      life: 0.85,
      from: 'stone',
      dead: false
    });
    tone(180, 0.06, 'square', 0.04, 90);
    return;
  }
  if (p.form !== 'sap') return;
  p.spitCool = 0.32;
  state.shots.push({
    x: p.face > 0 ? p.x + p.w : p.x - 12,
    y: p.y + 8,
    w: 12, h: 12,
    vx: p.face * 280,
    vy: 0,
    life: 0.55,
    from: 'player',
    dead: false
  });
  tone(640, 0.05, 'square', 0.03, 420);
}

function stepLogs(state) {
  for (let i = 0; i < state.logs.length; i++) {
    const log = state.logs[i];
    log.t += STEP;
    const nx = log.baseX + Math.sin(log.t * 0.85) * log.amp;
    log.dx = nx - log.x;
    log.x = nx;
  }
}

function carryRide(state) {
  const p = state.player;
  if (p.ride < 0) return;
  const log = state.logs.find((item) => item.id === p.ride);
  if (!log) { p.ride = -1; return; }
  p.x += log.dx;
}

function rideLogs(state) {
  const p = state.player;
  if (p.vy < 0) { p.ride = -1; return; }
  let caught = -1;
  for (let i = 0; i < state.logs.length; i++) {
    const log = state.logs[i];
    const feet = p.y + p.h;
    const horiz = p.x + p.w > log.x + 6 && p.x < log.x + log.w - 6;
    if (horiz && feet >= log.y - 10 && feet <= log.y + 18) {
      p.y = log.y - p.h;
      p.vy = 0;
      p.grounded = true;
      p.coyote = 0.1;
      caught = log.id;
    }
  }
  p.ride = caught;
}

function stepPlayer(state, input) {
  const p = state.player;
  p.prevBottom = p.y + p.h;
  p.invuln = Math.max(0, p.invuln - STEP);
  p.spitCool = Math.max(0, p.spitCool - STEP);
  if (p.squash > 0) p.squash -= STEP;
  if (!p.grounded) p.coyote = Math.max(0, p.coyote - STEP);
  if (input.jumpPressed) p.buffer = 0.12;
  else p.buffer = Math.max(0, p.buffer - STEP);

  const accel = p.grounded ? ACC : ACC * 0.72;
  if (input.left) p.vx -= accel * STEP;
  else if (input.right) p.vx += accel * STEP;
  else if (p.grounded) {
    const s = Math.sign(p.vx);
    if (s !== 0) {
      p.vx -= s * FRIC * STEP;
      if (Math.sign(p.vx) !== s) p.vx = 0;
    }
  }
  p.vx = clamp(p.vx, -RUN, RUN);
  if (input.left && !input.right) p.face = -1;
  if (input.right && !input.left) p.face = 1;

  p.chain = Math.max(0, (p.chain || 0) - STEP);
  if (p.buffer > 0 && (p.grounded || p.coyote > 0)) {
    p.vy = JUMP_V;
    p.grounded = false;
    p.coyote = 0;
    p.buffer = 0;
    p.ride = -1;
    sfxJump();
  } else if (!input.jump && p.vy < JUMP_CUT) {
    p.vy = JUMP_CUT;
  }

  p.vy = Math.min(MAX_FALL, p.vy + GRAV * STEP);
  p.falling = p.vy > 60;
  p.x += p.vx * STEP;
  resolveX(state, p);
  const vy = p.vy;
  p.y += vy * STEP;
  const hit = resolveY(state, p, vy);
  if (hit.grounded) {
    if (!p.wasGround) p.squash = 0.22;
    p.grounded = true;
    p.coyote = 0.1;
  } else {
    if (p.grounded) p.coyote = 0.1;
    p.grounded = false;
  }
  p.wasGround = p.grounded;
  if (hit.ceiling) tryHit(state, hit.ceiling.tx, hit.ceiling.ty);
  if (p.grounded && Math.abs(p.vx) > 18) {
    p.run += Math.abs(p.vx) * STEP * (Math.PI * 2) / 70;
  }
  const aim = clamp(p.vx / RUN, -1, 1);
  p.pose += (aim - p.pose) * Math.min(1, STEP * 7);
  if (p.grounded && Math.abs(p.vx) > 50) {
    const mark = Math.floor(p.run / (Math.PI * 2));
    if (mark !== p.dustMark) {
      p.dustMark = mark;
      state.parts.push({
        x: p.x + p.w / 2,
        y: p.y + p.h,
        vx: -p.face * 28,
        vy: -26,
        life: 0.22,
        color: state.theme.snow ? '#f4f8fc' : '#c4a574',
        r: 2.2
      });
    }
  }
  if (input.spitPressed) doSpit(state);
}

function pushShot(state, e, speed, w, h, from, life) {
  state.shots.push({
    x: e.face < 0 ? e.x - w + 2 : e.x + e.w,
    y: e.y + 8,
    w: w,
    h: h,
    vx: (e.face || -1) * speed,
    vy: 0,
    life: life,
    from: from,
    dead: false
  });
}

function stepEnemy(state, e) {
  if (!e.alive) return;
  e.invuln = Math.max(0, e.invuln - STEP);
  if (e.kind === 'drip' && e.state === 'hang') {
    const dx = (state.player.x + state.player.w / 2) - (e.x + e.w / 2);
    if (Math.abs(dx) < 78 && state.player.y > e.y + 8) {
      e.state = 'fall';
      e.vy = 60;
    }
    return;
  }
  if (e.kind === 'duck' || e.kind === 'goose' || e.kind === 'mason') {
    e.cool -= STEP;
    if (e.cool <= 0) {
      if (e.kind === 'duck') {
        e.cool = 2.05;
        pushShot(state, e, 110, 12, 12, 'duck', 2.4);
        burst(state, e.x - 6, e.y + 4, '#e7f7ff', 5);
        sfxBubble();
      } else if (e.kind === 'goose') {
        e.cool = 1.45;
        pushShot(state, e, 128, 13, 13, 'goose', 2.0);
        burst(state, e.x - 8, e.y + 2, '#e7f7ff', 5);
        sfxBubble();
      } else {
        e.cool = 1.8;
        pushShot(state, e, 126, 14, 10, 'mason', 2.2);
        burst(state, e.x - 4, e.y + 8, '#c46a45', 4);
      }
    }
    return;
  }
  if (e.kind === 'boss' && e.grounded) {
    e.cool -= STEP;
    if (e.cool <= 0) {
      e.vy = e.hopV || -380;
      e.grounded = false;
      e.cool = e.hopEvery || 2.6;
    }
  }
  if (e.kind === 'nipper') {
    const dx = (state.player.x + state.player.w / 2) - (e.x + e.w / 2);
    if (Math.abs(dx) < 160 && Math.abs(state.player.y - e.y) < 52) {
      e.vx = Math.sign(dx || 1) * (e.speed || 60);
      e.face = Math.sign(e.vx) || e.face;
    }
  }
  if (e.kind === 'leaper' && e.grounded && e.state !== 'roll') {
    e.cool -= STEP;
    const dir = Math.sign(e.vx) || e.face || 1;
    const ahead = hasSupport(state, e.x + e.w / 2 + dir * 28, e.y + e.h + 4);
    if (e.cool <= 0 && ahead) {
      e.vy = -300;
      e.grounded = false;
      e.cool = 1.25;
    } else if (e.cool <= 0) e.cool = 0.35;
  }
  if (e.kind === 'tumbler' && e.state !== 'roll') {
    const dx = (state.player.x + state.player.w / 2) - (e.x + e.w / 2);
    const close = Math.abs(dx) < 78 && Math.abs(state.player.y - e.y) < 48;
    e.arm = close ? (e.arm || 0) + STEP : 0;
    if (e.arm > 0.48) {
      e.state = 'roll';
      e.vx = Math.sign(dx || -1) * 170;
      e.face = Math.sign(e.vx) || -1;
      e.speed = 170;
    }
  }
  if (e.state !== 'roll') {
    const dir = Math.sign(e.vx) || e.face || 1;
    const probeX = dir > 0 ? e.x + e.w + 2 : e.x - 2;
    const floorY = e.y + e.h + 4;
    const wallY = e.y + e.h * 0.4;
    if (!hasSupport(state, probeX, floorY) || isSolidPoint(state, probeX, wallY)) {
      e.vx = -dir * (e.speed || 40);
      e.face = Math.sign(e.vx) || e.face;
    }
  }
  e.vy = Math.min(MAX_FALL, e.vy + GRAV * STEP);
  const dir = Math.sign(e.vx) || e.face;
  e.x += e.vx * STEP;
  const hitWall = resolveX(state, e);
  if (hitWall) {
    if (e.state === 'roll') {
      e.alive = false;
      burst(state, e.x + e.w / 2, e.y + e.h / 2, '#8b5a34', 6);
    } else {
      e.vx = -dir * (e.speed || 40);
      e.face = Math.sign(e.vx) || -dir;
    }
  }
  const vy = e.vy;
  e.y += vy * STEP;
  const hit = resolveY(state, e, vy);
  e.grounded = hit.grounded;
  if (e.grounded && Math.abs(e.vx) > 10) {
    const stride = e.kind === 'nipper' ? 18 : (e.kind === 'kit' ? 20 : (e.kind === 'icer' ? 48 : (e.kind === 'leaper' ? 34 : (e.kind === 'grub' ? 14 : 32))));
    e.gait = (e.gait || 0) + Math.abs(e.vx) * STEP * (Math.PI * 2) / stride;
  }
  if (e.kind === 'drip' && e.state === 'fall' && e.grounded) {
    e.state = 'walk';
    e.speed = 48;
    e.vx = (state.player.x < e.x ? -1 : 1) * e.speed;
    e.face = Math.sign(e.vx) || 1;
  }
  if (e.y > state.h * TILE + 48) e.alive = false;
}

function stepItem(state, it) {
  if (it.dead || it.still) return;
  it.vy = Math.min(MAX_FALL, it.vy + GRAV * STEP);
  const dir = Math.sign(it.vx) || 1;
  it.x += it.vx * STEP;
  if (resolveX(state, it)) it.vx = -dir * Math.abs(it.vx || 50);
  const vy = it.vy;
  it.y += vy * STEP;
  resolveY(state, it, vy);
  if (it.y > state.h * TILE) it.dead = true;
}

function stepShots(state) {
  for (let i = 0; i < state.shots.length; i++) {
    const s = state.shots[i];
    s.life -= STEP;
    s.x += s.vx * STEP;
    s.y += s.vy * STEP;
    if (s.from === 'stone') s.vy = Math.min(420, (s.vy || 0) + GRAV * 0.35 * STEP);
    const hx = Math.floor((s.x + s.w / 2) / TILE);
    const hy = Math.floor((s.y + s.h / 2) / TILE);
    if ((s.from === 'player' || s.from === 'stone') && tileAt(state, hx, hy) === 'X') {
      breakCrate(state, hx, hy);
      s.dead = true;
      continue;
    }
    if (s.life <= 0 || isSolidPoint(state, s.x + s.w / 2, s.y + s.h / 2)) s.dead = true;
  }
}

function damageBoss(state, e) {
  if (e.invuln > 0) return;
  e.hp -= 1;
  e.invuln = 0.55;
  burst(state, e.x + e.w / 2, e.y + 10, '#f2c14e', 6);
  if (e.hp <= 0) {
    e.alive = false;
    beginClear(state);
  }
}

function interact(state, input) {
  const p = state.player;
  const held = input || blankInput();
  if (state.mode !== 'play') return;
  for (let i = 0; i < state.items.length; i++) {
    const it = state.items[i];
    if (it.dead || !overlap(p, it)) continue;
    it.dead = true;
    if (it.kind === 'cap') {
      if (p.form === 'small') setForm(state, 'cap');
      else grant(state, 5);
    } else if (it.kind === 'stone') {
      p.stones = (p.stones || 0) + 6;
      burst(state, p.x + 8, p.y, '#d7d3cc', 5);
    } else if (it.kind === 'life') {
      state.lives = Math.min(9, state.lives + 1);
      burst(state, p.x + 8, p.y, '#f2c14e', 6);
    } else if (p.form !== 'sap') setForm(state, 'sap');
    else grant(state, 5);
  }
  if (p.vy >= 0) {
    const foot = p.y + p.h;
    const fx0 = Math.floor((p.x + 2) / TILE);
    const fx1 = Math.floor((p.x + p.w - 2) / TILE);
    for (let fx = fx0; fx <= fx1; fx++) {
      const fy = Math.floor((foot + 1) / TILE);
      if (tileAt(state, fx, fy) === 'X' && foot >= fy * TILE - 1) breakCrate(state, fx, fy);
    }
  }
  const tiles = rectTiles(p.x, p.y, p.w, p.h);
  for (let i = 0; i < tiles.length; i++) {
    const tx = tiles[i][0];
    const ty = tiles[i][1];
    const t = tileAt(state, tx, ty);
    if (t === 'C') {
      state.rows[ty][tx] = '.';
      grant(state, 1);
    } else if (t === '^') hurt(state);
  }
  if (state.pole && overlap(p, state.pole)) beginClear(state);

  let stomped = false;
  for (let i = 0; i < state.enemies.length; i++) {
    const e = state.enemies[i];
    if (!e.alive || !overlap(p, e)) continue;
    const feet = p.prevBottom <= e.y + 14;
    const fromAbove = p.falling && feet;
    const chain = (p.chain || 0) > 0 && held.jump && p.vy < 0 && feet;
    if (!fromAbove && !chain) continue;
    stomped = true;
    p.vy = -430;
    p.grounded = false;
    p.y = e.y - p.h - 0.5;
    p.ride = -1;
    if (held.jump) p.chain = 0.18;
    sfxStomp();
    state.shake = Math.max(state.shake || 0, 0.1);
    if (e.kind === 'boss') damageBoss(state, e);
    else if ((e.kind === 'roller' || e.kind === 'tumbler') && e.state !== 'roll') {
      e.state = 'roll';
      e.vx = (p.x + p.w / 2 < e.x + e.w / 2 ? 1 : -1) * 250;
      e.face = Math.sign(e.vx);
      e.speed = 250;
    } else {
      e.alive = false;
      burst(state, e.x + e.w / 2, e.y, '#e07a5a', 6);
    }
    if (!held.jump) break;
  }
  if (!stomped && p.invuln <= 0 && state.mode === 'play') {
    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
      if (!e.alive || !overlap(p, e)) continue;
      if (e.kind === 'boss' && e.invuln > 0) continue;
      hurt(state);
      break;
    }
  }
  let popped = false;
  for (let i = 0; i < state.shots.length; i++) {
    const s = state.shots[i];
    if (s.dead || !hostileShot(s) || state.mode !== 'play' || !overlap(s, p)) continue;
    const feet = p.prevBottom <= s.y + 14;
    const fromAbove = p.falling && feet;
    const chain = (p.chain || 0) > 0 && held.jump && p.vy < 0 && feet;
    if (!fromAbove && !chain) continue;
    s.dead = true;
    burst(state, s.x + s.w / 2, s.y + s.h / 2, s.from === 'mason' ? '#c46a45' : '#e7f7ff', 5);
    if (popped) continue;
    popped = true;
    if (p.vy > -360) p.vy = -360;
    p.grounded = false;
    if (!stomped) p.y = Math.min(p.y, s.y - p.h - 0.5);
    p.ride = -1;
    if (held.jump) p.chain = 0.18;
    sfxStomp();
  }
  for (let i = 0; i < state.shots.length; i++) {
    const s = state.shots[i];
    if (s.dead) continue;
    if (hostileShot(s) && state.mode === 'play' && overlap(s, p)) {
      s.dead = true;
      hurt(state);
      continue;
    }
    if (s.from !== 'player') continue;
    for (let k = 0; k < state.shots.length; k++) {
      const other = state.shots[k];
      if (other === s || other.dead || !hostileShot(other) || !overlap(s, other)) continue;
      s.dead = true;
      other.dead = true;
      burst(state, other.x + other.w / 2, other.y + other.h / 2, '#e7f7ff', 5);
      sfxBubble();
      break;
    }
    if (s.dead) continue;
    for (let j = 0; j < state.enemies.length; j++) {
      const e = state.enemies[j];
      if (!e.alive || !overlap(s, e)) continue;
      s.dead = true;
      if (e.kind === 'boss') damageBoss(state, e);
      else if ((e.kind === 'roller' || e.kind === 'tumbler') && e.state !== 'roll') {
        e.state = 'roll';
        e.vx = Math.sign(s.vx) * 250 || 250;
        e.face = Math.sign(e.vx);
      } else {
        e.alive = false;
        burst(state, e.x, e.y, '#e07a5a', 5);
      }
      break;
    }
  }
  for (let i = 0; i < state.enemies.length; i++) {
    const e = state.enemies[i];
    if (!e.alive || (e.kind !== 'roller' && e.kind !== 'tumbler') || e.state !== 'roll') continue;
    for (let j = 0; j < state.enemies.length; j++) {
      const o = state.enemies[j];
      if (o === e || !o.alive || o.kind === 'boss') continue;
      if (overlap(e, o)) {
        o.alive = false;
        burst(state, o.x, o.y, '#e07a5a', 5);
      }
    }
  }
}

function stepParts(state) {
  for (let i = 0; i < state.parts.length; i++) {
    const part = state.parts[i];
    part.life -= STEP;
    part.vy += GRAV * 0.35 * STEP;
    part.x += part.vx * STEP;
    part.y += part.vy * STEP;
  }
  state.parts = state.parts.filter((part) => part.life > 0);
  if (state.parts.length > 90) state.parts.splice(0, state.parts.length - 90);
}

function stepBumps(state) {
  const keys = Object.keys(state.bumps);
  for (let i = 0; i < keys.length; i++) {
    state.bumps[keys[i]] -= STEP;
    if (state.bumps[keys[i]] <= 0) delete state.bumps[keys[i]];
  }
}

function updateCamera(state, snap) {
  const p = state.player;
  const worldW = state.w * TILE;
  const worldH = state.h * TILE;
  let tx = p.x + p.w / 2 + p.face * 36 - VIEW_W * 0.36;
  let ty = p.y + p.h * 0.3 - VIEW_H * 0.62;
  tx = clamp(tx, Math.min(0, worldW - VIEW_W), Math.max(0, worldW - VIEW_W));
  ty = clamp(ty, Math.min(0, worldH - VIEW_H), Math.max(0, worldH - VIEW_H));
  if (state.shake > 0) {
    state.shake = Math.max(0, state.shake - STEP);
    ty += Math.sin(animT * 48) * 5 * state.shake;
  }
  if (snap) {
    state.camX = tx;
    state.camY = ty;
  } else {
    state.camX += (tx - state.camX) * 0.16;
    state.camY += (ty - state.camY) * 0.14;
  }
}

function blankInput() {
  return { left: false, right: false, jump: false, jumpPressed: false, spit: false, spitPressed: false, down: false };
}

function platformPastLog(state, log) {
  const tx = Math.floor((log.x + log.w + 2) / TILE);
  const ty = Math.floor(log.y / TILE);
  const t = tileAt(state, tx, ty);
  return SOLID.has(t) || t === '=';
}

function botInput(state) {
  const p = state.player;
  const boss = state.enemies.find((e) => e.alive && e.kind === 'boss');
  let left = false;
  let right = true;
  let want = false;
  let spit = false;
  let holding = false;
  if (boss) {
    const dx = (boss.x + boss.w / 2) - (p.x + p.w / 2);
    right = dx > 26;
    left = dx < -26;
    want = Math.abs(dx) < 86 && (p.grounded || p.coyote > 0);
    if (p.form === 'sap' && Math.abs(dx) < 150) spit = true;
  } else {
    const feet = p.y + p.h;
    const riding = p.ride >= 0 ? state.logs.find((log) => log.id === p.ride) : null;
    if (riding) {
      holding = true;
      const frontTile = tileAt(state, Math.floor((p.x + p.w + 2) / TILE), Math.floor((feet + 4) / TILE));
      if (SOLID.has(frontTile) || frontTile === '=') {
        right = true;
        left = false;
      } else {
        const pc = p.x + p.w / 2;
        const lc = riding.x + riding.w / 2;
        right = pc < lc - 8;
        left = pc > lc + 8;
      }
    } else {
      let log = null;
      for (let i = 0; i < state.logs.length; i++) {
        const candidate = state.logs[i];
        if (Math.abs(candidate.y - feet) > 42) continue;
        const reachL = candidate.baseX - candidate.amp;
        const reachR = candidate.baseX + candidate.amp + candidate.w;
        if (reachR < p.x + p.w - 16 || reachL > p.x + p.w + 48) continue;
        log = candidate;
        break;
      }
      const nearGap = !hasSupport(state, p.x + p.w + 12, feet + 8);
      const earlyGap = !hasSupport(state, p.x + p.w + 40, feet + 8);
      const logReady = log && log.x < p.x + p.w + 4 && log.x + log.w > p.x + p.w - 8 && Math.abs(log.y - feet) < 22;
      if (log && earlyGap && !logReady && p.grounded) {
        holding = true;
        right = false;
        left = nearGap;
      } else if (nearGap || isSolidPoint(state, p.x + p.w + 2, p.y + p.h * 0.45)) {
        want = true;
      }
      for (let i = 0; i < state.enemies.length; i++) {
        const e = state.enemies[i];
        if (!e.alive) continue;
        const dx = e.x - (p.x + p.w);
        if (dx > -10 && dx < 70 && Math.abs((e.y + e.h) - (p.y + p.h)) < 42) want = true;
      }
      for (let i = 0; i < state.shots.length; i++) {
        const s = state.shots[i];
        if (!hostileShot(s) || s.dead) continue;
        const dx = s.x - (p.x + p.w);
        if (dx > -12 && dx < 110 && Math.abs(s.y - p.y) < 46) want = true;
      }
      const tx = Math.floor((p.x + p.w / 2) / TILE);
      const ty = Math.floor((p.y - 6) / TILE);
      const above = tileAt(state, tx, ty);
      if ((above === '?' || above === '!' || above === 'S') && p.grounded) {
        const bottom = (ty + 1) * TILE;
        if (p.y - bottom < 96 && p.y > bottom - 4) want = true;
      }
      if (p.form === 'sap' || (p.stones || 0) > 0) {
        for (let i = 0; i < state.enemies.length; i++) {
          const e = state.enemies[i];
          if (!e.alive || (e.kind === 'boss' && (p.stones || 0) > 0 && p.form !== 'sap')) continue;
          const dx = (e.x + e.w / 2) - (p.x + p.w / 2);
          if (dx > 16 && dx < 150 && Math.abs(e.y - p.y) < 48) spit = true;
        }
      }
    }
  }
  if (Math.abs(p.x - state.botX) < 1.2) state.botStill += STEP;
  else { state.botStill = 0; state.botX = p.x; }
  if (!boss && !holding && state.botStill > 0.55) want = true;
  if (!boss && !holding && state.botStill > 1.15) { right = false; left = true; }
  if (state.botStill > 1.7) state.botStill = 0;
  if (want && (p.grounded || p.coyote > 0)) state.botJump = 0.32;
  const jump = state.botJump > 0;
  if (state.botJump > 0) state.botJump -= STEP;
  return { left: left, right: right, jump: jump, jumpPressed: jump, spit: spit, spitPressed: spit, down: false };
}

function revive(state) {
  const next = createState(state.def.id, {
    sim: state.sim,
    bot: state.bot,
    lives: state.lives,
    acorns: state.sim ? state.acorns : save.bank
  });
  const keys = Object.keys(state);
  for (let i = 0; i < keys.length; i++) delete state[keys[i]];
  Object.assign(state, next);
}

function advance(state, input) {
  if (state.mode === 'dying') {
    const p = state.player;
    state.dieT -= STEP;
    p.vy = Math.min(MAX_FALL, p.vy + GRAV * STEP);
    p.y += p.vy * STEP;
    if (state.dieT <= 0) {
      if (state.lives <= 0) state.mode = 'over';
      else revive(state);
    }
    return;
  }
  if (state.mode === 'clearing') {
    state.clearT -= STEP;
    state.player.vx = 0;
    state.player.vy = 0;
    if (state.clearT <= 0) state.mode = 'clear';
    return;
  }
  if (state.mode !== 'play') return;
  state.bannerT = Math.max(0, state.bannerT - STEP);
  state.clock -= STEP;
  if (state.clock <= 0) { kill(state); return; }
  stepLogs(state);
  carryRide(state);
  stepPlayer(state, input);
  rideLogs(state);
  for (let i = 0; i < state.enemies.length; i++) stepEnemy(state, state.enemies[i]);
  for (let i = 0; i < state.items.length; i++) stepItem(state, state.items[i]);
  stepShots(state);
  interact(state, input);
  stepParts(state);
  stepBumps(state);
  state.shots = state.shots.filter((s) => !s.dead);
  state.items = state.items.filter((it) => !it.dead);
  if (state.mode === 'play' && state.player.y > state.h * TILE + 4) kill(state);
  updateCamera(state, false);
}

function selfTest() {
  const fails = [];
  const report = [];
  for (let i = 0; i < LEVELS.length; i++) {
    const lv = LEVELS[i];
    const state = createState(lv.id, { sim: true, bot: true, lives: 8, acorns: 0 });
    const samples = [];
    let frames = 0;
    const cap = 60 * 80;
    while (frames < cap && state.mode !== 'clear' && state.mode !== 'over') {
      const input = state.mode === 'play' ? botInput(state) : blankInput();
      advance(state, input);
      if (frames % 60 === 0) samples.push(Math.round(state.player.x));
      frames += 1;
    }
    const row = {
      id: lv.id,
      mode: state.mode,
      frames: frames,
      x: Math.round(state.player.x),
      lives: state.lives,
      form: state.player.form,
      samples: samples
    };
    report.push(row);
    if (state.mode !== 'clear') fails.push(row);
  }
  return { fails: fails, report: report };
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCloud(x, y, s) {
  ctx.beginPath();
  ctx.ellipse(x, y, 16 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 12 * s, y + 2, 12 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 11 * s, y + 2, 10 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function treeLineY(state) {
  let bestY = state.h - 2;
  let best = 0;
  for (let y = 0; y < state.h; y++) {
    let n = 0;
    const row = state.rows[y];
    for (let x = 0; x < row.length; x++) if (row[x] === '#') n++;
    if (n > best) {
      best = n;
      bestY = y;
    }
  }
  return bestY * TILE;
}

function drawHillBand(state, y, amp, period, color, drift) {
  const x0 = state.camX - 24;
  const x1 = state.camX + VIEW_W + 24;
  const bottom = state.h * TILE + 8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += 8) {
    const world = x + state.camX * drift;
    const yy = y
      + Math.sin(world / period + animT * 0.45) * amp
      + Math.sin(world / (period * 0.41) + animT * 0.2) * amp * 0.45;
    ctx.lineTo(x, yy);
  }
  ctx.lineTo(x1, bottom);
  ctx.closePath();
  ctx.fill();
}

function drawBirds() {
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const speed = 36 + i * 11;
    const x = ((animT * speed + i * 78) % (VIEW_W + 50)) - 24;
    const y = 16 + (i % 3) * 18 + Math.sin(animT * 1.6 + i) * 5;
    const flap = Math.sin(animT * 12 + i * 1.7) * 4.5;
    ctx.strokeStyle = i % 2 ? 'rgba(42,32,28,0.72)' : 'rgba(70,48,36,0.55)';
    ctx.beginPath();
    ctx.moveTo(x - 7, y);
    ctx.quadraticCurveTo(x - 3.5, y - 5 - flap, x, y);
    ctx.quadraticCurveTo(x + 3.5, y - 5 - flap, x + 7, y);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}

function drawMotes(state) {
  const snow = state.theme.snow;
  const span = state.w * TILE + 80;
  const count = snow ? 34 : 18;
  for (let i = 0; i < count; i++) {
    const speed = snow ? 36 : 22 + (i % 4) * 6;
    const x = ((i * 149 + animT * speed) % span) - 10;
    if (x < state.camX - 20 || x > state.camX + VIEW_W + 20) continue;
    const base = (state.h - 8) * TILE;
    const y = base - (i % 7) * 26 + Math.sin(animT * (snow ? 1.4 : 2.2) + i) * 14;
    if (snow) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 3, 3);
      continue;
    }
    const wing = Math.sin(animT * 14 + i) * 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = i % 3 === 0 ? '#f2c14e' : (i % 3 === 1 ? '#e07a8a' : '#f6e7c1');
    ctx.beginPath();
    ctx.ellipse(-3, 0, 4.2, 1.6 + Math.abs(wing) * 0.15, -0.6 + wing * 0.04, 0, Math.PI * 2);
    ctx.ellipse(3, 0, 4.2, 1.6 + Math.abs(wing) * 0.15, 0.6 - wing * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1a14';
    ctx.fillRect(-0.7, -0.7, 1.4, 2.2);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function drawRoots(state) {
  const top = ((state.def.ground || 13) - 1) * TILE;
  const y0 = themeSafe(state, top);
  ctx.strokeStyle = 'rgba(215,196,164,0.55)';
  ctx.lineWidth = 1.3;
  const x0 = state.camX - 20;
  for (let i = 0; i < 9; i++) {
    const x = x0 + ((i * 37) % (VIEW_W + 40));
    const drop = 18 + (i % 4) * 14 + Math.sin(animT * 1.4 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.quadraticCurveTo(x + 8, y0 + drop * 0.5, x - 4, y0 + drop);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(126,206,106,0.8)';
  for (let i = 0; i < 5; i++) {
    const x = x0 + 20 + ((i * 61) % (VIEW_W + 10));
    const y = y0 + 16 + (i % 3) * 22 + Math.sin(animT * 2 + i) * 2;
    ctx.beginPath();
    ctx.ellipse(x, y, 2.2, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function themeSafe(state, top) {
  return state.def.theme === 'burrow' ? state.camY - 8 : top;
}

function drawRopes(state, treeLine) {
  ctx.strokeStyle = '#5c3d28';
  ctx.lineWidth = 1.5;
  const y = treeLine + 8;
  for (let i = 0; i < Math.ceil(state.w * TILE / 84); i += 2) {
    const x = i * 84;
    if (x < state.camX - 100 || x > state.camX + VIEW_W + 40) continue;
    const sag = 26 + Math.sin(animT * 1.2 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 42, y + sag, x + 84, y);
    ctx.stroke();
  }
}

function drawPine(x, base, h, dark, light, name) {
  const img = ART[name] || ART.pine;
  if (artReady(img)) {
    const dh = h;
    const dw = dh * (img.naturalWidth / img.naturalHeight);
    ctx.drawImage(img, x - dw / 2, base - dh, dw, dh);
    return;
  }
  ctx.fillStyle = '#5c3a2a';
  ctx.fillRect(x - 1.5, base - h * 0.28, 3, h * 0.28);
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(x, base - h);
  ctx.lineTo(x + 11, base - h * 0.18);
  ctx.lineTo(x - 11, base - h * 0.18);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(x, base - h * 0.78);
  ctx.lineTo(x + 8, base - h * 0.34);
  ctx.lineTo(x - 8, base - h * 0.34);
  ctx.fill();
}

function drawWorld(state) {
  const theme = state.theme;
  const camX = state.camX;
  const camY = state.camY;
  const cave = theme.burrow || state.player.y > ((state.def.ground || 13) + 0.4) * TILE;
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, cave ? '#2a2118' : theme.sky[0]);
  sky.addColorStop(0.55, cave ? '#5a4030' : theme.sky[1]);
  sky.addColorStop(1, cave ? '#1a120c' : (theme.night ? '#0e1c2e' : '#d7f3c8'));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (cave) {
    ctx.fillStyle = 'rgba(126,206,106,0.16)';
    for (let i = 0; i < 8; i++) {
      const sx = (i * 41 + Math.sin(animT * 0.8 + i) * 6) % VIEW_W;
      const sy = 24 + ((i * 29) % Math.floor(VIEW_H * 0.7));
      ctx.beginPath();
      ctx.ellipse(sx, sy, 2.2, 5 + (i % 3), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme.night) {
    const my = state.bannerT > 0 ? 86 : 32;
    const glow = ctx.createRadialGradient(VIEW_W - 28, my, 2, VIEW_W - 28, my, 28);
    glow.addColorStop(0, 'rgba(246,231,193,0.55)');
    glow.addColorStop(1, 'rgba(246,231,193,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(VIEW_W - 28, my, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6e7c1';
    ctx.beginPath();
    ctx.arc(VIEW_W - 28, my, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(20,36,60,0.35)';
    ctx.beginPath();
    ctx.arc(VIEW_W - 24, my - 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6e7c1';
    for (let i = 0; i < 7; i++) {
      const sx = (i * 37 + animT * 3) % VIEW_W;
      const sy = 18 + ((i * 23) % Math.floor(VIEW_H * 0.34));
      ctx.globalAlpha = 0.35 + 0.45 * Math.abs(Math.sin(animT * 1.6 + i));
      ctx.fillRect(sx, sy, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;
  } else {
    const sy = state.bannerT > 0 ? 92 : 34;
    const glow = ctx.createRadialGradient(VIEW_W - 36, sy, 4, VIEW_W - 36, sy, 40);
    glow.addColorStop(0, 'rgba(255,226,138,0.85)');
    glow.addColorStop(1, 'rgba(255,226,138,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(VIEW_W - 36, sy, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff4c4';
    ctx.beginPath();
    ctx.arc(VIEW_W - 36, sy, 13 + Math.sin(animT * 1.5) * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    const drift = camX * 0.22 + animT * 28;
    for (let i = -1; i < 5; i++) {
      const bob = Math.sin(animT * 0.9 + i) * 7;
      drawCloud(i * 78 - (drift % 78), 26 + (i % 3) * 18 + bob, 1.15 + (i % 2) * 0.35);
    }
    drawBirds();
  }
  ctx.save();
  ctx.translate(-Math.round(camX), -Math.round(camY));
  if (cave) drawRoots(state);
  const treeLine = treeLineY(state);
  if (!cave) {
    ctx.globalAlpha = 0.55;
    drawHillBand(state, treeLine - 48, 26, 110, theme.hill2, 0.55);
    ctx.globalAlpha = 0.72;
    drawHillBand(state, treeLine - 10, 16, 72, theme.hill, 0.22);
    ctx.globalAlpha = 1;
    const treeName = theme.tree || 'pine';
    const reed = treeName === 'reed';
    const treeStep = reed ? 50 : 84;
    const treeBase = reed ? 150 : 168;
    for (let i = -1; i < Math.ceil(state.w * TILE / treeStep) + 1; i++) {
      const foot = treeLine + (reed ? 86 : 34);
      const x = i * treeStep;
      if (x < camX - 160 || x > camX + VIEW_W + 160) continue;
      ctx.save();
      ctx.translate(x, foot);
      ctx.rotate(Math.sin(animT * 1.25 + i * 0.7) * (reed ? 0.08 : 0.055));
      drawPine(0, 0, treeBase + (i % 4) * (reed ? 10 : 20), theme.hill, theme.hill2, treeName);
      ctx.restore();
    }
  }
  const waterY = (state.h - 2) * TILE;
  if (!cave) {
  const water = ctx.createLinearGradient(0, waterY, 0, waterY + TILE * 2);
  water.addColorStop(0, theme.water);
  water.addColorStop(1, theme.night ? '#0c2433' : '#1d6f90');
  ctx.fillStyle = water;
  ctx.fillRect(camX - 40, waterY, VIEW_W + 80, TILE * 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.38)';
  ctx.lineWidth = 1.3;
  for (let row = 0; row < 4; row++) {
    ctx.beginPath();
    const y0 = waterY + 5 + row * 8;
    const x0 = camX - 8;
    const x1 = camX + VIEW_W + 8;
    for (let x = x0; x <= x1; x += 6) {
      const yy = y0 + Math.sin(x * 0.08 + animT * 3.1 + row) * 4.6;
      if (x === x0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 10; i++) {
    const fx = camX - 10 + ((i * 53 + animT * 34) % (VIEW_W + 30));
    const fy = waterY + 8 + (i % 4) * 8 + Math.sin(animT * 3 + i) * 2;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 6, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  }
  drawMotes(state);
  if (state.def.theme === 'rope' && !cave) drawRopes(state, treeLine);
  if (state.def.id === '3-2' || state.def.ending) drawLodge(state.w * TILE - 150, 5 * TILE);
  const x0 = Math.max(0, Math.floor(camX / TILE) - 1);
  const x1 = Math.min(state.w - 1, Math.floor((camX + VIEW_W) / TILE) + 1);
  const y0 = Math.max(0, Math.floor(camY / TILE) - 1);
  const y1 = Math.min(state.h - 1, Math.floor((camY + VIEW_H) / TILE) + 1);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      drawTile(state, x, y);
    }
  }
  for (let i = 0; i < state.logs.length; i++) drawLog(state.logs[i]);
  for (let i = 0; i < state.items.length; i++) drawItem(state.items[i]);
  for (let i = 0; i < state.enemies.length; i++) {
    if (state.enemies[i].alive) drawEnemy(state, state.enemies[i]);
  }
  for (let i = 0; i < state.shots.length; i++) drawShot(state.shots[i]);
  if (state.pole) drawPole(state);
  const p = state.player;
  const blink = p.invuln > 0 && Math.floor(p.invuln * 14) % 2 === 0;
  if (!blink) {
    const pose = beaverPose(p);
    drawBeaver(p.x, p.y, p.w, p.h, p.face, {
      form: p.form, phase: p.run, squash: pose.squash, bob: pose.bob, lean: pose.lean,
      sway: pose.sway, pitch: pose.pitch, tail: pose.tail, color: '#8b5a3c'
    });
  }
  for (let i = 0; i < state.parts.length; i++) {
    const part = state.parts[i];
    ctx.globalAlpha = Math.max(0, part.life * 2);
    ctx.fillStyle = part.color;
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if (state.bannerT > 0 && state.mode === 'play') drawBanner(state);
}

function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = words[i];
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawBanner(state) {
  const maxWidth = VIEW_W - 36;
  ctx.font = '700 13px Trebuchet MS, Segoe UI, sans-serif';
  const lines = wrapText(state.def.line, maxWidth);
  const hintLines = state.def.hint ? wrapText(state.def.hint, maxWidth) : [];
  const boxH = 16 + lines.length * 16 + hintLines.length * 14;
  ctx.fillStyle = 'rgba(26,16,40,0.92)';
  roundRect(10, 8, VIEW_W - 20, boxH, 8);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f6e7c1';
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], VIEW_W / 2, 26 + i * 16);
  ctx.fillStyle = '#f2c14e';
  ctx.font = '700 11px Trebuchet MS, Segoe UI, sans-serif';
  for (let i = 0; i < hintLines.length; i++) ctx.fillText(hintLines[i], VIEW_W / 2, 26 + lines.length * 16 + i * 14);
  ctx.textAlign = 'left';
}

function drawLodge(x, y) {
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? '#6b442c' : '#8d5c38';
    roundRect(x, y + 16 + i * 10, 100, 12, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(26,16,40,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.fillStyle = '#2f7a45';
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 22);
  ctx.lineTo(x + 50, y - 6);
  ctx.lineTo(x + 110, y + 22);
  ctx.fill();
  ctx.fillStyle = '#67b85a';
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 20);
  ctx.lineTo(x + 50, y - 1);
  ctx.lineTo(x + 104, y + 20);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  roundRect(x + 40, y + 42, 20, 28, 3);
  ctx.fill();
  const lit = live && (live.mode === 'clearing' || live.mode === 'clear');
  ctx.fillStyle = lit ? '#ffe28a' : '#8a7340';
  ctx.beginPath();
  ctx.arc(x + 82, y + 16, 9, Math.PI, 0);
  ctx.lineTo(x + 91, y + 30);
  ctx.quadraticCurveTo(x + 82, y + 36, x + 73, y + 30);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(x + 82, y + 28, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawBlockFace(px, py, top, bottom) {
  ctx.fillStyle = 'rgba(26,16,40,0.22)';
  roundRect(px + 3, py + 4, TILE - 3, TILE - 3, 5);
  ctx.fill();
  const g = ctx.createLinearGradient(px, py, px, py + TILE);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  roundRect(px + 1, py + 1, TILE - 2, TILE - 2, 5);
  ctx.fill();
  ctx.strokeStyle = '#1a1028';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  roundRect(px + 4, py + 3, TILE - 10, 4, 2);
  ctx.fill();
}

function drawTile(state, x, y) {
  const c = state.rows[y][x];
  if (c === '.') return;
  const px = x * TILE;
  let py = y * TILE;
  const bump = state.bumps[x + ',' + y] || 0;
  if (bump > 0) py -= Math.sin((bump / 0.14) * Math.PI) * 7;
  const above = tileAt(state, x, y - 1);
  if (c === '#') {
    const top = !SOLID.has(above) && above !== '=';
    const deep = state.def.theme === 'burrow' || y > (state.def.ground || 13);
    if (deep) {
      drawSoil(px, py, x, y, top);
      return;
    }
    if (artReady(ART.grass)) {
      const g = ART.grass;
      if (top) ctx.drawImage(g, px, py, TILE + 0.8, TILE + 0.8);
      else {
        const sy = Math.floor(g.naturalHeight * 0.5);
        ctx.drawImage(g, 0, sy, g.naturalWidth, g.naturalHeight - sy, px, py, TILE + 0.8, TILE + 0.8);
      }
      if (top && state.theme.snow) {
        ctx.fillStyle = 'rgba(244,248,252,0.92)';
        ctx.fillRect(px, py, TILE + 0.8, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, TILE + 0.8, 3);
      }
      if (top) dressBank(state, px, py, x);
      return;
    }
    const dirt = ctx.createLinearGradient(px, py, px, py + TILE);
    dirt.addColorStop(0, top ? '#6b442c' : '#7a5236');
    dirt.addColorStop(1, '#3d2818');
    ctx.fillStyle = dirt;
    ctx.fillRect(px, py, TILE + 0.5, TILE + 0.5);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.arc(px + 8 + (x % 3) * 4, py + 16, 2, 0, Math.PI * 2);
    ctx.arc(px + 22, py + 24, 1.4, 0, Math.PI * 2);
    ctx.fill();
    if (top) {
      ctx.fillStyle = '#2f7a3a';
      ctx.fillRect(px, py, TILE + 0.5, 8);
      ctx.fillStyle = '#7dce6a';
      ctx.fillRect(px, py, TILE + 0.5, 3);
      ctx.fillStyle = '#3e9a45';
      for (let i = 0; i < 4; i++) {
        const bx = px + 3 + i * 8;
        ctx.beginPath();
        ctx.moveTo(bx, py + 2);
        ctx.quadraticCurveTo(bx + 1, py - 5 - (i % 2), bx + 3, py + 2);
        ctx.fill();
      }
    }
    return;
  }
  if (c === 'B' || c === 'u' || c === '?' || c === '!' || c === 'S') {
    if (artReady(ART.brick)) {
      ctx.drawImage(ART.brick, px, py, TILE + 0.8, TILE + 0.8);
      if (c === 'u') {
        ctx.fillStyle = 'rgba(26,16,40,0.35)';
        ctx.fillRect(px, py, TILE, TILE);
      } else if (c !== 'B') {
        ctx.fillStyle = 'rgba(242,193,78,0.32)';
        ctx.fillRect(px, py, TILE, TILE);
      }
    } else if (c === 'B') drawBlockFace(px, py, '#e08a62', '#a65232');
    else if (c === 'u') drawBlockFace(px, py, '#c4a574', '#8d6b42');
    else drawBlockFace(px, py, '#f2c14e', '#c4842a');
    if (c === 'B') {
      ctx.strokeStyle = 'rgba(243,210,176,0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px + 3, py + TILE / 2);
      ctx.lineTo(px + TILE - 3, py + TILE / 2);
      ctx.moveTo(px + TILE / 2, py + 3);
      ctx.lineTo(px + TILE / 2, py + TILE / 2);
      ctx.stroke();
    } else if (c === '?') {
      drawAcorn(px + 16, py + 18, 7);
    } else if (c === '!') {
      ctx.fillStyle = '#f6e7c1';
      roundRect(px + 8, py + 10, 16, 5, 2);
      ctx.fill();
      ctx.strokeStyle = '#2f7a45';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px + 16, py + 10);
      ctx.lineTo(px + 12, py + 3);
      ctx.moveTo(px + 14, py + 6);
      ctx.lineTo(px + 20, py + 4);
      ctx.stroke();
    } else if (c === 'S') {
      ctx.fillStyle = '#8ed36a';
      ctx.beginPath();
      ctx.arc(px + 16, py + 18, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(px + 14, py + 16, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  if (c === '=') {
    if (artReady(ART.bark)) {
      ctx.save();
      roundRect(px + 1, py + 2, TILE - 2, 14, 7);
      ctx.clip();
      ctx.drawImage(ART.bark, px, py + 1, TILE, 16);
      ctx.restore();
      ctx.strokeStyle = '#3a2418';
      ctx.lineWidth = 1.2;
      roundRect(px + 1, py + 2, TILE - 2, 14, 7);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = '#6b442c';
    roundRect(px + 1, py + 2, TILE - 2, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#c4896a';
    ctx.fillRect(px + 4, py + 5, TILE - 8, 3);
    ctx.fillStyle = '#4a2e22';
    ctx.beginPath();
    ctx.arc(px + 6, py + 9, 4, 0, Math.PI * 2);
    ctx.arc(px + TILE - 6, py + 9, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (c === 'X') {
    drawCrate(px, py, bump);
    return;
  }
  if (c === 'C') {
    drawAcorn(px + 16, py + 16, 8);
    return;
  }
  if (c === '^') {
    ctx.fillStyle = '#e7e2d6';
    ctx.strokeStyle = '#6b442c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px + 4, py + TILE);
    ctx.lineTo(px + 10, py + 8);
    ctx.lineTo(px + 16, py + TILE);
    ctx.moveTo(px + 16, py + TILE);
    ctx.lineTo(px + 22, py + 6);
    ctx.lineTo(px + 28, py + TILE);
    ctx.fill();
    ctx.stroke();
  }
}

function drawProp(state, px, py, x) {
  const theme = state.def.theme || 'bank';
  const n = (x * 5 + (state.def.world || 1) * 3) % 8;
  if (n > 1) return;
  const sway = Math.sin(animT * 2.4 + x * 0.4) * 2.4;
  if (theme === 'cedar') {
    ctx.fillStyle = '#6b442c';
    roundRect(px + 14, py - 8, 8, 10, 2);
    ctx.fill();
    ctx.fillStyle = '#c4896a';
    ctx.beginPath();
    ctx.ellipse(px + 18, py - 8, 6, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'reed') {
    ctx.strokeStyle = '#d7e2b2';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(px + 16, py + 2);
    ctx.quadraticCurveTo(px + 16 + sway, py - 10, px + 16 + sway * 1.4, py - 22);
    ctx.stroke();
    ctx.fillStyle = '#f4efe4';
    ctx.beginPath();
    ctx.ellipse(px + 16 + sway * 1.4, py - 24, 3.2, 5, sway * 0.05, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'kiln') {
    ctx.fillStyle = '#c46a45';
    ctx.beginPath();
    ctx.moveTo(px + 12, py + 2);
    ctx.lineTo(px + 22, py + 2);
    ctx.lineTo(px + 20, py - 8);
    ctx.lineTo(px + 14, py - 8);
    ctx.fill();
    ctx.fillStyle = '#e7b07a';
    ctx.fillRect(px + 13, py - 11, 8, 3);
  } else if (theme === 'rope') {
    ctx.fillStyle = '#5c3a2a';
    ctx.fillRect(px + 16, py - 16, 3, 18);
    ctx.strokeStyle = '#c4a574';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(px + 18, py - 14);
    ctx.quadraticCurveTo(px + 28, py - 8 + sway, px + 36, py - 14);
    ctx.stroke();
  } else if (theme === 'frost') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px + 16, py - 3, 5, 0, Math.PI * 2);
    ctx.arc(px + 20, py - 8, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'dam') {
    ctx.fillStyle = '#6b442c';
    roundRect(px + 8, py - 6, 18, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#8d5c38';
    roundRect(px + 10, py - 11, 14, 5, 2);
    ctx.fill();
  } else if (theme === 'source') {
    ctx.fillStyle = 'rgba(90,190,220,0.9)';
    ctx.beginPath();
    ctx.arc(px + 16, py - 4 + Math.sin(animT * 4 + x) * 1.5, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(px + 15, py - 5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function dressBank(state, px, py, x) {
  const world = state.def.world || 1;
  const frost = !!state.theme.snow;
  ctx.lineWidth = 1.3;
  for (let i = 0; i < 4; i++) {
    const bx = px + 4 + i * 8;
    const sway = Math.sin(animT * 3.1 + x * 0.65 + i) * (frost ? 2.2 : 5.5);
    ctx.strokeStyle = frost ? 'rgba(255,255,255,0.9)' : (world === 5 ? '#e7f0c8' : '#1f6a32');
    ctx.beginPath();
    ctx.moveTo(bx, py + 6);
    ctx.quadraticCurveTo(bx + sway * 0.45, py - 4, bx + sway, py - (frost ? 8 : 14));
    ctx.stroke();
  }
  drawProp(state, px, py, x);
  const seed = (x * 13 + world * 17) % 11;
  if (seed === 0) {
    ctx.strokeStyle = '#2f7a3a';
    ctx.beginPath();
    ctx.moveTo(px + 18, py + 4);
    ctx.lineTo(px + 18, py - 4);
    ctx.stroke();
    ctx.fillStyle = world === 8 ? '#f4f8fc' : (world === 6 ? '#e07a5a' : '#f2c14e');
    ctx.beginPath();
    ctx.arc(px + 18, py - 5, 2.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (seed === 4) {
    ctx.fillStyle = frost ? '#d5e4ee' : '#6b5430';
    ctx.beginPath();
    ctx.ellipse(px + 22, py + 3, 3.2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAcorn(x, y, r) {
  y += Math.sin(animT * 3.1 + x * 0.12) * 2.6;
  if (artReady(ART.acorn)) {
    const dw = r * 2.6;
    const dh = dw * (ART.acorn.naturalHeight / ART.acorn.naturalWidth);
    ctx.drawImage(ART.acorn, x - dw / 2, y - dh / 2, dw, dh);
    return;
  }
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, r * 0.72, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.2, y, r * 0.22, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b3a22';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.55, r * 0.55, r * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a2e22';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y - r * 0.5);
  ctx.lineTo(x + r * 0.3, y - r * 0.7);
  ctx.stroke();
}

function drawLog(log) {
  if (artReady(ART.bark)) {
    ctx.save();
    roundRect(log.x, log.y, log.w, log.h, 8);
    ctx.clip();
    ctx.drawImage(ART.bark, log.x, log.y, log.w, log.h);
    ctx.restore();
    ctx.strokeStyle = '#2a1a14';
    ctx.lineWidth = 1.5;
    roundRect(log.x, log.y, log.w, log.h, 8);
    ctx.stroke();
    return;
  }
  const g = ctx.createLinearGradient(log.x, log.y, log.x, log.y + log.h);
  g.addColorStop(0, '#d9a36a');
  g.addColorStop(0.4, '#8b5a34');
  g.addColorStop(1, '#4a2e22');
  ctx.fillStyle = g;
  roundRect(log.x, log.y, log.w, log.h, 8);
  ctx.fill();
  ctx.strokeStyle = '#2a1a14';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(log.x + 14, log.y + 4);
  ctx.lineTo(log.x + log.w - 14, log.y + 4);
  ctx.stroke();
  ctx.fillStyle = '#6b442c';
  ctx.beginPath();
  ctx.arc(log.x + 8, log.y + 8, 6, 0, Math.PI * 2);
  ctx.arc(log.x + log.w - 8, log.y + 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c4896a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(log.x + 8, log.y + 8, 3, 0, Math.PI * 2);
  ctx.arc(log.x + log.w - 8, log.y + 8, 3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSoil(px, py, x, y, top) {
  const dirt = ctx.createLinearGradient(px, py, px, py + TILE);
  dirt.addColorStop(0, top ? '#6a4a32' : '#4a301f');
  dirt.addColorStop(1, '#2a1a12');
  ctx.fillStyle = dirt;
  ctx.fillRect(px, py, TILE + 0.5, TILE + 0.5);
  ctx.fillStyle = 'rgba(90,60,40,0.45)';
  ctx.beginPath();
  ctx.arc(px + 8 + (x % 4) * 5, py + 18, 3, 0, Math.PI * 2);
  ctx.arc(px + 22, py + 10, 2, 0, Math.PI * 2);
  ctx.fill();
  if ((x + y) % 3 === 0) {
    ctx.strokeStyle = '#d7c4a4';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(px + 6, py);
    ctx.quadraticCurveTo(px + 10, py + 10, px + 4, py + TILE);
    ctx.stroke();
  }
  if (top) {
    ctx.fillStyle = '#3e6a3a';
    ctx.fillRect(px, py, TILE + 0.5, 5);
    ctx.strokeStyle = '#c4a574';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px + 4, py + 4);
    ctx.quadraticCurveTo(px + 12, py - 8 - (x % 3) * 2, px + 18, py + 3);
    ctx.moveTo(px + 18, py + 4);
    ctx.quadraticCurveTo(px + 24, py - 6, px + 30, py + 4);
    ctx.stroke();
    if ((x + y) % 4 === 0) {
      ctx.fillStyle = 'rgba(126,206,106,0.85)';
      ctx.beginPath();
      ctx.ellipse(px + 16, py + 3, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCrate(px, py) {
  ctx.fillStyle = '#c4896a';
  roundRect(px + 2, py + 4, TILE - 4, TILE - 6, 3);
  ctx.fill();
  ctx.fillStyle = '#8d5a38';
  ctx.fillRect(px + 4, py + 8, TILE - 8, 4);
  ctx.fillRect(px + 4, py + 18, TILE - 8, 4);
  ctx.strokeStyle = '#3a2418';
  ctx.lineWidth = 1.4;
  roundRect(px + 2, py + 4, TILE - 4, TILE - 6, 3);
  ctx.stroke();
  ctx.strokeStyle = '#e7d3b0';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(px + 6, py + 8);
  ctx.lineTo(px + TILE - 6, py + 22);
  ctx.moveTo(px + TILE - 6, py + 8);
  ctx.lineTo(px + 6, py + 22);
  ctx.stroke();
}

function drawItem(it) {
  const bob = Math.sin(animT * 3 + it.x * 0.05) * 2.2;
  if (it.kind === 'stone') {
    ctx.fillStyle = '#8d908c';
    ctx.beginPath();
    ctx.ellipse(it.x + 9, it.y + 8 + bob, 7, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d7d3cc';
    ctx.beginPath();
    ctx.ellipse(it.x + 7, it.y + 6 + bob, 2.4, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (it.kind === 'life') {
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.arc(it.x + 9, it.y + 8 + bob, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1028';
    ctx.fillRect(it.x + 8, it.y + 5 + bob, 2, 7);
    ctx.fillRect(it.x + 6, it.y + 7 + bob, 6, 2);
    return;
  }
  if (it.kind === 'cap') {
    ctx.fillStyle = '#e2b13a';
    ctx.beginPath();
    ctx.ellipse(it.x + 9, it.y + 10 + bob, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.ellipse(it.x + 9, it.y + 6 + bob, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2f7a45';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(it.x + 8, it.y + 4 + bob);
    ctx.lineTo(it.x + 2, it.y - 4 + bob);
    ctx.moveTo(it.x + 5, it.y + bob);
    ctx.lineTo(it.x + 12, it.y - 2 + bob);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#5ea84e';
    roundRect(it.x + 3, it.y + bob, 12, 16, 5);
    ctx.fill();
    ctx.fillStyle = '#b6e37a';
    ctx.beginPath();
    ctx.arc(it.x + 9, it.y + 6 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBubble(cx, cy, radius, vx) {
  const dir = Math.sign(vx) || -1;
  const x = cx + dir * Math.min(14, radius * 0.45);
  const y = cy + Math.sin(animT * 16 + cx * 0.08) * 1.4;
  const r = radius + Math.sin(animT * 13 + x * 0.1) * 1.5;
  for (let i = 3; i >= 1; i--) {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = i % 2 ? '#f7c6e4' : '#b7ecff';
    ctx.beginPath();
    ctx.arc(x - dir * i * 11, y, r * (1 - i * 0.16), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const glow = ctx.createRadialGradient(x - r * 0.32, y - r * 0.36, 1, x, y, r);
  glow.addColorStop(0, 'rgba(255,255,255,0.98)');
  glow.addColorStop(0.35, 'rgba(186,236,255,0.9)');
  glow.addColorStop(0.72, 'rgba(244,176,226,0.78)');
  glow.addColorStop(1, 'rgba(90,186,230,0.9)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#14384c';
  ctx.lineWidth = 3.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(4, r - 4), 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.34, Math.max(2.6, r * 0.22), 0, Math.PI * 2);
  ctx.fill();
}

function drawCharge(e) {
  const max = e.kind === 'goose' ? 1.45 : (e.kind === 'mason' ? 1.8 : 2.05);
  const t = 1 - Math.max(0, e.cool) / max;
  if (t < 0.18) return;
  const face = e.face || -1;
  const reach = e.kind === 'goose' ? 36 : 30;
  const lift = e.kind === 'goose' ? 64 : (e.kind === 'mason' ? 44 : 44);
  const cx = e.x + e.w / 2 + face * reach;
  const cy = e.y + e.h - lift;
  if (e.kind === 'mason') {
    const s = 7 + t * 10;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.5 + t * 0.8);
    ctx.fillStyle = '#c46a45';
    ctx.fillRect(-s / 2, -s * 0.35, s, s * 0.7);
    ctx.strokeStyle = '#3a2418';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-s / 2, -s * 0.35, s, s * 0.7);
    ctx.restore();
    return;
  }
  drawBubble(cx, cy, 7 + t * 11, face * 20);
}

function drawShot(s) {
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  const r = s.w / 2;
  if (s.from === 'mason') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(s.x * 0.04);
    ctx.fillStyle = '#c46a45';
    ctx.fillRect(-9, -6, 18, 12);
    ctx.strokeStyle = '#3a2418';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-9, -6, 18, 12);
    ctx.fillStyle = 'rgba(243,210,176,0.85)';
    ctx.fillRect(-7, -1, 14, 2);
    ctx.restore();
    return;
  }
  if (s.from === 'duck' || s.from === 'goose') {
    drawBubble(cx, cy, s.from === 'goose' ? 20 : 18, s.vx);
    return;
  }
  if (s.from === 'stone') {
    ctx.fillStyle = '#6e726e';
    ctx.beginPath();
    ctx.ellipse(cx, cy, r + 1, r - 1, s.x * 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d7d3cc';
    ctx.beginPath();
    ctx.ellipse(cx - 2, cy - 2, 2, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.fillStyle = '#b6e37a';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1028';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawPole(state) {
  const pole = state.pole;
  const lit = state.mode === 'clearing' || state.mode === 'clear';
  ctx.fillStyle = '#5c3a2a';
  roundRect(pole.x + 8, pole.y, 7, pole.h, 3);
  ctx.fill();
  const bx = pole.x + 11;
  const by = pole.y + 6;
  if (artReady(ART.bell)) {
    if (lit) {
      ctx.fillStyle = 'rgba(255,226,138,0.42)';
      ctx.beginPath();
      ctx.arc(bx, by + 12, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    const bw = 38;
    const bh = bw * (ART.bell.naturalHeight / ART.bell.naturalWidth);
    ctx.drawImage(ART.bell, bx - bw / 2, by - 8, bw, bh);
    return;
  }
  if (lit) {
    ctx.fillStyle = 'rgba(255,226,138,0.45)';
    ctx.beginPath();
    ctx.arc(bx, by + 6, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  const bell = ctx.createLinearGradient(bx - 10, by, bx + 10, by + 16);
  bell.addColorStop(0, lit ? '#fff4c4' : '#c4a574');
  bell.addColorStop(1, lit ? '#e2a53a' : '#6b5430');
  ctx.fillStyle = bell;
  ctx.beginPath();
  ctx.arc(bx, by, 11, Math.PI, 0);
  ctx.lineTo(bx + 11, by + 14);
  ctx.quadraticCurveTo(bx, by + 20, bx - 11, by + 14);
  ctx.fill();
  ctx.strokeStyle = '#1a1028';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(bx, by + 12, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrub(e) {
  const phase = e.gait || animT * 5;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h - 2);
  ctx.fillStyle = '#f3e6cf';
  for (let i = 0; i < 4; i++) {
    const wave = Math.sin(phase - i * 0.85);
    ctx.beginPath();
    ctx.ellipse(-10 + i * 7 + wave * 1.1, wave * 2.6, 5.2, 4.2 - i * 0.2, wave * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  const head = Math.sin(phase - 3.2);
  ctx.fillStyle = '#6b442c';
  ctx.beginPath();
  ctx.arc(12 + head * 0.7, -1 + head * 1.5, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(13.2 + head * 0.7, -2 + head * 1.5, 0.9, 0, Math.PI * 2);
  ctx.arc(11.2 + head * 0.7, -2 + head * 1.5, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c4a574';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-6 + i * 6, 3);
    ctx.lineTo(-8 + i * 6, 6);
    ctx.moveTo(-2 + i * 6, 3);
    ctx.lineTo(0 + i * 6, 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDrip(e) {
  const hang = e.state === 'hang';
  ctx.save();
  if (hang) {
    const pulse = 1 + Math.sin(animT * 4.2 + e.x * 0.05) * 0.1;
    ctx.translate(e.x + e.w / 2, e.y);
    ctx.scale(1 / pulse, pulse);
    ctx.translate(-(e.x + e.w / 2), -e.y);
  } else if (!e.grounded) {
    ctx.translate(e.x + e.w / 2, e.y);
    ctx.scale(0.88, 1.16);
    ctx.translate(-(e.x + e.w / 2), -e.y);
  } else {
    ctx.translate(Math.sin(e.gait || 0) * 0.7, -Math.abs(Math.sin(e.gait || 0)) * 2.2);
  }
  ctx.fillStyle = hang ? '#7dce6a' : '#e7d7b8';
  ctx.beginPath();
  ctx.ellipse(e.x + e.w / 2, e.y + e.h * 0.55, e.w * 0.42, e.h * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(e.x + e.w * 0.38, e.y + e.h * 0.48, 1.1, 0, Math.PI * 2);
  ctx.arc(e.x + e.w * 0.62, e.y + e.h * 0.48, 1.1, 0, Math.PI * 2);
  ctx.fill();
  if (hang) {
    ctx.strokeStyle = '#9fd7c8';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(e.x + e.w / 2, e.y);
    ctx.lineTo(e.x + e.w / 2, e.y - 10);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEnemy(state, e) {
  if (e.kind === 'duck') {
    drawDuck(e);
    drawCharge(e);
    return;
  }
  if (e.kind === 'goose') {
    drawGoose(e);
    drawCharge(e);
    return;
  }
  if (e.kind === 'mason') {
    drawMason(e);
    drawCharge(e);
    return;
  }
  if (e.kind === 'roller') {
    drawRoller(e);
    return;
  }
  if (e.kind === 'tumbler') {
    drawTumbler(e);
    return;
  }
  if (e.kind === 'grub') {
    drawGrub(e);
    return;
  }
  if (e.kind === 'drip') {
    drawDrip(e);
    return;
  }
  const painted = { leaper: ['leaper', 52, 48], nipper: ['nipper', 54, 46], icer: ['icer', 54, 48] }[e.kind];
  const gait = enemyGait(e);
  const color = e.kind === 'boss' ? '#c44536' : '#d4533c';
  drawBeaver(e.x, e.y, e.w, e.h, e.face, {
    form: 'small',
    phase: e.gait || 0,
    color: color,
    angry: !painted,
    boss: e.kind === 'boss',
    sprite: painted ? painted[0] : '',
    dw: painted ? painted[1] : 0,
    dh: painted ? painted[2] : 0,
    bob: gait.bob,
    lean: gait.lean,
    sway: gait.sway,
    squash: gait.squash,
    pitch: gait.pitch,
    tail: gait.tail
  });
  if (e.kind === 'boss') {
    ctx.fillStyle = '#f6e7c1';
    ctx.font = '700 11px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    const label = state.def.bossName || 'LOCKJAW';
    const labelX = clamp(e.x + e.w / 2, state.camX + 48, state.camX + VIEW_W - 48);
    ctx.fillText(label, labelX, e.y - 30);
    const pips = e.maxHp || 3;
    const gap = pips > 4 ? 9 : 12;
    const total = pips * gap;
    for (let i = 0; i < pips; i++) {
      ctx.fillStyle = i < e.hp ? '#f2c14e' : '#3a2a22';
      ctx.fillRect(labelX - total / 2 + i * gap, e.y - 24, gap - 3, 5);
    }
    ctx.textAlign = 'left';
  }
}

function boundGait(g, face, hop, lean, tailLift) {
  const u = Math.sin(g || 0);
  const lift = Math.pow(Math.max(0, -u), 1.15);
  return {
    bob: -lift * hop,
    lean: face * lean,
    squash: (1 - lift) * 0.07 - lift * 0.05,
    sway: Math.sin((g || 0) * 2) * 1.1,
    pitch: u * 0.045,
    tail: -tailLift - lift * 0.16
  };
}

function enemyGait(e) {
  const face = e.face || 1;
  const g = e.gait || 0;
  if (e.kind === 'leaper') {
    if (!e.grounded) {
      const rising = e.vy < -40;
      return { bob: rising ? -1.2 : 0.6, lean: face * 0.05, squash: rising ? -0.1 : 0.08, sway: 0, pitch: rising ? -0.07 : 0.06, tail: rising ? -0.22 : -0.06 };
    }
    if ((e.cool || 1) < 0.28) {
      return { bob: 0.8, lean: face * 0.03, squash: 0.14, sway: 0, pitch: 0.08, tail: -0.24 };
    }
    return boundGait(g, face, 2.4, 0.06, 0.1);
  }
  if (e.kind === 'nipper') return boundGait(g, face, 2.6, 0.06, 0.16);
  if (e.kind === 'icer') {
    const pose = boundGait(g, face, 0.55, 0.04, 0.06);
    pose.sway = Math.sin((g || 0) * 2) * 2.1;
    pose.squash = 0.015;
    return pose;
  }
  if (e.kind === 'boss') {
    if (!e.grounded) {
      const rising = e.vy < -40;
      return { bob: rising ? -1.6 : 0.8, lean: face * 0.03, squash: rising ? -0.1 : 0.1, sway: 0, pitch: rising ? -0.06 : 0.06, tail: rising ? -0.22 : -0.04 };
    }
    if ((e.cool || 1) < 0.4) {
      return { bob: 1.2, lean: face * 0.02, squash: 0.12, sway: 0, pitch: 0.07, tail: -0.22 };
    }
    const breath = Math.sin(animT * 1.7);
    return { bob: breath * 0.9, lean: face * 0.03, squash: breath * 0.03, sway: 0, pitch: breath * 0.015, tail: Math.sin(animT * 1.25) * -0.14 };
  }
  return boundGait(g, face, 3.1, 0.08, 0.12);
}

function drawDuck(e) {
  const nod = Math.sin(animT * 1.8 + e.x * 0.01);
  const wind = Math.max(0, 1 - (e.cool || 0) / 2.05);
  const up = Math.max(0, -nod);
  if (blit('duck', e.x + e.w / 2, e.y + e.h, 66, 60, e.face || -1, up * 0.025 + wind * 0.14, {
    bob: -up * 1.1, lean: 0, sway: nod * 0.3, neck: nod * 0.2 + wind * 0.18
  })) return;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h);
  ctx.scale(e.face || -1, 1);
  ctx.fillStyle = 'rgba(26,16,40,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4efe4';
  ctx.beginPath();
  ctx.ellipse(0, -11, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a1a14';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = '#d7c8a4';
  ctx.beginPath();
  ctx.ellipse(-4, -10, 6, 4, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3e8f4a';
  ctx.beginPath();
  ctx.ellipse(7, -18, 7, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e07a45';
  ctx.beginPath();
  ctx.moveTo(11, -19);
  ctx.lineTo(19, -16);
  ctx.lineTo(11, -14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2c14e';
  ctx.fillRect(-2, -2, 3, 3);
  ctx.fillRect(3, -2, 3, 3);
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(9, -20, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(9.4, -20.4, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGoose(e) {
  const nod = Math.sin(animT * 1.35 + e.x * 0.01);
  const wind = Math.max(0, 1 - (e.cool || 0) / 1.45);
  const up = Math.max(0, -nod);
  if (blit('goose', e.x + e.w / 2, e.y + e.h, 74, 88, e.face || -1, up * 0.02 + wind * 0.1, {
    bob: -up * 1.0, lean: 0, sway: nod * 0.25, neck: nod * 0.26 + wind * 0.14
  })) return;
  drawDuck(e);
}

function drawMason(e) {
  const breath = Math.sin(animT * 1.6 + e.x * 0.01);
  const wind = Math.max(0, 1 - (e.cool || 0) / 1.8);
  if (blit('mason', e.x + e.w / 2, e.y + e.h, 62, 70, e.face || -1, Math.max(0, breath) * 0.02 + wind * 0.14, { bob: -Math.max(0, breath) * 0.7, lean: (e.face || -1) * wind * 0.035, sway: breath * 0.25, pitch: wind * 0.03, tail: -0.08 + breath * 0.14 - wind * 0.18 })) return;
  drawBeaver(e.x, e.y, e.w, e.h, e.face, { angry: true, color: '#d4533c', bob: breath * 0.85 });
}

function drawTumble(img, e, dw, dh) {
  const rolling = e.state === 'roll';
  const hw = dw / 2;
  const hh = dh / 2;
  const ang = rolling ? e.x / hh : Math.sin(animT * 2.2 + e.x * 0.02) * 0.05;
  const extent = rolling ? hw * Math.abs(Math.sin(ang)) + hh * Math.abs(Math.cos(ang)) : hh;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h - extent);
  ctx.rotate(ang);
  if (!rolling) ctx.scale(e.face || 1, 1);
  ctx.drawImage(img, -hw, -hh, dw, dh);
  ctx.restore();
}

function drawTumbler(e) {
  const img = ART.tumbler;
  if (artReady(img)) {
    drawTumble(img, e, 78, 48);
    return;
  }
  drawRoller(e);
}

function drawRoller(e) {
  if (artReady(ART.loghead)) {
    drawTumble(ART.loghead, e, 72, 42);
    return;
  }
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  if (e.state === 'roll') ctx.rotate(e.x * 0.08);
  const g = ctx.createLinearGradient(0, -8, 0, 8);
  g.addColorStop(0, '#c4896a');
  g.addColorStop(1, '#4a2e22');
  ctx.fillStyle = g;
  roundRect(-e.w / 2, -8, e.w, 16, 8);
  ctx.fill();
  ctx.strokeStyle = '#2a1a14';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = '#f3d2b0';
  ctx.beginPath();
  ctx.arc(e.w * 0.28, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(e.w * 0.32, -1, 1.1, 0, Math.PI * 2);
  ctx.arc(e.w * 0.22, -1, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7f1e4';
  ctx.fillRect(e.w * 0.22, 1.5, 2, 2.5);
  ctx.fillRect(e.w * 0.32, 1.5, 2, 2.5);
  ctx.restore();
}

function drawBeaver(x, y, w, h, face, opt) {
  const o = opt || {};
  let sprite = 'bober';
  let dw = 73;
  let dh = 64;
  if (o.sprite) { sprite = o.sprite; dw = o.dw || dw; dh = o.dh || dh; }
  else if (o.boss) { sprite = 'lockjaw'; dw = 80; dh = 84; }
  else if (o.angry) { sprite = 'kit'; dw = 48; dh = 50; }
  else if (o.form === 'sap') { sprite = 'sap'; dw = 73; dh = 64; }
  else if (o.form === 'cap') { sprite = 'cap'; dw = 73; dh = 69; }
  if (blit(sprite, x + w / 2, y + h, dw, dh, face || 1, o.squash || 0, { bob: o.bob || 0, lean: o.lean || 0, sway: o.sway || 0, pitch: o.pitch || 0, tail: o.tail || 0, neck: o.neck || 0 })) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  ctx.scale(face || 1, 1);
  const squash = o.squash || 0;
  ctx.scale(1 + squash, 1 - squash * 0.8);
  const fur = o.color || '#8b5a3c';
  const light = o.angry ? '#f08a6a' : '#c4896a';
  const belly = o.angry ? '#f6d2c4' : '#f6e7c1';
  ctx.fillStyle = 'rgba(26,16,40,0.2)';
  ctx.beginPath();
  ctx.ellipse(2, 2, w * 0.42, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2418';
  ctx.beginPath();
  ctx.ellipse(-w * 0.72, -h * 0.28, w * 0.36, h * 0.1, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(26,16,40,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w * 0.95, -h * 0.3);
  ctx.lineTo(-w * 0.5, -h * 0.24);
  ctx.moveTo(-w * 0.92, -h * 0.24);
  ctx.lineTo(-w * 0.52, -h * 0.32);
  ctx.stroke();
  const body = ctx.createRadialGradient(-w * 0.1, -h * 0.5, 2, 0, -h * 0.4, h * 0.55);
  body.addColorStop(0, light);
  body.addColorStop(1, fur);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.38, w * 0.48, h * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a1a14';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(w * 0.06, -h * 0.32, w * 0.26, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(w * 0.06, -h * 0.72, w * 0.4, h * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-w * 0.16, -h * 0.92, w * 0.13, h * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(-w * 0.14, -h * 0.9, w * 0.06, h * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  const eye = Math.max(1.7, w * 0.075);
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(w * 0.2, -h * 0.74, eye, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(w * 0.22, -h * 0.76, eye * 0.35, 0, Math.PI * 2);
  ctx.fill();
  if (o.angry) {
    ctx.strokeStyle = '#1a1028';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, -h * 0.84);
    ctx.lineTo(w * 0.3, -h * 0.76);
    ctx.stroke();
  }
  ctx.fillStyle = '#2a1a14';
  ctx.beginPath();
  ctx.ellipse(w * 0.32, -h * 0.66, w * 0.08, h * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7f1e4';
  roundRect(w * 0.04, -h * 0.62, w * 0.07, h * 0.1, 1);
  ctx.fill();
  roundRect(w * 0.13, -h * 0.62, w * 0.07, h * 0.1, 1);
  ctx.fill();
  const step = Math.sin(o.phase || 0) * 2;
  ctx.fillStyle = '#4a2e22';
  ctx.beginPath();
  ctx.ellipse(-w * 0.16, -h * 0.06 + step, w * 0.15, h * 0.07, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.18, -h * 0.06 - step, w * 0.15, h * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  if (o.form === 'cap' || o.form === 'sap' || o.boss) {
    ctx.fillStyle = '#c4842a';
    ctx.beginPath();
    ctx.ellipse(w * 0.08, -h * 0.9, w * 0.46, h * 0.06, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.ellipse(w * 0.02, -h * 1.0, w * 0.28, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a1028';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = '#2f7a45';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-w * 0.02, -h * 1.02);
    ctx.lineTo(-w * 0.22, -h * 1.28);
    ctx.moveTo(-w * 0.12, -h * 1.12);
    ctx.lineTo(-w * 0.28, -h * 1.18);
    ctx.moveTo(-w * 0.08, -h * 1.16);
    ctx.lineTo(w * 0.02, -h * 1.32);
    ctx.stroke();
  }
  if (o.form === 'sap') {
    ctx.fillStyle = '#8ed36a';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, -h * 0.52, w * 0.12, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(w * 0.24, -h * 0.54, w * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}


function render() {
  if (document.body.dataset.mode === 'play') {
    layoutView();
    animT += STEP;
  }
  ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (!live || document.body.dataset.mode !== 'play') {
    ctx.fillStyle = '#1a1028';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    return;
  }
  drawWorld(live);
  const bits = [];
  if (live.player.form === 'cap') bits.push('CAP');
  else if (live.player.form === 'sap') bits.push('SAP');
  if ((live.player.stones || 0) > 0) bits.push('STONE ' + live.player.stones);
  document.getElementById('hud-lives').textContent = 'Lives ' + Math.max(0, live.lives);
  document.getElementById('hud-level').textContent = live.def.id + ' ' + live.def.name;
  document.getElementById('hud-form').textContent = bits.join(' ');
  document.getElementById('hud-coins').textContent = '$BOBER ' + live.acorns;
  document.getElementById('hud-time').textContent = String(Math.max(0, Math.ceil(live.clock)));
  const spit = document.getElementById('btn-spit');
  spit.hidden = live.player.form !== 'sap' && !(live.player.stones > 0);
  spit.textContent = live.player.stones > 0 ? 'STONE' : 'SPIT';
  document.getElementById('stage').style.background = live.theme.sky[0];
}

const STORY = [
  { img: 'assets/museum/bell-dark.jpg', kicker: 'Before the hop', title: 'The quiet bell', copy: 'The lodge bell used to answer the river every evening. One night it stayed dark. The acorns that wake it were gone from the stoop.' },
  { img: 'assets/museum/kit.jpg', kicker: 'The reds', title: 'What they carried', copy: 'Small red kits hauled those acorns up the bank. Logheads rolled behind them. A duck stood in the mud and would not move.' },
  { img: 'assets/poster.jpg', kicker: 'Pine Bank', title: 'The mud knows him', copy: 'Bober left the lodge small. Cream belly, flat tail, two teeth. The mud still knew his feet, and the bank let him pass.' },
  { img: 'assets/museum/cap.jpg', kicker: 'Stump Stairs', title: 'The lodge cap', copy: 'On the old stumps sat a yellow cap with a green sprig. Wear it and one hit glances off. Bricks break under his feet.' },
  { img: 'assets/museum/mill.jpg', kicker: 'Brick Mill', title: 'The path, chewed', copy: 'The mill had chewed the path into bricks. Sap gathered in his cheek. He learned to spit a chip, and the mill coughed him out the far side.' },
  { img: 'assets/museum/spill.jpg', kicker: 'The high wood', title: 'Water in a hurry', copy: 'Scaffolds sway. The spillway does not wait. He rides the moving log, hops the gaps, and keeps the cap.' },
  { img: 'assets/museum/lockjaw.jpg', kicker: 'Bell Rope', title: 'Lockjaw', copy: 'Lockjaw sits on the rope and will not move. Three stomps, or a mouthful of sap. Then the rope is free.' },
  { img: 'assets/museum/bell-lit.jpg', kicker: 'The rope', title: 'The bell, not the river', copy: 'Bober rings the bell. It lights. The river does not rise. The light shows the water is held upstream.' },
  { img: 'assets/poster.jpg', kicker: 'Cedar Shade', title: 'A thin creek', copy: 'He follows the light along a cedar thread. Red leapers hop the shade. The water is still only a shine between roots.' },
  { img: 'assets/museum/burrow.jpg', kicker: 'Under the bank', title: 'The root road', copy: 'A soft spot in the mud drops into a burrow. Root grubs crawl there. Rope crates hide a river stone, a cap, or another life. The bank above still goes on.' },
  { img: 'assets/museum/duck.jpg', kicker: 'Reed Water', title: 'Long necks', copy: 'Reeds thicken. Ducks stand, and geese with long necks spit quicker bubbles. The creek is deeper here, and still not a river.' },
  { img: 'assets/museum/mill.jpg', kicker: 'Clay Kiln', title: 'A second mill', copy: 'Another mill is still chewing the bank into bricks. Nippers run low and fast. He breaks what he must and keeps the thread.' },
  { img: 'assets/museum/spill.jpg', kicker: 'Rope Run', title: 'Logs over the cut', copy: 'The creekbed is an empty cut. Scaffolds and tumblers cross it. He rides nothing he does not have to.' },
  { img: 'assets/museum/bell-dark.jpg', kicker: 'Frost Bank', title: 'The creek is ice', copy: 'Snow sits on the pines. Icers slide the frozen thread. Under the ice, the water is still trying to come home.' },
  { img: 'assets/museum/dam.jpg', kicker: 'Red Dam', title: 'What holds the river', copy: 'The reds stacked logs, kits, and acorns into a dam. Masons throw bricks from the top. The lake behind it is the river that never arrived.' },
  { img: 'assets/museum/source.jpg', kicker: 'The Source', title: 'Water comes home', copy: 'Past the dam is the spring. A last keeper sits on the source rope. When he lets go, the water runs the whole way, and the lit bell finally has a river to answer.' }
];

const MUSEUM = [
  { img: 'assets/museum/bober.jpg', tag: 'Hopper', name: 'Bober', copy: 'Brown fur, cream belly, a flat tail, two teeth. He is hopping home to light the lodge bell.' },
  { img: 'assets/museum/cap.jpg', tag: 'Gear', name: 'Lodge Cap', copy: 'A yellow cap and a green sprig. One hit glances off. Bricks break.' },
  { img: 'assets/museum/sap.jpg', tag: 'Gear', name: 'Sap Spit', copy: 'Green sap gathers in the cheek. Spit throws a chip. J, K, or Shift.' },
  { img: 'assets/museum/box.jpg', tag: 'Gear', name: 'Rope Crate', copy: 'Jump on the crate. A river stone, a cap, sap, or another life spills out.' },
  { img: 'assets/museum/burrow.jpg', tag: 'Under', name: 'Root Road', copy: 'Drop through the soft bank. The burrow runs ahead and comes up through a log.' },
  { img: 'assets/museum/grub.jpg', tag: 'Under', name: 'Root Grub', copy: 'Low and pale. He paces the clay. Land on him. A drip falls when you walk under it.' },
  { img: 'assets/museum/kit.jpg', tag: 'Reds', name: 'Red Kit', copy: 'Small, red, and in the way, with the acorns that wake the bell. Land on him.' },
  { img: 'assets/museum/loghead.jpg', tag: 'Reds', name: 'Loghead', copy: 'A barked log with a face. Stomp him and he rolls until a wall stops him.' },
  { img: 'assets/museum/duck.jpg', tag: 'Reds', name: 'Bank Duck', copy: 'Stands in the mud and spits bubbles to the left. Hop over them.' },
  { img: 'assets/museum/lockjaw.jpg', tag: 'The rope', name: 'Lockjaw', copy: 'He sits on the bell rope and will not move. Three stomps, or sap, and he lets go.' },
  { img: 'assets/poster.jpg', tag: 'Bank', name: 'Pine Bank', copy: 'The mud still knows his feet. The first hop home.' },
  { img: 'assets/museum/mill.jpg', tag: 'Bank', name: 'Brick Mill', copy: 'The mill chewed the path into bricks. Scaffolds hang over the wheel.' },
  { img: 'assets/museum/spill.jpg', tag: 'Bank', name: 'Spillway', copy: 'The water is in a hurry. The logs are not.' },
  { img: 'assets/museum/bell-lit.jpg', tag: 'Home', name: 'The Bell', copy: 'Ring it once. It lights. The river does not rise yet.' },
  { img: 'assets/museum/leaper.jpg', tag: 'Reds', name: 'Leaper', copy: 'A red kit that hops the cedar shade. Stomp him on the flat.' },
  { img: 'assets/museum/goose.jpg', tag: 'Reds', name: 'Goose', copy: 'Long neck, cream body, orange bill. Spits bubbles faster than a duck.' },
  { img: 'assets/museum/nipper.jpg', tag: 'Reds', name: 'Nipper', copy: 'Low and angry. Runs at Bober when he gets close.' },
  { img: 'assets/museum/tumbler.jpg', tag: 'Reds', name: 'Tumbler', copy: 'A round barked log. Comes rolling when Bober is near.' },
  { img: 'assets/museum/icer.jpg', tag: 'Reds', name: 'Icer', copy: 'Frost on the fur. Slides the frozen bank faster than a kit.' },
  { img: 'assets/museum/mason.jpg', tag: 'Reds', name: 'Mason', copy: 'Stands on the dam and throws a clay brick straight.' },
  { img: 'assets/museum/dam.jpg', tag: 'Upstream', name: 'Red Dam', copy: 'Logs, kits, and acorns stacked until the river stops.' },
  { img: 'assets/museum/source.jpg', tag: 'Upstream', name: 'The Source', copy: 'The spring under the pines. Clear the rope and the water comes home.' }
];

function artSrc(path) {
  return path + '?v=' + BUILD;
}

function renderStory() {
  const beat = STORY[storyIndex];
  document.getElementById('story-art').src = artSrc(beat.img);
  document.getElementById('story-kicker').textContent = beat.kicker;
  document.getElementById('story-title').textContent = beat.title;
  document.getElementById('story-copy').textContent = beat.copy;
  document.getElementById('btn-story-next').textContent = storyIndex < STORY.length - 1 ? 'NEXT' : 'DONE';
}

function renderMuseum() {
  const grid = document.getElementById('museum-grid');
  if (grid.childElementCount) return;
  MUSEUM.forEach((plate, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '<img alt="" src="' + artSrc(plate.img) + '"><small>' + plate.tag + '</small><span>' + plate.name + '</span>';
    btn.addEventListener('click', () => openPlate(i));
    grid.appendChild(btn);
  });
}

function openPlate(i) {
  const plate = MUSEUM[i];
  document.getElementById('plate-art').src = artSrc(plate.img);
  document.getElementById('plate-tag').textContent = plate.tag;
  document.getElementById('plate-name').textContent = plate.name;
  document.getElementById('plate-copy').textContent = plate.copy;
  showScreen('plate');
}

function openPanel(name) {
  const mode = document.body.dataset.mode;
  panelReturn = mode === 'play' ? 'pause' : mode;
  if (name === 'story') {
    storyIndex = 0;
    renderStory();
  }
  if (name === 'museum') renderMuseum();
  showScreen(name);
}

function closePanel() {
  if (panelReturn === 'pause') {
    showScreen('play');
    paused = true;
    setCard('pause');
    return;
  }
  showScreen(panelReturn || 'title');
}

function showScreen(name) {
  const names = ['title', 'notes', 'map', 'story', 'museum', 'plate'];
  for (let i = 0; i < names.length; i++) {
    document.getElementById('screen-' + names[i]).hidden = names[i] !== name;
  }
  document.body.dataset.mode = name;
  if (name !== 'play') setCard('');
}

function setCard(name) {
  document.body.dataset.card = name;
  document.getElementById('card-pause').hidden = name !== 'pause';
  document.getElementById('card-clear').hidden = name !== 'clear';
  document.getElementById('card-over').hidden = name !== 'over';
  document.getElementById('card-end').hidden = name !== 'end';
}

function renderMap() {
  const list = document.getElementById('map-list');
  list.innerHTML = '';
  const worldName = ['', 'Pine opening', 'Brick mill', 'Bell rope', 'Cedar shade', 'Reed water', 'Clay kiln', 'Rope run', 'Frost bank', 'Red dam', 'The source'];
  let nextIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (!save.cleared[LEVELS[i].id]) { nextIndex = i; break; }
    nextIndex = i;
  }
  if (save.cleared[LEVELS[LEVELS.length - 1].id]) nextIndex = LEVELS.length - 1;
  const story = LEVELS[Math.min(save.unlocked, LEVELS.length - 1)];
  document.getElementById('map-story').textContent = story.line;
  let lastWorld = 0;
  LEVELS.forEach((lv, i) => {
    if (lv.world !== lastWorld) {
      lastWorld = lv.world;
      const heading = document.createElement('h3');
      heading.textContent = worldName[lv.world] || ('World ' + lv.world);
      list.appendChild(heading);
    }
    const open = i <= save.unlocked;
    const cleared = !!save.cleared[lv.id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.disabled = !open;
    if (open && i === nextIndex && !cleared) btn.className = 'next';
    btn.innerHTML = '<span class="lid">' + lv.id + '</span><span class="lname">' + lv.name + '</span><span class="lmark">' + (cleared ? 'BELL' : open ? 'HOP' : 'LOCKED') + '</span>';
    btn.addEventListener('click', () => startLevel(lv.id));
    list.appendChild(btn);
  });
}

function startLevel(id) {
  ensureAudio();
  const params = new URLSearchParams(location.search);
  live = createState(id, { bot: params.has('bot') });
  paused = false;
  latch = '';
  showScreen('play');
  setCard('');
}

function onClear(state) {
  const index = LEVELS.findIndex((lv) => lv.id === state.def.id);
  if (index >= 0) save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length - 1, index + 1));
  const prev = save.cleared[state.def.id];
  const timeLeft = Math.max(0, Math.ceil(state.clock));
  if (!prev || timeLeft > prev.time) save.cleared[state.def.id] = { time: timeLeft };
  save.bank = state.acorns;
  persist();
}

function openClear() {
  document.getElementById('clear-title').textContent = live.def.name + ' clear';
  document.getElementById('clear-copy').textContent = live.def.after + ' ' + live.acorns + ' $BOBER banked. ' + Math.max(0, Math.ceil(live.clock)) + 's still on the sun.';
  const index = LEVELS.findIndex((lv) => lv.id === live.def.id);
  document.getElementById('btn-next').hidden = index >= LEVELS.length - 1;
  setCard('clear');
}

function openEnd() {
  document.getElementById('end-title').textContent = 'The river is home';
  document.getElementById('end-copy').textContent = 'The keeper lets go of the source rope. Water runs the creek, the spillway, and the mill, and the lit bell finally has a river to answer. ' + live.acorns + ' $BOBER banked.';
  setCard('end');
}

function openOver() {
  setCard('over');
  persist();
}

function watch() {
  if (!live || paused) return;
  if (live.mode === 'clear' && latch !== 'clear') {
    latch = 'clear';
    onClear(live);
    if (live.def.ending) openEnd();
    else openClear();
  } else if (live.mode === 'over' && latch !== 'over') {
    latch = 'over';
    openOver();
  }
}

function readInput() {
  if (live && live.bot) return botInput(live);
  let left = held.left && !held.right;
  let right = held.right && !held.left;
  if (left || right) {
    lastDir = left ? -1 : 1;
    dirGrace = 0.22;
  } else if (held.jump && dirGrace > 0) {
    dirGrace -= STEP;
    if (lastDir < 0) left = true;
    else right = true;
  } else dirGrace = Math.max(0, dirGrace - STEP);
  const input = {
    left: left,
    right: right,
    jump: held.jump,
    jumpPressed: pressed.jump,
    spit: held.spit,
    spitPressed: pressed.spit,
    down: held.down
  };
  pressed.jump = false;
  pressed.spit = false;
  return input;
}

function frame(now) {
  if (!lastT) lastT = now;
  let dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  acc += dt;
  let guard = 0;
  while (acc >= STEP && guard < 5) {
    if (live && !paused && document.body.dataset.mode === 'play') {
      const input = (live.mode === 'play') ? readInput() : blankInput();
      advance(live, input);
      watch();
    }
    acc -= STEP;
    guard += 1;
  }
  render();
  requestAnimationFrame(frame);
}

function bindHold(id, key) {
  const el = document.getElementById(id);
  const ids = new Set();
  const down = (ev) => {
    ev.preventDefault();
    ids.add(ev.pointerId);
    held[key] = true;
    if (key === 'jump' || key === 'spit') pressed[key] = true;
    if (el.setPointerCapture) {
      try { el.setPointerCapture(ev.pointerId); } catch (err) { /* pointer already gone */ }
    }
    ensureAudio();
  };
  const up = (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (ev && ev.pointerId != null) ids.delete(ev.pointerId);
    if (ids.size === 0) held[key] = false;
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}

function bindUI() {
  document.getElementById('btn-play').addEventListener('click', () => {
    ensureAudio();
    renderMap();
    showScreen('map');
  });
  document.getElementById('btn-continue').addEventListener('click', () => {
    ensureAudio();
    renderMap();
    showScreen('map');
  });
  document.getElementById('btn-notes').addEventListener('click', () => showScreen('notes'));
  document.getElementById('btn-notes-back').addEventListener('click', () => showScreen('title'));
  document.getElementById('btn-story').addEventListener('click', () => openPanel('story'));
  document.getElementById('btn-museum').addEventListener('click', () => openPanel('museum'));
  document.getElementById('btn-map-story').addEventListener('click', () => openPanel('story'));
  document.getElementById('btn-map-museum').addEventListener('click', () => openPanel('museum'));
  document.getElementById('btn-story-next').addEventListener('click', () => {
    if (storyIndex < STORY.length - 1) {
      storyIndex += 1;
      renderStory();
    } else closePanel();
  });
  document.getElementById('btn-story-back').addEventListener('click', closePanel);
  document.getElementById('btn-museum-back').addEventListener('click', closePanel);
  document.getElementById('btn-plate-back').addEventListener('click', () => showScreen('museum'));
  document.getElementById('btn-map-title').addEventListener('click', () => showScreen('title'));
  document.getElementById('btn-sound').addEventListener('click', () => {
    soundOn = !soundOn;
    save.sound = soundOn;
    persist();
    document.getElementById('btn-sound').textContent = soundOn ? 'Sound on' : 'Sound off';
    if (soundOn) ensureAudio();
  });
  document.getElementById('btn-pause').addEventListener('click', () => {
    if (!live || document.body.dataset.mode !== 'play') return;
    if (document.body.dataset.card && document.body.dataset.card !== 'pause') return;
    paused = true;
    setCard('pause');
  });
  document.getElementById('btn-resume').addEventListener('click', () => {
    paused = false;
    setCard('');
    pressed.jump = false;
    pressed.spit = false;
  });
  document.getElementById('btn-pause-museum').addEventListener('click', () => openPanel('museum'));
  document.getElementById('btn-restart').addEventListener('click', () => {
    if (live) startLevel(live.def.id);
  });
  document.getElementById('btn-quit').addEventListener('click', () => {
    live = null;
    paused = false;
    renderMap();
    showScreen('map');
  });
  document.getElementById('btn-next').addEventListener('click', () => {
    const index = LEVELS.findIndex((lv) => lv.id === live.def.id);
    if (index >= 0 && index < LEVELS.length - 1) startLevel(LEVELS[index + 1].id);
  });
  document.getElementById('btn-clear-map').addEventListener('click', () => {
    live = null;
    renderMap();
    showScreen('map');
  });
  document.getElementById('btn-retry').addEventListener('click', () => {
    if (live) startLevel(live.def.id);
  });
  document.getElementById('btn-over-map').addEventListener('click', () => {
    live = null;
    renderMap();
    showScreen('map');
  });
  document.getElementById('btn-end-map').addEventListener('click', () => {
    live = null;
    renderMap();
    showScreen('map');
  });
  bindHold('btn-left', 'left');
  bindHold('btn-right', 'right');
  bindHold('btn-jump', 'jump');
  bindHold('btn-spit', 'spit');
  document.addEventListener('gesturestart', (ev) => ev.preventDefault());
  document.addEventListener('gesturechange', (ev) => ev.preventDefault());
  document.addEventListener('touchmove', (ev) => {
    if (ev.touches && ev.touches.length > 1) ev.preventDefault();
  }, { passive: false });
  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const map = {
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
      ArrowUp: 'jump', Space: 'jump', KeyZ: 'jump', KeyW: 'jump',
      KeyJ: 'spit', KeyK: 'spit', ShiftLeft: 'spit',
      ArrowDown: 'down', KeyS: 'down'
    };
    if (map[ev.code]) {
      ev.preventDefault();
      held[map[ev.code]] = true;
      if (map[ev.code] === 'jump' || map[ev.code] === 'spit') pressed[map[ev.code]] = true;
      ensureAudio();
    }
    if (ev.code === 'Escape') {
      const mode = document.body.dataset.mode;
      if (mode === 'plate') {
        ev.preventDefault();
        showScreen('museum');
        return;
      }
      if (mode === 'story' || mode === 'museum') {
        ev.preventDefault();
        closePanel();
        return;
      }
    }
    if (ev.code === 'Escape' || ev.code === 'KeyP') {
      if (live && document.body.dataset.mode === 'play' && (!document.body.dataset.card || document.body.dataset.card === 'pause')) {
        ev.preventDefault();
        if (paused) {
          paused = false;
          setCard('');
        } else {
          paused = true;
          setCard('pause');
        }
      }
    }
  });
  window.addEventListener('keyup', (ev) => {
    const map = {
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
      ArrowUp: 'jump', Space: 'jump', KeyZ: 'jump', KeyW: 'jump',
      KeyJ: 'spit', KeyK: 'spit', ShiftLeft: 'spit',
      ArrowDown: 'down', KeyS: 'down'
    };
    if (map[ev.code]) held[map[ev.code]] = false;
  });
}

function syncContinue() {
  const has = save.unlocked > 0 || save.bank > 0 || Object.keys(save.cleared).length > 0;
  document.getElementById('btn-continue').hidden = !has;
  document.getElementById('btn-sound').textContent = soundOn ? 'Sound on' : 'Sound off';
}

loadArt();
loadSave();
bindUI();
syncContinue();
showScreen('title');
document.body.dataset.card = '';

window.__hop = {
  build: BUILD,
  start(id) { startLevel(id); },
  setBot(on) { if (live) live.bot = !!on; },
  kill() { if (live) kill(live); },
  selfTest: selfTest,
  snapshot() {
    return {
      build: BUILD,
      mode: live ? live.mode : '',
      screen: document.body.dataset.mode,
      card: document.body.dataset.card || '',
      level: live ? live.def.id : '',
      x: live ? Math.round(live.player.x) : 0,
      y: live ? Math.round(live.player.y) : 0,
      lives: live ? live.lives : save.unlocked,
      acorns: live ? live.acorns : save.bank,
      form: live ? live.player.form : '',
      shots: live ? live.shots.filter((s) => !s.dead).length : 0,
      paused: paused
    };
  }
};

requestAnimationFrame(frame);

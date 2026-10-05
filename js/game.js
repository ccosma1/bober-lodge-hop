/* Bober Lodge Hop lh1 — original bank hop. No borrowed characters or tunes. */
const BUILD = 'lh1';
const TILE = 32;
let VIEW_W = 224;
let VIEW_H = 360;
const SCALE = 2;
const STEP = 1 / 60;
const GRAV = 2100;
const JUMP_V = -680;
const JUMP_CUT = -280;
const RUN = 176;
const ACC = 1280;
const FRIC = 1700;
const MAX_FALL = 860;
const SAVE_KEY = 'bober-lodge-hop-v1';
const SOLID = new Set(['#', 'B', '?', '!', 'S', 'u']);

const THEMES = {
  bank: { sky: ['#8fd4f8', '#e7f7ff'], hill: '#67b85a', hill2: '#3e8f4a', water: '#3aa0c8', night: false },
  mill: { sky: ['#f2c48a', '#f8e2c4'], hill: '#c4845a', hill2: '#8a5a3a', water: '#3a88a8', night: false },
  spill: { sky: ['#7ec8d4', '#d7f4ef'], hill: '#3e8f78', hill2: '#1f6a62', water: '#1a7e96', night: false },
  night: { sky: ['#14243c', '#3d5c7a'], hill: '#1b3a38', hill2: '#122828', water: '#14384a', night: true }
};

const canvas = document.getElementById('view');
const ctx = canvas.getContext('2d');

function layoutView() {
  const rect = document.getElementById('stage').getBoundingClientRect();
  const w = rect.width || 390;
  const h = rect.height || 520;
  const nextW = 224;
  const nextH = Math.max(240, Math.round(nextW * (h / Math.max(1, w))));
  if (nextW === VIEW_W && nextH === VIEW_H && canvas.width === nextW * SCALE) return;
  VIEW_W = nextW;
  VIEW_H = nextH;
  canvas.width = VIEW_W * SCALE;
  canvas.height = VIEW_H * SCALE;
}

const held = { left: false, right: false, jump: false, spit: false, down: false };
const pressed = { jump: false, spit: false };
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
  if (def.id === '3-2') return THEMES.night;
  if (def.id === '3-1') return THEMES.spill;
  if (def.world === 2) return THEMES.mill;
  return THEMES.bank;
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
    run: 0, squash: 0, ride: -1, prevBottom: foot,
    falling: false, spitCool: 0, wasGround: false
  };
}

function makeEnemy(kind, x, foot) {
  const spec = {
    kit: { w: 26, h: 26, speed: 46 },
    roller: { w: 30, h: 26, speed: 40 },
    duck: { w: 30, h: 28, speed: 0 },
    boss: { w: 52, h: 56, speed: 52 }
  }[kind];
  return {
    kind: kind,
    x: x,
    y: foot - spec.h,
    w: spec.w,
    h: spec.h,
    vx: kind === 'duck' ? 0 : spec.speed,
    vy: 0,
    speed: spec.speed,
    face: kind === 'duck' ? -1 : 1,
    alive: true,
    state: 'walk',
    hp: kind === 'boss' ? 3 : 1,
    cool: kind === 'duck' ? 1.4 : 1.6,
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
      } else if (c === 'J') {
        enemies.push(makeEnemy('boss', px - 10, foot));
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

function doSpit(state) {
  const p = state.player;
  if (p.form !== 'sap' || p.spitCool > 0) return;
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
  else {
    const s = Math.sign(p.vx);
    if (s !== 0) {
      p.vx -= s * FRIC * STEP;
      if (Math.sign(p.vx) !== s) p.vx = 0;
    }
  }
  p.vx = clamp(p.vx, -RUN, RUN);
  if (input.left && !input.right) p.face = -1;
  if (input.right && !input.left) p.face = 1;

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
    if (!p.wasGround) p.squash = 0.1;
    p.grounded = true;
    p.coyote = 0.1;
  } else {
    if (p.grounded) p.coyote = 0.1;
    p.grounded = false;
  }
  p.wasGround = p.grounded;
  if (hit.ceiling) tryHit(state, hit.ceiling.tx, hit.ceiling.ty);
  if (p.grounded && Math.abs(p.vx) > 24) p.run += STEP * 12;
  if (input.spitPressed) doSpit(state);
}

function stepEnemy(state, e) {
  if (!e.alive) return;
  e.invuln = Math.max(0, e.invuln - STEP);
  if (e.kind === 'duck') {
    e.cool -= STEP;
    if (e.cool <= 0) {
      e.cool = 2.05;
      state.shots.push({
        x: e.face < 0 ? e.x - 10 : e.x + e.w,
        y: e.y + 8,
        w: 12, h: 12,
        vx: e.face * 110,
        vy: 0,
        life: 2.4,
        from: 'duck',
        dead: false
      });
    }
    return;
  }
  if (e.kind === 'boss' && e.grounded) {
    e.cool -= STEP;
    if (e.cool <= 0) {
      e.vy = -380;
      e.grounded = false;
      e.cool = 2.6;
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

function interact(state) {
  const p = state.player;
  if (state.mode !== 'play') return;
  for (let i = 0; i < state.items.length; i++) {
    const it = state.items[i];
    if (it.dead || !overlap(p, it)) continue;
    it.dead = true;
    if (it.kind === 'cap') {
      if (p.form === 'small') setForm(state, 'cap');
      else grant(state, 5);
    } else if (p.form !== 'sap') setForm(state, 'sap');
    else grant(state, 5);
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
    const fromAbove = p.falling && p.prevBottom <= e.y + 14;
    if (fromAbove) {
      stomped = true;
      p.vy = -430;
      p.grounded = false;
      p.y = e.y - p.h - 0.5;
      p.ride = -1;
      sfxStomp();
      if (e.kind === 'boss') damageBoss(state, e);
      else if (e.kind === 'roller' && e.state !== 'roll') {
        e.state = 'roll';
        e.vx = (p.x + p.w / 2 < e.x + e.w / 2 ? 1 : -1) * 250;
        e.face = Math.sign(e.vx);
        e.speed = 250;
      } else {
        e.alive = false;
        burst(state, e.x + e.w / 2, e.y, '#e07a5a', 6);
      }
      break;
    }
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
  for (let i = 0; i < state.shots.length; i++) {
    const s = state.shots[i];
    if (s.dead) continue;
    if (s.from === 'duck' && state.mode === 'play' && overlap(s, p)) {
      s.dead = true;
      hurt(state);
      continue;
    }
    if (s.from !== 'player') continue;
    for (let j = 0; j < state.enemies.length; j++) {
      const e = state.enemies[j];
      if (!e.alive || !overlap(s, e)) continue;
      s.dead = true;
      if (e.kind === 'boss') damageBoss(state, e);
      else if (e.kind === 'roller' && e.state !== 'roll') {
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
    if (!e.alive || e.kind !== 'roller' || e.state !== 'roll') continue;
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
        if (s.from !== 'duck' || s.dead) continue;
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
      if (p.form === 'sap') {
        for (let i = 0; i < state.enemies.length; i++) {
          const e = state.enemies[i];
          if (!e.alive) continue;
          const dx = (e.x + e.w / 2) - (p.x + p.w / 2);
          if (dx > 16 && dx < 150 && Math.abs(e.y - p.y) < 36) spit = true;
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
  interact(state);
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
    const cap = 60 * 55;
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

function drawWorld(state) {
  const theme = state.theme;
  const camX = state.camX;
  const camY = state.camY;
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, theme.sky[0]);
  sky.addColorStop(1, theme.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (theme.night) {
    ctx.fillStyle = '#f6e7c1';
    ctx.beginPath();
    ctx.arc(VIEW_W - 28, state.bannerT > 0 ? 86 : 32, 12, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#ffe28a';
    ctx.beginPath();
    ctx.arc(VIEW_W - 36, state.bannerT > 0 ? 92 : 34, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = theme.hill2;
  for (let i = -1; i < 8; i++) {
    const x = i * 90 - (camX * 0.25 % 90);
    ctx.beginPath();
    ctx.ellipse(x, VIEW_H * 0.78, 70, 36, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = theme.hill;
  for (let i = -1; i < 10; i++) {
    const x = i * 70 - (camX * 0.45 % 70);
    ctx.beginPath();
    ctx.moveTo(x, VIEW_H);
    ctx.lineTo(x + 22, VIEW_H * 0.62);
    ctx.lineTo(x + 36, VIEW_H * 0.7);
    ctx.lineTo(x + 58, VIEW_H);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(-Math.round(camX), -Math.round(camY));
  ctx.fillStyle = theme.water;
  ctx.fillRect(0, (state.h - 2) * TILE, state.w * TILE, TILE * 2);
  if (state.def.id === '3-2') drawLodge(state.w * TILE - 150, 5 * TILE);
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
  if (!blink) drawBeaver(p.x, p.y, p.w, p.h, p.face, { form: p.form, phase: p.run, squash: p.squash, color: '#8b5a3c' });
  for (let i = 0; i < state.parts.length; i++) {
    const part = state.parts[i];
    ctx.globalAlpha = Math.max(0, part.life * 2);
    ctx.fillStyle = part.color;
    ctx.fillRect(part.x, part.y, part.r, part.r);
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
  ctx.fillStyle = '#6b442c';
  ctx.fillRect(x, y + 20, 92, 46);
  ctx.fillStyle = '#3e8f4a';
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 24);
  ctx.lineTo(x + 46, y);
  ctx.lineTo(x + 100, y + 24);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.fillRect(x + 36, y + 40, 18, 26);
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.arc(x + 78, y + 18, 8, Math.PI, 0);
  ctx.lineTo(x + 86, y + 30);
  ctx.quadraticCurveTo(x + 78, y + 34, x + 70, y + 30);
  ctx.fill();
}

function drawTile(state, x, y) {
  const c = state.rows[y][x];
  if (c === '.' || c === 'u' && false) return;
  const px = x * TILE;
  let py = y * TILE;
  const bump = state.bumps[x + ',' + y] || 0;
  if (bump > 0) py -= Math.sin((bump / 0.14) * Math.PI) * 7;
  const above = tileAt(state, x, y - 1);
  if (c === '#') {
    const top = !SOLID.has(above) && above !== '=';
    ctx.fillStyle = top ? '#3e9a45' : '#8b5a34';
    ctx.fillRect(px, py, TILE, TILE);
    if (top) {
      ctx.fillStyle = '#2c7334';
      ctx.fillRect(px, py, TILE, 6);
      ctx.fillStyle = '#73c96a';
      ctx.fillRect(px + 4, py - 3, 3, 5);
      ctx.fillRect(px + 14, py - 4, 3, 6);
      ctx.fillRect(px + 24, py - 2, 3, 4);
    }
    return;
  }
  if (c === 'B' || c === 'u' || c === '?' || c === '!' || c === 'S') {
    ctx.fillStyle = c === 'B' ? '#c46a45' : (c === 'u' ? '#a98455' : '#e2a53a');
    ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
    ctx.strokeStyle = '#1a1028';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
    if (c === 'B') {
      ctx.strokeStyle = '#f3d2b0';
      ctx.beginPath();
      ctx.moveTo(px + 2, py + TILE / 2);
      ctx.lineTo(px + TILE - 2, py + TILE / 2);
      ctx.moveTo(px + TILE / 2, py + 2);
      ctx.lineTo(px + TILE / 2, py + TILE / 2);
      ctx.stroke();
    } else if (c === '?') {
      drawAcorn(px + 16, py + 18, 7);
    } else if (c === '!') {
      ctx.fillStyle = '#f2c14e';
      roundRect(px + 8, py + 8, 16, 6, 2);
      ctx.fill();
      ctx.fillStyle = '#2e7a3a';
      ctx.fillRect(px + 14, py + 4, 2, 6);
    } else if (c === 'S') {
      ctx.fillStyle = '#7dce6a';
      ctx.beginPath();
      ctx.arc(px + 16, py + 18, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  if (c === '=') {
    ctx.fillStyle = '#a56b3c';
    roundRect(px + 1, py + 2, TILE - 2, 14, 6);
    ctx.fill();
    ctx.fillStyle = '#d9a36a';
    ctx.fillRect(px + 4, py + 5, TILE - 8, 3);
    return;
  }
  if (c === 'C') {
    drawAcorn(px + 16, py + 16, 8);
    return;
  }
  if (c === '^') {
    ctx.fillStyle = '#d7d2c8';
    ctx.beginPath();
    ctx.moveTo(px + 4, py + TILE);
    ctx.lineTo(px + 10, py + 8);
    ctx.lineTo(px + 16, py + TILE);
    ctx.moveTo(px + 16, py + TILE);
    ctx.lineTo(px + 22, py + 6);
    ctx.lineTo(px + 28, py + TILE);
    ctx.fill();
  }
}

function drawAcorn(x, y, r) {
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.ellipse(x, y + 1, r * 0.7, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b3a22';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.45, r * 0.55, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLog(log) {
  ctx.fillStyle = '#8b5a34';
  roundRect(log.x, log.y, log.w, log.h, 7);
  ctx.fill();
  ctx.fillStyle = '#d9a36a';
  ctx.fillRect(log.x + 8, log.y + 4, log.w - 16, 3);
  ctx.fillStyle = '#6b442c';
  ctx.beginPath();
  ctx.arc(log.x + 8, log.y + 8, 6, 0, Math.PI * 2);
  ctx.arc(log.x + log.w - 8, log.y + 8, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawItem(it) {
  if (it.kind === 'cap') {
    ctx.fillStyle = '#f2c14e';
    roundRect(it.x, it.y + 4, it.w, 8, 3);
    ctx.fill();
    ctx.strokeStyle = '#2e7a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(it.x + 8, it.y + 4);
    ctx.lineTo(it.x + 4, it.y - 4);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#7dce6a';
    roundRect(it.x + 4, it.y, 10, 16, 4);
    ctx.fill();
    ctx.fillStyle = '#f6e7c1';
    ctx.fillRect(it.x + 7, it.y + 2, 4, 4);
  }
}

function drawShot(s) {
  ctx.fillStyle = s.from === 'duck' ? '#d7f4ff' : '#b6e37a';
  ctx.beginPath();
  ctx.arc(s.x + s.w / 2, s.y + s.h / 2, s.w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1028';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawPole(state) {
  const pole = state.pole;
  const lit = state.mode === 'clearing' || state.mode === 'clear';
  ctx.fillStyle = '#6b442c';
  ctx.fillRect(pole.x + 8, pole.y, 6, pole.h);
  ctx.fillStyle = lit ? '#ffe28a' : '#8a7340';
  const bx = pole.x + 11;
  const by = pole.y + 4;
  ctx.beginPath();
  ctx.arc(bx, by, 10, Math.PI, 0);
  ctx.lineTo(bx + 10, by + 12);
  ctx.quadraticCurveTo(bx, by + 18, bx - 10, by + 12);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(bx, by + 10, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemy(state, e) {
  if (e.kind === 'duck') {
    drawDuck(e);
    return;
  }
  if (e.kind === 'roller') {
    drawRoller(e);
    return;
  }
  const color = e.kind === 'boss' ? '#c44536' : '#d4533c';
  drawBeaver(e.x, e.y, e.w, e.h, e.face, {
    form: 'small',
    phase: e.x * 0.08,
    color: color,
    angry: true,
    boss: e.kind === 'boss'
  });
  if (e.kind === 'boss') {
    ctx.fillStyle = '#f6e7c1';
    ctx.font = '700 11px Trebuchet MS, sans-serif';
    ctx.textAlign = 'center';
    const labelX = clamp(e.x + e.w / 2, state.camX + 48, state.camX + VIEW_W - 48);
    ctx.fillText('LOCKJAW', labelX, e.y - 16);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < e.hp ? '#f2c14e' : '#3a2a22';
      ctx.fillRect(labelX - 16 + i * 12, e.y - 12, 8, 5);
    }
    ctx.textAlign = 'left';
  }
}

function drawDuck(e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h);
  ctx.scale(e.face || -1, 1);
  ctx.fillStyle = '#f3e2c4';
  ctx.beginPath();
  ctx.ellipse(0, -12, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3e8f4a';
  ctx.beginPath();
  ctx.ellipse(6, -18, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e07a45';
  ctx.beginPath();
  ctx.moveTo(10, -18);
  ctx.lineTo(18, -16);
  ctx.lineTo(10, -14);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(8, -20, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRoller(e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  if (e.state === 'roll') ctx.rotate(e.x * 0.08);
  ctx.fillStyle = '#8b5a34';
  roundRect(-e.w / 2, -8, e.w, 16, 8);
  ctx.fill();
  ctx.fillStyle = '#f3d2b0';
  ctx.beginPath();
  ctx.arc(4, -1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.fillRect(5, -3, 2, 2);
  ctx.restore();
}

function drawBeaver(x, y, w, h, face, opt) {
  const o = opt || {};
  ctx.save();
  ctx.translate(x + w / 2, y + h);
  ctx.scale(face || 1, 1);
  const squash = o.squash || 0;
  ctx.scale(1 + squash, 1 - squash * 0.8);
  const color = o.color || '#8b5a3c';
  ctx.fillStyle = '#4a2e22';
  roundRect(-w * 0.95, -h * 0.42, w * 0.62, h * 0.16, 4);
  ctx.fill();
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(-w * 0.9, -h * 0.38, w * 0.5, 2);
  ctx.fillRect(-w * 0.9, -h * 0.32, w * 0.5, 2);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.36, w * 0.46, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f3d2b0';
  ctx.beginPath();
  ctx.ellipse(w * 0.05, -h * 0.3, w * 0.26, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(w * 0.08, -h * 0.7, w * 0.4, h * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-w * 0.12, -h * 0.9, w * 0.12, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1028';
  ctx.beginPath();
  ctx.arc(w * 0.2, -h * 0.72, Math.max(1.5, w * 0.07), 0, Math.PI * 2);
  ctx.fill();
  if (o.angry) {
    ctx.strokeStyle = '#1a1028';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, -h * 0.8);
    ctx.lineTo(w * 0.28, -h * 0.76);
    ctx.stroke();
  }
  ctx.fillStyle = '#f7f1e4';
  ctx.fillRect(w * 0.02, -h * 0.6, w * 0.08, h * 0.08);
  ctx.fillRect(w * 0.12, -h * 0.6, w * 0.08, h * 0.08);
  const step = Math.sin(o.phase || 0) * 2;
  ctx.fillStyle = '#5c3a2a';
  ctx.beginPath();
  ctx.ellipse(-w * 0.16, -h * 0.08 + step, w * 0.14, h * 0.08, 0, 0, Math.PI * 2);
  ctx.ellipse(w * 0.18, -h * 0.08 - step, w * 0.14, h * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  if (o.form === 'cap' || o.form === 'sap' || o.boss) {
    ctx.fillStyle = '#f2c14e';
    roundRect(-w * 0.28, -h * 0.98, w * 0.7, h * 0.1, 3);
    ctx.fill();
    ctx.strokeStyle = '#2e7a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(-w * 0.15, -h * 1.16);
    ctx.stroke();
  } else if (!o.angry) {
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(-w * 0.05, -h * 0.5, w * 0.28, h * 0.06);
  }
  if (o.form === 'sap') {
    ctx.fillStyle = '#7dce6a';
    roundRect(w * 0.2, -h * 0.48, w * 0.16, h * 0.16, 3);
    ctx.fill();
  }
  ctx.restore();
}

function render() {
  if (document.body.dataset.mode === 'play') layoutView();
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = true;
  if (!live || document.body.dataset.mode !== 'play') {
    ctx.fillStyle = '#1a1028';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    return;
  }
  drawWorld(live);
  const form = live.player.form === 'small' ? '' : (live.player.form === 'cap' ? 'CAP' : 'SAP');
  document.getElementById('hud-lives').textContent = 'Lives ' + Math.max(0, live.lives);
  document.getElementById('hud-level').textContent = live.def.id + ' ' + live.def.name;
  document.getElementById('hud-form').textContent = form;
  document.getElementById('hud-coins').textContent = '$BOBER ' + live.acorns;
  document.getElementById('hud-time').textContent = String(Math.max(0, Math.ceil(live.clock)));
  document.getElementById('btn-spit').hidden = live.player.form !== 'sap';
  document.getElementById('stage').style.background = live.theme.sky[0];
}

function showScreen(name) {
  document.getElementById('screen-title').hidden = name !== 'title';
  document.getElementById('screen-notes').hidden = name !== 'notes';
  document.getElementById('screen-map').hidden = name !== 'map';
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
  let nextIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (!save.cleared[LEVELS[i].id]) { nextIndex = i; break; }
    nextIndex = i;
  }
  if (save.cleared[LEVELS[LEVELS.length - 1].id]) nextIndex = LEVELS.length - 1;
  const story = LEVELS[Math.min(save.unlocked, LEVELS.length - 1)];
  document.getElementById('map-story').textContent = story.line;
  LEVELS.forEach((lv, i) => {
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
  document.getElementById('end-copy').textContent = 'Bober rings the bell once. The reds scatter. The river answers, and the lodge is lit. ' + live.acorns + ' $BOBER banked.';
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
    if (live.def.id === '3-2') openEnd();
    else openClear();
  } else if (live.mode === 'over' && latch !== 'over') {
    latch = 'over';
    openOver();
  }
}

function readInput() {
  if (live && live.bot) return botInput(live);
  const input = {
    left: held.left && !held.right,
    right: held.right && !held.left,
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
  const down = (ev) => {
    ev.preventDefault();
    held[key] = true;
    if (key === 'jump' || key === 'spit') pressed[key] = true;
    ensureAudio();
  };
  const up = (ev) => {
    ev.preventDefault();
    held[key] = false;
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', up);
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
      paused: paused
    };
  }
};

requestAnimationFrame(frame);

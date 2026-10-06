/* Bober Burrow Hop — banks from the lodge bell to the source, with burrows under some of them. */
const LEVELS = [];
const TILE_CHARS = new Set(['.', '#', '=', 'B', '?', '!', 'S', 'u', 'C', 'K', 'R', 'D', 'J', 'P', 'F', 'M', '^', 'H', 'A', 'L', 'G', 'N', 'T', 'I', 'Q', 'X', 'U', 'V']);

function buildLevel(w, h, ground, paint) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) row.push(y >= ground ? '#' : '.');
    rows.push(row);
  }
  const set = (x, y, c) => {
    if (x < 0 || y < 0 || x >= w || y >= h) throw new Error('oob ' + x + ',' + y);
    rows[y][x] = c;
  };
  const fill = (x, y, ww, hh, c) => {
    for (let j = 0; j < hh; j++) {
      for (let i = 0; i < ww; i++) set(x + i, y + j, c);
    }
  };
  paint(set, fill);
  return rows.map((row) => row.join(''));
}

function stage(meta, w, h, ground, paint) {
  const rows = buildLevel(w, h, ground, paint);
  LEVELS.push(Object.assign({ w: w, h: h, ground: ground, rows: rows }, meta));
}

stage({
  id: '1-1',
  world: 1,
  name: 'Pine Bank',
  line: 'The mud still knows his feet.',
  hint: 'Hold jump. Land on the reds.',
  after: 'The bank lets him pass.',
  time: 200
}, 80, 14, 12, (set, fill) => {
  set(3, 11, 'P');
  for (let i = 0; i < 6; i++) set(8 + i, 11, 'C');
  set(16, 9, '?');
  fill(22, 12, 2, 2, '.');
  set(28, 11, 'K');
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k <= i; k++) set(34 + i, 11 - k, '#');
  }
  fill(38, 8, 6, 6, '#');
  set(40, 7, 'K');
  set(41, 5, '?');
  for (let i = 0; i < 4; i++) set(39 + i, 6, 'C');
  fill(50, 12, 2, 2, '.');
  set(56, 11, 'K');
  set(60, 9, 'B');
  set(61, 9, '?');
  set(62, 9, 'B');
  set(68, 11, 'K');
  for (let i = 0; i < 4; i++) set(72 + i, 11, 'C');
  set(77, 11, 'F');
});

stage({
  id: '1-2',
  world: 1,
  name: 'Stump Stairs',
  line: 'Old stumps mark where the river used to sit.',
  after: 'The stumps are behind him.',
  time: 210
}, 96, 14, 12, (set, fill) => {
  set(3, 11, 'P');
  set(8, 11, 'H');
  set(12, 9, '!');
  set(14, 9, '?');
  for (let i = 0; i < 5; i++) set(16 + i, 11, 'C');
  set(24, 11, 'R');
  for (let i = 0; i < 5; i++) {
    for (let k = 0; k <= i; k++) set(32 + i, 11 - k, '#');
  }
  fill(37, 7, 5, 7, '#');
  set(39, 6, 'K');
  for (let i = 0; i < 3; i++) set(38 + i, 5, 'C');
  fill(48, 12, 2, 2, '.');
  set(54, 11, 'K');
  set(60, 11, 'R');
  fill(66, 12, 20, 2, '.');
  fill(66, 10, 4, 1, '=');
  fill(72, 9, 4, 1, '=');
  fill(78, 10, 4, 1, '=');
  fill(83, 11, 3, 1, '=');
  set(90, 11, 'K');
  set(93, 11, 'F');
});

stage({
  id: '2-1',
  world: 2,
  name: 'Brick Mill',
  line: 'The mill chewed the path into bricks.',
  after: 'The mill coughs him out the far side.',
  time: 220
}, 92, 14, 12, (set, fill) => {
  set(3, 11, 'P');
  set(8, 11, 'A');
  for (let i = 0; i < 7; i++) set(12 + i, 9, i === 3 ? 'S' : 'B');
  for (let i = 0; i < 4; i++) set(14 + i, 11, 'C');
  set(24, 11, 'K');
  set(30, 11, 'R');
  fill(38, 12, 2, 2, '.');
  set(44, 11, 'K');
  set(48, 9, '?');
  set(49, 9, 'B');
  set(50, 9, '!');
  set(56, 11, 'R');
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k <= i; k++) set(64 + i, 11 - k, 'B');
  }
  set(72, 11, 'K');
  set(78, 11, 'D');
  for (let i = 0; i < 3; i++) set(82 + i, 11, 'C');
  set(88, 11, 'F');
});

stage({
  id: '2-2',
  world: 2,
  name: 'High Scaffolds',
  line: 'Someone left a lodge cap on the scaffold.',
  after: 'The scaffold sways, and he keeps going.',
  time: 230
}, 90, 16, 14, (set, fill) => {
  set(3, 13, 'P');
  set(8, 13, 'H');
  set(12, 11, '?');
  for (let i = 0; i < 4; i++) set(14 + i, 13, 'C');
  fill(22, 14, 48, 2, '.');
  fill(22, 13, 5, 1, '=');
  fill(28, 12, 4, 1, '=');
  fill(33, 12, 4, 1, '=');
  fill(38, 11, 4, 1, '=');
  set(42, 11, 'M');
  fill(46, 11, 5, 1, '=');
  fill(52, 12, 4, 1, '=');
  fill(57, 12, 4, 1, '=');
  fill(62, 13, 4, 1, '=');
  fill(67, 13, 4, 1, '=');
  set(76, 13, 'K');
  for (let i = 0; i < 3; i++) set(80 + i, 13, 'C');
  set(86, 13, 'F');
});

stage({
  id: '3-1',
  world: 3,
  name: 'Spillway',
  line: 'The water is in a hurry. The logs are not.',
  after: 'The spillway did not take him.',
  time: 220
}, 86, 14, 12, (set, fill) => {
  set(2, 11, 'P');
  set(7, 11, 'A');
  for (let i = 0; i < 5; i++) set(10 + i, 11, 'C');
  set(18, 11, 'K');
  set(22, 9, 'B');
  set(23, 9, '?');
  set(24, 9, 'B');
  fill(30, 12, 1, 2, '.');
  set(36, 11, 'K');
  fill(44, 12, 1, 2, '.');
  set(52, 11, 'D');
  set(58, 9, 'S');
  for (let i = 0; i < 4; i++) set(62 + i, 11, 'C');
  fill(72, 12, 1, 2, '.');
  set(78, 11, 'K');
  set(82, 11, 'F');
});

stage({
  id: '3-2',
  world: 3,
  name: 'Bell Rope',
  line: 'Lockjaw sits on the rope and will not move.',
  after: 'The bell is lit. The river does not rise.',
  time: 240
}, 24, 14, 12, (set, fill) => {
  fill(0, 0, 1, 14, '#');
  fill(23, 0, 1, 14, '#');
  set(3, 11, 'P');
  set(6, 11, 'H');
  set(8, 9, '?');
  set(9, 9, 'B');
  set(14, 11, 'J');
  for (let i = 0; i < 3; i++) set(18 + i, 11, 'C');
});

const FOE = { kit: 'K', leaper: 'L', goose: 'G', duck: 'D', nipper: 'N', tumbler: 'T', icer: 'I', mason: 'Q', roller: 'R', grub: 'U', drip: 'V' };
const FOE_CH = 'KLGDNTIQRUV';

function carveBurrow(rows, b, meta) {
  const H = rows.length;
  const floor = 21;
  const setAir = (x, y0, y1) => {
    for (let y = y0; y < y1; y++) rows[y][x] = '.';
  };
  const solidFrom = (x, top) => {
    for (let y = top; y < H; y++) rows[y][x] = '#';
  };
  // Shaft is two columns. A hop clears it. A miss still has a floor.
  for (let x = b.x; x < b.x + 2; x++) {
    setAir(x, 13, floor);
    rows[floor][x] = '#';
  }
  // Covered road. Row 13 stays the bank the hop walks.
  for (let x = b.x + 2; x < b.x + 14; x++) {
    setAir(x, 14, floor);
    rows[floor][x] = '#';
  }
  rows[20][b.x + 4] = 'U';
  rows[16][b.x + 7] = 'V';
  rows[20][b.x + 10] = 'X';
  rows[20][b.x + 11] = 'X';
  meta.drops = meta.drops || {};
  meta.drops[(b.x + 10) + ',20'] = b.drop;
  meta.drops[(b.x + 11) + ',20'] = b.drop;
  // One-tile steps. Solid, so the road cannot be walked under. The last gap is one column.
  const stair = [20, 19, 18, 17];
  for (let i = 0; i < stair.length; i++) {
    const x = b.x + 14 + i;
    setAir(x, 14, stair[i]);
    solidFrom(x, stair[i]);
  }
  setAir(b.x + 18, 13, 16);
  solidFrom(b.x + 18, 16);
  const exit = b.x + 19;
  rows[13][exit] = '=';
  solidFrom(exit, 14);
  if (b.x + 21 >= rows[0].length) throw new Error(meta.id + ' burrow wide');
}

function lay(meta, script) {
  const H = 24;
  const GROUND = 13;
  const cols = [];
  const ents = [];
  const marks = [];
  const burrows = [];
  const push = (floor) => cols.push(floor);
  function topFloor() {
    for (let i = cols.length - 1; i >= 0; i--) if (cols[i] < H) return cols[i];
    return GROUND;
  }
  function resumeFloor() {
    if (cols.length && cols[cols.length - 1] < H) return cols[cols.length - 1];
    return topFloor();
  }
  function solidRun() {
    let n = 0;
    for (let i = cols.length - 1; i >= 0; i--) {
      if (cols[i] >= H) break;
      n++;
    }
    return n;
  }
  function enemyDist() {
    let last = -99;
    for (let i = 0; i < ents.length; i++) {
      if (FOE_CH.indexOf(ents[i].ch) >= 0) last = ents[i].x;
    }
    return (cols.length - 1) - last;
  }
  function pad(n) {
    const fl = cols.length && cols[cols.length - 1] < H ? cols[cols.length - 1] : GROUND;
    const have = solidRun();
    for (let i = 0; i < n - have; i++) push(fl);
  }
  function gapFromEnemy(minDist) {
    while (enemyDist() < minDist) push(resumeFloor());
  }

  for (let i = 0; i < 8; i++) push(GROUND);
  ents.push({ x: 3, ch: 'P' });

  script.split(/\s+/).filter(Boolean).forEach((tok) => {
    if (tok.indexOf('flat') === 0) {
      const n = parseInt(tok.slice(4), 10) || 4;
      const use = resumeFloor();
      for (let i = 0; i < n; i++) push(use);
      return;
    }
    if (tok === 'pit') {
      const fl = resumeFloor();
      for (let i = 0; i < 8; i++) push(fl);
      gapFromEnemy(8);
      push(H);
      return;
    }
    if (tok.indexOf('creek') === 0) {
      const digits = tok.slice(5);
      if (!/^[0-2]+$/.test(digits)) throw new Error(meta.id + ' creek ' + tok);
      const fl = resumeFloor();
      for (let i = 0; i < 8; i++) push(fl);
      gapFromEnemy(10);
      for (let i = 0; i < digits.length; i++) {
        const row = 13 - parseInt(digits[i], 10);
        for (let k = 0; k < 4; k++) {
          marks.push({ x: cols.length, y: row, ch: '=' });
          push(H);
        }
        if (i < digits.length - 1) push(H);
      }
      for (let i = 0; i < 6; i++) push(fl);
      return;
    }
    if (tok === 'ferry') {
      const fl = resumeFloor();
      for (let i = 0; i < 10; i++) push(fl);
      gapFromEnemy(12);
      marks.push({ x: cols.length, y: GROUND, ch: 'M' });
      for (let i = 0; i < 4; i++) push(H);
      for (let i = 0; i < 8; i++) push(fl);
      return;
    }
    if (tok === 'perch' || tok === 'plateau') {
      let y = resumeFloor();
      const home = y;
      for (let i = 0; i < 8; i++) push(y);
      for (let s = 0; s < 3; s++) { y = Math.max(9, y - 1); push(y); }
      for (let i = 0; i < 4; i++) push(y);
      if (tok === 'plateau') {
        push(H);
        for (let i = 0; i < 4; i++) push(y);
      }
      y = Math.max(9, y - 1);
      for (let i = 0; i < 4; i++) push(y);
      push(Math.max(8, y - 1));
      for (let i = 0; i < 4; i++) push(y);
      push(y);
      ents.push({ x: cols.length - 1, ch: tok === 'plateau' ? 'I' : 'N' });
      for (let i = 0; i < 4; i++) push(y);
      while (y < home) { y += 1; push(y); }
      for (let i = 0; i < 10; i++) push(home);
      return;
    }
    if (tok === 'island' || tok === 'gaps' || tok === 'rise' || tok === 'roll') {
      const fl0 = resumeFloor();
      for (let i = 0; i < 8; i++) push(fl0);
      gapFromEnemy(8);
      const fl = resumeFloor();
      if (tok === 'rise') {
        let y = fl;
        const start = fl;
        for (let s = 0; s < 4; s++) { y = Math.max(9, y - 1); push(y); }
        for (let i = 0; i < 5; i++) push(y);
        while (y < start) { y += 1; push(y); }
        for (let i = 0; i < 4; i++) push(y);
        return;
      }
      if (tok === 'roll') {
        let y = fl;
        const start = fl;
        [-1, -1, 0, 0, 1, -1, 0, 0, 0, 1, 1, 0, 0].forEach((d) => {
          y = Math.max(9, Math.min(GROUND, y + d));
          push(y);
        });
        while (y < start) { y += 1; push(y); }
        while (y > start) { y -= 1; push(y); }
        for (let i = 0; i < 3; i++) push(start);
        return;
      }
      const hops = tok === 'gaps' ? 3 : 2;
      const land = tok === 'gaps' ? 4 : 5;
      for (let h = 0; h < hops; h++) {
        push(H);
        for (let i = 0; i < land; i++) push(fl);
      }
      for (let i = 0; i < 3; i++) push(fl);
      return;
    }
    if (tok === 'wide') {
      pad(10);
      gapFromEnemy(10);
      const fl = resumeFloor();
      push(H);
      push(H);
      for (let i = 0; i < 10; i++) push(fl);
      return;
    }
    if (tok.indexOf('up') === 0) {
      const steps = Math.min(3, parseInt(tok.slice(2), 10) || 1);
      pad(4);
      let fl = topFloor();
      for (let s = 0; s < steps; s++) {
        fl = Math.max(9, fl - 1);
        push(fl);
      }
      return;
    }
    if (tok.indexOf('down') === 0) {
      const steps = Math.min(4, parseInt(tok.slice(4), 10) || 1);
      let fl = topFloor();
      for (let s = 0; s < steps; s++) {
        fl = Math.min(GROUND, fl + 1);
        push(fl);
      }
      return;
    }
    if (tok.indexOf('coin') === 0) {
      const n = parseInt(tok.slice(4), 10) || 3;
      for (let i = 0; i < n; i++) {
        if (cols[cols.length - 1] >= H) push(GROUND);
        ents.push({ x: cols.length - 1, ch: 'C' });
        push(cols[cols.length - 1]);
      }
      return;
    }
    if (tok.indexOf('burrow') === 0) {
      const drop = tok.slice(6) || 'stone';
      if (['stone', 'cap', 'sap', 'life', 'coin'].indexOf(drop) < 0) throw new Error(meta.id + ' burrow ' + tok);
      const x0 = cols.length;
      for (let i = 0; i < 22; i++) push(GROUND);
      burrows.push({ x: x0, drop: drop });
      return;
    }
    if (tok.indexOf('box') === 0) {
      const drop = tok.slice(3) || 'stone';
      if (['stone', 'cap', 'sap', 'life', 'coin'].indexOf(drop) < 0) throw new Error(meta.id + ' box ' + tok);
      pad(4);
      const fl = topFloor();
      const x = cols.length - 1;
      ents.push({ x: x, ch: 'X', drop: drop });
      push(fl);
      ents.push({ x: cols.length - 1, ch: 'X', drop: drop });
      push(fl);
      push(fl);
      return;
    }
    const ch = tok === 'brick' ? 'B' : tok === 'ask' ? '?' : tok === 'cap' ? 'H' : tok === 'sap' ? 'A' : FOE[tok];
    if (!ch) throw new Error(meta.id + ' bad tok ' + tok);
    const foe = FOE_CH.indexOf(ch) >= 0;
    if (foe) {
      pad(6);
      gapFromEnemy(7);
    } else pad(2);
    const x = cols.length - 1;
    if (ch === 'B' || ch === '?') ents.push({ x: x, ch: ch, above: 3 });
    else ents.push({ x: x, ch: ch });
    const fl = topFloor();
    for (let i = 0; i < (foe ? 5 : 2); i++) push(fl);
  });

  const endFl = resumeFloor();
  for (let i = 0; i < 6; i++) push(endFl);
  ents.push({ x: cols.length - 2, ch: 'F' });

  const rows = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < cols.length; x++) row.push(y >= cols[x] ? '#' : '.');
    rows.push(row);
  }
  marks.forEach((m) => {
    if (rows[m.y][m.x] !== '.') throw new Error(meta.id + ' mark ' + m.ch + ' at ' + m.x);
    rows[m.y][m.x] = m.ch;
  });
  ents.forEach((e) => {
    if (cols[e.x] >= H) throw new Error(meta.id + ' ent on pit ' + e.ch);
    const y = e.above ? cols[e.x] - e.above : cols[e.x] - 1;
    if (y < 0 || y >= H) throw new Error(meta.id + ' ent y ' + e.ch);
    if (rows[y][e.x] !== '.') throw new Error(meta.id + ' overlap ' + e.ch + ' at ' + e.x);
    rows[y][e.x] = e.ch;
    if (e.drop) {
      meta.drops = meta.drops || {};
      meta.drops[e.x + ',' + y] = e.drop;
    }
  });
  burrows.forEach((b) => carveBurrow(rows, b, meta));
  LEVELS.push(Object.assign({
    w: cols.length,
    h: H,
    ground: GROUND,
    rows: rows.map((row) => row.join('')),
    time: 280
  }, meta));
}

lay({ id: '4-1', world: 4, theme: 'cedar', name: 'Cedar Path', time: 280, hint: 'Hop the stones across the creek.', line: 'The light follows a thin cedar creek.', after: 'The shade lets him through.' },
  'creek01210121 flat14 leaper flat24 coin6');
lay({ id: '4-2', world: 4, theme: 'cedar', name: 'Low Shade', time: 280, line: 'Roots step down toward the thread of water.', after: 'The low shade is behind him.' },
  'flat8 creek10121012 burrowstone flat12 leaper flat20 coin6');
lay({ id: '4-3', world: 4, theme: 'cedar', name: 'Twin Leapers', time: 280, line: 'Two reds hop the same stretch of shade.', after: 'Both leapers are in the mud.' },
  'creek01212101 flat10 cap flat28 coin6');
lay({ id: '4-4', world: 4, theme: 'cedar', name: 'Sprig Shelf', time: 280, line: 'A lodge cap waits on a short shelf.', after: 'He wears the sprig into the cedars.' },
  'flat6 creek21012101 flat16 leaper flat18 coin4');
lay({ id: '4-5', world: 4, theme: 'cedar', name: 'Acorn Shade', time: 280, line: 'Acorns glint where the creek should be wide.', after: 'The acorns are pocketed. The creek is still thin.' },
  'creek10121011 flat18 kit flat10 boxstone flat16 coin6');
lay({ id: '4-6', world: 4, theme: 'cedar', name: 'Stair Shade', time: 280, line: 'The bank climbs, then gives the water back.', after: 'He comes down to the thread again.' },
  'flat10 creek12101212 flat12 leaper flat18 coin6');
lay({ id: '4-7', world: 4, theme: 'cedar', name: 'Brick Shade', time: 280, line: 'Someone bricked a shelf above the cedars.', after: 'The bricks stay. He does not.' },
  'creek01212121 flat14 brick flat12 leaper flat8 coin6');
lay({ id: '4-8', world: 4, theme: 'cedar', name: 'Three Cuts', time: 280, line: 'Three cuts in the shade. The creek shows through each one.', after: 'Cedar Shade opens onto reeds.' },
  'flat4 creek12101211 flat20 leaper flat12 coin8');
lay({ id: '4-9', world: 4, theme: 'burrow', name: 'Root Road', time: 280, hint: 'Stomp the grub. Smash the crate.', line: 'The cedar roots open into a road of clay.', after: 'He comes up with a stone in his cheek.' },
  'flat16 grub flat18 boxstone up1 flat14 grub down1 flat20 boxcap flat24 coin8');

lay({ id: '5-1', world: 5, theme: 'reed', name: 'Goose Mud', time: 280, hint: 'Geese spit faster bubbles. Hop them.', line: 'A long neck stands in the reed mud.', after: 'The goose keeps its bank. He keeps the creek.' },
  'flat30 goose flat28 duck flat30 coin8');
lay({ id: '5-2', world: 5, theme: 'reed', name: 'Reed Hop', time: 280, line: 'A leaper and a goose share the reeds.', after: 'The hop carries him between them.' },
  'flat22 goose flat34 duck flat40 coin6');
lay({ id: '5-3', world: 5, theme: 'reed', name: 'Two Bills', time: 280, line: 'A duck and a goose. The bubbles come from both.', after: 'He hops both bills.' },
  'flat18 duck flat30 goose flat52 coin8');
lay({ id: '5-4', world: 5, theme: 'reed', name: 'High Reed', time: 280, line: 'The reeds grow up a stair and look down on the thread.', after: 'The high reed bends, and he goes on.' },
  'cap flat26 goose flat24 duck flat56 coin6');
lay({ id: '5-5', world: 5, theme: 'reed', name: 'Bubble Run', time: 280, line: 'Bubbles cross the path one after another.', after: 'The run is wet, and he is through it.' },
  'flat20 goose flat36 duck flat16 ask burrowcap flat12 coin6');
lay({ id: '5-6', world: 5, theme: 'reed', name: 'Cap Reed', time: 280, line: 'The sprig cap sits before the long-necked mud.', after: 'The cap stays on. The reeds do not.' },
  'flat16 duck flat26 goose flat22 duck flat18 coin6');
lay({ id: '5-7', world: 5, theme: 'reed', name: 'Long Bubbles', time: 280, line: 'The creek is deeper here, and still not a river.', after: 'Long bubbles pop behind him.' },
  'flat34 goose flat12 boxcap flat20 duck flat50 coin8');
lay({ id: '5-8', world: 5, theme: 'reed', name: 'Three Geese', time: 280, line: 'Three geese hold the thread between the reeds.', after: 'Reed Water gives way to brick and clay.' },
  'sap flat24 goose flat32 duck flat70 coin6');

lay({ id: '6-1', world: 6, theme: 'kiln', name: 'Nipper Yard', time: 280, hint: 'The nipper waits on the shelf. Climb to him.', line: 'A second mill is still chewing the bank.', after: 'The yard lets him pass.' },
  'perch flat60 coin6');
lay({ id: '6-2', world: 6, theme: 'kiln', name: 'Twin Nips', time: 280, line: 'Two nippers pace the clay between the cuts.', after: 'Both nips are behind him.' },
  'flat8 perch flat54 coin6');
lay({ id: '6-3', world: 6, theme: 'kiln', name: 'Kiln Stair', time: 280, line: 'Bricks climb, and a nipper waits at the top of the habit.', after: 'He comes down off the kiln stair.' },
  'flat16 perch flat48 coin8');
lay({ id: '6-4', world: 6, theme: 'kiln', name: 'Sap Yard', time: 280, line: 'Sap gathers again. The nipper does not care.', after: 'The chip is ready if he needs it.' },
  'flat4 sap perch flat56 coin6');
lay({ id: '6-5', world: 6, theme: 'kiln', name: 'High Kiln', time: 280, line: 'The high kiln looks over a thin shine of water.', after: 'The high clay is quiet.' },
  'flat12 perch flat52 coin6');
lay({ id: '6-6', world: 6, theme: 'kiln', name: 'Mill Birds', time: 280, line: 'A goose stands where the new mill meets the old habit.', after: 'Bird and nipper both lose the path.' },
  'flat20 perch flat44 coin8');
lay({ id: '6-7', world: 6, theme: 'kiln', name: 'Three Nips', time: 280, line: 'Three nippers, three stretches of chewed bank.', after: 'The third nip turns back.' },
  'flat10 perch flat50 coin6');
lay({ id: '6-8', world: 6, theme: 'kiln', name: 'Brick Ask', time: 280, line: 'The kiln asks nothing. The bricks just sit there.', after: 'Clay Kiln opens onto the empty cut.' },
  'flat14 cap perch flat40 coin6');
lay({ id: '6-9', world: 6, theme: 'burrow', name: 'Kiln Dark', time: 280, hint: 'The second mill has a basement.', line: 'Under the kiln the clay is still warm.', after: 'He leaves the dark with sap on his teeth.' },
  'flat14 grub flat16 boxsap up1 up1 flat18 grub down1 flat16 boxstone down1 flat22 coin6');

lay({ id: '7-1', world: 7, theme: 'rope', name: 'First Tumble', time: 280, hint: 'Wait for the log, then ride it over.', line: 'The creekbed is an empty cut. A log starts to turn.', after: 'The first tumbler stops on a wall of air.' },
  'burrowlife flat6 ferry up1 flat10 tumbler flat12 down1 flat36 coin6');
lay({ id: '7-2', world: 7, theme: 'rope', name: 'Roll And Tumble', time: 280, line: 'A loghead, then a rounder one that waits.', after: 'Both logs have had their roll.' },
  'flat10 ferry up1 flat8 tumbler flat16 down1 flat30 coin8');
lay({ id: '7-3', world: 7, theme: 'rope', name: 'Rope Stair', time: 280, line: 'Rope and stair cross the cut where water should run.', after: 'He climbs, and the cut stays empty.' },
  'flat4 ferry flat8 ferry up1 flat10 tumbler flat8 down1 flat20 coin6');
lay({ id: '7-4', world: 7, theme: 'rope', name: 'Twin Logs', time: 280, line: 'Two tumblers guard a long scaffold of mud.', after: 'Twin logs lie still.' },
  'flat14 ferry up1 flat12 tumbler flat10 down1 flat30 coin6');
lay({ id: '7-5', world: 7, theme: 'rope', name: 'Tumble Nip', time: 280, line: 'A tumbler, then a nipper who heard it.', after: 'The cut is louder, and he is past it.' },
  'flat8 ferry up1 flat14 tumbler flat18 down1 flat28 coin6');
lay({ id: '7-6', world: 7, theme: 'rope', name: 'Cap Rope', time: 280, line: 'The sprig cap hangs where the ropes used to.', after: 'He takes the cap across the cut.' },
  'cap flat12 ferry up1 flat8 tumbler flat14 down1 flat32 coin8');
lay({ id: '7-7', world: 7, theme: 'rope', name: 'Three Logs', time: 280, line: 'Three logs over the empty creek.', after: 'The third log rolls itself out.' },
  'flat18 ferry up1 flat6 tumbler flat12 down1 flat32 coin6');
lay({ id: '7-8', world: 7, theme: 'rope', name: 'Wide Cut', time: 280, line: 'One wide cut, then the bank remembers how to be ice.', after: 'Rope Run ends. The air is colder.' },
  'flat4 ferry flat14 ferry up1 flat12 tumbler flat8 down1 flat16 coin6');
lay({ id: '7-9', world: 7, theme: 'burrow', name: 'Cut Under', time: 280, hint: 'A life is packed in the crate.', line: 'The empty cut has a road underneath it.', after: 'The under-road gives him another life.' },
  'flat12 grub up1 flat20 boxlife down1 flat16 grub flat18 boxstone flat24 coin8');

lay({ id: '8-1', world: 8, theme: 'frost', name: 'First Ice', time: 280, hint: 'Climb the shelf. The icer cannot come down.', line: 'Snow sits on the pines. The creek is ice.', after: 'The first ice slides past under his feet.' },
  'plateau flat52 coin6');
lay({ id: '8-2', world: 8, theme: 'frost', name: 'Twin Ice', time: 280, line: 'Two icers trade the frozen thread.', after: 'Twin ice is behind him.' },
  'burrowsap flat8 plateau flat48 coin6');
lay({ id: '8-3', world: 8, theme: 'frost', name: 'Frost Stair', time: 280, line: 'The frost stair climbs above the frozen shine.', after: 'He comes down onto the ice again.' },
  'flat16 plateau flat10 boxlife flat34 coin8');
lay({ id: '8-4', world: 8, theme: 'frost', name: 'Ice And Log', time: 280, line: 'An icer, then a tumbler that does not like the cold.', after: 'Log and ice both stop.' },
  'flat6 plateau flat50 coin6');
lay({ id: '8-5', world: 8, theme: 'frost', name: 'Ice Nip', time: 280, line: 'A nipper learned the ice and got quicker.', after: 'The nip loses the frost.' },
  'flat12 plateau flat46 coin6');
lay({ id: '8-6', world: 8, theme: 'frost', name: 'Cap Frost', time: 280, line: 'The sprig cap is bright against the snow.', after: 'The cap stays yellow. The bank stays white.' },
  'cap flat10 plateau flat42 coin6');
lay({ id: '8-7', world: 8, theme: 'frost', name: 'Three Ice', time: 280, line: 'Three icers, and under them the water still tries.', after: 'The third slide ends.' },
  'flat14 plateau flat40 coin8');
lay({ id: '8-8', world: 8, theme: 'frost', name: 'Wide Ice', time: 280, line: 'A wide gap in the ice. Beyond it, the reds stacked a dam.', after: 'Frost Bank breaks. The dam shows red.' },
  'flat4 plateau flat44 coin6');
lay({ id: '8-9', world: 8, theme: 'burrow', name: 'Deep Frost', time: 280, hint: 'Roots under the ice.', line: 'The frost has a root road under the shine.', after: 'He climbs out ahead of the dam.' },
  'flat18 grub flat14 boxcap up1 down1 flat20 grub flat16 boxstone flat8 up1 flat22 coin6');

lay({ id: '9-1', world: 9, theme: 'dam', name: 'Mason Flat', time: 280, hint: 'Masons throw bricks. Hop the brick.', line: 'A mason stands on the logs and throws clay.', after: 'The first brick misses.' },
  'flat28 mason flat32 ask flat22 coin8');
lay({ id: '9-2', world: 9, theme: 'dam', name: 'Mason And Nip', time: 280, line: 'The mason throws. The nipper runs under the brick.', after: 'Brick and nipper both miss him.' },
  'flat20 mason flat36 ask flat36 coin6');
lay({ id: '9-3', world: 9, theme: 'dam', name: 'Mason Ice', time: 280, line: 'An icer still slides the logs of the dam.', after: 'Ice on the dam does not hold.' },
  'flat32 mason burrowstone flat26 ask flat40 coin8');
lay({ id: '9-4', world: 9, theme: 'dam', name: 'Two Masons', time: 280, line: 'Two masons. The bricks come in pairs.', after: 'Both masons are off the logs.' },
  'flat18 mason flat36 mason flat30 ask flat16 coin6');
lay({ id: '9-5', world: 9, theme: 'dam', name: 'Dam Mix', time: 280, line: 'Leaper, tumbler, and the stacked reds.', after: 'The mix breaks up along the logs.' },
  'flat26 mason flat38 ask flat36 coin8');
lay({ id: '9-6', world: 9, theme: 'dam', name: 'Hard Dam', time: 280, line: 'The lake behind the logs is the river that never arrived.', after: 'He is closer to the crack in the dam.' },
  'flat22 mason flat34 mason flat34 ask flat18 coin6');
lay({ id: '9-7', world: 9, theme: 'dam', name: 'Cap Dam', time: 280, line: 'The sprig cap, then everything the reds still have.', after: 'The cap goes on. The keeper is next.' },
  'cap flat24 mason flat30 ask flat40 coin8');

stage({
  id: '9-8',
  world: 9,
  theme: 'dam',
  name: 'Dam Keep',
  line: 'A keeper sits on the logs and will not let the water by.',
  after: 'The dam cracks. The spring is still ahead.',
  time: 240,
  bossHp: 4,
  bossName: 'DAM KEEP',
  bossSpeed: 54,
  bossHop: -390,
  bossEvery: 2.4
}, 26, 14, 12, (set, fill) => {
  fill(0, 0, 1, 14, '#');
  fill(25, 0, 1, 14, '#');
  set(3, 11, 'P');
  set(6, 11, 'H');
  set(8, 9, '?');
  set(9, 9, 'B');
  set(10, 9, 'B');
  set(16, 11, 'J');
  for (let i = 0; i < 3; i++) set(20 + i, 11, 'C');
});

lay({ id: '10-1', world: 10, theme: 'source', name: 'Thin Spring', time: 280, hint: 'The spring is close.', line: 'Past the dam, the water is a spring under the pines.', after: 'The thin spring leads to one last rope.' },
  'flat18 mason flat12 pit flat10 up1 flat12 icer flat8 down1 flat8 up1 flat10 tumbler flat8 down1 coin8');

stage({
  id: '10-2',
  world: 10,
  theme: 'source',
  name: 'The Source',
  line: 'The source keeper holds the rope. The river is waiting on him.',
  after: 'The water comes home.',
  time: 240,
  ending: true,
  bossHp: 5,
  bossName: 'SOURCE',
  bossSpeed: 58,
  bossHop: -400,
  bossEvery: 2.15
}, 30, 14, 12, (set, fill) => {
  fill(0, 0, 1, 14, '#');
  fill(29, 0, 1, 14, '#');
  set(3, 11, 'P');
  set(6, 11, 'H');
  set(8, 11, 'A');
  set(11, 9, '?');
  set(12, 9, 'B');
  set(18, 11, 'J');
  for (let i = 0; i < 4; i++) set(23 + i, 11, 'C');
});

(function validateLevels() {
  LEVELS.forEach((lv) => {
    if (!lv.rows.length) throw new Error(lv.id + ' empty');
    const w = lv.rows[0].length;
    if (w !== lv.w) throw new Error(lv.id + ' width');
    let starts = 0;
    let goals = 0;
    lv.rows.forEach((row, y) => {
      if (row.length !== w) throw new Error(lv.id + ' row ' + y);
      for (const ch of row) {
        if (!TILE_CHARS.has(ch)) throw new Error(lv.id + ' char ' + ch);
        if (ch === 'P') starts += 1;
        if (ch === 'F' || ch === 'J') goals += 1;
      }
    });
    if (starts !== 1) throw new Error(lv.id + ' starts ' + starts);
    if (goals < 1) throw new Error(lv.id + ' no goal');
    if (lv.world >= 4 && lv.id !== '9-8' && lv.id !== '10-2' && lv.w < 108) {
      throw new Error(lv.id + ' short ' + lv.w);
    }
  });
  if (LEVELS.length !== 60) throw new Error('count ' + LEVELS.length);
  const seen = {};
  const repeats = [];
  LEVELS.forEach((lv) => {
    const tops = [];
    for (let x = 0; x < lv.w; x++) {
      let top = lv.h;
      for (let y = 0; y < lv.h; y++) {
        const ch = lv.rows[y][x];
        if (ch === '#' || ch === 'B' || ch === '=' || ch === '?' || ch === '!' || ch === 'S' || ch === 'u') {
          top = y;
          break;
        }
      }
      tops.push(top);
    }
    const sig = tops.join('.');
    if (seen[sig]) repeats.push(seen[sig] + ' ' + lv.id);
    else seen[sig] = lv.id;
  });
  if (repeats.length) throw new Error('repeat map ' + repeats.join(' | '));
})();

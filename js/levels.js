/* Bober Burrow Hop lh13 — every bank is its own path, from the lodge bell to the source. */
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
  hint: 'Hold jump. Land on the reds. Smash the crate.',
  after: 'The bank lets him pass.',
  time: 200,
  drops: { '18,11': 'stone', '19,11': 'stone' }
}, 104, 14, 12, (set, fill) => {
  set(3, 11, 'P');
  for (let i = 0; i < 5; i++) set(8 + i, 11, 'C');
  set(18, 11, 'X');
  set(19, 11, 'X');
  set(24, 9, '?');
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k <= i; k++) {
      set(30 + i * 2, 11 - k, '#');
      set(31 + i * 2, 11 - k, '#');
    }
  }
  fill(44, 12, 1, 2, '.');
  set(52, 11, 'R');
  set(64, 11, 'K');
  fill(72, 12, 14, 2, '.');
  fill(72, 10, 4, 1, '=');
  fill(77, 9, 4, 1, '=');
  fill(82, 10, 4, 1, '=');
  for (let i = 0; i < 4; i++) set(90 + i, 11, 'C');
  set(100, 11, 'F');
});

stage({
  id: '1-2',
  world: 1,
  name: 'Stump Stairs',
  line: 'Old stumps mark where the river used to sit.',
  after: 'The stumps are behind him.',
  time: 210,
  drops: { '24,11': 'cap', '25,11': 'cap' }
}, 112, 14, 12, (set, fill) => {
  set(3, 11, 'P');
  set(8, 11, 'H');
  set(12, 9, '!');
  set(14, 9, '?');
  for (let i = 0; i < 5; i++) set(16 + i, 11, 'C');
  set(24, 11, 'X');
  set(25, 11, 'X');
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k <= i; k++) set(32 + i, 11 - k, '#');
  }
  set(35, 7, 'R');
  fill(46, 12, 1, 2, '.');
  fill(52, 12, 4, 2, '.');
  set(52, 12, 'M');
  set(68, 11, 'K');
  for (let i = 0; i < 4; i++) set(80 + i, 11, 'C');
  set(92, 11, 'K');
  set(108, 11, 'F');
});

stage({
  id: '2-1',
  world: 2,
  name: 'Brick Mill',
  line: 'The mill chewed the path into bricks.',
  after: 'The mill coughs him out the far side.',
  time: 220,
  drops: { '44,11': 'sap', '45,11': 'sap' }
}, 104, 14, 12, (set, fill) => {
  set(3, 11, 'P');
  set(8, 11, 'A');
  for (let i = 0; i < 7; i++) set(14 + i, 9, i === 3 ? 'S' : 'B');
  for (let i = 0; i < 4; i++) set(16 + i, 11, 'C');
  set(28, 11, 'K');
  fill(36, 12, 1, 2, '.');
  set(44, 11, 'X');
  set(45, 11, 'X');
  set(56, 11, 'R');
  set(64, 9, '?');
  set(66, 9, '!');
  set(82, 11, 'D');
  for (let i = 0; i < 3; i++) set(92 + i, 11, 'C');
  set(100, 11, 'F');
});

stage({
  id: '2-2',
  world: 2,
  name: 'High Scaffolds',
  line: 'Someone left a lodge cap on the scaffold.',
  after: 'The scaffold sways, and he keeps going.',
  time: 230,
  drops: { '12,13': 'stone', '13,13': 'stone' }
}, 102, 16, 14, (set, fill) => {
  set(3, 13, 'P');
  set(8, 13, 'H');
  set(12, 13, 'X');
  set(13, 13, 'X');
  set(16, 11, '?');
  for (let i = 0; i < 4; i++) set(18 + i, 13, 'C');
  fill(28, 14, 47, 2, '.');
  fill(28, 12, 4, 1, '=');
  fill(33, 13, 4, 1, '=');
  fill(38, 12, 4, 1, '=');
  fill(43, 12, 4, 1, '=');
  set(47, 12, 'M');
  fill(51, 12, 5, 1, '=');
  fill(57, 13, 4, 1, '=');
  fill(62, 12, 4, 1, '=');
  fill(67, 13, 4, 1, '=');
  fill(72, 12, 3, 1, '=');
  set(88, 13, 'K');
  for (let i = 0; i < 3; i++) set(92 + i, 13, 'C');
  set(98, 13, 'F');
});

stage({
  id: '3-1',
  world: 3,
  name: 'Spillway',
  line: 'The water is in a hurry. The logs are not.',
  after: 'The spillway did not take him.',
  time: 220,
  drops: { '26,11': 'stone', '27,11': 'stone' }
}, 108, 14, 12, (set, fill) => {
  set(3, 11, 'P');
  set(8, 11, 'A');
  for (let i = 0; i < 4; i++) set(12 + i, 11, 'C');
  set(18, 9, 'B');
  set(19, 9, '?');
  set(20, 9, 'B');
  set(21, 9, 'B');
  set(26, 11, 'X');
  set(27, 11, 'X');
  fill(34, 12, 1, 2, '.');
  fill(40, 12, 4, 2, '.');
  set(40, 12, 'M');
  set(62, 11, 'D');
  set(72, 9, 'S');
  fill(84, 12, 1, 2, '.');
  set(94, 11, 'K');
  set(104, 11, 'F');
});

stage({
  id: '3-2',
  world: 3,
  name: 'Bell Rope',
  line: 'Lockjaw sits on the rope and will not move.',
  after: 'The bell is lit. The river does not rise.',
  time: 240,
  drops: { '24,11': 'stone', '25,11': 'stone' }
}, 32, 14, 12, (set, fill) => {
  fill(0, 0, 1, 14, '#');
  fill(31, 0, 1, 14, '#');
  set(3, 11, 'P');
  set(6, 11, 'H');
  set(8, 9, '?');
  set(9, 9, 'B');
  fill(12, 12, 4, 2, '.');
  fill(12, 12, 4, 1, '=');
  set(20, 11, 'J');
  set(24, 11, 'X');
  set(25, 11, 'X');
  for (let i = 0; i < 3; i++) set(27 + i, 11, 'C');
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
  'creek0121212 island flat6 leaper flat10 coin6');
lay({ id: '4-2', world: 4, theme: 'cedar', name: 'Low Shade', time: 280, line: 'A soft bank hides a root road, then the shade breaks into islands.', after: 'The low shade is behind him.' },
  'burrowstone gaps flat8 kit flat14 rise coin6');
lay({ id: '4-3', world: 4, theme: 'cedar', name: 'Twin Leapers', time: 280, line: 'Two reds hop the same stretch of shade.', after: 'Both leapers are in the mud.' },
  'wide cap rise leaper flat10 leaper flat12 island coin8');
lay({ id: '4-4', world: 4, theme: 'cedar', name: 'Sprig Shelf', time: 280, line: 'Bricks hang over the creek. A leaper waits past the last stone.', after: 'He wears the sprig into the cedars.' },
  'brick brick ask flat6 creek1210121 flat8 leaper island coin6');
lay({ id: '4-5', world: 4, theme: 'cedar', name: 'Acorn Shade', time: 280, line: 'A moving log, a crate, then a kit on the far bank.', after: 'The acorns are pocketed. The creek is still thin.' },
  'ferry up1 boxcap down1 flat8 kit gaps roll coin6');
lay({ id: '4-6', world: 4, theme: 'cedar', name: 'Stair Shade', time: 280, line: 'The bank rolls, a leaper hops it, and a duck holds the far mud.', after: 'He comes down to the thread again.' },
  'roll flat6 leaper flat16 duck flat16 island coin6');
lay({ id: '4-7', world: 4, theme: 'cedar', name: 'Brick Shade', time: 280, hint: 'Climb the shelf, then hop the stones.', line: 'A nipper keeps the high shade. The creek is under it.', after: 'The bricks stay. He does not.' },
  'perch flat8 creek1012121 flat6 coin6');
lay({ id: '4-8', world: 4, theme: 'cedar', name: 'Three Cuts', time: 280, line: 'Three cuts in the shade. The creek shows through each one.', after: 'Cedar Shade opens onto reeds.' },
  'creek12101211 pit flat6 pit flat6 pit flat8 leaper coin6');
lay({ id: '4-9', world: 4, theme: 'burrow', name: 'Root Road', time: 280, hint: 'Stomp the grub. Smash the crate.', line: 'The cedar roots open into a road of clay.', after: 'He comes up with a stone in his cheek.' },
  'up2 grub flat6 boxstone down1 pit flat6 grub roll flat6 boxcap gaps coin6');

lay({ id: '5-1', world: 5, theme: 'reed', name: 'Goose Mud', time: 280, hint: 'Geese spit faster bubbles. Hop them.', line: 'Stones first. Then a long neck in the reed mud.', after: 'The goose keeps its bank. He keeps the creek.' },
  'creek01012101 flat16 goose flat24 duck flat20 coin6');
lay({ id: '5-2', world: 5, theme: 'reed', name: 'Reed Hop', time: 280, line: 'A stair, a duck, a goose, and a leaper share the reeds.', after: 'The hop carries him between them.' },
  'rise flat8 duck flat24 goose flat22 leaper flat12 coin6');
lay({ id: '5-3', world: 5, theme: 'reed', name: 'Two Bills', time: 280, line: 'A crate, a wide cut, then a duck and a goose.', after: 'He hops both bills.' },
  'rise boxstone wide flat12 duck flat24 goose flat16 coin6');
lay({ id: '5-4', world: 5, theme: 'reed', name: 'High Reed', time: 280, line: 'A moving log opens the reeds. The bills are on the far mud.', after: 'The high reed bends, and he goes on.' },
  'ferry flat8 cap flat14 duck flat26 goose flat18 coin6');
lay({ id: '5-5', world: 5, theme: 'reed', name: 'Bubble Run', time: 280, line: 'A root road, a run of islands, then the bubbles.', after: 'The run is wet, and he is through it.' },
  'burrowcap gaps flat16 goose flat26 duck flat20 coin6');
lay({ id: '5-6', world: 5, theme: 'reed', name: 'Cap Reed', time: 280, line: 'The sprig cap sits before the long-necked mud.', after: 'The cap stays on. The reeds do not.' },
  'cap roll up1 flat8 duck down1 flat22 duck flat22 goose flat12 coin6');
lay({ id: '5-7', world: 5, theme: 'reed', name: 'Long Bubbles', time: 280, line: 'Bricks, a goose, a crate of life, then one more bill.', after: 'Long bubbles pop behind him.' },
  'brick ask flat12 goose flat26 boxlife flat16 duck flat18 coin6');
lay({ id: '5-8', world: 5, theme: 'reed', name: 'Three Geese', time: 280, line: 'Three geese hold the thread between the reeds.', after: 'Reed Water gives way to brick and clay.' },
  'sap island flat8 goose flat24 goose flat24 goose flat14 coin6');

lay({ id: '6-1', world: 6, theme: 'kiln', name: 'Nipper Yard', time: 280, hint: 'Climb the shelf. Then ride the log.', line: 'A nipper keeps the yard. A log crosses the cut after him.', after: 'The yard lets him pass.' },
  'perch flat10 ferry flat12 coin8');
lay({ id: '6-2', world: 6, theme: 'kiln', name: 'Twin Nips', time: 280, line: 'Bricks, a creek, and two nippers on different clay.', after: 'Both nips are behind him.' },
  'brick brick up2 nipper down2 creek12121012 flat8 nipper flat10 coin6');
lay({ id: '6-3', world: 6, theme: 'kiln', name: 'Kiln Stair', time: 280, line: 'A log, a rolling bank, then a nipper on the flat.', after: 'He comes down off the kiln stair.' },
  'ferry roll flat8 nipper gaps flat8 coin8');
lay({ id: '6-4', world: 6, theme: 'kiln', name: 'Sap Yard', time: 280, line: 'Stones, a sap crate, a leaper, then the bank rises.', after: 'The chip is ready if he needs it.' },
  'creek21210121 flat8 boxsap flat10 leaper flat12 rise coin6');
lay({ id: '6-5', world: 6, theme: 'kiln', name: 'High Kiln', time: 280, line: 'A wide cut, a high stair, a nipper, then a duck.', after: 'The high clay is quiet.' },
  'wide rise flat8 nipper flat14 duck flat24 coin6');
lay({ id: '6-6', world: 6, theme: 'kiln', name: 'Mill Birds', time: 280, line: 'A burrow, a goose, then a nipper under the bricks.', after: 'Bird and nipper both lose the path.' },
  'burrowsap flat8 goose flat24 nipper island brick ask coin6');
lay({ id: '6-7', world: 6, theme: 'kiln', name: 'Three Nips', time: 280, line: 'A log over a cut, then three nippers on three steps.', after: 'The third nip turns back.' },
  'roll ferry up1 nipper down1 flat10 up2 nipper down2 flat8 nipper flat6 coin6');
lay({ id: '6-8', world: 6, theme: 'kiln', name: 'Brick Ask', time: 280, line: 'Two cuts, a goose, then the bank rolls away from the kiln.', after: 'Clay Kiln opens onto the empty cut.' },
  'cap pit flat8 pit flat16 goose flat24 roll coin6');
lay({ id: '6-9', world: 6, theme: 'burrow', name: 'Kiln Dark', time: 280, hint: 'The second mill has a basement.', line: 'Under the kiln the clay is still warm.', after: 'He leaves the dark with sap on his teeth.' },
  'up1 grub flat8 boxsap down1 flat12 wide flat8 grub rise flat8 boxlife flat8 coin6');

lay({ id: '7-1', world: 7, theme: 'rope', name: 'First Tumble', time: 280, hint: 'Wait for the log, then ride it over.', line: 'A moving log, a life in a crate, then a tumbler and a run of islands.', after: 'The first tumbler stops on a wall of air.' },
  'ferry up2 boxlife down2 flat8 tumbler island gaps coin6');
lay({ id: '7-2', world: 7, theme: 'rope', name: 'Roll And Tumble', time: 280, line: 'Two moving logs, a stone crate, then a loghead.', after: 'Both logs have had their roll.' },
  'ferry boxstone ferry flat8 roller flat12 gaps coin6');
lay({ id: '7-3', world: 7, theme: 'rope', name: 'Rope Stair', time: 280, line: 'A burrow, a stair, a tumbler, and a log at the end.', after: 'He climbs, and the cut stays empty.' },
  'burrowlife rise flat8 tumbler flat14 ferry coin6');
lay({ id: '7-4', world: 7, theme: 'rope', name: 'Twin Logs', time: 280, line: 'Stones, a rolling bank, and two tumblers.', after: 'Twin logs lie still.' },
  'creek0121012 roll flat8 tumbler flat12 tumbler coin6');
lay({ id: '7-5', world: 7, theme: 'rope', name: 'Tumble Nip', time: 280, line: 'A nipper on a short shelf, a tumbler, then a moving log.', after: 'The cut is louder, and he is past it.' },
  'flat4 perch flat8 tumbler ferry flat8 coin6');
lay({ id: '7-6', world: 7, theme: 'rope', name: 'Cap Rope', time: 280, line: 'The sprig cap, a run of gaps, a tumbler, then the log.', after: 'He takes the cap across the cut.' },
  'cap gaps flat10 tumbler flat12 ask ferry flat8 coin8');
lay({ id: '7-7', world: 7, theme: 'rope', name: 'Three Logs', time: 280, line: 'Three tumblers past a log that rides a raised cut.', after: 'The third log rolls itself out.' },
  'up2 ferry down2 flat8 tumbler flat10 tumbler flat8 tumbler island coin6');
lay({ id: '7-8', world: 7, theme: 'rope', name: 'Wide Cut', time: 280, line: 'Islands, a moving log, a cap in a crate, then the bank rolls.', after: 'Rope Run ends. The air is colder.' },
  'island ferry flat6 boxcap gaps roll coin6');
lay({ id: '7-9', world: 7, theme: 'burrow', name: 'Cut Under', time: 280, hint: 'A life is packed in the crate.', line: 'The empty cut has a road underneath it.', after: 'The under-road gives him another life.' },
  'pit flat6 grub up2 boxlife down2 flat8 grub gaps rise coin8');

lay({ id: '8-1', world: 8, theme: 'frost', name: 'First Ice', time: 280, hint: 'Climb the shelf. Then hop the frozen stones.', line: 'Snow sits on the pines. The creek is ice.', after: 'The first ice slides past under his feet.' },
  'plateau flat8 creek21012101 flat6 coin6');
lay({ id: '8-2', world: 8, theme: 'frost', name: 'Twin Ice', time: 280, line: 'A burrow, a run of gaps, then two icers on the flat.', after: 'Twin ice is behind him.' },
  'burrowsap gaps flat12 icer flat18 icer flat12 coin6');
lay({ id: '8-3', world: 8, theme: 'frost', name: 'Frost Stair', time: 280, line: 'A moving log, a life in a crate, then an icer.', after: 'He comes down onto the ice again.' },
  'ferry flat10 boxlife flat12 icer flat16 rise coin6');
lay({ id: '8-4', world: 8, theme: 'frost', name: 'Ice And Log', time: 280, line: 'An icer, then a tumbler that does not like the cold.', after: 'Log and ice both stop.' },
  'ferry rise flat8 icer flat14 tumbler flat10 coin6');
lay({ id: '8-5', world: 8, theme: 'frost', name: 'Ice Nip', time: 280, line: 'A wide cut, a nipper, a stone crate, then the bank rolls.', after: 'The nip loses the frost.' },
  'wide flat10 nipper flat14 boxstone island roll coin6');
lay({ id: '8-6', world: 8, theme: 'frost', name: 'Cap Frost', time: 280, line: 'The sprig cap, a moving log, a rolling bank, and a duck.', after: 'The cap stays yellow. The bank stays white.' },
  'cap ferry flat8 roll flat8 duck flat24 coin6');
lay({ id: '8-7', world: 8, theme: 'frost', name: 'Three Ice', time: 280, line: 'Three icers, and under them the water still tries.', after: 'The third slide ends.' },
  'creek01212101 flat12 icer flat20 icer flat20 icer flat10 coin6');
lay({ id: '8-8', world: 8, theme: 'frost', name: 'Wide Ice', time: 280, line: 'A short shelf, then a log across the last ice. Beyond it, the reds stacked a dam.', after: 'Frost Bank breaks. The dam shows red.' },
  'flat4 plateau ferry flat14 coin6');
lay({ id: '8-9', world: 8, theme: 'burrow', name: 'Deep Frost', time: 280, hint: 'Roots under the ice.', line: 'The frost has a root road under the shine.', after: 'He climbs out ahead of the dam.' },
  'up2 grub down1 flat6 boxcap wide flat6 grub rise island boxstone coin6');

lay({ id: '9-1', world: 9, theme: 'dam', name: 'Mason Flat', time: 280, hint: 'Masons throw bricks. Hop the brick.', line: 'Ride the log, then a mason throws from the flat.', after: 'The first brick misses.' },
  'island ferry flat12 mason flat18 ask flat8 coin6');
lay({ id: '9-2', world: 9, theme: 'dam', name: 'Mason And Nip', time: 280, line: 'A stair, a mason, then a nipper who runs under the brick.', after: 'Brick and nipper both miss him.' },
  'gaps rise flat8 mason flat22 nipper flat12 coin6');
lay({ id: '9-3', world: 9, theme: 'dam', name: 'Mason Ice', time: 280, line: 'Islands, a burrow, then a mason on the logs.', after: 'Ice on the dam does not hold.' },
  'burrowstone flat28 mason flat22 ask island coin6');
lay({ id: '9-4', world: 9, theme: 'dam', name: 'Two Masons', time: 280, line: 'Two masons. The bricks come in pairs.', after: 'Both masons are off the logs.' },
  'ferry flat28 mason flat36 mason flat16 coin6');
lay({ id: '9-5', world: 9, theme: 'dam', name: 'Dam Mix', time: 280, line: 'Stones, a mason, then a tumbler on the logs.', after: 'The mix breaks up along the logs.' },
  'creek10121012 flat12 mason flat18 tumbler flat14 coin6');
lay({ id: '9-6', world: 9, theme: 'dam', name: 'Hard Dam', time: 280, line: 'The bank rolls, the ground gaps, then one mason and a leaper.', after: 'He is closer to the crack in the dam.' },
  'roll gaps flat12 mason flat24 leaper flat14 ask flat8 coin6');
lay({ id: '9-7', world: 9, theme: 'dam', name: 'Cap Dam', time: 280, line: 'The sprig cap, a moving log, a mason, then a row of bricks.', after: 'The cap goes on. The keeper is next.' },
  'cap ferry flat12 mason flat14 brick ask island flat8 coin6');

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
  bossEvery: 2.4,
  drops: { '29,11': 'stone', '30,11': 'stone' }
}, 36, 14, 12, (set, fill) => {
  fill(0, 0, 1, 14, '#');
  fill(35, 0, 1, 14, '#');
  set(3, 11, 'P');
  set(6, 11, 'H');
  set(8, 9, '?');
  set(9, 9, 'B');
  set(10, 9, 'B');
  fill(14, 12, 4, 2, '.');
  fill(14, 12, 4, 1, '=');
  set(24, 11, 'J');
  set(29, 11, 'X');
  set(30, 11, 'X');
  for (let i = 0; i < 3; i++) set(32 + i, 11, 'C');
});

lay({ id: '10-1', world: 10, theme: 'source', name: 'Thin Spring', time: 280, hint: 'The spring is close. Smash the crate.', line: 'A crate, stones, a mason, a log, an icer, and a tumbler.', after: 'The thin spring leads to one last rope.' },
  'boxsap flat6 creek10121011 flat8 mason flat16 ferry flat8 icer flat10 tumbler coin6');

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
}, 40, 14, 12, (set, fill) => {
  fill(0, 0, 1, 14, '#');
  fill(39, 0, 1, 14, '#');
  set(3, 11, 'P');
  set(6, 11, 'H');
  set(9, 11, 'A');
  fill(13, 12, 4, 2, '.');
  fill(13, 12, 4, 1, '=');
  set(20, 9, 'B');
  set(21, 9, 'B');
  set(22, 9, '?');
  set(20, 7, 'B');
  set(21, 7, 'B');
  set(28, 11, 'J');
  for (let i = 0; i < 4; i++) set(33 + i, 11, 'C');
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

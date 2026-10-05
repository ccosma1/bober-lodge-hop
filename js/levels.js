/* Bober Lodge Hop — six banks on the way home. Original layout. */
const LEVELS = [];
const TILE_CHARS = new Set(['.', '#', '=', 'B', '?', '!', 'S', 'u', 'C', 'K', 'R', 'D', 'J', 'P', 'F', 'M', '^', 'H', 'A']);

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
  after: 'The rope is free.',
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
  });
})();

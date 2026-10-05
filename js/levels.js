/* Bober Lodge Hop — fifty-six banks from the lodge bell to the source. Original layout. */
const LEVELS = [];
const TILE_CHARS = new Set(['.', '#', '=', 'B', '?', '!', 'S', 'u', 'C', 'K', 'R', 'D', 'J', 'P', 'F', 'M', '^', 'H', 'A', 'L', 'G', 'N', 'T', 'I', 'Q']);

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

const FOE = { kit: 'K', leaper: 'L', goose: 'G', duck: 'D', nipper: 'N', tumbler: 'T', icer: 'I', mason: 'Q', roller: 'R' };

function lay(meta, script) {
  const H = 16;
  const GROUND = 13;
  const cols = [];
  const ents = [];
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
      if ('KLGDNTIQR'.indexOf(ents[i].ch) >= 0) last = ents[i].x;
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
      pad(6);
      gapFromEnemy(6);
      push(H);
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
    const ch = tok === 'brick' ? 'B' : tok === 'ask' ? '?' : tok === 'cap' ? 'H' : tok === 'sap' ? 'A' : FOE[tok];
    if (!ch) throw new Error(meta.id + ' bad tok ' + tok);
    const foe = 'KLGDNTIQR'.indexOf(ch) >= 0;
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
  ents.forEach((e) => {
    if (cols[e.x] >= H) throw new Error(meta.id + ' ent on pit ' + e.ch);
    const y = e.above ? cols[e.x] - e.above : cols[e.x] - 1;
    if (y < 0 || y >= H) throw new Error(meta.id + ' ent y ' + e.ch);
    if (rows[y][e.x] !== '.') throw new Error(meta.id + ' overlap ' + e.ch + ' at ' + e.x);
    rows[y][e.x] = e.ch;
  });
  LEVELS.push(Object.assign({
    w: cols.length,
    h: H,
    ground: GROUND,
    rows: rows.map((row) => row.join('')),
    time: 220
  }, meta));
}

lay({ id: '4-1', world: 4, theme: 'cedar', name: 'Cedar Path', time: 210, hint: 'Leapers hop. Stomp them on the flat.', line: 'The light follows a thin cedar creek.', after: 'The shade lets him through.' },
  'flat6 coin4 pit flat5 kit flat6 leaper flat4');
lay({ id: '4-2', world: 4, theme: 'cedar', name: 'Low Shade', time: 210, line: 'Roots step down toward the thread of water.', after: 'The low shade is behind him.' },
  'flat4 up2 flat5 down2 pit flat4 leaper flat6 coin3');
lay({ id: '4-3', world: 4, theme: 'cedar', name: 'Twin Leapers', time: 215, line: 'Two reds hop the same stretch of shade.', after: 'Both leapers are in the mud.' },
  'flat5 leaper flat8 pit flat6 leaper flat5 pit flat4 kit');
lay({ id: '4-4', world: 4, theme: 'cedar', name: 'Sprig Shelf', time: 215, line: 'A lodge cap waits on a short shelf.', after: 'He wears the sprig into the cedars.' },
  'flat3 cap up1 flat4 down1 pit flat5 leaper flat7');
lay({ id: '4-5', world: 4, theme: 'cedar', name: 'Acorn Shade', time: 215, line: 'Acorns glint where the creek should be wide.', after: 'The acorns are pocketed. The creek is still thin.' },
  'coin5 flat4 pit flat7 pit flat5 leaper flat8 kit');
lay({ id: '4-6', world: 4, theme: 'cedar', name: 'Stair Shade', time: 220, line: 'The bank climbs, then gives the water back.', after: 'He comes down to the thread again.' },
  'up3 flat4 down1 pit flat5 leaper flat4 down2 flat5 pit flat3 coin3');
lay({ id: '4-7', world: 4, theme: 'cedar', name: 'Brick Shade', time: 220, line: 'Someone bricked a shelf above the cedars.', after: 'The bricks stay. He does not.' },
  'flat4 brick ask flat6 leaper pit flat7 kit flat5 leaper');
lay({ id: '4-8', world: 4, theme: 'cedar', name: 'Three Cuts', time: 220, line: 'Three cuts in the shade. The creek shows through each one.', after: 'Cedar Shade opens onto reeds.' },
  'pit flat6 pit flat7 leaper flat6 pit flat5 kit flat4 coin4');

lay({ id: '5-1', world: 5, theme: 'reed', name: 'Goose Mud', time: 215, hint: 'Geese spit faster bubbles. Hop them.', line: 'A long neck stands in the reed mud.', after: 'The goose keeps its bank. He keeps the creek.' },
  'flat8 goose flat6 pit flat5 duck flat6 coin3');
lay({ id: '5-2', world: 5, theme: 'reed', name: 'Reed Hop', time: 215, line: 'A leaper and a goose share the reeds.', after: 'The hop carries him between them.' },
  'flat5 leaper flat7 goose flat8 pit flat4 kit');
lay({ id: '5-3', world: 5, theme: 'reed', name: 'Two Bills', time: 220, line: 'A duck and a goose. The bubbles come from both.', after: 'He hops both bills.' },
  'flat6 duck flat8 goose flat6 pit flat5 kit coin4');
lay({ id: '5-4', world: 5, theme: 'reed', name: 'High Reed', time: 220, line: 'The reeds grow up a stair and look down on the thread.', after: 'The high reed bends, and he goes on.' },
  'up2 flat4 goose flat5 down2 pit flat6 leaper flat4');
lay({ id: '5-5', world: 5, theme: 'reed', name: 'Bubble Run', time: 220, line: 'Bubbles cross the path one after another.', after: 'The run is wet, and he is through it.' },
  'up1 flat12 goose down1 pit flat14 duck flat8 coin4');
lay({ id: '5-6', world: 5, theme: 'reed', name: 'Cap Reed', time: 225, line: 'The sprig cap sits before the long-necked mud.', after: 'The cap stays on. The reeds do not.' },
  'cap flat6 goose flat5 pit flat6 leaper flat5 duck');
lay({ id: '5-7', world: 5, theme: 'reed', name: 'Long Bubbles', time: 225, line: 'The creek is deeper here, and still not a river.', after: 'Long bubbles pop behind him.' },
  'flat14 goose pit flat12 pit flat14 duck coin5');
lay({ id: '5-8', world: 5, theme: 'reed', name: 'Three Geese', time: 225, line: 'Three geese hold the thread between the reeds.', after: 'Reed Water gives way to brick and clay.' },
  'cap flat16 goose flat18 goose up1 flat6 down1 flat16 goose');

lay({ id: '6-1', world: 6, theme: 'kiln', name: 'Nipper Yard', time: 220, hint: 'Nippers run at you. Stomp them.', line: 'A second mill is still chewing the bank.', after: 'The yard lets him pass.' },
  'flat8 nipper flat6 pit flat5 kit coin4');
lay({ id: '6-2', world: 6, theme: 'kiln', name: 'Twin Nips', time: 220, line: 'Two nippers pace the clay between the cuts.', after: 'Both nips are behind him.' },
  'flat6 nipper flat8 pit flat6 nipper flat5 coin3');
lay({ id: '6-3', world: 6, theme: 'kiln', name: 'Kiln Stair', time: 225, line: 'Bricks climb, and a nipper waits at the top of the habit.', after: 'He comes down off the kiln stair.' },
  'flat4 brick up2 flat4 nipper down2 pit flat5 kit');
lay({ id: '6-4', world: 6, theme: 'kiln', name: 'Sap Yard', time: 225, line: 'Sap gathers again. The nipper does not care.', after: 'The chip is ready if he needs it.' },
  'sap flat6 nipper flat5 pit flat5 leaper flat6');
lay({ id: '6-5', world: 6, theme: 'kiln', name: 'High Kiln', time: 225, line: 'The high kiln looks over a thin shine of water.', after: 'The high clay is quiet.' },
  'up3 flat5 nipper down3 flat4 pit flat6 kit coin4');
lay({ id: '6-6', world: 6, theme: 'kiln', name: 'Mill Birds', time: 230, line: 'A goose stands where the new mill meets the old habit.', after: 'Bird and nipper both lose the path.' },
  'up2 flat12 nipper down2 flat20 goose flat14 leaper pit flat8');
lay({ id: '6-7', world: 6, theme: 'kiln', name: 'Three Nips', time: 230, line: 'Three nippers, three stretches of chewed bank.', after: 'The third nip turns back.' },
  'nipper flat8 pit flat6 nipper flat7 pit flat5 nipper coin3');
lay({ id: '6-8', world: 6, theme: 'kiln', name: 'Brick Ask', time: 230, line: 'The kiln asks nothing. The bricks just sit there.', after: 'Clay Kiln opens onto the empty cut.' },
  'ask flat4 nipper flat6 brick flat5 pit flat5 duck flat6 nipper');

lay({ id: '7-1', world: 7, theme: 'rope', name: 'First Tumble', time: 220, hint: 'Tumblers roll when you get close.', line: 'The creekbed is an empty cut. A log starts to turn.', after: 'The first tumbler stops on a wall of air.' },
  'flat14 tumbler flat12 roller up1 flat8 down1 pit flat8 coin4');
lay({ id: '7-2', world: 7, theme: 'rope', name: 'Roll And Tumble', time: 225, line: 'A loghead, then a rounder one that waits.', after: 'Both logs have had their roll.' },
  'flat6 roller flat8 tumbler flat5 pit flat4 kit');
lay({ id: '7-3', world: 7, theme: 'rope', name: 'Rope Stair', time: 225, line: 'Rope and stair cross the cut where water should run.', after: 'He climbs, and the cut stays empty.' },
  'up2 flat6 tumbler down2 flat4 pit flat6 kit coin4');
lay({ id: '7-4', world: 7, theme: 'rope', name: 'Twin Logs', time: 225, line: 'Two tumblers guard a long scaffold of mud.', after: 'Twin logs lie still.' },
  'flat8 tumbler flat10 tumbler flat5 pit coin4');
lay({ id: '7-5', world: 7, theme: 'rope', name: 'Tumble Nip', time: 230, line: 'A tumbler, then a nipper who heard it.', after: 'The cut is louder, and he is past it.' },
  'up1 flat8 tumbler down1 flat8 nipper pit flat8 leaper');
lay({ id: '7-6', world: 7, theme: 'rope', name: 'Cap Rope', time: 230, line: 'The sprig cap hangs where the ropes used to.', after: 'He takes the cap across the cut.' },
  'cap flat6 tumbler flat6 pit flat5 leaper flat7 coin3');
lay({ id: '7-7', world: 7, theme: 'rope', name: 'Three Logs', time: 230, line: 'Three logs over the empty creek.', after: 'The third log rolls itself out.' },
  'roller flat6 tumbler flat8 pit flat6 tumbler flat5 kit');
lay({ id: '7-8', world: 7, theme: 'rope', name: 'Wide Cut', time: 235, line: 'One wide cut, then the bank remembers how to be ice.', after: 'Rope Run ends. The air is colder.' },
  'flat8 wide flat6 tumbler flat8 pit flat4 nipper coin4');

lay({ id: '8-1', world: 8, theme: 'frost', name: 'First Ice', time: 220, hint: 'Icers slide fast. Land on them.', line: 'Snow sits on the pines. The creek is ice.', after: 'The first ice slides past under his feet.' },
  'flat10 icer flat6 pit flat5 coin4');
lay({ id: '8-2', world: 8, theme: 'frost', name: 'Twin Ice', time: 225, line: 'Two icers trade the frozen thread.', after: 'Twin ice is behind him.' },
  'up2 flat8 icer down2 pit flat8 icer flat6 kit');
lay({ id: '8-3', world: 8, theme: 'frost', name: 'Frost Stair', time: 225, line: 'The frost stair climbs above the frozen shine.', after: 'He comes down onto the ice again.' },
  'up3 flat4 icer down2 pit flat6 leaper coin3');
lay({ id: '8-4', world: 8, theme: 'frost', name: 'Ice And Log', time: 225, line: 'An icer, then a tumbler that does not like the cold.', after: 'Log and ice both stop.' },
  'up1 flat12 icer down1 pit flat14 tumbler flat10');
lay({ id: '8-5', world: 8, theme: 'frost', name: 'Ice Nip', time: 230, line: 'A nipper learned the ice and got quicker.', after: 'The nip loses the frost.' },
  'flat5 icer flat7 nipper flat6 pit flat5 icer');
lay({ id: '8-6', world: 8, theme: 'frost', name: 'Cap Frost', time: 230, line: 'The sprig cap is bright against the snow.', after: 'The cap stays yellow. The bank stays white.' },
  'cap flat6 icer flat5 pit flat8 icer flat5 kit coin3');
lay({ id: '8-7', world: 8, theme: 'frost', name: 'Three Ice', time: 230, line: 'Three icers, and under them the water still tries.', after: 'The third slide ends.' },
  'icer flat8 pit flat6 icer flat7 pit flat5 icer coin4');
lay({ id: '8-8', world: 8, theme: 'frost', name: 'Wide Ice', time: 235, line: 'A wide gap in the ice. Beyond it, the reds stacked a dam.', after: 'Frost Bank breaks. The dam shows red.' },
  'flat6 wide flat8 icer flat6 pit flat5 tumbler coin3');

lay({ id: '9-1', world: 9, theme: 'dam', name: 'Mason Flat', time: 225, hint: 'Masons throw bricks. Hop the brick.', line: 'A mason stands on the logs and throws clay.', after: 'The first brick misses.' },
  'flat10 mason flat6 pit flat5 kit coin4');
lay({ id: '9-2', world: 9, theme: 'dam', name: 'Mason And Nip', time: 230, line: 'The mason throws. The nipper runs under the brick.', after: 'Brick and nipper both miss him.' },
  'flat6 mason flat8 nipper flat5 pit flat4 coin3');
lay({ id: '9-3', world: 9, theme: 'dam', name: 'Mason Ice', time: 230, line: 'An icer still slides the logs of the dam.', after: 'Ice on the dam does not hold.' },
  'up3 flat6 mason down1 flat8 icer down2 pit flat8 kit');
lay({ id: '9-4', world: 9, theme: 'dam', name: 'Two Masons', time: 230, line: 'Two masons. The bricks come in pairs.', after: 'Both masons are off the logs.' },
  'up2 flat12 mason down2 pit flat16 mason flat10 coin4');
lay({ id: '9-5', world: 9, theme: 'dam', name: 'Dam Mix', time: 235, line: 'Leaper, tumbler, and the stacked reds.', after: 'The mix breaks up along the logs.' },
  'brick flat8 mason up1 flat8 leaper down1 pit flat8 tumbler');
lay({ id: '9-6', world: 9, theme: 'dam', name: 'Hard Dam', time: 235, line: 'The lake behind the logs is the river that never arrived.', after: 'He is closer to the crack in the dam.' },
  'flat6 mason flat5 pit flat6 nipper flat5 pit flat4 icer');
lay({ id: '9-7', world: 9, theme: 'dam', name: 'Cap Dam', time: 235, line: 'The sprig cap, then everything the reds still have.', after: 'The cap goes on. The keeper is next.' },
  'cap up2 flat8 mason down2 flat8 goose wide flat8 nipper flat9 icer');

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

lay({ id: '10-1', world: 10, theme: 'source', name: 'Thin Spring', time: 230, hint: 'The spring is close.', line: 'Past the dam, the water is a spring under the pines.', after: 'The thin spring leads to one last rope.' },
  'flat5 mason flat6 pit flat5 icer flat6 pit flat5 nipper flat6 pit flat4 tumbler flat5 coin4');

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
  });
  if (LEVELS.length !== 56) throw new Error('count ' + LEVELS.length);
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

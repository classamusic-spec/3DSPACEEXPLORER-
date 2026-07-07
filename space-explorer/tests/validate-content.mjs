/* Validates index.html: script-block syntax + curriculum data integrity.
   Run with: npm test   (node tests/validate-content.mjs) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root, 'index.html'), 'utf8');

let failures = 0;
const ok = (m) => console.log('  ✓', m);
const bad = (m) => { failures++; console.error('  ✗', m); };

/* ---------- 1. structure ---------- */
console.log('Structure');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.length >= 21 ? ok(`${scripts.length} inline script blocks found`) : bad('expected ≥5 script blocks');
for (const t of ['body', 'html']) {
  const open = html.split('<' + t).length - 1, close = html.split('</' + t + '>').length - 1;
  open === close ? ok(`<${t}> balanced`) : bad(`<${t}> unbalanced (${open} open / ${close} close)`);
}

/* ---------- 2. syntax: compile each block without executing ---------- */
console.log('Syntax');
scripts.forEach((s, i) => {
  try { new Function(s); ok(`block ${i} compiles`); }
  catch (e) { bad(`block ${i} syntax error: ${e.message}`); }
});

/* ---------- 3. data: execute curriculum blocks in a sandbox ---------- */
console.log('Curriculum data');
const stubs = `
const noopEl = () => new Proxy(function(){}, { get: (t,p) => p==='dataset'?{}: p==='style'?{}: p==='classList'?{add(){},remove(){},toggle(){},contains(){return false}}: noopEl(), apply: () => noopEl(), set: () => true });
const document = new Proxy({}, { get: (t,p) => ['getElementById','createElement','createElementNS','querySelector'].includes(p) ? noopEl() : p==='querySelectorAll' ? () => [] : p==='body' ? noopEl() : noopEl() });
const window = globalThis; const speechSynthesis = { cancel(){}, speak(){} };
const S = { grade: 2, stars: 0, calm: false, voice: false, badges: [] };
function $(){ return noopEl(); }
function setControlsVisible(){} function joyReset(){} function refreshHUD(){} function saveP(){}
function sndCorrect(){} function confetti(){} function speak(){} function tone(){}
function sndWrong(){} function sndTada(){} function showToast(){}
const cheers=['x']; const flight={vel:0}; let accelHeld=false, autopilot=-1, uiLock=false, streakN=0;
const shooter={}; function startShooter(){}
`;
const dataBlock = scripts.find(s => s.includes('const PHONICS'));
const expBlocks = scripts.filter(s => s.includes('PHONICS.push') || s.includes('const SENTENCES') || s.includes('const GRADE_NAMES') || s.includes('const SPANISH') || s.includes('function genSpanishBlast') || s.includes('const STORIES') || s.includes('const WORDPROBS') || s.includes("GRADE_NAMES.push('4th") || s.includes('const LESSONS') || s.includes('const EXTRA_SLIDES') || s.includes('LESSONS.liberty') || s.includes('USCIVICS.push') || s.includes('const MANDARIN') || s.includes('const POP_WORDS'));
const expBlock = expBlocks.join('\n');
if (!dataBlock || !expBlocks.length) bad('could not locate curriculum blocks');

const asserts = `
const pools = { PHONICS, SCIENCE, FEELINGS };
for (const [name, pool] of Object.entries(pools))
  for (const q of pool) {
    if (!q.o) throw name + ' question missing options: ' + q.q;
    const n = q.o.filter(o => o.ok).length;
    if (n !== 1) throw name + ' must have exactly 1 correct (' + n + '): ' + q.q;
    if (!q.q) throw name + ' missing prompt text';
  }
for (const q of HISTORY) {
  if (q.tf) { if (q.a !== 0 && q.a !== 1) throw 'HISTORY tf bad answer: ' + q.q; }
  else if (q.o.filter(o => o.ok).length !== 1) throw 'HISTORY needs 1 correct: ' + q.q;
}
for (const q of TRUEFALSE) if (q.a !== 0 && q.a !== 1) throw 'TRUEFALSE bad answer: ' + q.q;
for (const q of USCIVICS) {
  if (q.tf) { if (q.a !== 0 && q.a !== 1) throw 'USCIVICS tf bad: ' + q.q; }
  else if (q.o.filter(o => o.ok).length !== 1) throw 'USCIVICS needs 1 correct: ' + q.q;
}
if (!STOPS.some(s => s.id === 'liberty')) throw 'Liberty Station missing';
if (MANDARIN.length !== 6) throw 'expected 6 Mandarin categories';
for (const cat of MANDARIN) {
  if (cat.items.length < 6) throw 'Mandarin category too small: ' + cat.n;
  for (const w of cat.items)
    if (w.length !== 4 || !w[0] || !w[1] || !w[2] || !w[3]) throw 'Mandarin item needs pinyin/english/emoji/hanzi: ' + cat.n;
}
for (const g of [1,2,3,4,5]) {
  if (!POP_WORDS[g] || POP_WORDS[g].length < 6) throw 'POP_WORDS tier ' + g + ' too small';
  for (const w of POP_WORDS[g]) if (!w || w.includes(' ')) throw 'bad pop word: ' + w;
}
for (let i = 0; i < 300; i++) {
  const z = genZHBlast();
  if (!z.opts.includes(z.ans) || new Set(z.opts).size !== 3 || !z.zh) throw 'genZHBlast invalid';
}
for (const w of SPEECH_WORDS) if (!w.w || !w.e || !w.s) throw 'SPEECH word incomplete: ' + JSON.stringify(w);
for (const g of [1, 2, 3, 4, 5]) {
  S.grade = g;
  for (let i = 0; i < 500; i++) {
    const c = genCounting(); if (c.o.filter(o => o.ok).length !== 1) throw 'genCounting g' + g;
    const m = genMath();
    if (m.o.filter(o => o.ok).length !== 1) throw 'genMath g' + g;
    for (const o of m.o) if (+o.t < 0) throw 'genMath negative option g' + g;
    const s = genShooterProblem();
    if (!s.opts.includes(s.ans) || s.ans < 0 || new Set(s.opts).size !== 3) throw 'genShooterProblem g' + g;
    if (!Number.isInteger(s.ans)) throw 'non-integer shooter answer g' + g;
    if (/÷/.test(s.text)) { const [c,b] = s.text.split('÷').map(x=>parseInt(x)); if (c % b !== 0) throw 'uneven division g' + g; }
    const L = genLetterProblem();
    if (!L.opts.includes(L.ans) || new Set(L.opts).size !== 3) throw 'genLetterProblem';
    const sp = genSpanishBlast();
    if (!sp.opts.includes(sp.ans) || new Set(sp.opts).size !== 3 || !sp.es) throw 'genSpanishBlast';
  }
}
for (const shape of CONN_SHAPES) if (shape.pts.length < 5) throw 'CONN_SHAPES too small: ' + shape.name;
if (SENTENCES.length < 15) throw 'SENTENCES pool too small';
for (const s of SENTENCES) if (!s.words || s.words.length < 3 || !s.say) throw 'bad sentence: ' + JSON.stringify(s);
if (SPEECH_LEVELS.length !== 5) throw 'expected 5 apraxia levels';
for (const l of SPEECH_LEVELS) {
  if (l.items.length < 8) throw 'apraxia level too small: ' + l.n;
  for (const w of l.items) if (!w.w || !w.e || !w.s) throw 'incomplete speech item in ' + l.n;
}
for (const [L, ws] of Object.entries(LAB_WORDS)) {
  if (ws.length < 2) throw 'LAB_WORDS needs 2 words for ' + L;
  for (const w of ws) if (!w[1].toUpperCase().startsWith(L)) throw 'LAB word/letter mismatch: ' + L + ' / ' + w[1];
  if (!LAB_SOUNDS[L]) throw 'missing LAB_SOUNDS for ' + L;
}
if (!STOPS.some(s => s.type === 'sentence')) throw 'sentence station missing from STOPS';
if (STOPS.length < 13) throw 'STOPS shrank below 13';
if (!STOPS.some(s => s.type === 'spanish')) throw 'spanish station missing';
if (!STOPS.some(s => s.type === 'story')) throw 'story station missing';
if (STORIES.length < 8) throw 'STORIES pool too small';
for (const st of STORIES) {
  if (!st.t || !st.s || !st.q) throw 'incomplete story: ' + st.t;
  if (st.o.filter(o => o.ok).length !== 1) throw 'story needs 1 correct: ' + st.t;
}
if (WB_WORDS.length < 14) throw 'WB_WORDS too small';
for (const w of WB_WORDS) if (!w.w || !w.e || w.w.length < 3) throw 'bad WB word: ' + JSON.stringify(w);
if (SORT_SETS.length < 4) throw 'need 4 sort sets';
for (const ss of SORT_SETS) {
  if (ss.a.length < 5 || ss.b.length < 5) throw 'sort set too small: ' + ss.name;
  for (const e of ss.a) if (ss.b.includes(e)) throw 'sort item in both bins: ' + e;
}
if (MISSION_DEFS.length < 5) throw 'need 5 mission templates';
for (const m of MISSION_DEFS) if (!m.id || !m.goal || !m.n) throw 'bad mission def';
if (SHOP_ITEMS.length < 8) throw 'need 8 shop items';
for (const it of SHOP_ITEMS) if (!it.id || !it.kind || !it.cost || !it.c) throw 'bad shop item: ' + it.id;
if (TRACE_LETTERS.length < 14) throw 'need 14+ trace letters';
if (WORDPROBS.length < 12) throw 'WORDPROBS too small';
for (const w of WORDPROBS) {
  if (!w.q || !w.say) throw 'incomplete word problem';
  if (w.o.filter(o => o.ok).length !== 1) throw 'word problem needs 1 correct: ' + w.q;
}
/* time & money wrappers: sample heavily at each grade */
for (const g of [2, 3, 4]) {
  S.grade = g; let sawClock = false, sawCoin = false;
  for (let i = 0; i < 800; i++) {
    const c = genCounting();
    if (c.o.filter(o => o.ok).length !== 1) throw 'wrapped genCounting g' + g;
    if (/clock/i.test(c.q)) sawClock = true;
    const m = genMath();
    if (m.o.filter(o => o.ok).length !== 1) throw 'wrapped genMath g' + g;
    if (/cents/i.test(m.q)) sawCoin = true;
  }
  if (!sawClock) throw 'clock questions never appeared at g' + g;
  if (g >= 3 && !sawCoin) throw 'money questions never appeared at g' + g;
}
/* depth wrappers: word problems (2nd+) and fractions/rounding (3rd) must appear */
{
  S.grade = 4; let sawWord = false, sawFrac = false, sawRound = false;
  for (let i = 0; i < 1500; i++) {
    const m = genMath();
    if (m.o.filter(o => o.ok).length !== 1) throw 'depth genMath invalid';
    if (/rocks|rover|aliens|astronauts|snacks|pages|sparkles|stars|comet/i.test(m.q)) sawWord = true;
    if (/fraction|WHOLE/i.test(m.q)) sawFrac = true;
    if (/Round /.test(m.q)) sawRound = true;
  }
  if (!sawWord) throw 'word problems never appeared';
  if (!sawFrac) throw 'fraction questions never appeared';
  if (!sawRound) throw 'rounding questions never appeared';
}
/* new skills: ordinals (K-1), calendar (1st+), even/odd (1st+) */
{
  S.grade = 1; let sawOrd = false;
  for (let i = 0; i < 700; i++) {
    const c = genCounting();
    if (c.o.filter(o => o.ok).length !== 1) throw 'ordinal genCounting invalid';
    if (/FIRST|SECOND|THIRD|FOURTH/.test(c.q)) sawOrd = true;
  }
  if (!sawOrd) throw 'ordinal questions never appeared at K';
  S.grade = 3; let sawDay = false, sawMonth = false, sawEO = false;
  for (let i = 0; i < 1200; i++) {
    const c = genCounting();
    if (c.o.filter(o => o.ok).length !== 1) throw 'calendar genCounting invalid';
    if (/day comes after/.test(c.q)) sawDay = true;
    if (/month comes after/.test(c.q)) sawMonth = true;
    const m = genMath();
    if (m.o.filter(o => o.ok).length !== 1) throw 'even-odd genMath invalid';
    if (/EVEN or ODD/.test(m.q)) sawEO = true;
  }
  if (!sawDay) throw 'day-after questions never appeared';
  if (!sawMonth) throw 'month-after questions never appeared';
  if (!sawEO) throw 'even/odd questions never appeared';
}
/* 4th grade tier: big multiplication, equivalents, multiples, thousands place value */
{
  S.grade = 5; let sawBig = false, sawEquiv = false, sawMult = false, sawThou = false;
  for (let i = 0; i < 1800; i++) {
    const m = genMath();
    if (m.o.filter(o => o.ok).length !== 1) throw 'g5 genMath invalid';
    if (/1[2-9] × /.test(m.q)) sawBig = true;
    if (/EQUALS/.test(m.q)) sawEquiv = true;
    if (/MULTIPLE/.test(m.q)) sawMult = true;
    const c = genCounting();
    if (c.o.filter(o => o.ok).length !== 1) throw 'g5 genCounting invalid';
    if (/THOUSANDS/.test(c.q)) sawThou = true;
    const s = genShooterProblem();
    if (!s.opts.includes(s.ans) || new Set(s.opts).size !== 3) throw 'g5 shooter invalid';
    if (!Number.isInteger(s.ans) || s.ans < 0) throw 'g5 shooter bad answer';
  }
  if (!sawBig) throw '2-digit multiplication never appeared at g5';
  if (!sawEquiv) throw 'equivalent fractions never appeared at g5';
  if (!sawMult) throw 'multiples never appeared at g5';
  if (!sawThou) throw 'thousands place value never appeared at g5';
  if (GRADE_NAMES.length !== 6) throw 'GRADE_NAMES should have 6 entries';
}
/* micro-lessons: 9 stations x 5 grades x 3 slides */
{
  const need = ['mercury','venus','earth','mars','station','jupiter','saturn','uranus','comet','liberty'];
  for (const id of need) {
    if (!LESSONS[id]) throw 'missing lessons for ' + id;
    for (const g of [1,2,3,4,5]) {
      const slides = LESSONS[id][g];
      if (!slides || slides.length !== 5) throw id + ' grade ' + g + ' needs 5 slides';
      for (const sl of slides)
        if (!sl[0] || !sl[1] || sl[1].length < 10) throw 'bad slide in ' + id + ' g' + g;
    }
  }
}
/* per-band pool depth: every quizzed band must offer >= QUESTIONS x3 fresh items */
{
  const bands = (pool) => {
    for (const g of [1,2,3,4,5]) {
      let ok = pool.filter(q => !q.g || g >= q.g);
      if (g >= 3) { const hard = ok.filter(q => (q.g||1) >= g-1); if (hard.length >= 3) ok = hard; }
      if (ok.length < 9) return g;
    }
    return 0;
  };
  for (const [name,pool] of [['PHONICS',PHONICS],['SCIENCE',SCIENCE],['TRUEFALSE',TRUEFALSE],
    ['HISTORY',HISTORY],['FEELINGS',FEELINGS],['SENTENCES',SENTENCES],['USCIVICS',USCIVICS],['STORIES',STORIES]]) {
    const thin = bands(pool);
    if (thin) throw name + ' too thin at grade band ' + thin + ' (<9 items = repeats within 3 visits)';
  }
}
if (SPANISH.length !== 9) throw 'expected 9 Spanish categories';
for (const cat of SPANISH) {
  if (cat.silabas) {
    if (cat.items.length < 12) throw 'Sílabas needs 12+ items';
    for (const v of cat.items) if (v.length !== 5) throw 'sílaba item needs 5 fields: ' + v[0];
  } else if (cat.phonics) {
    if (cat.items.length !== 5) throw 'Spanish vowels must have 5 items';
    for (const v of cat.items) if (v.length !== 5) throw 'vowel item needs 5 fields: ' + v[0];
  } else {
    if (cat.items.length < 6) throw 'Spanish category too small: ' + cat.n;
    for (const w of cat.items) if (w.length !== 3 || !w[0] || !w[1] || !w[2]) throw 'bad Spanish word in ' + cat.n;
  }
}
const dists = STOPS.map(s => s.dist);
if (new Set(dists).size !== dists.length) throw 'duplicate STOPS.dist values';
return { PHONICS: PHONICS.length, SCIENCE: SCIENCE.length, TRUEFALSE: TRUEFALSE.length,
  HISTORY: HISTORY.length, FEELINGS: FEELINGS.length, SPEECH_WORDS: SPEECH_WORDS.length,
  SENTENCES: SENTENCES.length, USCIVICS: USCIVICS.length, SPANISH_WORDS: SPANISH.reduce((a,c)=>a+c.items.length,0), MANDARIN_WORDS: MANDARIN.reduce((a,c)=>a+c.items.length,0), STORIES: STORIES.length, WB_WORDS: WB_WORDS.length, SPEECH_LEVEL_ITEMS: SPEECH_LEVELS.reduce((a,l)=>a+l.items.length,0), STOPS: STOPS.length };
`;

try {
  const counts = new Function(dataBlock + stubs + expBlock + asserts)();
  ok('all pool questions have exactly one correct answer');
  ok('generators valid for grades K-4 (2500 samples)');
  ok('counts: ' + Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' '));
} catch (e) { bad('data validation failed: ' + (e.message || e)); }

/* ---------- 4. invariants ---------- */
console.log('Invariants');
/localStorage/.test(dataBlock + scripts[3] ?? '') && !/window\.storage/.test(html)
  ? bad('direct localStorage use without shim') : ok('storage access goes through window.storage shim');
html.includes('r128/three.min.js') ? ok('three.js r128 pinned') : bad('three.js version changed from r128');
html.includes('fonts.googleapis.com') && html.includes('--font-display') ? ok('premium type system present') : bad('font system missing');
html.includes('station.locked') ? ok('double-reward guard present') : bad('station.locked guard missing');

console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);

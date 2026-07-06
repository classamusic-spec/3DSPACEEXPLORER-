# Little Space Explorer — Flight Academy

A single-file 3D solar-system learning game for ages 3–10 (K through 4th grade), built with
Three.js r128. The player free-flies a rocket or flying saucer with an on-screen analog
joystick + red thruster button, lands on planets that host themed learning stations,
plays arcade mini games, and collects stars/badges/ranks with persistent progress.

## Run & test

```bash
npm start        # serves index.html at http://localhost:3000 (npx serve)
npm test         # syntax-checks all script blocks + validates every question/pool
```

Always run `npm test` after editing curriculum data or any script block.
There is no build step: `index.html` is the entire game. Keep it that way unless the
user explicitly asks for a split — single-file is a deliberate constraint so the game
can be pasted back into a claude.ai artifact.

## Architecture: one HTML file, 5 script blocks

`index.html` contains numbered section comments — grep for `=== N.` to jump around:

| Block | Sections | Contents |
|---|---|---|
| 0 | — | Storage shim (`window.storage` on claude.ai, localStorage fallback locally) |
| 1 | 1–2 | **Curriculum data + generators** (`PHONICS`, `SCIENCE`, `TRUEFALSE`, `HISTORY`, `FEELINGS`, `SPEECH_WORDS`, `genCounting`, `genMath`, `genShooterProblem`), `STOPS` (the 9 stations), `RANKS` |
| 2 | 3–7 | State `S`, audio/speech, save/load, Three.js scene (sun, planets, asteroid belt, Pluto, beacon), ship models, flight state, joystick/accel input, HUD/labels/passport |
| 3 | 8–11 | Station/question engine, Math Blaster shooter, settings/badges/start screens, sparkle coins, main animation loop |
| 4 | 12–16 | Curriculum expansion (`.push(...)` onto the pools), Letter Blaster generator, arcade menu, Star Patterns (Simon), Star Connect (dot-to-dot) |
| 5 | 17–19 | **Lessons**: `SENTENCES` + `renderSentence` (Space Station word-tile builder), `SPEECH_LEVELS` + apraxia practice flow (overrides `renderSpeech`; 5-level ladder, say-it-3-times rep dots, 🐢 slow model via `speak(text, rate)`), Letter Lab teach-then-practice phonics game (`LAB_WORDS`/`LAB_SOUNDS`) |
| 6 | 20 | `GRADE_NAMES`, 2nd/3rd grade curriculum pushes (`g:3`/`g:4` tags across all pools), Big Words apraxia level, grade-picker styles |
| 7 | 21 | **Español (La Luna)**: `SPANISH` categories incl. Las Vocales phonics, `speakES()` (Spanish TTS voice; pass `queue=true` to chain after English — a bare `speakES` cancels prior speech), `renderSpanishCats/Round`; Sílabas category uses `silabas:true` flag with 5-field items |
| 8 | 22 | **Premium design system** (final cascade layer: `:root` tokens, Fredoka/Nunito type, glass panels — never add colors/radii inline, extend the tokens) + Spanish Blaster (`genSpanishBlast`) |
| 9 | 23–33 | **Sprint block**: `STORIES` + Story Comet renderer; shapes push; time/money via `genCounting`/`genMath` WRAPPERS (they reassign the function bindings — keep them after the originals); Word Builder, Trace It (canvas coverage ≥55%), Match Up, Rhythm Repeat, Sorting Lab; Sparkle Shop (`SHOP_ITEMS`, `applyEquip`, `shipPaintMats`); Daily Missions (`MISSION_DEFS`, `missionBump` hooks in correctFlow/openStation/collectCoin/game starts); Parent Report (`S.skill` via `skillMark`); Echo Ocean mic recording (wraps `renderSpeech`) |
| 10 | 34 | **Depth pass**: geography/community in SCIENCE, syllables/suffixes/homophones in PHONICS, `WORDPROBS` + a second `genMath` wrapper (word problems 2nd+, fractions/rounding 3rd — wrappers chain, keep order), La Familia + La Comida, more stories/sentences/WB words, lowercase trace letters |
| 11 | 35 | **4th grade (g:5) + challenge pass**: third `genMath` wrapper (2-digit multiplication, equivalent fractions, multiples, fraction-of), `genCounting` thousands place value wrapper, shooter g5 wrapper, figurative language/idioms/roots ELA, photosynthesis/circuits/adaptations science, Apollo 13/Saturn V/probes history, digital citizenship SEL. Grade picker also lives on the START screen (same `.gradeBtn` class auto-binds) |
| 12 | 36–37 | **Micro-lesson system**: `LESSONS` (9 stations × 5 grades × 3 spoken slides), Teach-me/Quiz-me station menu (`renderStationMenu`), `pickFresh`/`ASKED` no-repeat engine in `buildQuestions` (per-station memory; recycles only when a band is exhausted), breadth wave filling thin grade bands |
| 13 | 38–39 | Lesson depth (`EXTRA_SLIDES` pushes slides 4-5 onto every lesson: worked example + your-turn) + question wave 4 |
| 14 | 40 | **Art Studio** (sensory 3D painting): own `artScene`/`artCam`, ring-buffer point layers with additive glow, kaleidoscope symmetry, bubble pool, pentatonic stroke tones, pressure-free artist star. Render loop swaps scenes via `art.active`. NOT included in the test sandbox (top-level THREE usage) — keep it in its own script block |
| 15 | 41–43 | **CT alignment + autism supports**: Liberty Station 🗽 (`USCIVICS` in block 1, lessons here), CT Curriculum Map screen (`CT_MAP`), First-Then planner (`S.ft`, `ftFirstDone` hook in completeStation, banner launch), Calm Cove breathing (transition-based — deliberately exempt from reduce-motion since it IS the regulation tool), Reduce Motion (`S.rm`, body.rm damping + JS sway/bob guards) |
| 16 | 44 | **CT wave 2**: state symbols/inventions civics, New England nature science, CT stories (Charter Oak, Frisbee, maple), plus ordinal/calendar `genCounting` wrapper and even-odd `genMath` wrapper (`DAYS`/`MONTHS`) |
| 17 | 45 | **Mandarin 🇨🇳**: `MANDARIN` (4-field items: pinyin/english/emoji/HANZI — speech uses hanzi for correct tones), `speakZH` (chains onto the shared `onvoiceschanged`), `LANGS` registry + language picker (overrides `renderSpanishCats/Round`; Spanish phonics cats still work), Mandarin Blaster (`genZHBlast`, mode 'zh'). To add another language: add a LANGS entry + category data — the picker/rounds are language-agnostic |
| 18-19 | 46–49 | Curriculum wave 5 + `POP_WORDS` sight-word tiers; three skill games: Clock Shop (set analog hands yourself), Snack Shop (compose exact change, grade-scaled prices, undo), Word Pop (spoken target → pop the printed word; rising CSS bubbles). Note: the test `asserts` block is a TEMPLATE LITERAL — regex backslashes must be doubled or avoided there |

Cross-block globals are fine: blocks execute in order and share the global scope.
New expansion content should go in block 4 or a new block appended before `</body>`.

## Key data shapes

**Pool question** (multiple choice): `{q:'Which…?', say:'spoken version', txt:1?, g:2?, o:[O('🍎','Apple',1), O('🐱','Cat'), …]}`
- `O(emoji, label, ok)` — exactly ONE option per question must have `ok`
- `txt:1` renders options as large text (no emoji) — used for numbers/sight words
- `g:N` grade tags: 2=1st, 3=2nd, 4=3rd, 5=4th (`S.grade` 1–5 = K–4th). `gradePool()` filters
  upward AND, for grades 3–4, prefers items tagged near that level so older kids
  aren't served baby questions. Generators branch on `S.grade` directly.
- True/false pool items: `{q, a:1|0}`; mixed pools can use `{q, tf:1, a}`

**Generated question** (from `genCounting`/`genMath`): same shape, plus optional
`big:'⭐⭐⭐'` rendered huge for counting. Generators read `S.grade` (1=K, 2=1st).

**Shooter problem**: `{text, say, ans, opts:[3 values]}` — `opts` may be numbers
(math) or strings (letters). `shooter.gen` is swapped per mode in `startShooter(mode, from)`;
`from:'arcade'` returns to flight on completion, `from:'station'` runs badge/completion flow.

**Station** (`STOPS` entry): `{id, name, emoji, pe, subject, size, dist, speed, fact, type, pool|gen}`
- `type`: `'pool' | 'tf' | 'gen' | 'speech' | 'shooter' | 'sentence' | 'spanish'`
- 13 stops now (Liberty Station 🗽 at dist 168 reuses buildStationMesh) (Story Comet at dist 136 has a custom head+tail mesh) (La Luna orbits EARTH, not the sun — special-cased in the orbit loop
  and its `dist` is its Earth-orbit radius); the belt index is looked up dynamically (`STOPS.findIndex(s=>s.id==='belt')`) — never hardcode station indices; Earth must stay at index 2 (moon animation)

**Save format** (key `lse-save`): `{stars, badges:[stopIds], calm, voice, ship, won, grade}` —
if you add fields, update BOTH `saveP()` and `loadP()` and default missing fields.

## Recipes

**Add a lesson**: add `LESSONS[stopId][grade] = [[emoji, text], x3]` — missing grades
fall back to the nearest lower grade. Slides must be short and speakable.

**Content depth rule**: every quizzed grade band per pool needs ≥9 items (3 repeat-free
visits) — `npm test` enforces this, so pushes that unbalance a band will fail CI.


**Add questions**: push onto the relevant pool array in block 4, run `npm test`.

**Add a mini game**: follow the Star Patterns pattern —
1. Add a `.screen hidden` overlay div + styles in the block-4 `<style>`
2. Add a `.gameCard` button in `#arcade` and wire it in section 14
3. On open: `uiLock=true; setControlsVisible(false); flight.vel=0; accelHeld=false; joyReset(); autopilot=-1;`
4. Award with `rewardStar()`; speak everything; mistakes must be gentle (replay/retry, never fail)
5. On close: `uiLock=false; setControlsVisible(true);`

**Add a planet/station**: add to `STOPS` (pick an unused `dist`), a `TEX` entry, and note
the win condition is `S.badges.length >= STOPS.length` — adding a stop raises the bar,
which also invalidates old `won` saves gracefully (they just have more to do).

## Hard constraints — do not break these

- **Design tokens live in block 8's `:root`.** New UI must consume `--gold/--mint/--glass/
  --font-display/etc.` rather than introducing new one-off colors. The gradient-border
  card technique needs `border:2px solid transparent` + double `background` — keep both.
- Google Fonts may be blocked in some sandboxes; every `font-family` must keep its
  fallback stack.

- **Three.js r128 from cdnjs only.** No OrbitControls, no CapsuleGeometry, no npm three.
  Camera control is hand-rolled (chase cam in section 11).
- **Never call `localStorage` directly** in game code — go through `window.storage`
  (the shim handles environment differences). On claude.ai, direct localStorage throws.
- **Audience UX rules**: every question must have a `say`/spoken form (players can't read);
  wrong answers wiggle + encourage, never punish or block; touch targets stay huge;
  Calm Mode (`S.calm`) must keep working — it gates confetti, softens sounds/nebulas,
  slows speech and Simon timing. Test new features with Calm Mode ON.
- **The speech station (Neptune / apraxia) is zero-fail by design.** The rep button always
  advances; do not add verification. Its 4-level ladder (CV → CVC → 2-syllable → phrases)
  and 3-repetition structure reflect apraxia therapy principles — keep both.
- **Sentence tiles match by text**, not index, so duplicate words are safe; keep the
  never-pre-solved shuffle guard in `renderSentence`.
- All copy is read by/for young kids: short, warm, concrete, silly-wrong-answers welcome.

## Gotchas

- **Sparkles (`S.sparks`) are persistent currency** for the Shop — they no longer
  auto-convert to stars. Never reintroduce the conversion.
- **`missionBump(id)` must be called from any new reward loop** (see existing hooks) or
  daily missions silently stop progressing. `ensureMissions()` must NOT run at page load
  (it would race the async `loadP` and clobber the save) — only from gameplay events.
- Un-equipping shop paint/flame restores `material.userData.def` — builders must not
  overwrite that field.

- **Chained bilingual speech**: `speak(english)` then `speakES(spanish, true)` — the queue
  flag is mandatory or the second call cancels the first.
- **Smart review** (`MISSED` map) re-queues wrong answers on the next station visit for
  pool/tf/gen types only; it is session-scoped by design.

- `const` declarations don't attach to `window` — use `typeof X!=='undefined'` guards if a
  block-1 function must reference later-declared globals (see the generators).
- `correctFlow()` uses `station.locked` to prevent double-tap star farming — any new
  reward path needs an equivalent guard.
- Planet labels are HTML divs projected to screen each frame; they're also the autopilot
  tap targets. Keep `pointer-events` toggling intact (hidden when behind camera).
- The joystick uses pointer capture on `#joyZone`; touching it cancels autopilot on purpose.
- Sparkle coins convert 5 ✨ → 1 ⭐ in `collectCoin()`; coin positions are session-random.
- **Comet Chase** (☄️) lives in the main animate loop: `spawnCometChase`/`catchComet`/`despawnComet`
  + `chaseComet` state (near `explodeAt`). It only *spawns* during free flight (`!uiLock&&!shooter.active&&!photoMode`)
  but *updates* whenever `chaseComet.active` so it always resolves. `catchComet` awards +2 ⭐/+5 ✨ and
  calls `starShower`. No save-format change — rewards go through existing counters.
- **Photo Mode** (📷): `photoMode` flag (declared by `flight`) + `body.photo` CSS hides all chrome;
  flight input is frozen in the loop's flight block. `exitPhoto` is a one-shot `pointerdown` listener.
- Planet **atmosphere halos** are additive glow sprites parented to each planet mesh (tints in `ATMO`);
  the **speed FOV** push is in the chase-camera block and is disabled under Calm/Reduce-Motion.

## Roadmap

See `docs/ROADMAP.md` for the prioritized backlog (daily missions, sparkle shop,
comet chase, voice recording for Echo Ocean, parent dashboard, 2nd-grade tier).

# Roadmap (prioritized backlog)

## Retention
1. ~~Daily mission board~~ — DONE (📋 HUD) — 3 rotating missions ("land on 3 planets", "get a 5-streak",
   "collect 10 sparkles") with a bonus-star chest. Persist `lastMissionDate` +
   `missionProgress` in the save. Highest-impact next feature.
2. ~~Sparkle Shop~~ — DONE (🛍️ HUD) — spend ✨ on ship paint colors, flame styles, a pet alien co-pilot
   riding the dome. Persist `owned` + `equipped`. Gives sparkles a long-term sink.
3. **Comet chase event** — a comet randomly streaks across space; catch it within 60s
   for a bonus star shower.

## Curriculum
4. ~~2nd/3rd Grade tiers~~ — DONE (grades 1–4 in `S.grade`). Next: telling time,
   money/coins, and measurement questions for the upper grades.
5. ~~Reading Station~~ — DONE (Story Comet). Next (space station stop)** — 2–3 sentence decodable passages with a
   comprehension question, 1st-grade mode only.
6. ~~Echo Ocean voice recording~~ — DONE (🎙️ in speech practice) — MediaRecorder: record the child saying the word and
   play it back next to the model. Huge for apraxia practice. Requires mic permission
   handling and a graceful fallback.

## Polish
7. ~~Parent dashboard~~ — DONE (settings → Progress Report). Next: time-played tracking (⚙️ sub-screen): per-subject correct counts, time played.
   Add per-subject counters to the save format.
8. Volume slider + separate music/effects toggles.
9. Photo-mode button that hides the HUD for planet close-ups.
10. Two-player co-pilot mode: alternate questions, shared stars.

## Engineering
- Consider splitting blocks into `src/*.js` with a tiny build script ONLY if single-file
  becomes painful; keep a `npm run bundle` that emits one `index.html` so it can still be
  pasted into a claude.ai artifact.
- Add a headless smoke test (Playwright) that boots the page and asserts no console errors.

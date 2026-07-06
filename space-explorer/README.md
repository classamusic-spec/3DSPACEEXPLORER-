# 🚀 Little Space Explorer — Flight Academy

A premium single-file 3D solar-system game where kids (ages 3–10) pilot a rocket or
flying saucer, land on planets to learn, and blast math asteroids — with a full
Kindergarten + 1st grade curriculum, autism-friendly Calm Mode, and an apraxia
speech-practice station.

## Quick start

```bash
npm start          # http://localhost:3000
npm test           # validate all 205+ questions and script syntax
```

No build step, no dependencies — `index.html` is the whole game. Open it via a local
server (speech synthesis and pointer capture behave best over http).

## Controls

- 🕹️ **Joystick** (bottom-left): steer — up/down pitches, left/right turns, with a
  deadzone and curved response for fine control
- 🔴 **Red button** (bottom-right): hold to fly; becomes FIRE! in blaster games
- **Tap a planet's floating label**: kid-friendly autopilot (joystick cancels it)
- Desktop: **WASD or arrow keys** to steer, **hold SPACE** to fly (SPACE = FIRE in blaster games)

## What's inside

- **9 learning stations**: counting (Mercury), phonics (Venus), science (Earth),
  true/false (Mars), Math Blaster (Asteroid Belt), addition/subtraction (Jupiter),
  space history (Saturn), feelings & social skills (Uranus), apraxia speech
  practice (Neptune) — everything read aloud, nothing punishes mistakes
- **🕹️ Space Arcade (6 games)**: Math Blaster, Letter Blaster, Spanish Blaster,
  Star Patterns (musical Simon), Star Connect (dot-to-dot), Letter Lab (phonics lessons)
- **Free-flight collectibles**: 44 golden sparkles, 5 ✨ = 1 ⭐
- **Progression**: stars → 5 pilot ranks, 9 badges, streaks, secret Pluto ending,
  progress persists across sessions
- **Accessibility**: Calm Mode (soft visuals/sounds, slower voice, visual schedule),
  1st Grade Mode difficulty toggle, zero-fail speech station

## Developing with Claude Code

Open this folder and run `claude` — `CLAUDE.md` contains the architecture map,
data schemas, recipes (add questions / mini games / planets), and hard constraints.
Run `npm test` after any curriculum or logic change.

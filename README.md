# Escape Pod Bay

A Crossmint engineering challenge submission. A small browser-based 3D escape room: you're alone on a research station whose reactor just died, you have 2 minutes of air, and the only way out is to power up and launch the escape pod parked in the next room.

**Live:** https://juanmanuelcb.github.io/crossmint-escape-room/

---

## How to play

Walk around with WASD (or keyboard arrows), look with the mouse, click things that highlight. Solve four short puzzles in order.

1. **Diagnose.** Read the warning console. Three of the four subsystems show normal codes, one shows a critical code. Click that one. You learn which subsystem failed, and you get the first digit of the launch code.

2. **Plan a bypass.** Look at the schematic on the opposite wall. The reactor is crossed out. A backup battery can feed the pod through a network of junctions, but only one path is still live. Trace the path. The bulkhead to the pod room opens, and you get the second digit plus a cable-color sequence.

3. **Rig the cables.** In the pod room, an open junction panel holds three colored cables and three ports. Plug them in the order the schematic showed you. Power restores, the pod wakes up, and you get the third digit.

4. **Launch.** Enter the 4-digit code on the pod's keypad. You already have three of the four digits. The fourth is engraved on the pod's hull, in plain sight.

## Why the puzzles feel different

Each one exercises a different kind of attention.

- **P1: looking.** Which thing is out of place?
- **P2: thinking.** Which path is the only one that still works?
- **P3: doing.** Apply what you learned, in order.
- **P4: combining.** Assemble everything from before, plus one thing in plain sight.

## Atmosphere

Emergency lighting pulses red. An alarm loops. As your oxygen drops, the lights pulse faster, the alarm gets louder, and the screen edges darken. If the timer hits zero you suffocate and get a restart button. You have two minutes. That is enough time if you read the clues. It is not enough to wander.

## Architecture

Vite + React 19 + TypeScript with `@react-three/fiber` v9 and `@react-three/drei` v10. Deployed to GitHub Pages. The pivot on stack choice was AI-codegen quality. R3F's JSX scene graph is more legible to LLMs than imperative Three.js. Three.js also churns hard (r152 color spaces, r160 UMD removal, r163 WebGL 1 drop), so training-era code is wrong out of the box. Vercel reached the same conclusion when picking R3F as the canonical stack for v0.

Two rooms, side by side. The Control Room sits centered at the origin, roughly 10 by 10 by 3 meters. The Pod Bay sits at the same size, centered at x=+10. They share a wall at x=5, with a 2-meter doorway gap in the middle. The bulkhead in that gap opens after P2.

A single Zustand store in `src/state/gameStore.ts` is the source of truth: the oxygen timer, three puzzle booleans, three collected symbols, the active 4-digit entry on P4, and a status enum. There is no formal Puzzle interface. Each puzzle is a self-contained component that reads the store directly.

All four puzzles mount as siblings under one `<Canvas>` in `App.tsx`. Linear gating is computed per puzzle with an early return: if the previous puzzle is not solved, the component returns null. P4 reads symbols one, two, and three indirectly through what the HUD already shows the player. The fourth digit is the pod serial engraved on the pod hull.

Scene composition stays flat. `Station.tsx` holds the room geometry and the bulkhead. `PlayerControls.tsx` owns the first-person camera, WASD, and AABB wall collision. `Lighting.tsx` handles the emergency lights. The puzzle files sit next to each other under `src/puzzles/`.

Hints are diegetic only. Every clue is an object in the world: the printed manual at the main console, the schematic on the wall, the service tag on the junction panel, the engraving on the pod hull. There is no HUD hint button by design.

## Run locally

```bash
bun install
bun run dev
```

Then open http://localhost:5173.

## AI usage

I worked with Claude across four sessions plus a polish pass. The notes below are the actual decisions I made about what to delegate, what to keep for myself, what worked, and what didn't.

**Delegated.**

- Industry survey of browser-3D libraries with the AI-codegen-quality angle as the decisive framing (R3F's JSX scene graph is more legible to LLMs than imperative Three.js; Three.js churns hard on releases so training-era code is wrong out of the box).
- Mechanical scaffold: Vite + R3F + Drei wiring, Tailwind v4 via `@tailwindcss/vite`, the `@/` alias, the GitHub Pages Actions workflow.
- Pre-flagging R3F footguns ahead of runtime (`useFrame` must live inside `<Canvas>`, GLB paths break on deploy without `/public` + absolute URLs).
- Parallel sub-agent fanouts under hard edit-boundary contracts: one agent per puzzle file, one for the Zustand store, one for the UI overlays, plus read-only audit agents at the end of each session.
- The P2 graph deepening (added JUNCTION-D and a plausible-but-dead decoy path so the puzzle stops being two clicks of the only unbroken junctions).
- The bundle-splitting pass: lazy-loading `EffectComposer` so first paint doesn't wait on post-FX, plus vendor chunks for `three`, `@react-three/*`, and React so app-code edits don't bust the heavy caches.
- The seed-based randomness layer: `src/state/runConfig.ts` with mulberry32 + a single `RunConfig` object every puzzle reads from, so the launch code and the diegetic clues can't desync within a run.

**Kept as my call.**

- Theme: Escape Pod Bay. A deep-space cascade-failure premise. Crossmint evaluates creativity in unfamiliar territory and the theme shouldn't be AI-generated.
- The four puzzle archetypes (observation → logic → interaction → combination) and the linear chain that connects them. No branching, no optional puzzles.
- Diegetic hints only. Every clue lives on an object in the world (printed manual, schematic, panel service tag, hull engraving). No HUD hint button.
- Hard 2-minute oxygen timer with restart-on-death. Tension over a no-fail puzzle box, with the trade-off documented.
- Bun as the package manager throughout. Caught the agent defaulting to `npm` on the first scaffold and redirected.
- Not pushing the internal planning docs. The agent's first draft of session zero would have shipped four markdown design files; on reflection that reads as process theater for a 2h challenge. Moved them to a gitignored `.notes/` directory. The repo carries source + this README, nothing more.
- Flatten the file layout below what the initial design doc proposed. Stay single-room through Session 2 instead of pre-building the room split (speculative work is anti-slop).
- The verdicts on which AI-proposed randomness candidates were worth shipping. The audit agents surfaced ~30 candidates; only four ship: P1 row position, P2 bypass color order, P3 tray shuffle, P4 pod serial. Rejected on principle: randomizing room geometry (collision math is fixed), randomizing the keypad layout (fights muscle memory), randomizing the puzzle archetypes (those are the game), randomizing station name (zero perceived variety).
- Pushed back on an agent debug hypothesis: when Play Again was showing an empty room, the agent's theory was a stuck camera. I re-read `gameStore.reset()`, confirmed state was actually fine, shipped a camera-position reset on `status === 'idle'` instead. Confirmed correct by replay.

**Where it helped.**

- Compressed a 3D domain ramp-up that has no real shortcut otherwise. I have no prior 3D experience.
- Caught scaffold slop the model left behind: `package.json` name still set to `"scaffold"`, `<title>` still `scaffold` in the served HTML.
- An audit caught a stale "deployed to Vercel" line in `CLAUDE.md` left over from the pre-pivot stack research.
- Another audit caught `src/main.tsx` using `{ StrictMode }` instead of the project's namespace-import convention.
- Disjoint edit-boundary contracts let four puzzle agents run in parallel with zero merge conflicts.
- The audit pass caught two trivial line-length nits (a template literal at 103 chars in `P4_Launch`, a ternary at 81 chars in `Hud`) before commit.

**Where it fell short.**

- Scaffolded with `npm` despite my bun preference. The model defaulted to the most-documented option rather than checking my toolchain. Had to interrupt.
- Black-screen dead-end on first load: dark initial materials (`#1a1a1f` floor, `#2a2a32` walls) got crushed to body `#000` by R3F's default ACES tone mapping. Pointer lock worked, walls were invisible. Took a playtester report ("always black, just cursor disappears") to catch. Bumped materials to `#5a5a66` / `#7a7a88` and intensities up. Lesson: dim atmosphere belongs to the final polish pass, not the Session 1 sanity check.
- A `GameOverScreen` agent shipped the screen but no trigger to transition `status` to `'lost'`. Caught mid-integration. Fixed by adding a 500ms `setInterval` in `App.tsx` that calls `lose()` when the timer expires.
- A Session 3 investigation agent claimed `PointerLockControls.dispose()` releases pointer lock. It does not. The build shipped with stuck pointer lock on the win screen until I added an explicit `document.exitPointerLock()` in `PlayerControls.tsx`. Lesson: verify investigation-agent claims that hinge on library internals.
- A compliance audit agent reflexively agreed with itself across passes when asked to be critical, and flagged the bulkhead's close-direction lerp as dead code despite it firing on reset.
- An R3F `<Html occlude>` on the printed manual hid the text at close range. Drei's occlusion raycast goes unstable when the camera approaches and corner samples leave the frustum. Caught only on the live deployed build. Fix was to drop the `occlude` prop entirely; the manual sits on the back wall, AABB collision keeps the player on the right side of it, so the occlusion test wasn't doing anything useful.

## Trade-offs

Two rooms over three, immersion over scope. One sealed-door gate is the cheapest way to gate exploration without doubling the geometry work.

A 2-minute oxygen timer with restart, tension over a no-fail puzzle box. Two minutes is short. It's enough time for an attentive player who reads the clues, but the player has to move. The timer is the game's only fail state, and it has to actually bite.

Linear gating, no branching or optional puzzles. The state machine collapses to three booleans plus three collected symbols.

Primitive geometry only, no GLB models. Lighting and emissive materials do the visual work at this scope, and skipping model loading skips its biggest footgun.

Tests cover the state machine only. `gameStore` has a Bun test suite for digit collection, penalties, and win/lose transitions. The puzzles and the camera are validated by manual playtest, since a 4-puzzle single-player game gets near-zero signal from UI integration tests at this scope.

No `Puzzle` interface abstraction. The four puzzles are different from each other (click a row, click junctions, click cables in order, enter a code), and a shared interface would be forced abstraction. Each puzzle is a self-contained component reading from the store directly.

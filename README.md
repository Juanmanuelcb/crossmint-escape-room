# Escape Pod Bay

A Crossmint engineering challenge submission. A small browser-based 3D escape room: you're alone on a research station whose reactor just died, you have 2 minutes of air, and the only way out is to power up and launch the escape pod parked in the next room.

**Live:** https://juanmanuelcb.github.io/crossmint-escape-room/

---

## How to play

Walk around with WASD, look with the mouse, click things that highlight. Solve four short puzzles in order.

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

Two rooms, side by side. The Control Room sits centered at the origin, roughly 10 by 10 by 3 meters. The Pod Bay sits at the same size, centered at x=+10. They share a wall at x=5, with a 2-meter doorway gap in the middle. The bulkhead in that gap opens after P2.

A single Zustand store in `src/state/gameStore.ts` is the source of truth: the oxygen timer, three puzzle booleans, three collected symbols, the active 4-digit entry on P4, and a status enum. There is no formal Puzzle interface. Each puzzle is a self-contained component that reads the store directly.

All four puzzles mount as siblings under one `<Canvas>` in `App.tsx`. Linear gating is computed per puzzle with an early return: if the previous puzzle is not solved, the component returns null. P4 reads symbols one, two, and three indirectly through what the HUD already shows the player. The fourth digit is the pod serial `#9`, engraved on the pod hull.

Scene composition stays flat. `Station.tsx` holds the room geometry and the bulkhead. `PlayerControls.tsx` owns the first-person camera, WASD, and AABB wall collision. `Lighting.tsx` handles the emergency lights. The puzzle files sit next to each other under `src/puzzles/`.

Hints are diegetic only. Every clue is an object in the world: the printed manual at the main console, the schematic on the wall, the service tag on the junction panel, the engraving on the pod hull. There is no HUD hint button by design.

## Run locally

```bash
bun install
bun run dev
```

Then open http://localhost:5173.

## Design decisions

**Stack.** Vite + React 19 + TypeScript with `@react-three/fiber` v9 and `@react-three/drei` v10. Deployed to GitHub Pages. The pivot point was AI-codegen quality. R3F's JSX scene graph is more legible to LLMs than imperative Three.js. Three.js also churns hard (r152 color spaces, r160 UMD removal, r163 WebGL 1 drop), so training-era code is wrong out of the box. Vercel reached the same conclusion when picking R3F as the canonical stack for v0.

**Architecture.** One component per puzzle under `src/puzzles/`. A single Zustand store in `src/state/gameStore.ts` holds the timer, three puzzle booleans, three collected symbols, and the P4 entry buffer. No formal `Puzzle` interface. Each puzzle gates with an early return: `if (!prevSolved) return null`. The scene stays flat: `Station.tsx` owns geometry, `PlayerControls.tsx` owns the camera and AABB collision, `Lighting.tsx` owns the emergency lights. Hints are diegetic only. Every clue lives on an object in the world: the printed manual, the schematic, the panel service tag, the pod hull engraving. No HUD hint button by design.

## AI usage

The running log is in `AI_LOG.md`. Short version:

**Delegated.** Stack research, and the angle that AI-codegen quality was the decisive factor. The mechanical scaffold (Vite + R3F + Drei wiring, Tailwind v4 plugin, the `@/` alias, GH Pages workflow). R3F-specific footguns ahead of runtime. Parallel sub-agent fanouts for state, UI overlays, audits, and per-puzzle implementation under hard edit-boundary contracts.

**Kept.** Theme: Escape Pod Bay, a deep-space cascade-failure premise. The four puzzle archetypes and their linear chain. Diegetic-only hints. The 2-minute oxygen timer with restart. The call to flatten the file layout below what `DESIGN.md` initially proposed, and the call to stay single-room through Session 2 instead of pre-building the split.

**Where it helped.** Compressed a 3D domain ramp-up that had no real shortcut. Pre-flagged predictable R3F mistakes (`useFrame` placement, GLB path quirks) I would have hit at runtime.

**Where it fell short.** Scaffolded with `npm` despite my bun preference, and I had to redirect. A Session 3 investigation agent claimed `PointerLockControls.dispose()` releases pointer lock; it does not, and the build shipped broken until I added an explicit `document.exitPointerLock()`. A compliance audit agent reflexively agreed with itself across passes, and flagged the bulkhead's close-direction lerp as dead code when it fires on reset.

## Trade-offs

Two rooms over three, immersion over scope. One sealed-door gate is the cheapest way to gate exploration without doubling the geometry work.

A 2-minute oxygen timer with restart, tension over a no-fail puzzle box. Two minutes is short. It's enough time for an attentive player who reads the clues, but the player has to move. The timer is the game's only fail state, and it has to actually bite.

Linear gating, no branching or optional puzzles. The state machine collapses to three booleans plus three collected symbols.

Primitive geometry only, no GLB models. Lighting and emissive materials do the visual work at this scope, and skipping model loading skips its biggest footgun.

No automated tests. A single-player four-puzzle game inside a 2-4h budget gets near-zero eval signal from tests; manual playtest is the right validation.

No `Puzzle` interface abstraction. The four puzzles are different from each other (click a row, click junctions, click cables in order, enter a code), and a shared interface would be forced abstraction. Each puzzle is a self-contained component reading from the store directly.

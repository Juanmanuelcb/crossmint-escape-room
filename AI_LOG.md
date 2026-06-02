# AI Usage Log

How I used Claude (Claude Code CLI, Opus 4.7) across this challenge: what I delegated, what I kept as my own judgment, where it helped, where it fell short. Written incrementally as the work happened, not reconstructed at the end.

---

## Pre-session: stack and design

**Delegated:**

- Industry survey of browser-3D libraries. I had no prior 3D experience and leaned on Claude to compress a stack-decision exercise that would otherwise have eaten most of the build budget.
- Identifying the AI-codegen-quality angle as the decisive factor. Specifically that Vercel chose R3F as the canonical stack for v0 because JSX-declarative scene graphs are easier for LLMs to reason about than imperative Three.js, and that Three.js's release cadence (r152 colorspace overhaul, r160 UMD removal, r163 WebGL1 drop, r180+ WebGPU churn) means training-data-era code is materially wrong. This framing was the actual decision driver, and I would not have arrived at it independently inside the time budget.
- Structural skeleton of the internal design doc (visual style framing, file-layout proposal, trade-offs framing).
- The 4-session workflow plan (scaffold → architecture → puzzles → polish/README), including the "AI_LOG.md kept live, never reconstructed" discipline that itself is why this file exists.

**Kept as my call:**

- Theme: Escape Pod Bay. A deep-space station subsystem failure, oxygen bleeding down, the player must diagnose, plan a bypass, physically rig it, and launch before suffocating. Crossmint evaluates creativity in unfamiliar territory; the premise should not be AI-generated.
- The 4 puzzle archetypes and how they chain (observation → logic → interaction → combination). Linear gating, no branching. Knocks state-machine complexity to 4 booleans + 3 collected symbols.
- "Diegetic hints only, no HUD hint button." Fits the suffocation-pressure tone better than a menu hint system.
- Hard oxygen timer with restart-on-death. Explicit choice of tension over a no-fail puzzle box, with the trade-off documented for the README.

**Where it helped:**

- Compressed a 3D domain ramp-up that has no real shortcut otherwise.
- Surfaced R3F-specific footguns ahead of time (`useFrame` must be inside `<Canvas>`, GLB 404s on Vercel if not in `/public` with absolute paths). Predictable mistakes I'd have hit at runtime.

**Where it fell short:**

- _(To be filled as Sessions 1–4 surface concrete failures.)_

---

## Session 0: scaffold (~20 min)

**Delegated:** the mechanical scaffold. `create-vite` invocation, file moves, `.gitignore` and `package.json` sanity, dev-server smoke test.

**Kept as my call:**

- Package manager: bun, not npm. Matches my existing toolchain.
- The call to _not_ push the planning markdown docs. Initial draft would have pushed 4 internal documents; on reflection, that reads as process theater for a 2h challenge rather than evidence of good judgment. Moved them to a gitignored `.notes/` directory. The pushed repo carries source + `README.md` + this file, nothing else.

**Where it helped:** caught small slop the scaffold left behind. `package.json` name still set to `"scaffold"`, `<title>` still `scaffold` in the served HTML. Things I'd have shipped and felt sloppy about.

**Where it fell short:** initially scaffolded with `npm create vite@latest` even though I prefer bun. The scaffold _output_ is identical (the choice only affects install + lockfile) so no rework was needed, but I had to interrupt and redirect. Generalizable lesson: state tool preferences upfront; the model defaulted to the most-documented option rather than checking my actual toolchain.

---

## Session 1: minimal R3F scene + WASD (2026-06-02)

**Delegated:**

- R3F + Drei scaffolding inside `App.tsx`: `KeyboardControls` map, `PointerLockControls`, basic floor + 4 double-sided walls, a `<Player>` child driving the camera on XZ via `useFrame` + `useKeyboardControls` at 4 m/s.
- Tailwind v4 wiring via `@tailwindcss/vite`, no `tailwind.config.js`, no postcss.
- Bun install of `three`, `@react-three/fiber@^9`, `@react-three/drei@^10`, `zustand`, `@types/three`.

**Kept as my call:**

- Keep everything in `src/App.tsx` instead of pre-scaffolding the locked `scene/` layout. Speculative split now is anti-slop. Session 2 extracts when there's an actual second mount point.
- Room dims 10 x 10 x 3 m. Comfortable for two puzzle stations, ~3s to walk across.
- Defer wall collision explicitly. AABB checks land alongside the puzzle stations.

**Where it helped:**

- The R3F scaffold worked first try: pointer lock on click, mouse look, WASD + arrows translating correctly. No `useFrame`-outside-Canvas footgun, no Drei v8 pattern drift.

**Where it fell short:**

- Black-screen dead-end on first load. Initial materials (`#1a1a1f` floor, `#2a2a32` walls) under ambient 0.4 + directional 0.8 got crushed to body `#000` by R3F's default ACES tone mapping. Pointer lock worked, walls were invisible. Took a user playtest report ("always black, just cursor disappears") to catch. Bumped materials to `#5a5a66` / `#7a7a88` and intensities to 0.8 / 1.2. Lesson: the moody dim palette belongs to the final atmosphere pass, not the Session 1 sanity check.

---

## Session 2: puzzle skeleton + state spine (2026-06-02)

**Delegated:**

- A 3-agent parallel split under disjoint-directory contracts. Agent A: read-only verification audit against `CLAUDE.md` and the locked stack. Agent B: `src/state/gameStore.ts` only, matching `DESIGN.md:219-255` exactly. Agent C: `src/ui/` only (Hud, WinScreen, GameOverScreen). No clobber risk because B and C own non-overlapping directories.
- Integration in the main session: `scene/PlayerControls.tsx` extraction, `App.tsx` rewrite, 4 placeholder puzzle files (one cube each, gated by `if (!prevSolved) return null`).

**Kept as my call:**

- Stay single-room for Session 2. Pre-building stub rooms means building them twice when Session 3 lands real content.
- Wire `start()` to `PointerLockControls.onLock` instead of having each puzzle defensively call `start()`. Cleaner ownership.
- Component-file naming: `P1_Diagnose` matches the file name from `DESIGN.md` even though underscores in React names are unusual.

**Where it helped:**

- Audit agent caught two real must-fix items pre-integration: `src/main.tsx` used named `{ StrictMode }` instead of the namespace import rule, and `CLAUDE.md:7` still said "deployed to Vercel" from the pre-pivot stack research.
- Three agents in parallel, no merge conflicts.

**Where it fell short:**

- Half-finished-implementation problem caught mid-integration: `GameOverScreen` was unreachable because nothing transitioned `status` to `'lost'`. The agents shipped the screen but not the trigger. Fixed by adding a 500ms `setInterval` in `App.tsx` that calls `lose()` when `Date.now() - startedAt >= durationMs`.
- Post-playtest, user flagged that P4 was brute-forceable since digit 4 had no in-world clue yet, and that "clicking boxes is not a puzzle." Both correct, both addressed by Session 3 real-content work. Stayed on the plan rather than bolting on extra difficulty.

---

## Session 3: real puzzle content + 2-room scene + cleanup (2026-06-02)

**Delegated:**

- Two-room scene per the locked layout: `Station.tsx` composing ControlRoom (origin) + PodBay (x=+10) + shared wall with 2m doorway + Bulkhead. AABB per-axis sliding clamp inside `PlayerControls.Player.useFrame`, with `isPassable(x, z, doorOpen)` for the doorway corridor.
- Bulkhead slide-up animation: BoxGeometry [0.15, 3, 2], `useFrame` lerp between y=1.5 and y=4.5 on `p2Solved` transition, bidirectional.
- Per-puzzle implementation in parallel under hard edit-boundary contracts: one agent per puzzle file (`P1_Diagnose.tsx`, `P2_Bypass.tsx`, `P3_RigCables.tsx`, `P4_Launch.tsx`). Each agent owned its own file plus narrowly scoped puzzle assets.
- Two read-only cleanup audit agents at the end of Step 0: (a) compliance vs `CLAUDE.md`, (b) over-engineering.

**Kept as my call:**

- In-world hint design: the printed manual at the main console for P1, the crossed-out schematic for P2, the cable-color sequence persisting on the schematic for P3, the `ESCAPE POD #9 // HELIOS-IX` hull engraving for P4 slot 4.
- Ship the cable-color hint on the P3 panel itself for accessibility. The schematic carries it for the player who plans ahead, but the panel reinforces it for the player who walked over without re-reading.
- The over-engineering audit's calls I agreed with: fold `CameraSpawn` into `Player`, drop the `PlayerKeyboard` wrapper, inline `slotFor` into the keypad `.map`. The call I rejected: the audit flagged the Bulkhead close-direction lerp as dead. Wrong; it fires on reset when `p2Solved` flips false.
- On Issue 3 (Play Again showing empty room), user pushed back on the camera-stuck hypothesis. Re-read `gameStore.reset`, confirmed state was resetting correctly, shipped a camera-position reset on `status === 'idle'`. User confirmed on replay. Pattern: when user and agent disagree on root cause, verify by reading, then ship the more likely fix and let playtest falsify.

**Where it helped:**

- Disjoint edit-boundary contracts let four puzzle agents run in parallel, no merge conflicts.
- Compliance audit caught two trivial line-length nits (template literal at 103 chars in `P4_Launch`, ternary at 81 chars in `Hud`) before commit.

**Where it fell short:**

- **Investigation agent claimed `PointerLockControls.dispose()` releases pointer lock.** It does not. `dispose()` only removes event listeners. Shipped the conditional unmount without verifying, user replayed, pointer lock still stuck on win screen. Patched by adding an explicit `useEffect` in `PlayerControls` that calls `document.exitPointerLock()` when `lockable` flips false. Lesson: verify investigation-agent claims that hinge on library internals.
- Compliance audit agent reflexively agreed with itself across passes when asked to be critical, and flagged the Bulkhead close-direction lerp as dead code despite being reachable via reset. Useful across 5 agents this session, but not infallible.

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
- *(To be filled as Sessions 1–4 surface concrete failures.)*

---

## Session 0: scaffold (~20 min)

**Delegated:** the mechanical scaffold. `create-vite` invocation, file moves, `.gitignore` and `package.json` sanity, dev-server smoke test.

**Kept as my call:**
- Package manager: bun, not npm. Matches my existing toolchain.
- The call to *not* push the planning markdown docs. Initial draft would have pushed 4 internal documents; on reflection, that reads as process theater for a 2h challenge rather than evidence of good judgment. Moved them to a gitignored `.notes/` directory. The pushed repo carries source + `README.md` + this file, nothing else.

**Where it helped:** caught small slop the scaffold left behind. `package.json` name still set to `"scaffold"`, `<title>` still `scaffold` in the served HTML. Things I'd have shipped and felt sloppy about.

**Where it fell short:** initially scaffolded with `npm create vite@latest` even though I prefer bun. The scaffold *output* is identical (the choice only affects install + lockfile) so no rework was needed, but I had to interrupt and redirect. Generalizable lesson: state tool preferences upfront; the model defaulted to the most-documented option rather than checking my actual toolchain.

---

*(Sessions 1–4 follow as they happen.)*

# Crossmint Escape Room — Escape Pod Bay

> A browser-based 3D escape room: a deep-space station has suffered a subsystem failure. Diagnose the fault, plan a power bypass, rig it, and launch the escape pod before oxygen runs out.

**Live:** *TBD — will be added after Vercel deploy*

> *This README is a stub. It will be filled in during the polish session — see `AI_LOG.md` for what's been built so far.*

---

## Run locally

```bash
bun install
bun run dev
```

Then open http://localhost:5173.

---

## Design decisions

*(To be written in Session 4. Will cover: stack choice — R3F + Vite + TS, puzzle architecture, the "diegetic hints only" decision, the oxygen-timer mechanic, and the deliberate trade-offs made under a 2h target.)*

## AI usage

See `AI_LOG.md` for the live log written across the project. Short version *(to be written in Session 4 by synthesizing the log)*: what I delegated, what I kept as my own judgment, where Claude helped, where it fell short.

## Trade-offs

*(To be written in Session 4. Will cover: no automated tests — manual playtest is the validation for a 4-puzzle single-player game at this scope; no GLB models — primitive geometry + emissive materials carry the visual identity; two rooms over three; linear gating; etc.)*

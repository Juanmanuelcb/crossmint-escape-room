# Escape Pod Bay

A Crossmint engineering challenge submission. A small browser-based 3D escape room: you're alone on a research station whose reactor just died, you have 15 minutes of air, and the only way out is to power up and launch the escape pod parked in the next room.

**Live:** *to be added after deploy*

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

Emergency lighting pulses red. An alarm loops. As your oxygen drops, the lights pulse faster, the alarm gets louder, and the screen edges darken. If the timer hits zero you suffocate and get a restart button. With a 15-minute timer, most attentive first-time players finish on their first attempt. The pressure is for atmosphere, not punishment.

## Run locally

```bash
bun install
bun run dev
```

Then open http://localhost:5173.

## Design decisions

*To be written in Session 4. Will cover the stack choice, puzzle architecture, the diegetic-hints decision, the oxygen-timer mechanic, and the trade-offs accepted under a 2h target.*

## AI usage

See `AI_LOG.md` for the running log written across the project. Short version (to be written in Session 4 by synthesizing the log): what I delegated, what I kept as my own judgment, where Claude helped, where it fell short.

## Trade-offs

*To be written in Session 4. Will cover: no automated tests (manual playtest validates a 4-puzzle single-player game at this scope), no GLB models (primitive geometry plus emissive materials), two rooms over three, linear gating, and other deliberate choices.*

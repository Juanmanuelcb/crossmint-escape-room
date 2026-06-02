import * as React from 'react'
import { useGameStore, type Digit } from '@/state/gameStore'

export type BypassColor = 'BLUE' | 'GREEN' | 'YELLOW'

export interface RunConfig {
  p1: { criticalIndex: 0 | 1 | 2 | 3; digit: Digit }
  p2: { digit: Digit }
  p3: {
    order: readonly [BypassColor, BypassColor, BypassColor]
    trayOrder: readonly [BypassColor, BypassColor, BypassColor]
    digit: Digit
  }
  podSerial: Digit
  launchCode: readonly [Digit, Digit, Digit, Digit]
}

// mulberry32: small, fast, deterministic PRNG. Same seed -> same sequence.
const mulberry32 = (seed: number) => {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const shuffle = <T>(rng: () => number, arr: readonly T[]): T[] => {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Pod serial and puzzle digits draw from 1-9. Skipping 0 keeps the
// "POD #0" edge case out and matches the original code's style.
const DIGITS: readonly Digit[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
const BYPASS_COLORS: readonly BypassColor[] = ['BLUE', 'GREEN', 'YELLOW']

export const deriveRunConfig = (runId: number): RunConfig => {
  const rng = mulberry32(runId + 1)

  const p1Digit = DIGITS[Math.floor(rng() * DIGITS.length)]
  const p2Digit = DIGITS[Math.floor(rng() * DIGITS.length)]
  const p3Digit = DIGITS[Math.floor(rng() * DIGITS.length)]
  const podSerial = DIGITS[Math.floor(rng() * DIGITS.length)]
  const p1Index = Math.floor(rng() * 4) as 0 | 1 | 2 | 3

  const order = shuffle(rng, BYPASS_COLORS) as [
    BypassColor,
    BypassColor,
    BypassColor,
  ]
  const trayOrder = shuffle(rng, BYPASS_COLORS) as [
    BypassColor,
    BypassColor,
    BypassColor,
  ]

  return {
    p1: { criticalIndex: p1Index, digit: p1Digit },
    p2: { digit: p2Digit },
    p3: { order, trayOrder, digit: p3Digit },
    podSerial,
    launchCode: [p1Digit, p2Digit, p3Digit, podSerial],
  }
}

export const useRunConfig = (): RunConfig => {
  const runId = useGameStore((s) => s.runId)
  return React.useMemo(() => deriveRunConfig(runId), [runId])
}

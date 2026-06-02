import { create } from 'zustand'

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export interface GameState {
  startedAt: number | null
  /** Total air supply in ms (2 * 60 * 1000). */
  durationMs: number
  status: 'idle' | 'playing' | 'won' | 'lost'

  p1Solved: boolean
  p2Solved: boolean
  p3Solved: boolean

  symbols: {
    one: Digit | null
    two: Digit | null
    three: Digit | null
  }

  /** Set once per run when start() is called. enterDigit compares against this. */
  launchCode: readonly Digit[]

  /** Active 4-digit launch attempt. On wrong 4th digit we clear to []; we do not shift. */
  enteredCode: Digit[]

  /** Increments on every reset. Used as a React key to force-remount puzzles
   * so their local state (clicked nodes, installed cables, etc.) clears.
   * Also feeds deriveRunConfig in src/state/runConfig.ts. */
  runId: number

  start: (launchCode: readonly Digit[]) => void
  solveP1: (digit: Digit) => void
  solveP2: (digit: Digit) => void
  solveP3: (digit: Digit) => void
  enterDigit: (d: Digit) => void
  /** Shaves ms off the oxygen budget by sliding startedAt backward.
   * No-op when not playing. Underflow handled by the existing lose-poll. */
  penalize: (ms: number) => void
  win: () => void
  lose: () => void
  reset: () => void
}

const initialState = {
  startedAt: null,
  durationMs: 2 * 60 * 1000,
  status: 'idle' as const,
  p1Solved: false,
  p2Solved: false,
  p3Solved: false,
  symbols: {
    one: null,
    two: null,
    three: null,
  },
  launchCode: [] as readonly Digit[],
  enteredCode: [] as Digit[],
  runId: 0,
}

export const useGameStore = create<GameState>()((set, get) => ({
  ...initialState,

  start: (launchCode) => {
    if (get().startedAt !== null) return
    set({ startedAt: Date.now(), status: 'playing', launchCode })
  },

  solveP1: (digit) =>
    set((s) => ({
      p1Solved: true,
      symbols: { ...s.symbols, one: digit },
    })),

  solveP2: (digit) =>
    set((s) => ({
      p2Solved: true,
      symbols: { ...s.symbols, two: digit },
    })),

  solveP3: (digit) =>
    set((s) => ({
      p3Solved: true,
      symbols: { ...s.symbols, three: digit },
    })),

  enterDigit: (d) => {
    if (get().status !== 'playing') return
    const next = [...get().enteredCode, d]
    if (next.length < 4) {
      set({ enteredCode: next })
      return
    }
    const code = get().launchCode
    const match = next.every((digit, i) => digit === code[i])
    if (match) {
      set({ enteredCode: next })
      get().win()
    } else {
      get().penalize(5000)
      set({ enteredCode: [] })
    }
  },

  penalize: (ms) => {
    if (get().status !== 'playing') return
    const s = get().startedAt
    if (s === null) return
    set({ startedAt: s - ms })
  },

  win: () => set({ status: 'won' }),
  lose: () => set({ status: 'lost' }),
  reset: () => set((s) => ({ ...initialState, runId: s.runId + 1 })),
}))

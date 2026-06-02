import { create } from 'zustand'

export type Digit =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'

export const LAUNCH_CODE: readonly Digit[] = ['3', '3', '5', '9']

export interface GameState {
  startedAt: number | null
  /** Total air supply in ms (15 * 60 * 1000). */
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

  /** Active 4-digit launch attempt. On wrong 4th digit we clear to []; we do not shift. */
  enteredCode: Digit[]

  /** Increments on every reset. Used as a React key to force-remount puzzles
   * so their local state (clicked nodes, installed cables, etc.) clears. */
  runId: number

  start: () => void
  solveP1: () => void
  solveP2: () => void
  solveP3: () => void
  enterDigit: (d: Digit) => void
  win: () => void
  lose: () => void
  reset: () => void
}

const initialState = {
  startedAt: null,
  durationMs: 15 * 60 * 1000,
  status: 'idle' as const,
  p1Solved: false,
  p2Solved: false,
  p3Solved: false,
  symbols: {
    one: null,
    two: null,
    three: null,
  },
  enteredCode: [] as Digit[],
  runId: 0,
}

export const useGameStore = create<GameState>()((set, get) => ({
  ...initialState,

  start: () => {
    if (get().startedAt !== null) return
    set({ startedAt: Date.now(), status: 'playing' })
  },

  solveP1: () =>
    set((s) => ({
      p1Solved: true,
      symbols: { ...s.symbols, one: '3' },
    })),

  solveP2: () =>
    set((s) => ({
      p2Solved: true,
      symbols: { ...s.symbols, two: '3' },
    })),

  solveP3: () =>
    set((s) => ({
      p3Solved: true,
      symbols: { ...s.symbols, three: '5' },
    })),

  enterDigit: (d) => {
    if (get().status !== 'playing') return
    const next = [...get().enteredCode, d]
    if (next.length < 4) {
      set({ enteredCode: next })
      return
    }
    const match = next.every((digit, i) => digit === LAUNCH_CODE[i])
    if (match) {
      set({ enteredCode: next })
      get().win()
    } else {
      set({ enteredCode: [] })
    }
  },

  win: () => set({ status: 'won' }),
  lose: () => set({ status: 'lost' }),
  reset: () => set((s) => ({ ...initialState, runId: s.runId + 1 })),
}))

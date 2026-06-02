import { describe, test, expect, beforeEach } from 'bun:test'
import { useGameStore, LAUNCH_CODE, type Digit } from './gameStore'

const get = () => useGameStore.getState()

beforeEach(() => {
  get().reset()
})

describe('initial state', () => {
  test('starts idle with no run started', () => {
    const s = get()
    expect(s.status).toBe('idle')
    expect(s.startedAt).toBeNull()
    expect(s.durationMs).toBe(120000)
    expect(s.p1Solved).toBe(false)
    expect(s.p2Solved).toBe(false)
    expect(s.p3Solved).toBe(false)
    expect(s.symbols).toEqual({ one: null, two: null, three: null })
    expect(s.enteredCode).toEqual([])
  })
})

describe('start', () => {
  test('moves to playing and records startedAt', () => {
    const before = Date.now()
    get().start()
    const after = Date.now()
    const s = get()
    expect(s.status).toBe('playing')
    expect(s.startedAt).not.toBeNull()
    expect(s.startedAt!).toBeGreaterThanOrEqual(before)
    expect(s.startedAt!).toBeLessThanOrEqual(after)
  })

  test('is idempotent: second call does not reset startedAt', () => {
    get().start()
    const first = get().startedAt
    get().start()
    expect(get().startedAt).toBe(first)
  })
})

describe('solve actions', () => {
  test('solveP1 flips boolean and drops symbol "3"', () => {
    get().solveP1()
    expect(get().p1Solved).toBe(true)
    expect(get().symbols.one).toBe('3')
  })

  test('solveP2 flips boolean and drops symbol "3"', () => {
    get().solveP2()
    expect(get().p2Solved).toBe(true)
    expect(get().symbols.two).toBe('3')
  })

  test('solveP3 flips boolean and drops symbol "5"', () => {
    get().solveP3()
    expect(get().p3Solved).toBe(true)
    expect(get().symbols.three).toBe('5')
  })
})

describe('enterDigit', () => {
  test('is a no-op when not playing', () => {
    get().enterDigit('3')
    expect(get().enteredCode).toEqual([])
    expect(get().status).toBe('idle')
  })

  test('appends digits while length < 4', () => {
    get().start()
    get().enterDigit('3')
    get().enterDigit('3')
    get().enterDigit('5')
    expect(get().enteredCode).toEqual(['3', '3', '5'])
    expect(get().status).toBe('playing')
  })

  test('triggers win when the 4th digit completes the code', () => {
    get().start()
    for (const d of LAUNCH_CODE) get().enterDigit(d)
    expect(get().enteredCode).toEqual([...LAUNCH_CODE])
    expect(get().status).toBe('won')
  })

  test('clears the buffer and penalizes 5s on a wrong 4-digit attempt', () => {
    get().start()
    const startedAt = get().startedAt!
    const wrong: Digit[] = ['1', '2', '3', '4']
    for (const d of wrong) get().enterDigit(d)
    expect(get().enteredCode).toEqual([])
    expect(get().status).toBe('playing')
    expect(get().startedAt).toBe(startedAt - 5000)
  })
})

describe('penalize', () => {
  test('subtracts ms from startedAt while playing', () => {
    get().start()
    const startedAt = get().startedAt!
    get().penalize(5000)
    expect(get().startedAt).toBe(startedAt - 5000)
  })

  test('is a no-op when idle', () => {
    get().penalize(5000)
    expect(get().startedAt).toBeNull()
    expect(get().status).toBe('idle')
  })

  test('is a no-op when won', () => {
    get().start()
    get().win()
    const startedAt = get().startedAt!
    get().penalize(5000)
    expect(get().startedAt).toBe(startedAt)
  })

  test('is a no-op when lost', () => {
    get().start()
    get().lose()
    const startedAt = get().startedAt!
    get().penalize(5000)
    expect(get().startedAt).toBe(startedAt)
  })
})

describe('win / lose / reset', () => {
  test('win() sets status to won', () => {
    get().start()
    get().win()
    expect(get().status).toBe('won')
  })

  test('lose() sets status to lost', () => {
    get().start()
    get().lose()
    expect(get().status).toBe('lost')
  })

  test('reset() restores initial state and bumps runId', () => {
    const beforeRunId = get().runId
    get().start()
    get().solveP1()
    get().solveP2()
    get().solveP3()
    get().enterDigit('3')
    get().reset()
    const s = get()
    expect(s.status).toBe('idle')
    expect(s.startedAt).toBeNull()
    expect(s.p1Solved).toBe(false)
    expect(s.p2Solved).toBe(false)
    expect(s.p3Solved).toBe(false)
    expect(s.symbols).toEqual({ one: null, two: null, three: null })
    expect(s.enteredCode).toEqual([])
    expect(s.runId).toBe(beforeRunId + 1)
  })
})

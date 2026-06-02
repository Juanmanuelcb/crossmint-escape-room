import { describe, test, expect, beforeEach } from 'bun:test'
import { useGameStore, type Digit } from './gameStore'

const get = () => useGameStore.getState()

const CODE: readonly Digit[] = ['3', '3', '5', '9']

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
    expect(s.launchCode).toEqual([])
  })
})

describe('start', () => {
  test('moves to playing, records startedAt, and stores the code', () => {
    const before = Date.now()
    get().start(CODE)
    const after = Date.now()
    const s = get()
    expect(s.status).toBe('playing')
    expect(s.startedAt).not.toBeNull()
    expect(s.startedAt!).toBeGreaterThanOrEqual(before)
    expect(s.startedAt!).toBeLessThanOrEqual(after)
    expect(s.launchCode).toEqual(CODE)
  })

  test('is idempotent: second call does not reset startedAt or code', () => {
    get().start(CODE)
    const first = get().startedAt
    get().start(['1', '2', '3', '4'])
    expect(get().startedAt).toBe(first)
    expect(get().launchCode).toEqual(CODE)
  })
})

describe('solve actions', () => {
  test('solveP1 flips boolean and stores the passed digit', () => {
    get().solveP1('7')
    expect(get().p1Solved).toBe(true)
    expect(get().symbols.one).toBe('7')
  })

  test('solveP2 flips boolean and stores the passed digit', () => {
    get().solveP2('2')
    expect(get().p2Solved).toBe(true)
    expect(get().symbols.two).toBe('2')
  })

  test('solveP3 flips boolean and stores the passed digit', () => {
    get().solveP3('8')
    expect(get().p3Solved).toBe(true)
    expect(get().symbols.three).toBe('8')
  })
})

describe('enterDigit', () => {
  test('is a no-op when not playing', () => {
    get().enterDigit('3')
    expect(get().enteredCode).toEqual([])
    expect(get().status).toBe('idle')
  })

  test('appends digits while length < 4', () => {
    get().start(CODE)
    get().enterDigit('3')
    get().enterDigit('3')
    get().enterDigit('5')
    expect(get().enteredCode).toEqual(['3', '3', '5'])
    expect(get().status).toBe('playing')
  })

  test('triggers win when the 4th digit completes the code', () => {
    get().start(CODE)
    for (const d of CODE) get().enterDigit(d)
    expect(get().enteredCode).toEqual([...CODE])
    expect(get().status).toBe('won')
  })

  test('clears the buffer and penalizes 5s on a wrong 4-digit attempt', () => {
    get().start(CODE)
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
    get().start(CODE)
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
    get().start(CODE)
    get().win()
    const startedAt = get().startedAt!
    get().penalize(5000)
    expect(get().startedAt).toBe(startedAt)
  })

  test('is a no-op when lost', () => {
    get().start(CODE)
    get().lose()
    const startedAt = get().startedAt!
    get().penalize(5000)
    expect(get().startedAt).toBe(startedAt)
  })
})

describe('win / lose / reset', () => {
  test('win() sets status to won', () => {
    get().start(CODE)
    get().win()
    expect(get().status).toBe('won')
  })

  test('lose() sets status to lost', () => {
    get().start(CODE)
    get().lose()
    expect(get().status).toBe('lost')
  })

  test('reset() restores initial state and bumps runId', () => {
    const beforeRunId = get().runId
    get().start(CODE)
    get().solveP1('3')
    get().solveP2('3')
    get().solveP3('5')
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
    expect(s.launchCode).toEqual([])
    expect(s.runId).toBe(beforeRunId + 1)
  })
})

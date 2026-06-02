import * as React from 'react'
import { useGameStore } from '@/state/gameStore'

const formatMmSs = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const WinScreen: React.FC = () => {
  const startedAt = useGameStore((s) => s.startedAt)
  const reset = useGameStore((s) => s.reset)

  const frozenElapsed = React.useRef(
    startedAt === null ? 0 : Date.now() - startedAt,
  )

  const [faded, setFaded] = React.useState(false)
  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => setFaded(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-1000 ${
        faded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <h1 className='text-7xl font-bold tracking-widest text-black'>
        ESCAPED
      </h1>
      <p className='mt-6 font-mono text-2xl text-black tabular-nums'>
        Run time: {formatMmSs(frozenElapsed.current)}
      </p>
      <button
        type='button'
        onClick={reset}
        className='mt-10 rounded-md border-2 border-black bg-white px-6 py-2 text-lg font-semibold text-black hover:bg-black hover:text-white'
      >
        Play Again
      </button>
    </div>
  )
}

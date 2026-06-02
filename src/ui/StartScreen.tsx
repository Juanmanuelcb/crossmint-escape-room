import * as React from 'react'
import { useGameStore } from '@/state/gameStore'
import { useRunConfig } from '@/state/runConfig'

export const StartScreen: React.FC = () => {
  const start = useGameStore((s) => s.start)
  const cfg = useRunConfig()

  const [faded, setFaded] = React.useState(false)
  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => setFaded(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-mono text-white transition-opacity duration-700 ${
        faded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <h1 className='text-6xl font-bold tracking-[0.4em] text-[#ff3322] drop-shadow-[0_0_12px_rgba(255,51,34,0.4)]'>
        ESCAPE POD BAY
      </h1>

      <div className='mt-10 max-w-xl px-6 text-center text-base leading-7 text-white/80'>
        <p>The reactor is dead. You have two minutes of air.</p>
        <p>Power up the pod and launch.</p>
        <p className='mt-5'>Move with WASD. Look with the mouse.</p>
        <p>Click anything that highlights.</p>
        <p>Solve four puzzles in order. Clues are in the room.</p>
        <p className='mt-5 text-xs tracking-widest text-white/40'>
          Each wrong click costs five seconds of air.
        </p>
      </div>

      <button
        type='button'
        onClick={() => start(cfg.launchCode)}
        className='mt-10 rounded-md border-2 border-[#ff3322] bg-transparent px-10 py-3 text-lg font-bold tracking-[0.3em] text-[#ff3322] hover:bg-[#ff3322] hover:text-black'
      >
        START
      </button>
    </div>
  )
}

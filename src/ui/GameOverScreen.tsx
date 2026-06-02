import * as React from 'react'
import { useGameStore } from '@/state/gameStore'

export const GameOverScreen: React.FC = () => {
  const reset = useGameStore((s) => s.reset)

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-black'>
      <h1 className='text-7xl font-bold tracking-widest text-red-600'>
        ASPHYXIATED
      </h1>
      <button
        type='button'
        onClick={reset}
        className='mt-10 rounded-md border-2 border-red-600 bg-black px-6 py-2 text-lg font-semibold text-red-600 hover:bg-red-600 hover:text-black'
      >
        Restart
      </button>
    </div>
  )
}

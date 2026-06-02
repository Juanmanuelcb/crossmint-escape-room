import * as React from 'react'
import { useGameStore } from '@/state/gameStore'

const formatMmSs = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const Hud: React.FC = () => {
  const startedAt = useGameStore((s) => s.startedAt)
  const durationMs = useGameStore((s) => s.durationMs)
  const symbols = useGameStore((s) => s.symbols)

  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (startedAt === null) return
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [startedAt])

  const remaining =
    startedAt === null
      ? durationMs
      : Math.max(0, durationMs - (now - startedAt))

  const slots: (string | null)[] = [
    symbols.one,
    symbols.two,
    symbols.three,
    null,
  ]

  return (
    <div className='pointer-events-none fixed inset-0 z-10 select-none'>
      <div className='absolute top-4 left-4 font-mono text-3xl font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'>
        {formatMmSs(remaining)}
      </div>

      <div className='absolute top-4 right-4 flex gap-2 font-mono text-xl text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'>
        {slots.map((value, i) => (
          <div key={i} className='flex flex-col items-center gap-1'>
            <span className='text-[10px] tracking-widest text-white/60'>
              {i + 1}
            </span>
            <span className='flex h-9 w-9 items-center justify-center rounded-md border border-white/40 bg-black/40 font-bold'>
              {value ?? '_'}
            </span>
          </div>
        ))}
      </div>

      <div
        className='absolute top-1/2 left-1/2 rounded-full bg-white shadow-[0_0_3px_rgba(0,0,0,0.9)]'
        style={{
          width: 6,
          height: 6,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

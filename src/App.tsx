import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { PlayerControls, keyMap } from '@/scene/PlayerControls'
import { Station } from '@/scene/Station'
import { P1_Diagnose } from '@/puzzles/P1_Diagnose'
import { P2_Bypass } from '@/puzzles/P2_Bypass'
import { P3_RigCables } from '@/puzzles/P3_RigCables'
import { P4_Launch } from '@/puzzles/P4_Launch'
import { Hud } from '@/ui/Hud'
import { WinScreen } from '@/ui/WinScreen'
import { GameOverScreen } from '@/ui/GameOverScreen'
import { useGameStore } from '@/state/gameStore'

export const App: React.FC = () => {
  const status = useGameStore((s) => s.status)
  const startedAt = useGameStore((s) => s.startedAt)
  const durationMs = useGameStore((s) => s.durationMs)
  const lose = useGameStore((s) => s.lose)

  React.useEffect(() => {
    if (status !== 'playing' || startedAt === null) return
    const id = window.setInterval(() => {
      if (Date.now() - startedAt >= durationMs) lose()
    }, 500)
    return () => window.clearInterval(id)
  }, [status, startedAt, durationMs, lose])

  return (
    <>
      <KeyboardControls map={keyMap}>
        <Canvas
          camera={{ position: [0, 1.6, 3], fov: 75, near: 0.1, far: 100 }}
          style={{ width: '100vw', height: '100svh' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 8, 0]} intensity={1.2} />
          <directionalLight position={[10, 8, 0]} intensity={1.2} />
          <Station />
          <P1_Diagnose />
          <P2_Bypass />
          <P3_RigCables />
          <P4_Launch />
          <PlayerControls />
        </Canvas>
      </KeyboardControls>
      <Hud />
      {status === 'won' && <WinScreen />}
      {status === 'lost' && <GameOverScreen />}
    </>
  )
}

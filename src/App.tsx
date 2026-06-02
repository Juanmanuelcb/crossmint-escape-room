import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Environment, Sparkles } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { PlayerControls } from '@/scene/PlayerControls'
import { keyMap } from '@/scene/keyMap'
import { Station } from '@/scene/Station'
import { Lighting } from '@/scene/Lighting'
import { P1_Diagnose } from '@/puzzles/P1_Diagnose'
import { P2_Bypass } from '@/puzzles/P2_Bypass'
import { P3_RigCables } from '@/puzzles/P3_RigCables'
import { P4_Launch } from '@/puzzles/P4_Launch'
import { Hud } from '@/ui/Hud'
import { WinScreen } from '@/ui/WinScreen'
import { GameOverScreen } from '@/ui/GameOverScreen'
import { useGameStore } from '@/state/gameStore'

const computeOxygen = (
  status: string,
  startedAt: number | null,
  durationMs: number,
) => {
  if (status !== 'playing' || startedAt === null) return 1
  const remaining = 1 - (Date.now() - startedAt) / durationMs
  return Math.max(0, Math.min(1, remaining))
}

export const App: React.FC = () => {
  const status = useGameStore((s) => s.status)
  const startedAt = useGameStore((s) => s.startedAt)
  const durationMs = useGameStore((s) => s.durationMs)
  const lose = useGameStore((s) => s.lose)
  const runId = useGameStore((s) => s.runId)

  const [vignetteDarkness, setVignetteDarkness] = React.useState(0.5)

  React.useEffect(() => {
    if (status !== 'playing' || startedAt === null) return
    const id = window.setInterval(() => {
      if (Date.now() - startedAt >= durationMs) lose()
    }, 500)
    return () => window.clearInterval(id)
  }, [status, startedAt, durationMs, lose])

  React.useEffect(() => {
    const id = window.setInterval(() => {
      const o2 = computeOxygen(status, startedAt, durationMs)
      setVignetteDarkness(0.5 + (1 - o2) * 0.45)
    }, 200)
    return () => window.clearInterval(id)
  }, [status, startedAt, durationMs])

  return (
    <>
      <KeyboardControls map={keyMap}>
        <Canvas
          camera={{ position: [0, 1.6, 3], fov: 75, near: 0.1, far: 100 }}
          style={{ width: '100vw', height: '100svh' }}
        >
          <color attach='background' args={['#0a0d14']} />
          <fog attach='fog' args={['#0a0d14', 2, 18]} />
          <Environment preset='night' background={false} />
          <Lighting />
          <Station />
          <P1_Diagnose key={`p1-${runId}`} />
          <P2_Bypass key={`p2-${runId}`} />
          <P3_RigCables key={`p3-${runId}`} />
          <P4_Launch key={`p4-${runId}`} />
          <Sparkles
            position={[0, 1.5, 0]}
            count={50}
            scale={[10, 4, 10]}
            size={2}
            speed={0.2}
            color='#ffffff'
            opacity={0.3}
          />
          <Sparkles
            position={[10, 1.5, 0]}
            count={50}
            scale={[10, 4, 10]}
            size={2}
            speed={0.2}
            color='#ffffff'
            opacity={0.3}
          />
          <PlayerControls />
          <EffectComposer>
            <Bloom
              intensity={0.7}
              luminanceThreshold={0.7}
              luminanceSmoothing={0.2}
              mipmapBlur
            />
            <Vignette darkness={vignetteDarkness} offset={0.3} />
            <Noise opacity={0.04} />
            <ChromaticAberration offset={[0.0004, 0.0004]} />
          </EffectComposer>
        </Canvas>
      </KeyboardControls>
      <Hud />
      {status === 'won' && <WinScreen />}
      {status === 'lost' && <GameOverScreen />}
    </>
  )
}

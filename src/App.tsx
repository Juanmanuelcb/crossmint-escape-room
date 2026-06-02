import * as React from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { PlayerControls, PlayerKeyboard } from '@/scene/PlayerControls'
import { P1_Diagnose } from '@/puzzles/P1_Diagnose'
import { P2_Bypass } from '@/puzzles/P2_Bypass'
import { P3_RigCables } from '@/puzzles/P3_RigCables'
import { P4_Launch } from '@/puzzles/P4_Launch'
import { Hud } from '@/ui/Hud'
import { WinScreen } from '@/ui/WinScreen'
import { GameOverScreen } from '@/ui/GameOverScreen'
import { useGameStore } from '@/state/gameStore'

const ROOM = 10
const WALL_H = 3

const Room: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROOM, ROOM]} />
      <meshStandardMaterial color='#5a5a66' />
    </mesh>
    <mesh position={[0, WALL_H / 2, -ROOM / 2]}>
      <planeGeometry args={[ROOM, WALL_H]} />
      <meshStandardMaterial color='#7a7a88' side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, WALL_H / 2, ROOM / 2]}>
      <planeGeometry args={[ROOM, WALL_H]} />
      <meshStandardMaterial color='#7a7a88' side={THREE.DoubleSide} />
    </mesh>
    <mesh
      position={[-ROOM / 2, WALL_H / 2, 0]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <planeGeometry args={[ROOM, WALL_H]} />
      <meshStandardMaterial color='#7a7a88' side={THREE.DoubleSide} />
    </mesh>
    <mesh
      position={[ROOM / 2, WALL_H / 2, 0]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <planeGeometry args={[ROOM, WALL_H]} />
      <meshStandardMaterial color='#7a7a88' side={THREE.DoubleSide} />
    </mesh>
  </group>
)

export const App: React.FC = () => {
  const status = useGameStore((s) => s.status)
  const startedAt = useGameStore((s) => s.startedAt)
  const durationMs = useGameStore((s) => s.durationMs)
  const lose = useGameStore((s) => s.lose)

  React.useEffect(() => {
    if (status === 'won' || status === 'lost') {
      document.exitPointerLock?.()
    }
  }, [status])

  React.useEffect(() => {
    if (status !== 'playing' || startedAt === null) return
    const id = window.setInterval(() => {
      if (Date.now() - startedAt >= durationMs) lose()
    }, 500)
    return () => window.clearInterval(id)
  }, [status, startedAt, durationMs, lose])

  return (
    <>
      <PlayerKeyboard>
        <Canvas
          camera={{ position: [0, 1.6, 3], fov: 75, near: 0.1, far: 100 }}
          style={{ width: '100vw', height: '100svh' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} />
          <Room />
          <P1_Diagnose />
          <P2_Bypass />
          <P3_RigCables />
          <P4_Launch />
          <PlayerControls />
        </Canvas>
      </PlayerKeyboard>
      <Hud />
      {status === 'won' && <WinScreen />}
      {status === 'lost' && <GameOverScreen />}
    </>
  )
}

import * as React from 'react'
import { useGameStore } from '@/state/gameStore'

export const P3_RigCables: React.FC = () => {
  const gated = useGameStore((s) => !s.p2Solved)
  const solved = useGameStore((s) => s.p3Solved)
  const solveP3 = useGameStore((s) => s.solveP3)
  const [hover, setHover] = React.useState(false)

  if (gated || solved) return null

  return (
    <mesh
      position={[7, 1, -3]}
      onClick={(e) => {
        e.stopPropagation()
        solveP3()
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color='#00ff88'
        emissive='#00ff88'
        emissiveIntensity={hover ? 0.8 : 0.25}
      />
    </mesh>
  )
}

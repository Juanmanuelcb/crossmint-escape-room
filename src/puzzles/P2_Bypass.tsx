import * as React from 'react'
import { useGameStore } from '@/state/gameStore'

export const P2_Bypass: React.FC = () => {
  const gated = useGameStore((s) => !s.p1Solved)
  const solved = useGameStore((s) => s.p2Solved)
  const solveP2 = useGameStore((s) => s.solveP2)
  const [hover, setHover] = React.useState(false)

  if (gated || solved) return null

  return (
    <mesh
      position={[3, 1, -3]}
      onClick={(e) => {
        e.stopPropagation()
        solveP2()
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color='#00aaff'
        emissive='#00aaff'
        emissiveIntensity={hover ? 0.8 : 0.25}
      />
    </mesh>
  )
}

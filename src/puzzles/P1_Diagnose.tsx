import * as React from 'react'
import { useGameStore } from '@/state/gameStore'

export const P1_Diagnose: React.FC = () => {
  const solved = useGameStore((s) => s.p1Solved)
  const solveP1 = useGameStore((s) => s.solveP1)
  const [hover, setHover] = React.useState(false)

  if (solved) return null

  return (
    <mesh
      position={[-3, 1, -3]}
      onClick={(e) => {
        e.stopPropagation()
        solveP1()
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color='#ffaa00'
        emissive='#ffaa00'
        emissiveIntensity={hover ? 0.8 : 0.25}
      />
    </mesh>
  )
}

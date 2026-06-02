import * as React from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/state/gameStore'

const CLOSED_Y = 1.5
const OPEN_Y = 4.5
const SPEED = 3

export const Bulkhead: React.FC = () => {
  const open = useGameStore((s) => s.p2Solved)
  const ref = React.useRef<THREE.Mesh>(null)

  useFrame((_, dt) => {
    if (!ref.current) return
    const target = open ? OPEN_Y : CLOSED_Y
    const cur = ref.current.position.y
    if (Math.abs(cur - target) < 0.001) return
    const step = SPEED * dt
    ref.current.position.y =
      cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step)
  })

  return (
    <mesh ref={ref} position={[5, CLOSED_Y, 0]}>
      <boxGeometry args={[0.15, 3, 2]} />
      <meshStandardMaterial
        color='#5e3a1a'
        emissive='#220900'
        emissiveIntensity={0.25}
      />
    </mesh>
  )
}

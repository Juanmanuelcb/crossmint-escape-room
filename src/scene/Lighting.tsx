import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/state/gameStore'

const COOL = '#88aacc'
const WARM = '#ffd089'

const POINT_LIGHTS: ReadonlyArray<{
  position: [number, number, number]
  color: string
}> = [
  { position: [0, 2.4, -3.5], color: WARM },
  { position: [-2.5, 2.4, 0], color: COOL },
  { position: [2.5, 2.4, 0], color: COOL },
  { position: [0, 2.4, 3], color: WARM },
  { position: [4.5, 2.4, 0], color: COOL },
  { position: [7.5, 2.4, 0], color: COOL },
  { position: [6.5, 2.4, -3.5], color: WARM },
  { position: [13, 2.4, -1.5], color: WARM },
  { position: [13, 2.4, 2], color: COOL },
  { position: [10, 2.4, 3.5], color: COOL },
]

const Strobe: React.FC = () => {
  const ref = React.useRef<THREE.PointLight>(null)
  const sphereRef = React.useRef<THREE.MeshStandardMaterial>(null)
  const status = useGameStore((s) => s.status)
  const startedAt = useGameStore((s) => s.startedAt)
  const durationMs = useGameStore((s) => s.durationMs)

  useFrame((state) => {
    if (status !== 'playing' || startedAt === null) {
      if (ref.current) ref.current.intensity = 0
      if (sphereRef.current) sphereRef.current.emissiveIntensity = 0.1
      return
    }
    const remaining = Math.max(0, durationMs - (Date.now() - startedAt))
    const pct = remaining / durationMs
    // Tiers from DESIGN.md atmosphere escalation table.
    // 100-75% O2 = 2 Hz, 75-50% = 3 Hz, 50-25% = 5 Hz, <25% = near-constant red.
    if (pct <= 0.25) {
      if (ref.current) ref.current.intensity = 4
      if (sphereRef.current) sphereRef.current.emissiveIntensity = 2.5
      return
    }
    const hz = pct > 0.75 ? 2 : pct > 0.5 ? 3 : 5
    const on = Math.sin(state.clock.elapsedTime * hz * 2 * Math.PI) > 0
    if (ref.current) ref.current.intensity = on ? 4 : 0
    if (sphereRef.current) sphereRef.current.emissiveIntensity = on ? 2.5 : 0.1
  })

  return (
    <group position={[5, 2.7, -2.5]}>
      <pointLight ref={ref} color='#ff2030' distance={6} intensity={0} />
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          ref={sphereRef}
          color='#330000'
          emissive='#ff2030'
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  )
}

export const Lighting: React.FC = () => (
  <>
    <ambientLight intensity={0.05} color='#2a3a55' />
    {POINT_LIGHTS.map((l, i) => (
      <pointLight
        key={i}
        position={l.position}
        color={l.color}
        distance={4}
        intensity={1.5}
      />
    ))}
    <Strobe />
  </>
)

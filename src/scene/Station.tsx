import * as React from 'react'
import * as THREE from 'three'
import { ControlRoom } from '@/scene/ControlRoom'
import { PodBay } from '@/scene/PodBay'
import { Bulkhead } from '@/scene/Bulkhead'

const WALL_H = 3

export const Station: React.FC = () => (
  <group>
    <ControlRoom />
    <group position={[10, 0, 0]}>
      <PodBay />
    </group>
    <mesh position={[5, WALL_H / 2, -3]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[4, WALL_H]} />
      <meshStandardMaterial
        color='#7a7a88'
        side={THREE.DoubleSide}
        metalness={0.6}
        roughness={0.4}
      />
    </mesh>
    <mesh position={[5, WALL_H / 2, 3]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[4, WALL_H]} />
      <meshStandardMaterial
        color='#7a7a88'
        side={THREE.DoubleSide}
        metalness={0.6}
        roughness={0.4}
      />
    </mesh>
    <Bulkhead />
  </group>
)

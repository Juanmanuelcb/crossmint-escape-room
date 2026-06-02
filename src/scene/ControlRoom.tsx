import * as React from 'react'
import * as THREE from 'three'

const W = 10
const H = 3

export const ControlRoom: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[W, W]} />
      <meshStandardMaterial color='#5a5a66' />
    </mesh>
    <mesh position={[0, H / 2, -W / 2]}>
      <planeGeometry args={[W, H]} />
      <meshStandardMaterial color='#7a7a88' side={THREE.DoubleSide} />
    </mesh>
    <mesh position={[0, H / 2, W / 2]}>
      <planeGeometry args={[W, H]} />
      <meshStandardMaterial color='#7a7a88' side={THREE.DoubleSide} />
    </mesh>
    <mesh
      position={[-W / 2, H / 2, 0]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <planeGeometry args={[W, H]} />
      <meshStandardMaterial color='#7a7a88' side={THREE.DoubleSide} />
    </mesh>
  </group>
)

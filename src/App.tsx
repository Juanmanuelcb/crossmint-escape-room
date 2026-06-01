import * as React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  KeyboardControls,
  PointerLockControls,
  useKeyboardControls,
} from '@react-three/drei'
import * as THREE from 'three'

type Control = 'forward' | 'back' | 'left' | 'right'

const keyMap: { name: Control; keys: string[] }[] = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
]

const ROOM = 10
const WALL_H = 3
const SPEED = 4

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

const Player: React.FC = () => {
  const camera = useThree((s) => s.camera)
  const [, getKeys] = useKeyboardControls<Control>()
  const forward = React.useRef(new THREE.Vector3())
  const right = React.useRef(new THREE.Vector3())
  const move = React.useRef(new THREE.Vector3())

  useFrame((_, dt) => {
    const k = getKeys()
    forward.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
    forward.current.y = 0
    forward.current.normalize()
    right.current.set(1, 0, 0).applyQuaternion(camera.quaternion)
    right.current.y = 0
    right.current.normalize()

    move.current.set(0, 0, 0)
    if (k.forward) move.current.add(forward.current)
    if (k.back) move.current.sub(forward.current)
    if (k.right) move.current.add(right.current)
    if (k.left) move.current.sub(right.current)
    if (move.current.lengthSq() > 0) {
      move.current.normalize().multiplyScalar(SPEED * dt)
      camera.position.add(move.current)
    }
  })

  return null
}

export const App: React.FC = () => (
  <KeyboardControls map={keyMap}>
    <Canvas
      camera={{ position: [0, 1.6, 3], fov: 75, near: 0.1, far: 100 }}
      style={{ width: '100vw', height: '100svh' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <Room />
      <Player />
      <PointerLockControls />
    </Canvas>
  </KeyboardControls>
)

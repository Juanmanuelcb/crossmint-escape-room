import * as React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  KeyboardControls,
  PointerLockControls,
  useKeyboardControls,
} from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/state/gameStore'

type Control = 'forward' | 'back' | 'left' | 'right'

const keyMap: { name: Control; keys: string[] }[] = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
]

const SPEED = 4

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

export const PlayerControls: React.FC = () => {
  const start = useGameStore((s) => s.start)
  return (
    <>
      <Player />
      <PointerLockControls onLock={start} />
    </>
  )
}

export const PlayerKeyboard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <KeyboardControls map={keyMap}>{children}</KeyboardControls>

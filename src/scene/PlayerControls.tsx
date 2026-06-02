import * as React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '@/state/gameStore'
import type { Control } from '@/scene/keyMap'

const SPEED = 4
const R = 0.3

// Two rooms joined at x=5: Control Room x in [-5,5], Pod Bay x in [5,15],
// both z in [-5,5]. The 2m doorway gap (z in [-1,1]) opens only after P2.
const isPassable = (x: number, z: number, doorOpen: boolean) => {
  const inCR = x > -5 + R && x < 5 - R && z > -5 + R && z < 5 - R
  const inPB = x > 5 + R && x < 15 - R && z > -5 + R && z < 5 - R
  const inDoor = doorOpen && x >= 5 - R && x <= 5 + R && z > -1 + R && z < 1 - R
  return inCR || inPB || inDoor
}

const Player: React.FC = () => {
  const camera = useThree((s) => s.camera)
  const [, getKeys] = useKeyboardControls<Control>()
  const doorOpen = useGameStore((s) => s.p2Solved)
  const status = useGameStore((s) => s.status)
  const forward = React.useRef(new THREE.Vector3())
  const right = React.useRef(new THREE.Vector3())
  const move = React.useRef(new THREE.Vector3())

  React.useEffect(() => {
    if (status !== 'idle') return
    camera.position.set(0, 1.6, 3)
    camera.quaternion.identity()
    camera.lookAt(0, 1.6, 2)
  }, [status, camera])

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
    if (move.current.lengthSq() === 0) return

    move.current.normalize().multiplyScalar(SPEED * dt)
    const cz = camera.position.z
    if (isPassable(camera.position.x + move.current.x, cz, doorOpen)) {
      camera.position.x += move.current.x
    }
    if (isPassable(camera.position.x, cz + move.current.z, doorOpen)) {
      camera.position.z += move.current.z
    }
  })

  return null
}

export const PlayerControls: React.FC = () => {
  const status = useGameStore((s) => s.status)
  const lockable = status === 'playing'

  React.useEffect(() => {
    if (!lockable) document.exitPointerLock?.()
  }, [lockable])

  // Timer is started by the StartScreen button, not by pointer lock,
  // so the player can read the instructions without the clock running.
  return (
    <>
      <Player />
      {lockable && <PointerLockControls />}
    </>
  )
}

import * as React from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore, type Digit } from '@/state/gameStore'

const DIGITS: Digit[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

const HULL_RADIUS = 1
const HULL_LENGTH = 3
const HATCH_X = 13 - HULL_LENGTH / 2
const KEYPAD_X = HATCH_X - 0.06

const KeypadBackplate: React.FC<{ pulsing: boolean }> = ({ pulsing }) => {
  const matRef = React.useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    if (!pulsing) {
      matRef.current.emissiveIntensity = 0
      return
    }
    const s = Math.sin((clock.elapsedTime * 2 * Math.PI) / 1.5)
    matRef.current.emissiveIntensity = 0.15 + s * 0.1
  })

  return (
    <mesh position={[0, -0.2, -0.04]}>
      <boxGeometry args={[1.4, 1.8, 0.03]} />
      <meshStandardMaterial
        ref={matRef}
        color='#222230'
        emissive='#88ccff'
        emissiveIntensity={0}
      />
    </mesh>
  )
}

const Key: React.FC<{
  digit: Digit
  col: number
  row: number
  onPress: (d: Digit) => void
}> = ({ digit, col, row, onPress }) => {
  const [hover, setHover] = React.useState(false)
  return (
    <group position={[col * 0.4, row * 0.4, 0]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onPress(digit)
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[0.32, 0.32, 0.08]} />
        <meshStandardMaterial
          color='#ffaa55'
          emissive='#ffaa55'
          emissiveIntensity={hover ? 0.8 : 0.25}
        />
      </mesh>
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.18}
        color='white'
        anchorX='center'
        anchorY='middle'
      >
        {digit}
      </Text>
    </group>
  )
}

export const P4_Launch: React.FC = () => {
  const gated = useGameStore((s) => !s.p3Solved)
  const enterDigit = useGameStore((s) => s.enterDigit)
  const entered = useGameStore((s) => s.enteredCode)

  if (gated) return null

  return (
    <group>
      <mesh position={[13, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[HULL_RADIUS, HULL_RADIUS, HULL_LENGTH, 24]} />
        <meshStandardMaterial color='#404048' />
      </mesh>

      <mesh
        position={[13 + HULL_LENGTH / 2, 1.0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[HULL_RADIUS, 0.8, 24]} />
        <meshStandardMaterial color='#404048' />
      </mesh>

      <mesh position={[HATCH_X + 0.01, 1.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[HULL_RADIUS * 0.92, 32]} />
        <meshStandardMaterial color='#222230' />
      </mesh>

      <mesh position={[HATCH_X + 0.02, 1.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ringGeometry args={[HULL_RADIUS * 0.9, HULL_RADIUS * 0.98, 48]} />
        <meshStandardMaterial
          color='#ffaa55'
          emissive='#ffaa55'
          emissiveIntensity={0.35}
        />
      </mesh>

      <group position={[KEYPAD_X, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <KeypadBackplate pulsing={entered.length === 0} />

        <Text
          position={[0, 0.78, 0.02]}
          fontSize={0.1}
          color='#ffaa55'
          anchorX='center'
          anchorY='middle'
        >
          ESCAPE POD #9 // HELIOS-IX
        </Text>

        <Text
          position={[0, 0.62, 0.02]}
          fontSize={0.12}
          color='#88ccff'
          anchorX='center'
          anchorY='middle'
        >
          LAUNCH CODE // 4 SYMBOLS
        </Text>

        <Text
          position={[0, 0.45, 0.02]}
          fontSize={0.12}
          color='#88ccff'
          anchorX='center'
          anchorY='middle'
        >
          {[0, 1, 2, 3].map((i) => `[${entered[i] ?? '_'}]`).join(' ')}
        </Text>

        <group position={[0, -0.3, 0]}>
          {DIGITS.map((d, i) => {
            const col = i < 9 ? (i % 3) - 1 : 0
            const row = i < 9 ? 1 - Math.floor(i / 3) : -2
            return (
              <Key key={d} digit={d} col={col} row={row} onPress={enterDigit} />
            )
          })}
        </group>
      </group>
    </group>
  )
}

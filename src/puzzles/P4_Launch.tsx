import * as React from 'react'
import { Text } from '@react-three/drei'
import { useGameStore, type Digit } from '@/state/gameStore'

const DIGITS: Digit[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
]

const slotFor = (i: number) => {
  if (i < 9) {
    const col = i % 3
    const row = Math.floor(i / 3)
    return { col: col - 1, row: 1 - row }
  }
  return { col: 0, row: -2 }
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
          color='#ff44aa'
          emissive='#ff44aa'
          emissiveIntensity={hover ? 0.8 : 0.2}
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
    <group position={[3, 1.5, 1]}>
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[1.5, 2, 0.05]} />
        <meshStandardMaterial color='#222230' />
      </mesh>

      <Text
        position={[0, 0.85, 0]}
        fontSize={0.12}
        color='#88ccff'
        anchorX='center'
        anchorY='middle'
      >
        {`[${entered[0] ?? '_'}] [${entered[1] ?? '_'}] [${entered[2] ?? '_'}] [${entered[3] ?? '_'}]`}
      </Text>

      {DIGITS.map((d, i) => {
        const { col, row } = slotFor(i)
        return (
          <Key
            key={d}
            digit={d}
            col={col}
            row={row}
            onPress={enterDigit}
          />
        )
      })}
    </group>
  )
}

import * as React from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MeshStandardMaterial } from 'three'
import { useGameStore } from '@/state/gameStore'

type CableColor = 'BLUE' | 'GREEN' | 'YELLOW'

const COLOR: Record<CableColor, string> = {
  BLUE: '#3366ff',
  GREEN: '#22cc66',
  YELLOW: '#ffcc33',
}

const TRAY_ORDER: readonly CableColor[] = ['YELLOW', 'BLUE', 'GREEN']
const CORRECT: readonly CableColor[] = ['BLUE', 'GREEN', 'YELLOW']

const BODY = '#222230'
const INERT = '#404048'
const SCREEN = '#0a0a14'
const INFO = '#88ccff'
const NOMINAL = '#22ff88'
const CRITICAL = '#ff3322'
const WARM = '#ffaa55'

const PANEL_X = 6.5
const PANEL_Y = 1.4
const PANEL_Z = -4.95
const FRONT_Z = -4.75
const TRAY_Z = -4.6
const PORT_OFFSETS = [-0.5, 0, 0.5] as const

interface PortProps {
  index: number
  installed: CableColor | null
  selectable: boolean
  pulse: boolean
  onClick: () => void
}

const Port: React.FC<PortProps> = ({
  index,
  installed,
  selectable,
  pulse,
  onClick,
}) => {
  const [hover, setHover] = React.useState(false)
  const matRef = React.useRef<MeshStandardMaterial>(null)
  const color = installed ? COLOR[installed] : INERT

  useFrame(({ clock }) => {
    if (!matRef.current) return
    if (pulse) {
      const t = clock.elapsedTime * ((2 * Math.PI) / 1.5)
      const v = 0.275 + 0.125 * Math.sin(t)
      matRef.current.emissiveIntensity = v
      return
    }
    const target = installed ? 0.7 : selectable && hover ? 0.8 : 0.15
    matRef.current.emissiveIntensity = target
  })

  return (
    <group position={[PORT_OFFSETS[index], PANEL_Y + 0.15, FRONT_Z + 0.01]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[0.24, 0.24, 0.08]} />
        <meshStandardMaterial
          ref={matRef}
          color={installed ? color : SCREEN}
          emissive={pulse && !installed ? INFO : color}
          emissiveIntensity={0.15}
        />
      </mesh>
      <Text
        position={[0, -0.2, 0.06]}
        fontSize={0.1}
        color={INFO}
        anchorX='center'
        anchorY='middle'
      >
        {index + 1}
      </Text>
    </group>
  )
}

interface CableProps {
  color: CableColor
  slot: number
  selected: boolean
  onClick: () => void
}

const Cable: React.FC<CableProps> = ({ color, slot, selected, onClick }) => {
  const [hover, setHover] = React.useState(false)
  const lift = selected ? 0.08 : 0
  const intensity = selected ? 0.8 : hover ? 0.55 : 0.3
  return (
    <group
      position={[
        PANEL_X - 0.5 + slot * 0.5,
        PANEL_Y - 0.55 + lift,
        TRAY_Z + 0.18,
      ]}
    >
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.36, 12]} />
        <meshStandardMaterial
          color={COLOR[color]}
          emissive={COLOR[color]}
          emissiveIntensity={intensity}
        />
      </mesh>
    </group>
  )
}

export const P3_RigCables: React.FC = () => {
  const gated = useGameStore((s) => !s.p2Solved)
  const solved = useGameStore((s) => s.p3Solved)
  const solveP3 = useGameStore((s) => s.solveP3)

  const [installed, setInstalled] = React.useState<
    readonly (CableColor | null)[]
  >([null, null, null])
  const [selected, setSelected] = React.useState<CableColor | null>(null)
  const [spark, setSpark] = React.useState(false)
  const sparkTimer = React.useRef<number | null>(null)

  React.useEffect(
    () => () => {
      if (sparkTimer.current !== null) {
        window.clearTimeout(sparkTimer.current)
      }
    },
    [],
  )

  if (gated) return null

  const triggerSpark = () => {
    setSpark(true)
    if (sparkTimer.current !== null) {
      window.clearTimeout(sparkTimer.current)
    }
    sparkTimer.current = window.setTimeout(() => setSpark(false), 300)
  }

  const handlePort = (portIndex: number) => {
    if (solved) return
    if (selected === null) return
    if (installed[portIndex] !== null) return
    if (CORRECT[portIndex] === selected) {
      const next = installed.map((c, i) =>
        i === portIndex ? selected : c,
      )
      setInstalled(next)
      setSelected(null)
      if (next.every((c, i) => c === CORRECT[i])) {
        solveP3()
      }
    } else {
      triggerSpark()
      setSelected(null)
    }
  }

  const handleCable = (color: CableColor) => {
    if (solved) return
    if (installed.includes(color)) return
    setSelected((cur) => (cur === color ? null : color))
  }

  const displayColor = solved ? NOMINAL : spark ? CRITICAL : INFO
  const displayText = solved
    ? 'POWER RESTORED // CODE DIGIT: 5'
    : 'AWAITING POWER'

  const nextEmptyIdx = installed.findIndex((c) => c === null)
  const anyInstalled = installed.some((c) => c !== null)
  const pulseActive = !solved && selected === null && !anyInstalled

  return (
    <group>
      <mesh position={[PANEL_X, PANEL_Y, PANEL_Z]}>
        <boxGeometry args={[1.8, 1.4, 0.4]} />
        <meshStandardMaterial color={BODY} />
      </mesh>

      <mesh position={[PANEL_X, PANEL_Y + 0.15, FRONT_Z + 0.001]}>
        <planeGeometry args={[1.6, 0.5]} />
        <meshStandardMaterial color={SCREEN} />
      </mesh>

      {!solved && (
        <>
          <Text
            position={[PANEL_X, PANEL_Y + 0.6, FRONT_Z + 0.02]}
            fontSize={0.1}
            color={INFO}
            anchorX='center'
            anchorY='middle'
          >
            INSTALL CABLES
          </Text>
          <Text
            position={[PANEL_X, PANEL_Y + 0.48, FRONT_Z + 0.02]}
            fontSize={0.055}
            color={INFO}
            anchorX='center'
            anchorY='middle'
          >
            SELECT CABLE // THEN CLICK A PORT
          </Text>
        </>
      )}

      <Text
        position={[PANEL_X, PANEL_Y - 0.4, FRONT_Z + 0.02]}
        fontSize={0.045}
        color={WARM}
        anchorX='center'
        anchorY='middle'
      >
        BYPASS ORDER
      </Text>
      <group position={[PANEL_X, PANEL_Y - 0.48, FRONT_Z + 0.02]}>
        <Text
          position={[-0.28, 0, 0]}
          fontSize={0.05}
          color={COLOR.BLUE}
          anchorX='center'
          anchorY='middle'
        >
          [BLUE]
        </Text>
        <Text
          position={[-0.1, 0, 0]}
          fontSize={0.05}
          color={WARM}
          anchorX='center'
          anchorY='middle'
        >
          {'>'}
        </Text>
        <Text
          position={[0.07, 0, 0]}
          fontSize={0.05}
          color={COLOR.GREEN}
          anchorX='center'
          anchorY='middle'
        >
          [GREEN]
        </Text>
        <Text
          position={[0.24, 0, 0]}
          fontSize={0.05}
          color={WARM}
          anchorX='center'
          anchorY='middle'
        >
          {'>'}
        </Text>
        <Text
          position={[0.43, 0, 0]}
          fontSize={0.05}
          color={COLOR.YELLOW}
          anchorX='center'
          anchorY='middle'
        >
          [YELLOW]
        </Text>
      </group>

      {PORT_OFFSETS.map((_, i) => (
        <group key={i} position={[PANEL_X, 0, 0]}>
          <Port
            index={i}
            installed={installed[i]}
            selectable={selected !== null && !solved}
            pulse={pulseActive && i === nextEmptyIdx}
            onClick={() => handlePort(i)}
          />
        </group>
      ))}

      <mesh position={[PANEL_X, PANEL_Y - 0.25, FRONT_Z + 0.01]}>
        <planeGeometry args={[1.4, 0.24]} />
        <meshStandardMaterial
          color={SCREEN}
          emissive={displayColor}
          emissiveIntensity={spark ? 0.9 : 0.2}
        />
      </mesh>
      <Text
        position={[PANEL_X, PANEL_Y - 0.25, FRONT_Z + 0.02]}
        fontSize={0.1}
        color={displayColor}
        anchorX='center'
        anchorY='middle'
        maxWidth={1.35}
        textAlign='center'
      >
        {displayText}
      </Text>

      {solved && (
        <Text
          position={[PANEL_X, PANEL_Y + 0.55, FRONT_Z + 0.02]}
          fontSize={0.36}
          color={NOMINAL}
          anchorX='center'
          anchorY='middle'
          outlineWidth={0.006}
          outlineColor={NOMINAL}
        >
          5
        </Text>
      )}

      <mesh position={[PANEL_X, PANEL_Y - 0.6, TRAY_Z + 0.1]}>
        <boxGeometry args={[1.6, 0.1, 0.4]} />
        <meshStandardMaterial color={INERT} />
      </mesh>

      {TRAY_ORDER.map((color, slot) =>
        installed.includes(color) ? null : (
          <Cable
            key={color}
            color={color}
            slot={slot}
            selected={selected === color}
            onClick={() => handleCable(color)}
          />
        ),
      )}
    </group>
  )
}

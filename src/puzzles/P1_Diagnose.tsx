import * as React from 'react'
import { Html, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MeshStandardMaterial } from 'three'
import { useGameStore } from '@/state/gameStore'
import { useRunConfig } from '@/state/runConfig'

interface RowSpec {
  index: number
  label: string
  code: string
  critical: boolean
}

const LABELS = ['NAVIGATION', 'COMMS', 'REACTOR', 'LIFE SUPPORT'] as const
const E_CODES = ['E-01', 'E-02', 'E-03', 'E-04'] as const
const CRITICAL_CODE = 'F-7C'

const INFO = '#88ccff'
const CRITICAL = '#ff3322'
const NOMINAL = '#22ff88'
const WARM = '#ffaa55'
const BODY = '#222230'
const SCREEN = '#0a0a14'

const ROW_HEIGHT = 0.18
const ROW_WIDTH = 2.0
const DISPLAY_FRONT_Z = -4.24

const PULSE_PERIOD = 1.5
const PULSE_MIN = 0.25
const PULSE_MAX = 0.55

interface RowProps {
  spec: RowSpec
  y: number
  flashing: boolean
  pulsing: boolean
  onClick: () => void
  onEngage: () => void
}

const DiagnosticRow: React.FC<RowProps> = ({
  spec,
  y,
  flashing,
  pulsing,
  onClick,
  onEngage,
}) => {
  const [hover, setHover] = React.useState(false)
  const materialRef = React.useRef<MeshStandardMaterial>(null)

  const baseColor = spec.critical ? CRITICAL : INFO
  const displayColor = flashing ? CRITICAL : baseColor
  const propIntensity = flashing ? 0.9 : hover ? 0.8 * 0.15 : 0.25 * 0.15

  useFrame(({ clock }) => {
    if (!pulsing || flashing) return
    const mat = materialRef.current
    if (!mat) return
    const t = clock.elapsedTime
    const s = 0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / PULSE_PERIOD)
    mat.emissiveIntensity = PULSE_MIN + (PULSE_MAX - PULSE_MIN) * s
  })

  const handleOver = () => {
    setHover(true)
    onEngage()
  }

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onEngage()
    onClick()
  }

  return (
    <group position={[0, y, 0]}>
      <mesh
        position={[0, 0, DISPLAY_FRONT_Z + 0.001]}
        onClick={handleClick}
        onPointerOver={handleOver}
        onPointerOut={() => setHover(false)}
      >
        <planeGeometry args={[ROW_WIDTH, ROW_HEIGHT]} />
        <meshStandardMaterial
          ref={materialRef}
          color={SCREEN}
          emissive={displayColor}
          emissiveIntensity={propIntensity}
        />
      </mesh>
      <Text
        position={[-ROW_WIDTH / 2 + 0.05, 0, DISPLAY_FRONT_Z + 0.01]}
        fontSize={0.1}
        color={displayColor}
        anchorX='left'
        anchorY='middle'
      >
        {`${spec.index}.  ${spec.label}`}
      </Text>
      <Text
        position={[ROW_WIDTH / 2 - 0.05, 0, DISPLAY_FRONT_Z + 0.01]}
        fontSize={0.1}
        color={displayColor}
        anchorX='right'
        anchorY='middle'
      >
        {`[${spec.code}]`}
      </Text>
    </group>
  )
}

export const P1_Diagnose: React.FC = () => {
  const solved = useGameStore((s) => s.p1Solved)
  const solveP1 = useGameStore((s) => s.solveP1)
  const penalize = useGameStore((s) => s.penalize)
  const cfg = useRunConfig()

  const rows: RowSpec[] = LABELS.map((label, i) => ({
    index: i + 1,
    label,
    code: i === cfg.p1.criticalIndex ? CRITICAL_CODE : E_CODES[i],
    critical: i === cfg.p1.criticalIndex,
  }))

  const [flashIndex, setFlashIndex] = React.useState<number | null>(null)
  const flashTimer = React.useRef<number | null>(null)
  const [engaged, setEngaged] = React.useState(false)

  React.useEffect(
    () => () => {
      if (flashTimer.current !== null) {
        window.clearTimeout(flashTimer.current)
      }
    },
    [],
  )

  const triggerFlash = (index: number) => {
    setFlashIndex(index)
    if (flashTimer.current !== null) {
      window.clearTimeout(flashTimer.current)
    }
    flashTimer.current = window.setTimeout(() => setFlashIndex(null), 250)
  }

  const handleRowClick = (spec: RowSpec) => {
    if (spec.critical) {
      solveP1(cfg.p1.digit)
    } else {
      triggerFlash(spec.index)
      penalize(5000)
    }
  }

  return (
    <group>
      <mesh position={[0, 1.0, -4.5]}>
        <boxGeometry args={[2.5, 1.5, 0.5]} />
        <meshStandardMaterial color={BODY} />
      </mesh>

      <mesh position={[0, 1.2, DISPLAY_FRONT_Z]}>
        <planeGeometry args={[2.2, 1.0]} />
        <meshStandardMaterial color={SCREEN} />
      </mesh>

      <Text
        position={[0, 1.68, DISPLAY_FRONT_Z + 0.01]}
        fontSize={0.1}
        color={INFO}
        anchorX='center'
        anchorY='middle'
      >
        SUBSYSTEM STATUS
      </Text>

      {!solved && (
        <Text
          position={[0, 1.56, DISPLAY_FRONT_Z + 0.01]}
          fontSize={0.1}
          color={INFO}
          anchorX='center'
          anchorY='middle'
        >
          SELECT FAILED SUBSYSTEM
        </Text>
      )}

      {solved ? (
        <Text
          position={[0, 1.2, DISPLAY_FRONT_Z + 0.01]}
          fontSize={0.12}
          color={NOMINAL}
          anchorX='center'
          anchorY='middle'
          maxWidth={2.0}
          textAlign='center'
        >
          DIAGNOSIS LOGGED // REACTOR OFFLINE
        </Text>
      ) : (
        rows.map((spec, i) => (
          <DiagnosticRow
            key={spec.index}
            spec={spec}
            y={1.36 - (i + 1) * 0.2}
            flashing={flashIndex === spec.index}
            pulsing={spec.critical && !engaged}
            onClick={() => handleRowClick(spec)}
            onEngage={() => setEngaged(true)}
          />
        ))
      )}

      <group position={[2.2, 1.6, -4.95]}>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[1.28, 1.58]} />
          <meshStandardMaterial
            color={WARM}
            emissive={WARM}
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.2, 1.5]} />
          <meshStandardMaterial
            color={WARM}
            emissive={WARM}
            emissiveIntensity={0.15}
          />
        </mesh>
        <Html
          transform
          position={[0, 0, 0.02]}
          distanceFactor={1.2}
          style={{
            width: '320px',
            padding: '18px 20px',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
            color: '#2a1a0a',
            lineHeight: 1.35,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <div className='text-[14px] font-bold tracking-wide mb-2'>
            ORV HELIOS-IX
          </div>
          <div className='text-[11px] font-semibold mb-3 tracking-wider'>
            OPERATIONS MANUAL // STATUS CODES
          </div>
          <div className='text-[11px] mb-2'>
            <span className='font-bold'>E-codes:</span> warning, system OK.
          </div>
          <div className='text-[11px] mb-3'>
            <span className='font-bold'>F-codes:</span> critical fault, system
            OFFLINE.
          </div>
          <div className='text-[10px] italic border-t border-[#2a1a0a]/40 pt-2'>
            Click the row showing an F-code.
          </div>
        </Html>
      </group>
    </group>
  )
}

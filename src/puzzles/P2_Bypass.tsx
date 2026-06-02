import * as React from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MeshStandardMaterial } from 'three'
import { useGameStore } from '@/state/gameStore'
import { useRunConfig } from '@/state/runConfig'

type NodeId =
  | 'REACTOR'
  | 'JUNCTION-A'
  | 'AUX BATTERY'
  | 'JUNCTION-B'
  | 'JUNCTION-C'
  | 'JUNCTION-D'
  | 'POD BAY'

interface GridNode {
  id: NodeId
  label: string
  x: number
  y: number
  clickable: boolean
}

type CableColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW'

interface Cable {
  from: NodeId
  to: NodeId
  color: CableColor
  dead?: boolean
  severed?: boolean
  partOfBypass?: boolean
}

const COLOR_RED = '#ff3322'
const COLOR_BLUE = '#3366ff'
const COLOR_GREEN = '#22cc66'
const COLOR_YELLOW = '#ffcc33'
const COLOR_DIM = '#404048'
const COLOR_BROKEN = '#2a2a30'
const COLOR_PANEL = '#222230'
const COLOR_BACKPLATE = '#0a0a14'
const COLOR_INFO = '#88ccff'
const COLOR_NOMINAL = '#22ff88'
const COLOR_WALL_ACCENT = '#7a7a88'

const cableHex = (c: CableColor): string => {
  if (c === 'RED') return COLOR_RED
  if (c === 'BLUE') return COLOR_BLUE
  if (c === 'GREEN') return COLOR_GREEN
  return COLOR_YELLOW
}

// Layout uses panel-local coordinates: +x is player's LEFT, +y is up,
// +z is toward player. The wrapping group rotates Math.PI around Y to
// face the +z wall, so local +x maps to world -x (player's left).
const NODES: GridNode[] = [
  { id: 'REACTOR', label: 'REACTOR', x: 1.4, y: 0.5, clickable: false },
  { id: 'JUNCTION-A', label: 'JUNCTION A', x: 0.3, y: 0.5, clickable: true },
  { id: 'JUNCTION-C', label: 'JUNCTION C', x: -0.85, y: 0.5, clickable: true },
  {
    id: 'AUX BATTERY',
    label: 'AUX BATTERY',
    x: 1.4,
    y: -0.05,
    clickable: false,
  },
  { id: 'POD BAY', label: 'POD BAY', x: -1.4, y: -0.05, clickable: false },
  { id: 'JUNCTION-B', label: 'JUNCTION B', x: 0.3, y: -0.65, clickable: true },
  {
    id: 'JUNCTION-D',
    label: 'JUNCTION D',
    x: -0.85,
    y: -0.65,
    clickable: true,
  },
]

const buildCables = (
  bypass: readonly [CableColor, CableColor, CableColor],
): Cable[] => [
  { from: 'REACTOR', to: 'JUNCTION-A', color: 'RED', dead: true },
  {
    from: 'AUX BATTERY',
    to: 'JUNCTION-A',
    color: bypass[0],
    partOfBypass: true,
  },
  {
    from: 'JUNCTION-A',
    to: 'JUNCTION-C',
    color: bypass[1],
    partOfBypass: true,
  },
  { from: 'JUNCTION-C', to: 'POD BAY', color: bypass[2], partOfBypass: true },
  { from: 'AUX BATTERY', to: 'JUNCTION-B', color: 'YELLOW' },
  { from: 'JUNCTION-B', to: 'JUNCTION-D', color: 'GREEN', severed: true },
  { from: 'JUNCTION-D', to: 'POD BAY', color: 'RED', dead: true },
]

const SEQUENCE: NodeId[] = ['JUNCTION-A', 'JUNCTION-C']

const nodeById = (id: NodeId): GridNode => {
  const n = NODES.find((node) => node.id === id)
  if (!n) throw new Error('missing node ' + id)
  return n
}

const PANEL_DEPTH = 0.05
const SURFACE_Z = PANEL_DEPTH / 2 + 0.005
const CABLE_Z = SURFACE_Z
const NODE_Z = SURFACE_Z + 0.012
const TEXT_Z = SURFACE_Z + 0.025

interface CableSegmentProps {
  cable: Cable
  litGreen: boolean
}

const BREAK_GAP = 0.3

const CableSegment: React.FC<CableSegmentProps> = ({ cable, litGreen }) => {
  const a = nodeById(cable.from)
  const b = nodeById(cable.to)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx)
  const cx = (a.x + b.x) / 2
  const cy = (a.y + b.y) / 2

  const broken = cable.dead || cable.severed
  const baseColor = litGreen
    ? COLOR_GREEN
    : broken
      ? COLOR_BROKEN
      : cableHex(cable.color)
  const emissiveIntensity = litGreen ? 0.9 : broken ? 0.05 : 0.35

  if (broken) {
    const halfLen = Math.max((length - BREAK_GAP) / 2, 0.02)
    const offset = halfLen / 2 + BREAK_GAP / 2
    return (
      <group position={[cx, cy, CABLE_Z]} rotation={[0, 0, angle]}>
        <mesh position={[-offset, 0, 0]}>
          <boxGeometry args={[halfLen, 0.04, 0.01]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        <mesh position={[offset, 0, 0]}>
          <boxGeometry args={[halfLen, 0.04, 0.01]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        {cable.severed && (
          <group rotation={[0, 0, -angle]} position={[0, 0, 0.012]}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.12, 0.018, 0.005]} />
              <meshStandardMaterial
                color={COLOR_RED}
                emissive={COLOR_RED}
                emissiveIntensity={0.9}
              />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.12, 0.018, 0.005]} />
              <meshStandardMaterial
                color={COLOR_RED}
                emissive={COLOR_RED}
                emissiveIntensity={0.9}
              />
            </mesh>
          </group>
        )}
      </group>
    )
  }

  return (
    <group position={[cx, cy, CABLE_Z]} rotation={[0, 0, angle]}>
      <mesh>
        <boxGeometry args={[length, 0.04, 0.01]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  )
}

interface NodeMarkerProps {
  node: GridNode
  isLocked: boolean
  isFlashing: boolean
  pulsing: boolean
  onClick: () => void
  showReactorX: boolean
}

const NodeMarker: React.FC<NodeMarkerProps> = ({
  node,
  isLocked,
  isFlashing,
  pulsing,
  onClick,
  showReactorX,
}) => {
  const [hover, setHover] = React.useState(false)
  const matRef = React.useRef<MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    if (!pulsing || isFlashing || hover || isLocked) return
    const t = clock.elapsedTime
    const wave = (Math.sin((t * 2 * Math.PI) / 1.5) + 1) / 2
    matRef.current.emissiveIntensity = 0.25 + wave * 0.3
  })

  const flashColor = COLOR_RED
  const baseColor = isLocked
    ? COLOR_NOMINAL
    : node.clickable
      ? COLOR_INFO
      : COLOR_DIM
  const color = isFlashing ? flashColor : baseColor
  const staticIntensity = isFlashing
    ? 0.9
    : isLocked
      ? 0.7
      : node.clickable && hover
        ? 0.8
        : node.clickable
          ? 0.25
          : 0.15

  return (
    <group position={[node.x, node.y, NODE_Z]}>
      <mesh
        onPointerOver={(e) => {
          if (!node.clickable) return
          e.stopPropagation()
          setHover(true)
        }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => {
          if (!node.clickable) return
          e.stopPropagation()
          onClick()
        }}
      >
        <boxGeometry args={[0.42, 0.18, 0.025]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={staticIntensity}
        />
      </mesh>
      <Text
        position={[0, -0.17, 0.02]}
        fontSize={0.09}
        color={isLocked ? COLOR_NOMINAL : COLOR_INFO}
        anchorX='center'
        anchorY='middle'
      >
        {node.label}
      </Text>
      {showReactorX && (
        <group position={[0, 0, 0.02]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.36, 0.03, 0.005]} />
            <meshStandardMaterial
              color={COLOR_RED}
              emissive={COLOR_RED}
              emissiveIntensity={0.9}
            />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.36, 0.03, 0.005]} />
            <meshStandardMaterial
              color={COLOR_RED}
              emissive={COLOR_RED}
              emissiveIntensity={0.9}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

interface CableColorTagProps {
  cable: Cable
}

const CableColorTag: React.FC<CableColorTagProps> = ({ cable }) => {
  const a = nodeById(cable.from)
  const b = nodeById(cable.to)
  const cx = (a.x + b.x) / 2
  const cy = (a.y + b.y) / 2

  return (
    <Text
      position={[cx, cy + 0.1, TEXT_Z]}
      fontSize={0.07}
      color={
        cable.dead || cable.severed ? COLOR_WALL_ACCENT : cableHex(cable.color)
      }
      anchorX='center'
      anchorY='middle'
    >
      {cable.color}
    </Text>
  )
}

const isCableLit = (
  cable: Cable,
  lockedSet: Set<NodeId>,
  solved: boolean,
): boolean => {
  if (!cable.partOfBypass) return false
  if (solved) return true
  if (cable.from === 'AUX BATTERY') return lockedSet.has(cable.to)
  if (cable.to === 'POD BAY') return lockedSet.has(cable.from)
  return lockedSet.has(cable.from) && lockedSet.has(cable.to)
}

export const P2_Bypass: React.FC = () => {
  const gated = useGameStore((s) => !s.p1Solved)
  const solved = useGameStore((s) => s.p2Solved)
  const solveP2 = useGameStore((s) => s.solveP2)
  const penalize = useGameStore((s) => s.penalize)
  const cfg = useRunConfig()

  const cables = React.useMemo(() => buildCables(cfg.p3.order), [cfg.p3.order])
  const p2Digit = cfg.p2.digit

  const [clicked, setClicked] = React.useState<NodeId[]>([])
  const [flashing, setFlashing] = React.useState<NodeId | null>(null)
  const flashTimer = React.useRef<number | null>(null)

  React.useEffect(
    () => () => {
      if (flashTimer.current !== null) {
        window.clearTimeout(flashTimer.current)
      }
    },
    [],
  )

  React.useEffect(() => {
    if (solved) return
    if (clicked.length !== SEQUENCE.length) return
    if (clicked.every((id, i) => id === SEQUENCE[i])) {
      solveP2(p2Digit)
    }
  }, [clicked, solved, solveP2, p2Digit])

  if (gated) return null

  const lockedSet: Set<NodeId> = new Set(solved ? SEQUENCE : clicked)
  const nextExpected: NodeId | null = solved
    ? null
    : (SEQUENCE[clicked.length] ?? null)

  const triggerFlash = (id: NodeId) => {
    setFlashing(id)
    if (flashTimer.current !== null) {
      window.clearTimeout(flashTimer.current)
    }
    flashTimer.current = window.setTimeout(() => setFlashing(null), 250)
  }

  const handleClick = (id: NodeId) => {
    if (solved) return
    if (id === nextExpected) {
      setClicked((prev) => [...prev, id])
      return
    }
    triggerFlash(id)
    penalize(5000)
  }

  return (
    <group position={[0, 1.6, 4.95]} rotation={[0, Math.PI, 0]}>
      <mesh>
        <boxGeometry args={[3.5, 2.5, PANEL_DEPTH]} />
        <meshStandardMaterial color={COLOR_PANEL} />
      </mesh>
      <mesh position={[0, 0, PANEL_DEPTH / 2 + 0.001]}>
        <boxGeometry args={[3.3, 2.3, 0.003]} />
        <meshStandardMaterial color={COLOR_BACKPLATE} />
      </mesh>

      <Text
        position={[0, 1.05, TEXT_Z]}
        fontSize={0.12}
        color={COLOR_INFO}
        anchorX='center'
        anchorY='middle'
      >
        ROUTE POWER FROM AUX BATTERY TO POD BAY
      </Text>
      <Text
        position={[0, 0.9, TEXT_Z]}
        fontSize={0.09}
        color={COLOR_INFO}
        anchorX='center'
        anchorY='middle'
      >
        CLICK JUNCTIONS IN ORDER
      </Text>

      <group position={[0, 0.05, 0]}>
        {cables.map((cable) => (
          <CableSegment
            key={cable.from + '->' + cable.to}
            cable={cable}
            litGreen={isCableLit(cable, lockedSet, solved)}
          />
        ))}

        {cables.map((cable) => (
          <CableColorTag
            key={'tag-' + cable.from + '->' + cable.to}
            cable={cable}
          />
        ))}

        {NODES.map((node) => (
          <NodeMarker
            key={node.id}
            node={node}
            isLocked={lockedSet.has(node.id)}
            isFlashing={flashing === node.id}
            pulsing={!solved && node.id === nextExpected}
            onClick={() => handleClick(node.id)}
            showReactorX={node.id === 'REACTOR'}
          />
        ))}
      </group>

      {solved && (
        <group position={[0, -1.05, TEXT_Z]}>
          <mesh position={[0, 0, -0.004]}>
            <boxGeometry args={[3.1, 0.22, 0.004]} />
            <meshStandardMaterial color={COLOR_BACKPLATE} />
          </mesh>
          <Text
            fontSize={0.1}
            color={COLOR_NOMINAL}
            anchorX='center'
            anchorY='middle'
          >
            BYPASS ROUTE LOCKED // POD BAY DOOR UNSEALED
          </Text>
        </group>
      )}
    </group>
  )
}

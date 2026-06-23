'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d'
import * as THREE from 'three'
import type { AssumptionNode } from '@/lib/types'
import { STATE_META } from '@/lib/mock-data'

interface GraphNode extends AssumptionNode {
  x?: number
  y?: number
  z?: number
  fx?: number
  fy?: number
  fz?: number
}

const STATE_OPACITY: Record<string, number> = {
  locked: 0.5,
  active: 1.0,
  surviving: 1.0,
  contested: 1.0,
  killed: 0.55,
  blocked: 0.4,
  pending: 0.5,
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function buildNodeObject(node: AssumptionNode, selected: boolean): THREE.Object3D {
  const meta = STATE_META[node.state]
  const color = meta.color
  const opacity = STATE_OPACITY[node.state]

  const SCALE = 2 // supersample for crispness
  const W = 320
  const H = 132
  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  const pad = 6
  const x = pad
  const y = pad
  const w = W - pad * 2
  const h = H - pad * 2

  // Outer corner HUD brackets for root nodes to distinguish them
  if (node.isRoot) {
    const bLen = 14
    const offset = 4
    const bx1 = x - offset
    const by1 = y - offset
    const bx2 = x + w + offset
    const by2 = y + h + offset

    ctx.strokeStyle = color
    ctx.lineWidth = 2.0
    
    // Top-left bracket
    ctx.beginPath()
    ctx.moveTo(bx1 + bLen, by1)
    ctx.lineTo(bx1, by1)
    ctx.lineTo(bx1, by1 + bLen)
    ctx.stroke()

    // Top-right bracket
    ctx.beginPath()
    ctx.moveTo(bx2 - bLen, by1)
    ctx.lineTo(bx2, by1)
    ctx.lineTo(bx2, by1 + bLen)
    ctx.stroke()

    // Bottom-left bracket
    ctx.beginPath()
    ctx.moveTo(bx1 + bLen, by2)
    ctx.lineTo(bx1, by2)
    ctx.lineTo(bx1, by2 - bLen)
    ctx.stroke()

    // Bottom-right bracket
    ctx.beginPath()
    ctx.moveTo(bx2 - bLen, by2)
    ctx.lineTo(bx2, by2)
    ctx.lineTo(bx2, by2 - bLen)
    ctx.stroke()
  }

  // Body — frosted dark surface
  roundRect(ctx, x, y, w, h, 8)
  ctx.fillStyle = 'rgba(12,12,12,0.96)'
  ctx.fill()

  // Internal glow for surviving / selected
  if (node.state === 'surviving' || selected) {
    ctx.save()
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 7)
    ctx.clip()
    const grad = ctx.createLinearGradient(0, y, 0, y + h)
    grad.addColorStop(0, `${color}1F`)
    grad.addColorStop(0.5, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(x, y, w, h)
    ctx.restore()
  }

  // Border
  roundRect(ctx, x, y, w, h, 8)
  ctx.strokeStyle = selected ? color : `${color}${node.state === 'blocked' ? '66' : 'AA'}`
  ctx.lineWidth = selected ? 2.5 : 1.25
  ctx.stroke()

  // Accent left bar — double thickness for root nodes
  ctx.save()
  roundRect(ctx, x, y, w, h, 8)
  ctx.clip()
  ctx.fillStyle = color
  ctx.fillRect(x, y, node.isRoot ? 6 : 3, h)
  ctx.restore()

  // Dimension + layer eyebrow with special ROOT badge for root cards
  ctx.textBaseline = 'top'
  if (node.isRoot) {
    // Draw a small "ROOT" badge container
    ctx.fillStyle = `${color}25`
    roundRect(ctx, x + 16, y + 13, 44, 18, 4)
    ctx.fill()
    ctx.fillStyle = color
    ctx.font = '700 9px "Geist Mono", monospace'
    ctx.fillText('ROOT', x + 24, y + 17)

    // Offset and draw standard dimension text
    ctx.fillStyle = '#a3a3a3'
    ctx.font = '600 12px Inter, system-ui, sans-serif'
    ctx.fillText(
      `${node.dimension.toUpperCase()}`,
      x + 68,
      y + 16,
    )
  } else {
    ctx.fillStyle = '#8a8a8a'
    ctx.font = '600 12px Inter, system-ui, sans-serif'
    ctx.fillText(
      `${node.dimension.toUpperCase()} · ${node.layer.toUpperCase()}`,
      x + 18,
      y + 16,
    )
  }

  // State dot + label (top right)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x + w - 64, y + 22, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = '600 11px Inter, system-ui, sans-serif'
  ctx.fillText(meta.label.toUpperCase(), x + w - 54, y + 16)

  // Assumption label — wrapped, max 3 lines
  ctx.fillStyle = node.state === 'blocked' ? '#8a8a8a' : '#ffffff'
  ctx.font = '600 17px Inter, system-ui, sans-serif'
  const words = node.label.split(' ')
  const maxWidth = w - 36
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  const shown = lines.slice(0, 3)
  shown.forEach((ln, i) => {
    ctx.fillText(ln, x + 18, y + 44 + i * 22)
  })

  // Confidence bar (bottom)
  const barY = y + h - 22
  ctx.fillStyle = '#8a8a8a'
  ctx.font = '500 11px "Geist Mono", ui-monospace, monospace'
  ctx.fillText('CONFIDENCE', x + 18, barY - 1)
  ctx.fillStyle = color
  ctx.textAlign = 'right'
  ctx.fillText(`${node.confidence}%`, x + w - 18, barY - 1)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#1c1c1c'
  roundRect(ctx, x + 94, barY + 1, w - 150, 4, 2)
  ctx.fill()
  ctx.fillStyle = color
  roundRect(ctx, x + 94, barY + 1, (w - 150) * (node.confidence / 100), 4, 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.minFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: selected ? 1 : opacity,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)
  const baseW = node.isRoot ? 40 : 34
  sprite.scale.set(baseW, baseW * (H / W), 1)
  return sprite
}

export default function DependencyGraph({
  nodes,
  links,
  selectedId,
  onSelect,
}: {
  nodes: AssumptionNode[]
  links: { source: string; target: string }[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const fgRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<string | null>(selectedId)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  // 1. Compute each node's depth in the dependency graph recursively
  const depths = useMemo(() => {
    const computedDepths: Record<string, number> = {}
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    const getDepth = (id: string, visited = new Set<string>()): number => {
      if (computedDepths[id] !== undefined) return computedDepths[id]
      if (visited.has(id)) return 0 // Safeguard to break circular dependencies
      visited.add(id)

      const node = nodeMap.get(id)
      if (!node || !node.dependencies || node.dependencies.length === 0) {
        computedDepths[id] = 0
        return 0
      }

      let maxDep = 0
      for (const depId of node.dependencies) {
        maxDep = Math.max(maxDep, getDepth(depId, new Set(visited)))
      }
      computedDepths[id] = maxDep + 1
      return computedDepths[id]
    }

    nodes.forEach((n) => getDepth(n.id))
    return computedDepths
  }, [nodes])

  // 2. Position nodes in 3D space by depth and spread them out
  const graphData = useMemo(() => {
    // Group nodes by their computed depth level
    const nodesByDepth: Record<number, AssumptionNode[]> = {}
    nodes.forEach((n) => {
      const d = depths[n.id] ?? 0
      if (!nodesByDepth[d]) nodesByDepth[d] = []
      nodesByDepth[d].push(n)
    })

    const mappedNodes = nodes.map((n) => {
      const d = depths[n.id] ?? 0
      const levelNodes = nodesByDepth[d]
      const K = levelNodes.length
      const i = levelNodes.findIndex((ln) => ln.id === n.id)

      // Top of the scene has highest Y value, decreases with depth
      const fy = 100 - d * 38

      // Spread nodes horizontally on the X-axis and slightly on the Z-axis (depth)
      let fx = 0
      let fz = 0

      if (K > 1) {
        const spacingX = 55
        fx = (i - (K - 1) / 2) * spacingX
        // Alternate Z values to create depth/volume
        fz = (i % 2 === 0 ? 1 : -1) * 15
      } else {
        fx = 0
        fz = 0
      }

      return {
        ...n,
        fx,
        fy,
        fz,
      }
    })

    return {
      nodes: mappedNodes as GraphNode[],
      links: links.map((l) => ({ ...l })),
    }
  }, [nodes, links, depths])

  useEffect(() => {
    selectedRef.current = selectedId
    fgRef.current?.refresh()
  }, [selectedId])

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDims({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Forces setup
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    const charge = fg.d3Force('charge') as { strength: (n: number) => void } | undefined
    charge?.strength(-300)
    const linkForce = fg.d3Force('link') as
      | { distance: (d: number) => void }
      | undefined
    linkForce?.distance(50)
  }, [])

  const nodeThreeObject = useCallback((node: GraphNode) => {
    return buildNodeObject(node, selectedRef.current === node.id)
  }, [])

  // Link colors based on source/target node states and selected state
  const linkColor = useCallback((link: any) => {
    const sel = selectedRef.current

    const targetNode = typeof link.target === 'object' ? link.target as GraphNode : nodes.find(n => n.id === link.target)
    const sourceNode = typeof link.source === 'object' ? link.source as GraphNode : nodes.find(n => n.id === link.source)

    const targetState = targetNode?.state || 'locked'
    const sourceState = sourceNode?.state || 'locked'
    
    const sId = sourceNode?.id || (typeof link.source === 'object' ? (link.source as any).id : link.source)
    const tId = targetNode?.id || (typeof link.target === 'object' ? (link.target as any).id : link.target)
    const isSelected = sId === sel || tId === sel

    let baseColor = 'rgba(120, 120, 120, 0.2)'
    if (targetState === 'surviving' && sourceState === 'surviving') {
      baseColor = 'rgba(34, 211, 238, 0.6)' // Bright Cyan
    } else if (targetState === 'active' || targetState === 'contested') {
      baseColor = 'rgba(245, 158, 11, 0.7)' // Bright Amber
    } else if (targetState === 'killed') {
      baseColor = 'rgba(239, 68, 68, 0.3)' // Red
    } else if (targetState === 'blocked') {
      baseColor = 'rgba(82, 82, 82, 0.2)' // Dark grey
    } else if (targetState === 'pending' || targetState === 'locked') {
      baseColor = 'rgba(168, 85, 247, 0.3)' // Dimmed Purple
    }

    if (sel) {
      if (isSelected) {
        return baseColor.replace(/[\d.]+\)$/, '0.9)')
      } else {
        return baseColor.replace(/[\d.]+\)$/, '0.08)')
      }
    }
    return baseColor
  }, [nodes])

  // Link width depending on state & selection
  const linkWidth = useCallback((link: any) => {
    const sel = selectedRef.current
    const targetNode = typeof link.target === 'object' ? link.target as GraphNode : nodes.find(n => n.id === link.target)
    const targetState = targetNode?.state || 'locked'

    const sId = typeof link.source === 'object' ? (link.source as any).id : link.source
    const tId = typeof link.target === 'object' ? (link.target as any).id : link.target
    const isSelected = sId === sel || tId === sel

    let baseWidth = 0.8
    if (targetState === 'surviving' || targetState === 'active' || targetState === 'contested') {
      baseWidth = 1.5
    } else if (targetState === 'killed' || targetState === 'blocked') {
      baseWidth = 0.5
    }

    if (sel) {
      return isSelected ? baseWidth * 1.5 : baseWidth * 0.5
    }
    return baseWidth
  }, [nodes])

  return (
    <div ref={containerRef} className="absolute inset-0">
      {dims.width > 0 && (
        <ForceGraph3D<GraphNode>
          ref={fgRef}
          width={dims.width}
          height={dims.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          showNavInfo={false}
          nodeThreeObject={nodeThreeObject}
          nodeThreeObjectExtend={false}
          nodeLabel={() => ''}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkOpacity={0.6}
          linkDirectionalParticles={(link: any) => {
            const targetNode = typeof link.target === 'object' ? link.target as GraphNode : nodes.find(n => n.id === link.target)
            const targetState = targetNode?.state || 'locked'
            return (targetState === 'active' || targetState === 'contested' || targetState === 'surviving') ? 1 : 0
          }}
          linkDirectionalParticleWidth={(link: any) => {
            const sel = selectedRef.current
            const sId = typeof link.source === 'object' ? (link.source as any).id : link.source
            const tId = typeof link.target === 'object' ? (link.target as any).id : link.target
            const isSelected = sId === sel || tId === sel
            
            const baseW = 1.5
            if (sel) {
              return isSelected ? baseW * 1.4 : baseW * 0.4
            }
            return baseW
          }}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={(link: any) => {
            const targetNode = typeof link.target === 'object' ? link.target as GraphNode : nodes.find(n => n.id === link.target)
            const targetState = targetNode?.state || 'locked'
            if (targetState === 'surviving') return 'rgba(34,211,238,0.7)'
            if (targetState === 'active' || targetState === 'contested') return 'rgba(245,158,11,0.7)'
            return 'rgba(180,180,180,0.5)'
          }}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={0.98}
          linkDirectionalArrowColor={(link: any) => {
            const targetNode = typeof link.target === 'object' ? link.target as GraphNode : nodes.find(n => n.id === link.target)
            const targetState = targetNode?.state || 'locked'
            if (targetState === 'surviving') return 'rgba(34,211,238,0.7)'
            if (targetState === 'active' || targetState === 'contested') return 'rgba(245,158,11,0.7)'
            return 'rgba(120,120,120,0.4)'
          }}
          enableNodeDrag={false}
          onNodeClick={(node: GraphNode) => {
            onSelect(node.id)
            const distance = 90
            const hyp = Math.hypot(node.x ?? 0, node.y ?? 0, node.z ?? 0) || 1
            const ratio = 1 + distance / hyp
            fgRef.current?.cameraPosition(
              {
                x: (node.x ?? 0) * ratio,
                y: (node.y ?? 0) * ratio,
                z: (node.z ?? 0) * ratio,
              },
              { x: node.x ?? 0, y: node.y ?? 0, z: node.z ?? 0 },
              700,
            )
          }}
          onBackgroundClick={() => onSelect(null)}
          onNodeHover={(node: GraphNode | null) => {
            if (containerRef.current) {
              containerRef.current.style.cursor = node ? 'pointer' : 'default'
            }
          }}
          cooldownTicks={120}
          warmupTicks={40}
          onEngineStop={() => {
            fgRef.current?.zoomToFit(700, 60)
          }}
        />
      )}
    </div>
  )
}

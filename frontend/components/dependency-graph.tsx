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

  // Outer ring for root nodes
  if (node.isRoot) {
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12)
    ctx.strokeStyle = `${color}40`
    ctx.lineWidth = 1.5
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

  // Accent left bar
  ctx.save()
  roundRect(ctx, x, y, w, h, 8)
  ctx.clip()
  ctx.fillStyle = color
  ctx.fillRect(x, y, 3, h)
  ctx.restore()

  // Dimension + layer eyebrow
  ctx.fillStyle = '#8a8a8a'
  ctx.font = '600 12px Inter, system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(
    `${node.dimension.toUpperCase()} · ${node.layer.toUpperCase()}`,
    x + 18,
    y + 16,
  )

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

  const graphData = useMemo(
    () => ({
      nodes: nodes.map((n) => {
        let targetY = 0
        if (n.layer === 'Foundational') targetY = 70
        else if (n.layer === 'Structural') targetY = 0
        else if (n.layer === 'Surface') targetY = -70
        return {
          ...n,
          fy: targetY,
        }
      }),
      links: links.map((l) => ({ ...l })),
    }),
    [nodes, links],
  )

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

  // Forces + initial framing
  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    const charge = fg.d3Force('charge') as { strength: (n: number) => void } | undefined
    charge?.strength(-700)
    const linkForce = fg.d3Force('link') as
      | { distance: (d: number) => void }
      | undefined
    linkForce?.distance(80)
  }, [])

  const nodeThreeObject = useCallback((node: GraphNode) => {
    return buildNodeObject(node, selectedRef.current === node.id)
  }, [])

  const linkColor = useCallback((link: { source?: unknown; target?: unknown }) => {
    const sel = selectedRef.current
    if (!sel) return 'rgba(120,120,120,0.22)'
    const idOf = (v: unknown): string =>
      typeof v === 'object' && v !== null
        ? String((v as GraphNode).id)
        : String(v)
    const s = idOf(link.source)
    const t = idOf(link.target)
    return s === sel || t === sel
      ? 'rgba(34,211,238,0.55)'
      : 'rgba(120,120,120,0.12)'
  }, [])

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
          linkWidth={0.6}
          linkOpacity={0.6}
          linkDirectionalParticles={1}
          linkDirectionalParticleWidth={1.4}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={() => 'rgba(180,180,180,0.5)'}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={() => 'rgba(140,140,140,0.6)'}
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

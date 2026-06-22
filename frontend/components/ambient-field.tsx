'use client'

import { useEffect, useRef } from 'react'

/**
 * AmbientField
 * -------------
 * Full-viewport, fixed-position halftone dot field that sits behind the
 * entire app (sidebar, header, cards, panels). Dot SIZE encodes brightness
 * (not opacity) so "empty" space is never truly empty — it's just smaller
 * dots, matching a halftone print look rather than a soft CSS gradient.
 *
 * Cursor interaction: dots near the pointer darken quickly (snappy), then
 * ease back to their resting brightness slowly (the "liquid" settle).
 * The disturbance itself also decays each frame, which is what produces a
 * trailing wake behind the cursor rather than a static spotlight.
 *
 * Hotspot Movement: Spheres (hotspots) float and drift slowly across the screen
 * at a smooth, premium rate (bouncing off the screen edges), making the ambient
 * background feel alive.
 */

interface Hotspot {
  x: number
  y: number
  falloff: number
  vx: number
  vy: number
}

interface Cell {
  disturbance: number
  targetDisturbance: number
  r: number
  g: number
  b: number
}

export interface AmbientFieldProps {
  /** Hex color for the gradient start (default '#d9a7c7') */
  gradientStart?: string
  /** Hex color for the gradient end (default '#fffcdc') */
  gradientEnd?: string
  /** Hex color for the bright stop (near hotspot centers) — e.g. '#e6b45a'. */
  colorBright?: string
  /** Hex color for the mid stop (amber/ochre transition) — e.g. '#a06e32'. */
  colorMid?: string
  /** Hex color for the dark stop (far from hotspots / edges) — e.g. '#322314'. */
  colorDark?: string
  /** Hex color for the dots (deprecated base reference color, defaults to golden bronze). */
  color?: string
  /** Background fill behind the dots — should match your app's base bg. */
  background?: string
  /** Distance between dot centers, in px. Smaller = denser field. */
  cellSize?: number
  /** Number of bright "hotspot" zones scattered across the viewport. */
  hotspotCount?: number
  /** Average radius of each hotspot's bright zone, in px. */
  circleSize?: number
  /** How far the cursor's darkening trail reaches, in px. */
  trailRadius?: number
  /** 1 (short trail) .. 20 (long, lingering trail). */
  trailDuration?: number
}

export function AmbientField({
  gradientStart = '#d9a7c7',
  gradientEnd = '#fffcdc',
  colorBright = '#e6b45a',
  colorMid = '#a06e32',
  colorDark = '#322314',
  color = '#ad8043',
  background = '#050505',
  cellSize = 8,
  hotspotCount = 12,
  circleSize = 320,
  trailRadius = 65,
  trailDuration = 6,
}: AmbientFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const brightRgb = hexToRgb(colorBright)
    const midRgb = hexToRgb(colorMid)
    const darkRgb = hexToRgb(colorDark)
    const colorRgb = hexToRgb(color)

    // ---- mutable simulation state, scoped to this effect run -----------
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let hotspots: Hotspot[] = []
    let cols = 0
    let rows = 0
    let cells: Cell[][] = []

    const MIN_FRACTION = 0.18
    const MAX_FRACTION = 1.0
    const DOT_GAP_RATIO = 0.42
    const DISTURB_EASE = 0.35

    const RECOVER_EASE = 0.28 - trailDuration * 0.008
    const DECAY_RATE = 0.9 + trailDuration * 0.0042

    function rand(min: number, max: number) {
      return min + Math.random() * (max - min)
    }

    function generateHotspots() {
      hotspots = []
      const minSeparation = circleSize * 0.5
      let attempts = 0
      const minX = width > 768 ? 256 : 0
      const maxX = width
      const totalRange = maxX - minX
      const thirdWidth = totalRange / 3

      while (hotspots.length < hotspotCount && attempts < 500) {
        attempts++
        const idx = hotspots.length
        const thirdIndex = idx % 3
        const minXZone = minX + thirdIndex * thirdWidth
        const maxXZone = minXZone + thirdWidth

        const x = rand(minXZone, maxXZone)
        const y = rand(height * 0.05, height * 0.95)
        const tooClose = hotspots.some((h) => Math.hypot(h.x - x, h.y - y) < minSeparation)
        if (!tooClose) {
          hotspots.push({
            x,
            y,
            falloff: circleSize * rand(0.75, 1.15),
            vx: rand(-0.6, 0.6),
            vy: rand(-0.6, 0.6),
          })
        }
      }
      while (hotspots.length < hotspotCount) {
        const idx = hotspots.length
        const thirdIndex = idx % 3
        const minXZone = minX + thirdIndex * thirdWidth
        const maxXZone = minXZone + thirdWidth
        hotspots.push({
          x: rand(minXZone, maxXZone),
          y: rand(height * 0.05, height * 0.95),
          falloff: circleSize * rand(0.75, 1.15),
          vx: rand(-0.6, 0.6),
          vy: rand(-0.6, 0.6),
        })
      }
    }

    function resampleGrid() {
      cols = Math.ceil(width / cellSize)
      rows = Math.ceil(height / cellSize)
      cells = []
      const startRgb = hexToRgb(gradientStart)
      const endRgb = hexToRgb(gradientEnd)

      for (let r = 0; r < rows; r++) {
        const rowArr: Cell[] = []
        for (let c = 0; c < cols; c++) {
          const cx = (c + 0.5) * cellSize
          const cy = (r + 0.5) * cellSize
          const t = Math.max(0.0, Math.min(1.0, (cx / width + cy / height) / 2))
          const rVal = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * t)
          const gVal = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * t)
          const bVal = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * t)

          rowArr.push({
            disturbance: 0,
            targetDisturbance: 0,
            r: rVal,
            g: gVal,
            b: bVal,
          })
        }
        cells.push(rowArr)
      }
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.scale(dpr, dpr)
      generateHotspots()
      resampleGrid()
    }

    let mouseX = -9999
    let mouseY = -9999
    let hasMouse = false

    function handlePointerMove(e: PointerEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
      hasMouse = true
    }
    function handlePointerLeave() {
      hasMouse = false
    }

    // Listen on window, not the canvas — the canvas sits behind interactive
    // elements (cards, sidebar) which would otherwise swallow pointer
    // events before they reach it. This is also why the canvas itself must
    // have pointer-events: none in its CSS, see integration notes below.
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)
    window.addEventListener('resize', resize)

    resize()

    let rafId: number
    function frame() {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, width, height)

      // Move hotspots, apply organic velocity jitter, and bounce off boundaries
      for (const h of hotspots) {
        // Subtle path wander/jitter
        h.vx += rand(-0.015, 0.015)
        h.vy += rand(-0.015, 0.015)

        // Keep speed constrained in a pleasant slow-medium drift range
        const speed = Math.hypot(h.vx, h.vy)
        const maxSpeed = 1.0
        const minSpeed = 0.4
        if (speed > maxSpeed) {
          h.vx = (h.vx / speed) * maxSpeed
          h.vy = (h.vy / speed) * maxSpeed
        } else if (speed < minSpeed) {
          h.vx = (h.vx / (speed || 1)) * minSpeed
          h.vy = (h.vy / (speed || 1)) * minSpeed
        }

        h.x += h.vx
        h.y += h.vy

        // Bounce physics with position correction
        if (h.x < 0) {
          h.x = 0
          h.vx = Math.abs(h.vx)
        } else if (h.x > width) {
          h.x = width
          h.vx = -Math.abs(h.vx)
        }

        if (h.y < 0) {
          h.y = 0
          h.vy = Math.abs(h.vy)
        } else if (h.y > height) {
          h.y = height
          h.vy = -Math.abs(h.vy)
        }
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = cells[r][c]
          const cx = (c + 0.5) * cellSize
          const cy = (r + 0.5) * cellSize

          if (hasMouse) {
            const dx = cx - mouseX
            const dy = cy - mouseY
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < trailRadius) {
              const strength = 1 - dist / trailRadius
              cell.targetDisturbance = Math.max(cell.targetDisturbance, strength)
            }
          }

          if (cell.targetDisturbance > cell.disturbance) {
            cell.disturbance += (cell.targetDisturbance - cell.disturbance) * DISTURB_EASE
          } else {
            cell.disturbance += (cell.targetDisturbance - cell.disturbance) * RECOVER_EASE
          }
          cell.targetDisturbance *= DECAY_RATE

          // Additive metaball blending for soft merge/divide transitions
          let sumBrightnessInfluence = 0
          let sumSizeInfluence = 0
          for (const h of hotspots) {
            const dx = cx - h.x
            const dy = cy - h.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const influence = Math.max(0, 1 - dist / h.falloff)
            sumBrightnessInfluence += influence * influence
            sumSizeInfluence += Math.pow(influence, 3) // Steeper size falloff for tight clustering
          }

          const brightnessFraction = Math.min(1.0, sumBrightnessInfluence)
          const effectiveBrightnessFraction = brightnessFraction * (1 - cell.disturbance * 0.92)

          const sizeFraction = MIN_FRACTION + Math.min(1.0, sumSizeInfluence) * (MAX_FRACTION - MIN_FRACTION)
          const effectiveSizeFraction = sizeFraction * (1 - cell.disturbance * 0.92)

          const maxDiameter = cellSize * DOT_GAP_RATIO
          const diameter = maxDiameter * effectiveSizeFraction
          const radius = Math.max(0.3, diameter / 2)

          if (radius < 0.35) continue

          ctx.beginPath()
          ctx.fillStyle = `rgba(${cell.r}, ${cell.g}, ${cell.b}, ${effectiveBrightnessFraction * 0.48})`
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      rafId = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      window.removeEventListener('resize', resize)
    }
  }, [gradientStart, gradientEnd, colorBright, colorMid, colorDark, color, background, cellSize, hotspotCount, circleSize, trailRadius, trailDuration])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ width: '100vw', height: '100vh', display: 'block' }}
    />
  )
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

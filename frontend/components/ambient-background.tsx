'use client'

import { useEffect, useRef } from 'react'

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Precompute strand configs (5–8 independent wavy line strands)
    const numStrands = 6
    const strands = Array.from({ length: numStrands }, (_, idx) => {
      return {
        baseY: height * (0.15 + (idx / numStrands) * 0.7),
        amplitude1: 15 + Math.random() * 25,
        amplitude2: 5 + Math.random() * 10,
        speed1: 0.005 + Math.random() * 0.01,
        speed2: 0.015 + Math.random() * 0.02,
        freq1: 0.002 + Math.random() * 0.003,
        freq2: 0.01 + Math.random() * 0.015,
        seed1: Math.random() * Math.PI * 2,
        seed2: Math.random() * Math.PI * 2,
        opacity: 0.12 + Math.random() * 0.14, // Opacity in range 0.12 - 0.26
        scrollSpeed: 0.2 + Math.random() * 0.4,
        xOffset: Math.random() * width,
      }
    })

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      strands.forEach((s, idx) => {
        s.baseY = height * (0.15 + (idx / numStrands) * 0.7)
      })
    }

    window.addEventListener('resize', resize)
    resize()

    let t = 0
    const cols = 28
    const rows = 14

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      t += 0.012

      // 1. Draw Wireframe Terrain Grid (lower-left to lower-middle area)
      const gridOriginX = width * 0.35
      const gridOriginY = height * 0.75
      const gridPoints: { x: number; y: number }[][] = []

      for (let r = 0; r < rows; r++) {
        const rowPoints: { x: number; y: number }[] = []
        const depth = r / (rows - 1)
        const scale = 0.45 + depth * 0.55
        for (let c = 0; c < cols; c++) {
          const normC = (c / (cols - 1)) - 0.5
          const gridWidth = width * 1.1 * scale
          const baseX = gridOriginX + normC * gridWidth
          const baseY = gridOriginY + (depth - 0.5) * height * 0.28

          const waveFreqX = 0.25
          const waveFreqY = 0.45
          const heightAmp = 18 * scale
          const heightOffset = (
            Math.sin(c * waveFreqX + r * waveFreqY + t) * 0.65 +
            Math.cos(c * 0.4 - r * 0.2 - t * 0.7) * 0.35
          ) * heightAmp

          rowPoints.push({ x: baseX, y: baseY - heightOffset })
        }
        gridPoints.push(rowPoints)
      }

      ctx.lineWidth = 0.85
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)'

      // Horizontal lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath()
        for (let c = 0; c < cols; c++) {
          const pt = gridPoints[r][c]
          if (c === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        }
        ctx.stroke()
      }

      // Vertical lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath()
        for (let r = 0; r < rows; r++) {
          const pt = gridPoints[r][c]
          if (r === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        }
        ctx.stroke()
      }

      // 2. Draw Drifting Noise Threads
      ctx.lineWidth = 0.8
      strands.forEach((s) => {
        s.xOffset += s.scrollSpeed
        if (s.xOffset > width) {
          s.xOffset -= width
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`
        ctx.beginPath()

        const numSegments = 60
        for (let i = 0; i <= numSegments; i++) {
          const fraction = i / numSegments
          const segmentX = fraction * width
          const evalX = (segmentX - s.xOffset + width) % width

          const wave1 = Math.sin(evalX * s.freq1 + t * s.speed1 + s.seed1) * s.amplitude1
          const wave2 = Math.sin(evalX * s.freq2 - t * s.speed2 + s.seed2) * s.amplitude2

          const segmentY = s.baseY + wave1 + wave2

          if (i === 0) ctx.moveTo(segmentX, segmentY)
          else ctx.lineTo(segmentX, segmentY)
        }
        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ display: 'block', width: '100vw', height: '100vh' }}
    />
  )
}

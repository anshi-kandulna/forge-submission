'use client'

import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown, Cpu, Users, Briefcase } from 'lucide-react'
import { useRef, useEffect, useState, useCallback } from 'react'
import type { PersonaName } from '@/lib/types'

interface PersonaIntroProps {
  onBegin: () => void
}

interface PersonaInfo {
  name: PersonaName
  role: string
  trait: string
  icon: any
  accentColor: string
  // depth: 1 = foreground (largest/closest), 2 = mid, 3 = background (smallest/farthest)
  depth: 1 | 2 | 3
  // Globe surface anchor as percentage of the container [0..100]
  // x: horizontal position matching actual country geography
  // y: vertical depth into the globe (higher % = lower/deeper on sphere)
  globeAnchor: { x: number; y: number }
  // Shifts the card DOWN by this many px → shorter golden line for that persona
  cardTopOffset: number
}

const PERSONAS: PersonaInfo[] = [
  {
    name: 'Market Skeptic',
    role: 'Questions demand, timing, and market fit.',
    trait: 'Skeptical',
    icon: TrendingDown,
    accentColor: '#a78bfa',
    depth: 3,
    // UK / Western Scandinavia — background, high on the sphere (far side)
    globeAnchor: { x: 30, y: 78 },
    cardTopOffset: 60, // card pushed down → shorter line
  },
  {
    name: 'Technical Expert',
    role: 'Evaluates feasibility, technical risk, and scalability.',
    trait: 'Analytical',
    icon: Cpu,
    accentColor: '#22d3ee',
    depth: 1,
    // Central Europe — inland Germany / Poland, foreground
    globeAnchor: { x: 49, y: 82 },
    cardTopOffset: 0, // tallest column → longest line
  },
  {
    name: 'Customer Persona',
    role: "Represents the end user's actual needs and adoption behavior.",
    trait: 'User-focused',
    icon: Users,
    accentColor: '#f59e0b',
    depth: 1,
    // Middle East / Arabian Peninsula — foreground
    globeAnchor: { x: 59, y: 81 },
    cardTopOffset: 20, // medium-long line
  },
  {
    name: 'Operations Expert',
    role: 'Challenges execution, operations, and delivery risk.',
    trait: 'Pragmatic',
    icon: Briefcase,
    accentColor: '#34d399',
    depth: 2,
    // India / SE Asia — midground
    globeAnchor: { x: 73, y: 85 },
    cardTopOffset: 40, // medium-short line
  },
]

// Depth → visual properties
const DEPTH_PROPS = {
  1: { scale: 1.00, opacity: 1.00, cardH: 158, textSz: '10px', badgeSz: '9px',   lineW: 1.3, dotR: 4.5 },
  2: { scale: 0.90, opacity: 0.88, cardH: 142, textSz: '9.5px', badgeSz: '8.5px', lineW: 0.9, dotR: 3.5 },
  3: { scale: 0.80, opacity: 0.72, cardH: 126, textSz: '9px',  badgeSz: '8px',   lineW: 0.6, dotR: 2.5 },
}

type LineEndpoint = { bx: number; by: number; gx: number; gy: number } | null

export function PersonaIntro({ onBegin }: PersonaIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null])
  const [lines, setLines] = useState<LineEndpoint[]>([null, null, null, null])
  const [ready, setReady] = useState(false)

  const measureLines = useCallback(() => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const cw = containerRect.width
    const ch = containerRect.height

    const newLines: LineEndpoint[] = PERSONAS.map((p, idx) => {
      const el = bubbleRefs.current[idx]
      if (!el) return null
      const r = el.getBoundingClientRect()
      // Bubble bottom-centre in container-local coords
      const bx = r.left - containerRect.left + r.width / 2
      const by = r.bottom - containerRect.top

      // Globe anchor in container-local coords
      const gx = (p.globeAnchor.x / 100) * cw
      const gy = (p.globeAnchor.y / 100) * ch

      return { bx, by, gx, gy }
    })

    setLines(newLines)
    setReady(true)
  }, [])

  useEffect(() => {
    // Wait for layout to settle then measure
    const raf = requestAnimationFrame(() => {
      setTimeout(measureLines, 80)
    })
    window.addEventListener('resize', measureLines)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measureLines)
    }
  }, [measureLines])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden flex flex-col"
      style={{ background: 'transparent' }}
    >
      {/* ── Globe image + glow rim ────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <div
          className="absolute bottom-0 left-1/2 w-full max-w-7xl"
          style={{
            transform: 'translate(-50%, 14%) scale(1.15)',
            aspectRatio: '1672 / 941',
            height: 'auto',
          }}
        >
          <img
            src="/globe-bg.png"
            alt="Globe Background"
            className="w-full h-full object-cover opacity-65"
            style={{
              maskImage: 'radial-gradient(ellipse at 50% 100%, black 50%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 50% 100%, black 50%, transparent 90%)',
            }}
          />
          {/* Horizon glow (circle-fit aligned) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none z-0"
            style={{
              width: '123.56%',
              aspectRatio: '1',
              bottom: '-164.5%',
              background: 'radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.15) 0%, transparent 50%)',
              borderTop: '1.5px solid rgba(34,211,238,0.40)',
              boxShadow: '0 -15px 45px rgba(34,211,238,0.22)',
              filter: 'blur(0.5px)',
            }}
          />
        </div>
      </div>

      {/* ── Golden thread SVG ─────────────────────────────────────────── */}
      {ready && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
          {lines.map((ln, idx) => {
            if (!ln) return null
            const p = PERSONAS[idx]
            const dp = DEPTH_PROPS[p.depth]
            return (
              <g key={p.name}>
                {/* Line: bubble base → globe surface */}
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: p.depth === 1 ? 0.75 : p.depth === 2 ? 0.55 : 0.38 }}
                  transition={{ duration: 0.9, delay: idx * 0.15 + 0.5, ease: 'easeOut' }}
                  x1={ln.bx} y1={ln.by}
                  x2={ln.gx} y2={ln.gy}
                  stroke="#d4a843"
                  strokeWidth={dp.lineW}
                  strokeLinecap="round"
                />
                {/* Globe surface origin dot */}
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.15 + 0.55 }}
                  cx={ln.gx} cy={ln.gy}
                  r={dp.dotR}
                  fill="#d4a843"
                  style={{ filter: `drop-shadow(0 0 ${dp.dotR * 2}px #d4a843bb)` }}
                />
                {/* Expanding pulse ring on globe dot */}
                <motion.circle
                  initial={{ r: dp.dotR, opacity: 0.7 }}
                  animate={{ r: dp.dotR * 4, opacity: 0 }}
                  transition={{ duration: 1.8, delay: idx * 0.15 + 0.7, repeat: Infinity, ease: 'easeOut' }}
                  cx={ln.gx} cy={ln.gy}
                  fill="none"
                  stroke="#d4a843"
                  strokeWidth="0.8"
                />
              </g>
            )
          })}
        </svg>
      )}

      {/* ── Main content (upper zone) ─────────────────────────────────── */}
      <div className="relative z-20 mx-auto max-w-5xl px-8 w-full flex flex-col" style={{ paddingTop: '2rem' }}>

        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-6"
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
            Stage 02 · Team Selection
          </div>
          <h1 className="mt-2 font-mono text-[22px] font-bold tracking-[0.12em] uppercase text-foreground">
            Meet your AI personas
          </h1>
          <p className="mt-2 font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
            We've selected 4 specialized analysts to challenge your business thesis, stressing your assumptions from every angle.
          </p>
        </motion.div>

        {/* 4-column persona grid — lives in the UPPER empty space above the globe */}
        <div className="grid grid-cols-4 gap-4 w-full items-start">
          {PERSONAS.map((p, idx) => {
            const dp = DEPTH_PROPS[p.depth]
            const bubbleDelay = idx * 0.15 + 0.20
            const cardDelay   = idx * 0.15 + 0.30

            return (
              <div
                key={p.name}
                className="relative flex flex-col items-center w-full"
                style={{ opacity: dp.opacity, paddingTop: `${p.cardTopOffset}px` }}
              >
                {/* Chat Bubble — measured for line attachment */}
                <motion.div
                  ref={el => { bubbleRefs.current[idx] = el }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 18, delay: bubbleDelay }}
                  onAnimationComplete={measureLines}
                  className="mb-2 px-3 py-2 rounded-xl relative z-20 shadow-lg text-center"
                  style={{
                    transform: `scale(${dp.scale})`,
                    transformOrigin: 'bottom center',
                    background: 'rgba(8, 13, 28, 0.97)',
                    border: `1px solid ${p.accentColor}`,
                    boxShadow: `0 0 20px ${p.accentColor}20`,
                  }}
                >
                  <span
                    className="font-mono font-semibold uppercase tracking-[0.13em] whitespace-nowrap"
                    style={{ fontSize: dp.textSz, color: '#e4e8f5' }}
                  >
                    {p.name}
                  </span>
                  {/* Pointer tail pointing down toward the globe */}
                  <div
                    className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
                    style={{
                      background: 'rgba(8, 13, 28, 0.97)',
                      borderRight: `1px solid ${p.accentColor}`,
                      borderBottom: `1px solid ${p.accentColor}`,
                    }}
                  />
                </motion.div>

                {/* Persona Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: cardDelay }}
                  className="flex flex-col justify-between p-4 w-full relative z-10"
                  style={{
                    height: `${dp.cardH * dp.scale}px`,
                    borderTop: `2px solid ${p.accentColor}`,
                    borderLeft: '1px solid rgba(255,255,255,0.07)',
                    borderRight: '1px solid rgba(255,255,255,0.07)',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(10, 15, 30, 0.55)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    borderRadius: '14px',
                  }}
                >
                  <div className="flex-1 flex flex-col justify-center">
                    <p
                      className="font-mono leading-relaxed line-clamp-4"
                      style={{ fontSize: dp.textSz, color: 'rgba(255,255,255,0.82)' }}
                    >
                      {p.role}
                    </p>
                  </div>
                  <div className="mt-2 shrink-0">
                    <span
                      className="inline-flex items-center px-2 py-0.5 font-mono font-medium uppercase tracking-[0.14em]"
                      style={{
                        fontSize: dp.badgeSz,
                        color: p.accentColor,
                        border: `1px solid ${p.accentColor}40`,
                        background: 'rgba(4, 7, 18, 0.90)',
                        borderRadius: '4px',
                      }}
                    >
                      {p.trait}
                    </span>
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Begin Analysis button — pinned to bottom ───────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
        className="relative z-20 text-center mt-auto mb-8"
      >
        <button
          onClick={onBegin}
          className="inline-flex items-center gap-2 px-8 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer"
          style={{
            background: '#000000',
            border: '1px solid #22d3ee',
            color: '#22d3ee',
            borderRadius: '12px',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,211,238,0.07)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#000000' }}
        >
          Begin Analysis
          <ArrowRight className="size-4" strokeWidth={2} />
        </button>
      </motion.div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown, Cpu, Users, Briefcase } from 'lucide-react'
import { PERSONA_AVATARS } from '@/lib/personas'
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
}

const PERSONAS: PersonaInfo[] = [
  {
    name: 'Market Skeptic',
    role: 'Questions demand, timing, and market fit.',
    trait: 'Skeptical',
    icon: TrendingDown,
    accentColor: '#a78bfa',
  },
  {
    name: 'Technical Expert',
    role: 'Evaluates feasibility, technical risk, and scalability.',
    trait: 'Analytical',
    icon: Cpu,
    accentColor: '#22d3ee',
  },
  {
    name: 'Customer Persona',
    role: "Represents the end user's actual needs and adoption behavior.",
    trait: 'User-focused',
    icon: Users,
    accentColor: '#f59e0b',
  },
  {
    name: 'Operations Expert',
    role: 'Challenges execution, operations, and delivery risk.',
    trait: 'Pragmatic',
    icon: Briefcase,
    accentColor: '#34d399',
  },
]

export function PersonaIntro({ onBegin }: PersonaIntroProps) {
  return (
    <div className="h-full overflow-hidden" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-5xl px-8 h-full flex flex-col justify-between py-8 min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto shrink-0 pt-10"
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 w-full flex-1 my-6 items-center">
          {PERSONAS.map((p, idx) => {
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="liquid-glass flex flex-col justify-between p-5 h-[300px] relative transition-all"
                style={{ borderTop: `2px solid ${p.accentColor}` }}
              >
                <div className="flex-1 flex flex-col">
                  {/* Avatar Image */}
                  <div
                    className="w-full h-[140px] overflow-hidden mb-3 flex items-center justify-center shrink-0 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <img
                      src={PERSONA_AVATARS[p.name]}
                      alt={p.name}
                      className="w-full h-full object-cover object-center"
                      style={{ filter: 'grayscale(30%) contrast(1.05)' }}
                    />
                  </div>

                  {/* Persona name */}
                  <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground">
                    {p.name}
                  </h3>

                  {/* Role description */}
                  <p className="mt-1 font-mono text-[10px] leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    {p.role}
                  </p>
                </div>

                {/* Trait Badge */}
                <div className="mt-3 shrink-0">
                  <span
                    className="inline-flex items-center px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
                    style={{
                      color: p.accentColor,
                      border: `1px solid ${p.accentColor}50`,
                      background: '#0f172a',
                      borderRadius: '4px',
                    }}
                  >
                    {p.trait}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center shrink-0 mb-8"
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
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,211,238,0.07)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#000000' }}
          >
            Begin Analysis
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

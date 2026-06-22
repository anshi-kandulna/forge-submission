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
  colorClass: string
  avatarBg: string
}

const PERSONAS: PersonaInfo[] = [
  {
    name: 'Market Skeptic',
    role: 'Questions demand, timing, and market fit.',
    trait: 'Skeptical',
    icon: TrendingDown,
    colorClass: 'text-purple-400 border-purple-500/20 bg-purple-500/10',
    avatarBg: 'bg-purple-950/20 text-purple-400 border-purple-800/40',
  },
  {
    name: 'Technical Expert',
    role: 'Evaluates feasibility, technical risk, and scalability.',
    trait: 'Analytical',
    icon: Cpu,
    colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10',
    avatarBg: 'bg-cyan-950/20 text-cyan-400 border-cyan-800/40',
  },
  {
    name: 'Customer Persona',
    role: "Represents the end user's actual needs and adoption behavior.",
    trait: 'User-focused',
    icon: Users,
    colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
    avatarBg: 'bg-amber-950/20 text-amber-400 border-amber-800/40',
  },
  {
    name: 'Operations Expert',
    role: 'Challenges execution, operations, and delivery risk.',
    trait: 'Pragmatic',
    icon: Briefcase,
    colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
    avatarBg: 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40',
  },
]

export function PersonaIntro({ onBegin }: PersonaIntroProps) {
  return (
    <div className="h-full overflow-hidden bg-transparent">
      <div className="mx-auto max-w-5xl px-8 h-full flex flex-col justify-between py-8 min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto shrink-0"
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Stage 02 · Team Selection
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Meet your AI personas
          </h1>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            We've selected 4 specialized analysts to challenge your business thesis, stressing your assumptions from every angle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full flex-1 my-6 items-center">
          {PERSONAS.map((p, idx) => {
            return (
               <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="liquid-glass flex flex-col justify-between border border-border/40 p-5 h-[300px] relative transition-colors hover:bg-surface-2/10"
              >
                <div className="flex-1 flex flex-col">
                  {/* Avatar Image Slot */}
                  <div className="w-full h-[140px] rounded-xl overflow-hidden mb-3 border border-border/20 bg-surface-2/20 flex items-center justify-center shrink-0">
                    <img
                      src={PERSONA_AVATARS[p.name]}
                      alt={p.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  
                  {/* Persona name */}
                  <h3 className="text-[13px] font-semibold text-foreground tracking-tight">
                    {p.name}
                  </h3>
                  
                  {/* Role description */}
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground font-light line-clamp-2">
                    {p.role}
                  </p>
                </div>

                {/* Trait Pill */}
                <div className="mt-3 shrink-0">
                  <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] ${p.colorClass}`}>
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
          className="text-center shrink-0"
        >
          <button
            onClick={onBegin}
            className="liquid-glass inline-flex items-center gap-2 px-6 py-3 text-[13px] font-semibold text-foreground hover:bg-surface-2/20 cursor-pointer transition-colors relative"
          >
            Let's Begin
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

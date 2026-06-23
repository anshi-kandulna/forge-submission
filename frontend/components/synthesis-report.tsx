'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Compass,
  Loader2,
  Shield,
  TriangleAlert,
} from 'lucide-react'
import type { ExecutionPlan } from '@/lib/types'

interface PivotPoint {
  assumption: string
  why_it_failed: string
  possible_pivot: string
}

interface PivotData {
  summary: string
  pivot_points: PivotPoint[]
}

export function SynthesisReport({
  plan,
  pivot,
  onSynthesize,
  isSynthesizing,
}: {
  plan: ExecutionPlan
  pivot?: PivotData | null
  onSynthesize?: () => void
  isSynthesizing?: boolean
}) {
  if (pivot) {
    return <PivotView pivot={pivot} onRetry={onSynthesize} />
  }

  const score = plan.validationScore
  const tone = score >= 70 ? '#22d3ee' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="scrollbar-thin h-full overflow-y-auto" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Stage 04 · Synthesis
        </div>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="font-mono text-[22px] font-bold tracking-[0.12em] uppercase text-foreground">
            Execution Plan
          </h1>
          {onSynthesize && (
            <button
              onClick={onSynthesize}
              disabled={isSynthesizing}
              className="inline-flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors disabled:opacity-40 cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.60)', background: 'transparent' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.14)' }}
            >
              {isSynthesizing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ArrowRight className="size-3.5" strokeWidth={2} />
              )}
              {isSynthesizing ? 'Synthesizing…' : 'Re-synthesize'}
            </button>
          )}
        </div>
        <p className="mt-2 max-w-2xl font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
          Synthesized exclusively from assumptions that survived adversarial
          validation. Killed and blocked assumptions are excluded from the
          recommended path.
        </p>

        {/* Score banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="liquid-glass mt-6 flex items-center gap-6 p-6"
          style={{ borderLeft: `2px solid ${tone}` }}
        >
          <div className="relative flex size-20 items-center justify-center">
            <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke={tone}
                strokeWidth="4"
                strokeLinecap="square"
                strokeDasharray={`${(score / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-tabular font-mono text-[20px] font-bold" style={{ color: tone }}>
                {score}
              </span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Validation Score
            </div>
            <div className="mt-1 font-mono text-[14px] font-semibold uppercase tracking-[0.10em]" style={{ color: tone }}>
              {score >= 70 ? 'Validated' : score >= 50 ? 'Conditionally Validated' : 'Needs Work'}
            </div>
            <p className="mt-1 max-w-md font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {plan.primaryStrategy}
            </p>
          </div>
        </motion.div>

        {/* Strategy */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <StrategyCard icon={Compass} label="Primary Strategy" body={plan.primaryStrategy} accent="#22d3ee" />
          <StrategyCard icon={Shield} label="Fallback Strategy" body={plan.fallbackStrategy} accent="#525252" />
        </div>

        {/* Risks */}
        <SectionTitle icon={TriangleAlert}>Top Risks</SectionTitle>
        <div className="liquid-glass">
          {plan.topRisks.map((risk, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3"
              style={{ borderBottom: i < plan.topRisks.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
            >
              {/* Cyan square bullet */}
              <span
                className="mt-1.5 size-1.5 shrink-0"
                style={{
                  background: risk.severity === 'High' ? '#ef4444' : risk.severity === 'Medium' ? '#f59e0b' : '#525252',
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-medium text-foreground">{risk.title}</span>
                  <span
                    className="px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]"
                    style={{
                      color: risk.severity === 'High' ? '#ef4444' : risk.severity === 'Medium' ? '#f59e0b' : '#525252',
                      border: `1px solid ${risk.severity === 'High' ? '#ef444430' : risk.severity === 'Medium' ? '#f59e0b30' : '#52525230'}`,
                    }}
                  >
                    {risk.severity}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>{risk.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <SectionTitle icon={Calendar}>Phased Plan</SectionTitle>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <PhaseCard label="30-Day" items={plan.plan30} />
          <PhaseCard label="60-Day" items={plan.plan60} />
          <PhaseCard label="90-Day" items={plan.plan90} />
        </div>

        {/* First action */}
        <div
          className="mt-4 flex items-start gap-3 p-5"
          style={{ border: '1px solid rgba(34,211,238,0.20)', background: 'rgba(34,211,238,0.04)', borderLeft: '2px solid #22d3ee' }}
        >
          <ArrowRight className="size-4 mt-0.5 shrink-0" strokeWidth={2} style={{ color: '#22d3ee' }} />
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: '#22d3ee' }}>
              First Action
            </div>
            <p className="mt-1 font-mono text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.70)' }}>{plan.firstAction}</p>
          </div>
        </div>

        {/* Uncertainty */}
        <SectionTitle>Uncertainty Notes</SectionTitle>
        <ul className="mb-6 flex flex-col gap-2">
          {plan.uncertaintyNotes.map((note, i) => (
            <li key={i} className="flex items-start gap-2.5 font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <span className="mt-2 size-1 shrink-0" style={{ background: '#22d3ee' }} />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PivotView({ pivot, onRetry }: { pivot: PivotData; onRetry?: () => void }) {
  return (
    <div className="scrollbar-thin h-full overflow-y-auto" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Stage 04 · Synthesis
        </div>
        <h1 className="mt-2 font-mono text-[22px] font-bold tracking-[0.12em] uppercase text-foreground">
          No Surviving Path
        </h1>
        {/* Pivot callout */}
        <div
          className="mt-4 p-4"
          style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)', borderLeft: '2px solid #ef4444' }}
        >
          <p className="font-mono text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{pivot.summary}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {pivot.pivot_points.map((p, i) => (
            <div
              key={i}
              className="liquid-glass p-5"
            >
              <div className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Pivot {String(i + 1).padStart(2, '0')}
              </div>
              <div className="mt-2 font-mono text-[13px] font-semibold uppercase tracking-[0.08em] text-foreground">{p.assumption}</div>
              <p className="mt-2 font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
                <span className="font-medium" style={{ color: '#ef4444' }}>Why it failed: </span>{p.why_it_failed}
              </p>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
                <span className="font-medium" style={{ color: '#22d3ee' }}>Possible pivot: </span>{p.possible_pivot}
              </p>
            </div>
          ))}
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.60)', background: 'transparent' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#22d3ee'; (e.currentTarget as HTMLButtonElement).style.color = '#22d3ee' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.60)' }}
          >
            Re-synthesize after resolving nodes
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}

function StrategyCard({ icon: Icon, label, body, accent }: { icon: typeof Compass; label: string; body: string; accent: string }) {
  return (
    <div
      className="liquid-glass p-5"
      style={{ borderLeft: `2px solid ${accent}` }}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-3.5" strokeWidth={1.5} style={{ color: accent }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      </div>
      <p className="mt-2.5 font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{body}</p>
    </div>
  )
}

function PhaseCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div
      className="liquid-glass p-5"
      style={{ borderTop: '2px solid #22d3ee' }}
    >
      <div className="mb-3 flex items-center justify-between pb-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.10em] text-foreground">{label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.30)' }}>Plan</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 font-mono text-[10px]" style={{ color: '#22d3ee' }}>{String(i + 1).padStart(2, '0')}</span>
            <span className="font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionTitle({ icon: Icon, children }: { icon?: typeof Compass; children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-2">
      {Icon && <Icon className="size-3.5" strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.35)' }} />}
      <h2 className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{children}</h2>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}
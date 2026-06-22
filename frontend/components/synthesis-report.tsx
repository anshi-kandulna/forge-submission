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
  // If no surviving path, show pivot view
  if (pivot) {
    return <PivotView pivot={pivot} onRetry={onSynthesize} />
  }

  const score = plan.validationScore
  const tone = score >= 70 ? '#22d3ee' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="scrollbar-thin h-full overflow-y-auto bg-transparent">
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Stage 04 · Synthesis
        </div>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Execution Plan
          </h1>
          {onSynthesize && (
            <button
              onClick={onSynthesize}
              disabled={isSynthesizing}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px] font-medium text-secondary-foreground transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-40"
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
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Synthesized exclusively from assumptions that survived adversarial
          validation. Killed and blocked assumptions are excluded from the
          recommended path.
        </p>

        {/* Validation score banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6 flex items-center gap-6 rounded-lg border border-border/40 liquid-glass p-6"
        >
          <div className="relative flex size-20 items-center justify-center">
            <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1c1c1c" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke={tone}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-tabular text-xl font-semibold" style={{ color: tone }}>
                {score}
              </span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Validation Score
            </div>
            <div className="mt-1 text-[15px] font-semibold text-foreground">
              {score >= 70 ? 'Validated' : score >= 50 ? 'Conditionally Validated' : 'Needs Work'}
            </div>
            <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">
              {plan.primaryStrategy}
            </p>
          </div>
        </motion.div>

        {/* Strategy */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <StrategyCard icon={Compass} label="Primary Strategy" body={plan.primaryStrategy} accent="#22d3ee" />
          <StrategyCard icon={Shield} label="Fallback Strategy" body={plan.fallbackStrategy} accent="#8a8a8a" />
        </div>

        {/* Risks */}
        <SectionTitle icon={TriangleAlert}>Top Risks</SectionTitle>
        <div className="overflow-hidden rounded-lg border border-border/40 liquid-glass">
          {plan.topRisks.map((risk, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border-b border-border/40 bg-transparent px-4 py-3 last:border-b-0"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                strokeWidth={1.5}
                style={{
                  color: risk.severity === 'High' ? '#ef4444' : risk.severity === 'Medium' ? '#f59e0b' : '#8a8a8a',
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">{risk.title}</span>
                  <span
                    className="rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]"
                    style={{
                      color: risk.severity === 'High' ? '#ef4444' : risk.severity === 'Medium' ? '#f59e0b' : '#8a8a8a',
                      borderColor: `${risk.severity === 'High' ? '#ef4444' : risk.severity === 'Medium' ? '#f59e0b' : '#8a8a8a'}33`,
                    }}
                  >
                    {risk.severity}
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{risk.detail}</p>
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
          className="mt-4 flex items-start gap-3 rounded-lg border backdrop-blur-[20px] saturate-[1.4] p-5"
          style={{ borderColor: '#22d3ee33', backgroundColor: '#22d3ee0A' }}
        >
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: '#22d3ee1A' }}
          >
            <ArrowRight className="size-4" strokeWidth={2} style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: '#22d3ee' }}>
              First Action
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-secondary-foreground">{plan.firstAction}</p>
          </div>
        </div>

        {/* Uncertainty */}
        <SectionTitle>Uncertainty Notes</SectionTitle>
        <ul className="mb-6 flex flex-col gap-2">
          {plan.uncertaintyNotes.map((note, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[12px] leading-relaxed text-muted-foreground">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
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
    <div className="scrollbar-thin h-full overflow-y-auto bg-transparent">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Stage 04 · Synthesis
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          No Surviving Path
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-secondary-foreground">{pivot.summary}</p>

        <div className="mt-6 flex flex-col gap-3">
          {pivot.pivot_points.map((p, i) => (
            <div key={i} className="rounded-lg border border-border/40 liquid-glass p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Pivot {i + 1}
              </div>
              <div className="mt-2 text-[14px] font-semibold text-foreground">{p.assumption}</div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-red-400">Why it failed: </span>{p.why_it_failed}
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                <span className="font-medium text-cyan-400">Possible pivot: </span>{p.possible_pivot}
              </p>
            </div>
          ))}
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer"
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
    <div className="rounded-lg border border-border/40 liquid-glass p-5">
      <div className="flex items-center gap-2">
        <Icon className="size-4" strokeWidth={1.5} style={{ color: accent }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-secondary-foreground">{body}</p>
    </div>
  )
}

function PhaseCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border/40 liquid-glass p-5">
      <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2.5">
        <span className="text-[13px] font-semibold text-foreground">{label}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Plan</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-[12px] leading-relaxed text-secondary-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionTitle({ icon: Icon, children }: { icon?: typeof Compass; children: React.ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-2">
      {Icon && <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />}
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{children}</h2>
    </div>
  )
}
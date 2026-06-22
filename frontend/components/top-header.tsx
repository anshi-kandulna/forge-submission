'use client'

import { cn } from '@/lib/utils'

interface Stats {
  total: number
  surviving: number
  contested: number
  killed: number
  blocked: number
}

export function TopHeader({
  stats,
  validationScore,
  graphId,
}: {
  stats: Stats
  validationScore: number
  graphId: string
}) {
  return (
    <header className="flex h-[88px] shrink-0 items-stretch mt-3 mx-3 liquid-glass">
      <div className="flex min-w-0 flex-1 items-center gap-4 px-5">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            Autonomous AP/AR Agent
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Assumption Dependency Graph
          </div>
        </div>
        <span
          className="ml-1 inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface-3/30 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-secondary-foreground"
        >
          <span className="size-1.5 rounded-full" style={{ backgroundColor: '#22d3ee' }} />
          Analyzed
        </span>
      </div>

      <div className="hidden items-stretch divide-x divide-border border-l border-border md:flex">
        <Kpi label="Assumptions" value={stats.total} />
        <div className="hidden lg:flex divide-x divide-border items-stretch">
          <Kpi label="Surviving" value={stats.surviving} color="#22d3ee" />
          <Kpi label="Contested" value={stats.contested} color="#f59e0b" />
          <Kpi label="Killed" value={stats.killed} color="#ef4444" />
          <Kpi label="Blocked" value={stats.blocked} color="#8a8a8a" />
        </div>
        <ScoreKpi score={validationScore} />
        <div className="hidden xl:flex flex-col justify-center px-5 shrink-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">
            Graph ID
          </span>
          <span className="font-mono text-[12px] text-secondary-foreground truncate max-w-[100px]" title={graphId}>
            {graphId}
          </span>
        </div>
      </div>
    </header>
  )
}

function Kpi({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="flex min-w-[84px] shrink-0 flex-col justify-center px-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <span
        className="text-tabular text-lg font-semibold leading-tight"
        style={{ color: color ?? 'var(--foreground)' }}
      >
        {String(value).padStart(2, '0')}
      </span>
    </div>
  )
}

function ScoreKpi({ score }: { score: number }) {
  const tone =
    score >= 70 ? '#22d3ee' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex min-w-[120px] shrink-0 flex-col justify-center px-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground whitespace-nowrap">
        Validation Score
      </span>
      <div className="flex items-center gap-2">
        <span
          className="text-tabular text-lg font-semibold leading-tight"
          style={{ color: tone }}
        >
          {score}
          <span className="text-xs text-muted-foreground">/100</span>
        </span>
        <div className="h-1 w-12 overflow-hidden rounded-full bg-surface-3">
          <div
            className={cn('h-full rounded-full')}
            style={{ width: `${score}%`, backgroundColor: tone }}
          />
        </div>
      </div>
    </div>
  )
}

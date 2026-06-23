'use client'

interface Stats {
  total: number
  surviving: number
  contested: number
  killed: number
  blocked: number
}

export function TopHeader({
  stats,
  graphId,
}: {
  stats: Stats
  graphId: string
}) {
  return (
    <header
      className="glass-header flex h-[64px] shrink-0 items-stretch"
    >
      {/* Left: Brand */}
      <div className="flex min-w-0 flex-1 items-center gap-4 px-6">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
            Forge — Zero-to-One
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.20em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
            Assumption Dependency Graph
          </div>
        </div>
        <span
          className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]"
          style={{
            border: '1px solid rgba(34,211,238,0.25)',
            color: '#22d3ee',
          }}
        >
          <span className="size-1.5" style={{ background: '#22d3ee', display: 'inline-block' }} />
          Analyzed
        </span>
      </div>

      {/* Right: KPI blocks */}
      <div
        className="hidden items-stretch divide-x md:flex"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.03)', '--tw-divide-opacity': '1' } as React.CSSProperties}
      >
        <Kpi label="Assumptions" value={stats.total} />
        <div className="hidden lg:flex divide-x items-stretch" style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
          <Kpi label="Surviving" value={stats.surviving} color="#22d3ee" />
          <Kpi label="Contested" value={stats.contested} color="#f59e0b" />
          <Kpi label="Killed" value={stats.killed} color="#ef4444" />
          <Kpi label="Blocked" value={stats.blocked} color="#525252" />
        </div>
        <div
          className="hidden xl:flex flex-col justify-center items-center text-center px-5 shrink-0"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.03)' }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
            Graph ID
          </span>
          <span
            className="font-mono text-[11px] truncate max-w-[100px]"
            style={{ color: 'rgba(255,255,255,0.60)' }}
            title={graphId}
          >
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
    <div
      className="flex min-w-[72px] shrink-0 flex-col justify-center items-center text-center px-4"
      style={{ borderRight: '1px solid rgba(255, 255, 255, 0.03)' }}
    >
      <span
        className="font-mono text-[9px] uppercase tracking-[0.16em]"
        style={{ color: 'rgba(255,255,255,0.30)' }}
      >
        {label}
      </span>
      <span
        className="text-tabular text-[22px] font-bold leading-tight"
        style={{ color: color ?? 'var(--foreground)', fontFamily: 'var(--font-mono)' }}
      >
        {String(value).padStart(2, '0')}
      </span>
    </div>
  )
}

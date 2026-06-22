import { cn } from '@/lib/utils'
import type { Verdict } from '@/lib/types'

const VERDICT_META: Record<Verdict, { color: string }> = {
  Validated: { color: '#22d3ee' },
  Contested: { color: '#f59e0b' },
  Rejected: { color: '#ef4444' },
  Inconclusive: { color: '#8a8a8a' },
}

export function VerdictBadge({
  verdict,
  className,
}: {
  verdict: Verdict
  className?: string
}) {
  const meta = VERDICT_META[verdict]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em]',
        className,
      )}
      style={{
        color: meta.color,
        borderColor: `${meta.color}33`,
        backgroundColor: `${meta.color}0F`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {verdict}
    </span>
  )
}

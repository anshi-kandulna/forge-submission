import { cn } from '@/lib/utils'
import type { NodeState } from '@/lib/types'
import { STATE_META } from '@/lib/mock-data'

export function StateBadge({
  state,
  className,
  showDot = true,
}: {
  state: NodeState
  className?: string
  showDot?: boolean
}) {
  const meta = STATE_META[state]
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
      {showDot && (
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
      )}
      {meta.label}
    </span>
  )
}

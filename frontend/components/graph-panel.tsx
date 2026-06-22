'use client'

import dynamic from 'next/dynamic'
import { STATE_META } from '@/lib/mock-data'
import type { AssumptionNode, NodeState } from '@/lib/types'
import { Loader2 } from 'lucide-react'

const DependencyGraph = dynamic(() => import('./dependency-graph'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Initializing graph engine
      </div>
    </div>
  ),
})

const LEGEND_ORDER: NodeState[] = ['surviving', 'active', 'locked', 'killed', 'blocked', 'pending']

export function GraphPanel({
  nodes,
  links,
  selectedId,
  onSelect,
}: {
  nodes: AssumptionNode[]
  links: { source: string; target: string }[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      {/* Atmospheric depth — restrained radial gradients, no stars */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 600px at 38% 32%, rgba(230,180,90,0.05), transparent 60%), radial-gradient(700px 500px at 75% 78%, rgba(245,158,11,0.035), transparent 55%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(circle at center, black 30%, transparent 80%)',
        }}
      />

      <DependencyGraph
        nodes={nodes}
        links={links}
        selectedId={selectedId}
        onSelect={onSelect}
      />

      {/* Title overlay */}
      <div className="pointer-events-none absolute left-5 top-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Dependency Graph
        </div>
        <div className="mt-0.5 text-[13px] font-medium text-secondary-foreground">
          8 assumptions · 9 dependency links
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-5 left-5 rounded-md border border-border/40 liquid-glass p-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Node State
        </div>
        <div className="flex flex-col gap-1.5">
          {LEGEND_ORDER.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className="size-2 rounded-[2px]"
                style={{ backgroundColor: STATE_META[s]?.color ?? '#737373' }}
              />
              <span className="text-[11px] text-secondary-foreground">
                {STATE_META[s]?.label ?? s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-5 right-5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
        Click a node to inspect · drag to orbit
      </div>
    </div>
  )
}

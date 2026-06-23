'use client'

import dynamic from 'next/dynamic'
import { STATE_META } from '@/lib/mock-data'
import type { AssumptionNode, NodeState } from '@/lib/types'
import { Loader2 } from 'lucide-react'

const DependencyGraph = dynamic(() => import('./dependency-graph'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
    <div className="relative h-full w-full overflow-hidden" style={{ background: 'transparent' }}>
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
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
        <div className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Dependency Graph
        </div>
        <div className="mt-0.5 font-mono text-[12px] font-semibold uppercase tracking-[0.10em]" style={{ color: 'rgba(255,255,255,0.60)' }}>
          {nodes.length} assumptions
        </div>
      </div>

      {/* Legend */}
      <div className="liquid-glass absolute bottom-5 left-5 p-3">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Node State
        </div>
        <div className="flex flex-col gap-1.5">
          {LEGEND_ORDER.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className="size-1.5"
                style={{ background: STATE_META[s]?.color ?? '#737373' }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.10em]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {STATE_META[s]?.label ?? s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-5 right-5 font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Click node to inspect · drag to orbit
      </div>
    </div>
  )
}

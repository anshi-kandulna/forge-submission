'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import type { AssumptionNode } from '@/lib/types'
import { STATE_META } from '@/lib/mock-data'
import { StateBadge } from './state-badge'

const STATE_VERDICT: Record<string, string> = {
  surviving: 'Validated',
  contested: 'Contested',
  killed: 'Rejected',
  blocked: 'Inconclusive',
}

const VERDICT_COLOR: Record<string, string> = {
  Validated: '#22d3ee',
  Contested: '#f59e0b',
  Rejected: '#ef4444',
  Inconclusive: '#8a8a8a',
}

export function PersonaAttacks({
  nodes,
  onSelect,
}: {
  nodes: AssumptionNode[]
  onSelect: (id: string) => void
}) {
  const analyzed = useMemo(
    () => nodes.filter((n) => n.state !== 'contested' || n.reasoning !== 'Pending adversarial review.'),
    [nodes],
  )

  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-transparent">
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          Submit an idea first to see adversarial analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="scrollbar-thin h-full overflow-y-auto bg-transparent">
      <div className="border-b border-border px-8 py-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Adversarial Review
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Persona Attacks
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          AI analyst verdicts for each assumption. Assumptions are attacked
          layer-by-layer; only those whose dependencies survived are evaluated.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-8 lg:grid-cols-2">
        {analyzed.map((node, idx) => {
          const verdict = STATE_VERDICT[node.state] ?? 'Inconclusive'
          const color = VERDICT_COLOR[verdict]
          const meta = STATE_META[node.state]

          return (
            <motion.button
              key={node.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: idx * 0.03, ease: 'easeOut' }}
              onClick={() => onSelect(node.id)}
              className="liquid-glass border border-border/40 rounded-lg p-6 text-left transition-colors hover:bg-surface-2/20 cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border-strong bg-surface-2/30">
                    <Brain className="size-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">
                      AI Analyst
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {node.dimension} · {node.layer}
                    </div>
                  </div>
                </div>
                <StateBadge state={node.state} />
              </div>

              {/* Assumption label */}
              <div className="mt-4 text-[13px] font-medium text-secondary-foreground">
                {node.label}
              </div>

              {/* Reasoning */}
              <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-muted-foreground">
                {node.reasoning ?? 'No reasoning returned.'}
              </p>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                <span
                  className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{
                    color,
                    borderColor: `${color}33`,
                    backgroundColor: `${color}0F`,
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {verdict}
                </span>
                <span className="font-mono text-[11px]" style={{ color: meta?.color ?? '#8a8a8a' }}>
                  {node.confidence}% confidence
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
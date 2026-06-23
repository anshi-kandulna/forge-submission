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
  Inconclusive: '#525252',
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
      <div className="flex h-full items-center justify-center" style={{ background: 'transparent' }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Submit an idea first to see adversarial analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="scrollbar-thin h-full overflow-y-auto" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="px-8 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Adversarial Review
        </div>
        <h1 className="mt-2 font-mono text-[22px] font-bold tracking-[0.12em] uppercase text-foreground">
          Persona Attacks
        </h1>
        <p className="mt-2 max-w-2xl font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
          AI analyst verdicts for each assumption. Assumptions are attacked
          layer-by-layer; only those whose dependencies survived are evaluated.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-8 lg:grid-cols-2">
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
              className="liquid-glass p-5 text-left transition-all cursor-pointer hover:shadow-[0_8px_32px_rgba(0,0,0,0.20)] hover:border-white/30"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center"
                    style={{ border: '1px solid rgba(255,255,255,0.10)', background: '#0a0a0a' }}
                  >
                    <Brain className="size-4" strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.55)' }} />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-foreground">
                      AI Analyst
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {node.dimension} · {node.layer}
                    </div>
                  </div>
                </div>
                <StateBadge state={node.state} />
              </div>

              {/* Assumption label */}
              <div className="mt-4 font-mono text-[12px] uppercase tracking-[0.06em]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {node.label}
              </div>

              {/* Reasoning */}
              <p className="mt-2 line-clamp-3 font-mono text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
                {node.reasoning ?? 'No reasoning returned.'}
              </p>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em]"
                  style={{
                    color,
                    borderColor: `${color}33`,
                    border: `1px solid ${color}33`,
                    backgroundColor: `${color}0A`,
                  }}
                >
                  <span className="size-1.5" style={{ background: color }} />
                  {verdict}
                </span>
                <span className="font-mono text-[10px]" style={{ color: meta?.color ?? '#525252' }}>
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
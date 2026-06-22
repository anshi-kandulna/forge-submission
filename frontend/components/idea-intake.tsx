'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Layers, Target } from 'lucide-react'
import { computeStats } from '@/lib/mock-data'
import type { AssumptionNode } from '@/lib/types'
import { StateBadge } from './state-badge'

export function IdeaIntake({
  nodes,
  ideaInput,
  onIdeaChange,
  onAnalyze,
  onSelect,
  isLoading,
}: {
  nodes: AssumptionNode[]
  ideaInput: string
  onIdeaChange: (v: string) => void
  onAnalyze: (idea: string) => void
  onSelect: (id: string) => void
  isLoading?: boolean
}) {
  const stats = computeStats(nodes)
  const hasNodes = nodes.length > 0

  return (
    <div className="scrollbar-thin h-full overflow-y-auto bg-transparent">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Stage 01 · Intake
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground text-balance">
          Idea Intake
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Submit a venture thesis. The system will decompose it into a dependency
          graph of testable assumptions and attack them with AI analyst personas.
        </p>

        {/* Idea input */}
        <div className="mt-6 rounded-lg border border-border/40 liquid-glass p-6">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Venture Thesis
            </span>
          </div>
          <textarea
            value={ideaInput}
            onChange={(e) => onIdeaChange(e.target.value)}
            placeholder="Describe your startup idea or venture thesis in 1–3 sentences…"
            rows={4}
            disabled={isLoading}
            className="mt-3 w-full resize-none rounded-md border border-border/40 bg-surface-2/30 px-3 py-2.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none disabled:opacity-50"
          />

          <button
            onClick={() => onAnalyze(ideaInput.trim())}
            disabled={!ideaInput.trim() || isLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {isLoading ? 'Analyzing…' : 'Analyze Idea'}
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* Decomposition summary — only after analysis */}
        {hasNodes && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <SummaryStat label="Assumptions" value={stats.total} />
              <SummaryStat label="Surviving" value={stats.surviving} color="#22d3ee" />
              <SummaryStat label="Contested" value={stats.contested} color="#f59e0b" />
              <SummaryStat label="Killed" value={stats.killed} color="#ef4444" />
              <SummaryStat label="Blocked" value={stats.blocked} color="#8a8a8a" />
            </div>

            <div className="mt-6 flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Decomposed Assumptions
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-border/40 liquid-glass">
              {nodes.map((node, i) => (
                <motion.button
                  key={node.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => onSelect(node.id)}
                  className="flex w-full items-center gap-4 border-b border-border/40 bg-transparent px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-2/20 cursor-pointer"
                >
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {node.id.toUpperCase()}
                  </span>
                  <span className="flex-1 text-[13px] font-medium text-secondary-foreground">
                    {node.label}
                  </span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:inline">
                    {node.dimension}
                  </span>
                  <StateBadge state={node.state} showDot={false} />
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SummaryStat({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="rounded-md border border-border/40 liquid-glass px-3 py-2.5">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div
        className="text-tabular mt-0.5 text-xl font-semibold"
        style={{ color: color ?? 'var(--foreground)' }}
      >
        {value}
      </div>
    </div>
  )
}
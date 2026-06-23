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
    <div className="scrollbar-thin h-full overflow-y-auto" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="font-mono text-[9px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
          Stage 01 · Intake
        </div>
        <h1 className="mt-2 font-mono text-[22px] font-bold tracking-[0.12em] uppercase text-foreground">
          Idea Intake
        </h1>
        <p className="mt-2 font-mono text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Submit a venture thesis. The system will decompose it into a dependency
          graph of testable assumptions and attack them with AI analyst personas.
        </p>

        {/* Idea input */}
        <div className="liquid-glass mt-8 p-6">
          <div className="flex items-center gap-2">
            <Target className="size-3.5" strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Venture Thesis
            </span>
          </div>
          <textarea
            value={ideaInput}
            onChange={(e) => onIdeaChange(e.target.value)}
            placeholder="Describe your startup idea or venture thesis in 1–3 sentences…"
            rows={4}
            disabled={isLoading}
            className="mt-4 w-full resize-none bg-transparent px-0 py-2 font-mono text-[13px] leading-relaxed text-foreground focus:outline-none disabled:opacity-50"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.15)',
              color: '#e0e0e0',
            }}
          />
          <style>{`textarea::placeholder { color: rgba(255,255,255,0.22); font-family: var(--font-mono); }`}</style>

          <button
            onClick={() => onAnalyze(ideaInput.trim())}
            disabled={!ideaInput.trim() || isLoading}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: '#000000',
              border: '1px solid #22d3ee',
              color: '#22d3ee',
              borderRadius: '12px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,211,238,0.07)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#000000' }}
          >
            {isLoading ? 'Analyzing…' : 'Analyze Idea'}
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Decomposition summary — only after analysis */}
        {hasNodes && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <SummaryStat label="Assumptions" value={stats.total} />
              <SummaryStat label="Surviving" value={stats.surviving} color="#22d3ee" />
              <SummaryStat label="Contested" value={stats.contested} color="#f59e0b" />
              <SummaryStat label="Killed" value={stats.killed} color="#ef4444" />
              <SummaryStat label="Blocked" value={stats.blocked} color="#525252" />
            </div>

            <div className="mt-8 flex items-center gap-2">
              <Layers className="size-3.5" strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Decomposed Assumptions
              </span>
            </div>
            <div
              className="liquid-glass mt-3 overflow-hidden"
            >
              {nodes.map((node, i) => (
                <motion.button
                  key={node.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => onSelect(node.id)}
                  className="flex w-full items-center gap-4 bg-transparent px-4 py-3 text-left transition-colors last:border-b-0 cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                    {node.id.toUpperCase()}
                  </span>
                  <span className="flex-1 font-mono text-[12px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {node.label}
                  </span>
                  <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] sm:inline" style={{ color: 'rgba(255,255,255,0.30)' }}>
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
    <div className="liquid-glass px-3 py-3 text-center flex flex-col items-center justify-center">
      <div className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
        {label}
      </div>
      <div
        className="text-tabular mt-1 font-mono text-[22px] font-bold"
        style={{ color: color ?? 'var(--foreground)' }}
      >
        {value}
      </div>
    </div>
  )
}
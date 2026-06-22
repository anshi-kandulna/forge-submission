'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  FilePlus2,
  GitBranch,
  MousePointerClick,
  Sparkles,
  Send,
  User,
  Brain,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react'
import type { AssumptionNode, Persona } from '@/lib/types'
import { STATE_META } from '@/lib/mock-data'
import { StateBadge } from './state-badge'
import { getPersonaAvatar } from '@/lib/personas'

export function NodeDetailsPanel({
  node,
  allNodes,
  personas = [],
  onSelect,
  onChat,
  onTriggerSynthesis,
  onSectionChange,
}: {
  node: AssumptionNode | null
  allNodes: AssumptionNode[]
  personas?: Persona[]
  onSelect: (id: string) => void
  onChat?: (nodeId: string, message: string) => Promise<any>
  onTriggerSynthesis?: () => Promise<void>
  onSectionChange?: (sec: any) => void
}) {
  const [chatMessage, setChatMessage] = useState('')
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of chat history when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [node?.chatHistory])

  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center bg-transparent">
        <div className="flex size-11 items-center justify-center rounded-md border border-border bg-surface-2">
          <MousePointerClick className="size-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div className="text-[13px] font-medium text-secondary-foreground">
          No assumption selected
        </div>
        <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
          Select a node in the dependency graph to inspect its details, chat with its persona, or view resolution paths.
        </p>
      </div>
    )
  }

  const meta = STATE_META[node.state]
  const deps = node.dependencies
    .map((id) => allNodes.find((n) => n.id === id))
    .filter(Boolean) as AssumptionNode[]

  const persona = personas.find((p) => p.id === node.personaId)
  const exchangesUsed = node.exchangesUsed ?? 0
  const exchangesRemaining = Math.max(0, 3 - exchangesUsed)

  async function handleSendMessage() {
    if (!chatMessage.trim() || !onChat || sending) return
    setSending(true)
    const msg = chatMessage.trim()
    setChatMessage('')
    try {
      await onChat(node.id, msg)
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const handleSynthesizeClick = async () => {
    if (onTriggerSynthesis) {
      await onTriggerSynthesis()
      if (onSectionChange) {
        onSectionChange('synthesis')
      }
    }
  }

  // SPECIAL RENDER FOR ROADMAP NODE
  if (node.id === 'roadmap') {
    const isRoadmapActive = node.state === 'active'
    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex h-full flex-col"
      >
        {/* Header */}
        <div className="border-b border-border/40 px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Synthesis Gate
            </span>
            <StateBadge state={node.state} />
          </div>
          <h2 className="mt-3 text-[16px] font-semibold leading-snug text-foreground">
            {node.assumption}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          <div className="rounded-md border border-border/40 bg-surface-2/15 p-4 text-center space-y-4">
            <div className="flex justify-center">
              <div className={`flex size-14 items-center justify-center rounded-full border ${isRoadmapActive ? 'border-primary bg-primary/10 text-primary' : 'border-border/40 bg-surface-3/30 text-muted-foreground'}`}>
                {isRoadmapActive ? <Unlock className="size-6 animate-pulse" /> : <Lock className="size-6" />}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                {isRoadmapActive ? 'Synthesis Ready' : 'Synthesis Locked'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isRoadmapActive
                  ? 'All assumptions have been verified or resolved. You are ready to generate the final execution plan or get a recommended pivot strategy.'
                  : 'You must resolve and validate all assumption nodes in the graph first. Chat with their skeptical personas to decide whether each assumption survives or fails.'}
              </p>
            </div>
          </div>

          {/* Dependencies List */}
          <div className="space-y-3">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Required Assumptions ({deps.length})
            </h4>
            <div className="flex flex-col gap-2">
              {deps.map((dep) => (
                <button
                  key={dep.id}
                  onClick={() => onSelect(dep.id)}
                  className="group flex items-center gap-3 rounded-sm border border-border/40 bg-surface-1/20 px-3 py-2 text-left transition-colors hover:border-border-strong hover:bg-surface-2/30"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: STATE_META[dep.state]?.color ?? '#737373' }}
                  />
                  <span className="flex-1 truncate text-xs text-secondary-foreground group-hover:text-foreground">
                    {dep.label}
                  </span>
                  <StateBadge state={dep.state} className="scale-90" showDot={false} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/40 bg-surface-1/25 px-5 py-4 backdrop-blur-[20px] saturate-[1.4]">
          {isRoadmapActive ? (
            <button
              onClick={handleSynthesizeClick}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer shadow-lg shadow-primary/10"
            >
              <Sparkles className="size-4" />
              Unlock Synthesis Report
            </button>
          ) : (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-border/40 bg-surface-2/30 px-4 py-2.5 text-[13px] font-medium text-muted-foreground/60 opacity-50 cursor-not-allowed"
            >
              <Lock className="size-4" />
              Unlock Synthesis Report
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // REGULAR ASSUMPTION NODE RENDER
  const canChat = node.state === 'active' && exchangesRemaining > 0

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex h-full flex-col bg-transparent"
    >
      {/* Header */}
      <div className="border-b border-border/40 px-5 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Assumption · {node.id.toUpperCase()}
          </span>
          <StateBadge state={node.state} />
        </div>
        <h2 className="mt-3 text-[14px] font-semibold leading-snug text-foreground text-pretty">
          {node.assumption}
        </h2>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4 px-5 scrollbar-thin">
        {/* Meta grid */}
        <div className="grid grid-cols-2 divide-x divide-border/40 border border-border/40 rounded-sm bg-surface-2/15">
          <Meta label="Dimension" value={node.dimension} />
          <Meta label="Layer" value={node.layer} />
        </div>

        {/* Confidence Progress bar - only if active or resolved */}
        {node.state !== 'locked' && node.state !== 'blocked' && node.state !== 'pending' && (
          <div className="border border-border/40 rounded-sm bg-surface-2/15 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Persona Confidence
              </span>
              <span
                className="text-tabular text-xs font-semibold"
                style={{ color: meta.color }}
              >
                {node.confidence}%
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3/40">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${node.confidence}%`, backgroundColor: meta.color }}
              />
            </div>
          </div>
        )}

        {/* Assigned Persona Skeptic Details */}
        {persona && (
          <div className="rounded border border-border/40 bg-surface-2/15 p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <img
                src={getPersonaAvatar(persona.name)}
                alt={persona.name}
                className="size-7 rounded-full object-cover shrink-0"
              />
              <div>
                <h4 className="text-[12px] font-semibold text-foreground">{persona.name}</h4>
                <p className="text-[10px] text-muted-foreground">{persona.role}</p>
              </div>
            </div>
            <div className="border-t border-border/40 pt-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                Primary Concern
              </span>
              <p className="mt-1 text-[11px] leading-relaxed text-secondary-foreground font-medium italic">
                "{persona.concern}"
              </p>
            </div>
          </div>
        )}

        {/* Chat Dialog Sandbox */}
        {(node.state === 'active' || node.state === 'surviving' || node.state === 'killed') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Validation Dialogue
              </h4>
              {node.state === 'active' && (
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
                  {exchangesRemaining} exchanges remaining
                </span>
              )}
            </div>

            {/* Chat Messages Frame */}
            <div className="border border-border/40 rounded-md bg-surface-2/10 p-3 space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin flex flex-col">
              {/* Initial Persona Prompt reply */}
              <div className="flex gap-2 self-start max-w-[90%]">
                <img
                  src={getPersonaAvatar(persona?.name || 'Market Skeptic')}
                  alt={persona?.name || 'AI Analyst'}
                  className="size-5 rounded-full object-cover shrink-0"
                />
                <div className="rounded-lg bg-surface-2/30 text-[11px] leading-relaxed p-2.5 text-foreground border border-border/40">
                  {node.reasoning || 'Convince me that this assumption is valid. Please provide concrete evidence.'}
                </div>
              </div>

              {/* Dynamic dialog bubbles */}
              {node.chatHistory?.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-primary/20 border-primary/30 text-primary">
                      <User className="size-3" />
                    </div>
                  ) : (
                    <img
                      src={getPersonaAvatar(persona?.name || 'Market Skeptic')}
                      alt={persona?.name || 'AI Analyst'}
                      className="size-5 rounded-full object-cover shrink-0"
                    />
                  )}
                  <div className={`rounded-lg leading-relaxed p-2.5 text-[11px] border ${msg.role === 'user' ? 'bg-primary/10 text-foreground border-primary/20' : 'bg-surface-2/30 text-foreground border-border/40'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Locked / Blocked Warnings */}
        {(node.state === 'locked' || node.state === 'blocked') && (
          <div className="rounded border border-dashed border-border/40 bg-surface-2/15 p-4 text-center space-y-2">
            <div className="flex justify-center text-muted-foreground">
              {node.state === 'blocked' ? <AlertTriangle className="size-5 text-red-500/80" /> : <Lock className="size-5" />}
            </div>
            <h5 className="text-[12px] font-semibold text-foreground">
              {node.state === 'blocked' ? 'Assumption Blocked' : 'Assumption Locked'}
            </h5>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {node.state === 'blocked'
                ? 'An upstream assumption this node depends on has been killed. This validation branch is blocked.'
                : 'This assumption is locked because upstream dependencies are not yet validated. Resolve dependencies first.'}
            </p>
          </div>
        )}

        {/* Upstream Dependencies Tracker */}
        <div className="space-y-2.5 border-t border-border/40 pt-4">
          <div className="flex items-center gap-1.5">
            <GitBranch className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
            <h4 className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              Dependencies ({deps.length})
            </h4>
          </div>
          {deps.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">
              Root assumption — no upstream dependencies.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {deps.map((dep) => (
                <button
                  key={dep.id}
                  onClick={() => onSelect(dep.id)}
                  className="group flex items-center gap-2.5 rounded-sm border border-border/40 bg-surface-1/20 px-3 py-1.5 text-left transition-colors hover:border-border-strong hover:bg-surface-2/30"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: STATE_META[dep.state]?.color ?? '#737373' }}
                  />
                  <span className="flex-1 truncate text-xs text-secondary-foreground group-hover:text-foreground">
                    {dep.label}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {dep.id.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogue Input Drawer */}
      {node.state === 'active' && (
        <div className="border-t border-border/40 bg-surface-1/25 p-4 shrink-0 space-y-2 backdrop-blur-[20px] saturate-[1.4]">
          {exchangesRemaining > 0 ? (
            <div className="flex gap-2">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={sending}
                placeholder="Argue your case, supply metrics/evidence…"
                rows={2}
                className="flex-1 resize-none rounded-sm border border-border/40 bg-surface-2/30 px-3 py-1.5 text-[11px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-border-strong focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !chatMessage.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 cursor-pointer"
              >
                <Send className="size-4" />
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-center text-red-400 font-mono py-1">
              Exchanges exhausted. Assumption validation closed.
            </div>
          )}
        </div>
      )}

      {/* Resolved State Informer */}
      {(node.state === 'surviving' || node.state === 'killed') && (
        <div className="border-t border-border/40 bg-surface-2/20 p-4 shrink-0 text-center">
          <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: meta.color }}>
            <CheckCircle2 className="size-3.5" />
            {node.state === 'surviving' ? 'Validation Passed' : 'Validation Failed'}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
            {node.state === 'surviving'
              ? 'The persona has been convinced by your evidence. Node is now validated.'
              : 'Failed to convince the persona within 3 exchanges. Downstream path is blocked.'}
          </p>
        </div>
      )}
    </motion.div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2">
      <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold text-foreground truncate">{value}</div>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon?: any
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border/40 px-5 py-4">
      <div className="mb-2.5 flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />}
        <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}
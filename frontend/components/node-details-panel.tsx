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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [node?.chatHistory])

  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center" style={{ background: 'transparent' }}>
        <div
          className="flex size-11 items-center justify-center rounded-xl"
          style={{ border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)' }}
        >
          <MousePointerClick className="size-5" strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.35)' }} />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.60)' }}>
          No assumption selected
        </div>
        <p className="max-w-[220px] font-mono text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.30)' }}>
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
        style={{ background: 'transparent' }}
      >
        {/* Header */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Synthesis Gate
            </span>
            <StateBadge state={node.state} />
          </div>
          <h2 className="mt-3 font-mono text-[14px] font-semibold uppercase tracking-[0.08em] text-foreground">
            {node.assumption}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          <div
            className="liquid-glass p-4 text-center space-y-4"
          >
            <div className="flex justify-center">
              <div
                className="flex size-14 items-center justify-center"
                style={{
                  border: isRoadmapActive ? '1px solid rgba(34,211,238,0.50)' : '1px solid rgba(255,255,255,0.12)',
                  background: isRoadmapActive ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.04)',
                }}
              >
                {isRoadmapActive
                  ? <Unlock className="size-6 animate-pulse" style={{ color: '#22d3ee' }} />
                  : <Lock className="size-6" style={{ color: 'rgba(255,255,255,0.35)' }} />
                }
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                {isRoadmapActive ? 'Synthesis Ready' : 'Synthesis Locked'}
              </h3>
              <p className="font-mono text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
                {isRoadmapActive
                  ? 'All assumptions have been verified or resolved. You are ready to generate the final execution plan or get a recommended pivot strategy.'
                  : 'You must resolve and validate all assumption nodes in the graph first. Chat with their skeptical personas to decide whether each assumption survives or fails.'}
              </p>
            </div>
          </div>

          {/* Dependencies List */}
          <div className="space-y-3">
            <h4 className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Required Assumptions ({deps.length})
            </h4>
            <div className="flex flex-col gap-1.5">
              {deps.map((dep) => (
                <button
                  key={dep.id}
                  onClick={() => onSelect(dep.id)}
                  className="group flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.16)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  <span
                    className="size-1.5 shrink-0"
                    style={{ background: STATE_META[dep.state]?.color ?? '#737373' }}
                  />
                  <span className="flex-1 truncate font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {dep.label}
                  </span>
                  <StateBadge state={dep.state} className="scale-90" showDot={false} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', background: 'transparent' }}>
          {isRoadmapActive ? (
            <button
              onClick={handleSynthesizeClick}
              className="flex w-full items-center justify-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors cursor-pointer"
              style={{ border: '1px solid #22d3ee', color: '#22d3ee', background: 'transparent' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,211,238,0.07)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <Sparkles className="size-4" />
              Unlock Synthesis Report
            </button>
          ) : (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] opacity-40 cursor-not-allowed"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.40)' }}
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
      className="flex h-full flex-col"
      style={{ background: 'transparent' }}
    >
      {/* Header */}
      <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Assumption · {node.id.toUpperCase()}
          </span>
          <StateBadge state={node.state} />
        </div>
        <h2 className="mt-3 font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground">
          {node.assumption}
        </h2>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-4 px-5 scrollbar-thin">
        {/* Meta grid */}
        <div
          className="liquid-glass grid grid-cols-2"
        >
          <Meta label="Dimension" value={node.dimension} />
          <Meta label="Layer" value={node.layer} />
        </div>

        {/* Confidence Progress bar */}
        {node.state !== 'locked' && node.state !== 'blocked' && node.state !== 'pending' && (
          <div className="liquid-glass px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Persona Confidence
              </span>
              <span className="text-tabular font-mono text-[11px] font-semibold" style={{ color: meta.color }}>
                {node.confidence}%
              </span>
            </div>
            <div className="mt-2 h-0.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${node.confidence}%`, background: meta.color }}
              />
            </div>
          </div>
        )}

        {/* Assigned Persona */}
        {persona && (
          <div className="liquid-glass p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <img
                src={getPersonaAvatar(persona.name)}
                alt={persona.name}
                className="size-7 object-cover shrink-0"
                style={{ filter: 'grayscale(40%)' }}
              />
              <div>
                <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-foreground">{persona.name}</h4>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.35)' }}>{persona.role}</p>
              </div>
            </div>
            <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Primary Concern
              </span>
              <p className="mt-1 font-mono text-[10px] leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.60)' }}>
                "{persona.concern}"
              </p>
            </div>
          </div>
        )}

        {/* Chat Dialog Sandbox */}
        {(node.state === 'active' || node.state === 'surviving' || node.state === 'killed') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Validation Dialogue
              </h4>
              {node.state === 'active' && (
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5"
                  style={{
                    color: '#f59e0b',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.20)',
                  }}
                >
                  Exchange {String(exchangesUsed).padStart(2,'0')} / 03
                </span>
              )}
            </div>

            {/* Chat Messages Frame */}
            <div
              className="liquid-glass p-3 space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin flex flex-col"
            >
              {/* Initial Persona message */}
              <div className="flex gap-2 self-start max-w-[90%]">
                <img
                  src={getPersonaAvatar(persona?.name || 'Market Skeptic')}
                  alt={persona?.name || 'AI Analyst'}
                  className="size-5 object-cover shrink-0"
                  style={{ filter: 'grayscale(40%)' }}
                />
                <div
                  className="font-mono text-[10px] leading-relaxed p-2.5"
                  style={{
                    borderLeft: '1px solid rgba(255,255,255,0.15)',
                    paddingLeft: '10px',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
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
                    <div
                      className="flex size-5 shrink-0 items-center justify-center"
                      style={{ border: '1px solid rgba(34,211,238,0.30)', background: 'rgba(34,211,238,0.06)' }}
                    >
                      <User className="size-3" style={{ color: '#22d3ee' }} />
                    </div>
                  ) : (
                    <img
                      src={getPersonaAvatar(persona?.name || 'Market Skeptic')}
                      alt={persona?.name || 'AI Analyst'}
                      className="size-5 object-cover shrink-0"
                      style={{ filter: 'grayscale(40%)' }}
                    />
                  )}
                  <div
                    className="font-mono leading-relaxed p-2 text-[10px]"
                    style={
                      msg.role === 'user'
                        ? { borderLeft: '1px solid #22d3ee', paddingLeft: '10px', color: 'rgba(255,255,255,0.80)' }
                        : { borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '10px', color: 'rgba(255,255,255,0.65)' }
                    }
                  >
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
          <div
            className="p-4 text-center space-y-2"
            style={{
              border: node.state === 'blocked'
                ? '1px solid rgba(239,68,68,0.25)'
                : '1px dashed rgba(255,255,255,0.12)',
              background: node.state === 'blocked' ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
            }}
          >
            <div className="flex justify-center">
              {node.state === 'blocked'
                ? <AlertTriangle className="size-5" style={{ color: 'rgba(239,68,68,0.70)' }} />
                : <Lock className="size-5" style={{ color: 'rgba(255,255,255,0.30)' }} />
              }
            </div>
            <h5 className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
              {node.state === 'blocked' ? 'Assumption Blocked' : 'Assumption Locked'}
            </h5>
            <p className="font-mono text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.40)' }}>
              {node.state === 'blocked'
                ? 'An upstream assumption this node depends on has been killed. This validation branch is blocked.'
                : 'This assumption is locked because upstream dependencies are not yet validated. Resolve dependencies first.'}
            </p>
          </div>
        )}

        {/* Upstream Dependencies Tracker */}
        <div className="space-y-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-1.5">
            <GitBranch className="size-3" strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <h4 className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Dependencies ({deps.length})
            </h4>
          </div>
          {deps.length === 0 ? (
            <p className="font-mono text-[10px] italic" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Root assumption — no upstream dependencies.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {deps.map((dep) => (
                <button
                  key={dep.id}
                  onClick={() => onSelect(dep.id)}
                  className="group flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.16)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  <span
                    className="size-1.5 shrink-0"
                    style={{ background: STATE_META[dep.state]?.color ?? '#737373' }}
                  />
                  <span className="flex-1 truncate font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.60)' }}>
                    {dep.label}
                  </span>
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
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
        <div className="p-4 shrink-0 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', background: 'transparent' }}>
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
                className="flex-1 resize-none bg-transparent px-3 py-1.5 font-mono text-[10px] leading-relaxed text-foreground focus:outline-none disabled:opacity-50"
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !chatMessage.trim()}
                className="flex size-9 shrink-0 items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                style={{ border: '1px solid rgba(255,255,255,0.20)', background: 'transparent', color: 'rgba(255,255,255,0.60)' }}
                onMouseEnter={(e) => { if (!sending && chatMessage.trim()) (e.currentTarget as HTMLButtonElement).style.borderColor = '#22d3ee' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.20)' }}
              >
                <Send className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="font-mono text-[10px] text-center py-1" style={{ color: '#ef4444' }}>
              Exchanges exhausted. Assumption validation closed.
            </div>
          )}
        </div>
      )}

      {/* Resolved State Informer */}
      {(node.state === 'surviving' || node.state === 'killed') && (
        <div className="p-4 shrink-0 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', background: 'transparent' }}>
          <div
            className="flex items-center justify-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: meta.color }}
          >
            <CheckCircle2 className="size-3.5" />
            {node.state === 'surviving' ? 'Validation Passed' : 'Validation Failed'}
          </div>
          <p className="mt-1 font-mono text-[9px] leading-relaxed max-w-[280px] mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
    <div
      className="px-4 py-2"
      style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="font-mono text-[8px] uppercase tracking-[0.20em]" style={{ color: 'rgba(255,255,255,0.30)' }}>
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-foreground truncate">{value}</div>
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
    <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="mb-2.5 flex items-center gap-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
        {Icon && <Icon className="size-3" strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.35)' }} />}
        <h3 className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}
'use client'

import { useCallback, useMemo, useState } from 'react'
import { Sidebar, type Section } from '@/components/sidebar'
import { TopHeader } from '@/components/top-header'
import { GraphPanel } from '@/components/graph-panel'
import { NodeDetailsPanel } from '@/components/node-details-panel'
import { PersonaAttacks } from '@/components/persona-attacks'
import { SynthesisReport } from '@/components/synthesis-report'
import { IdeaIntake } from '@/components/idea-intake'
import { AmbientField } from '@/components/ambient-field'
import { PersonaIntro } from '@/components/persona-intro'
import { computeStats, executionPlan as mockPlan } from '@/lib/mock-data'
import { apiChat, apiCreateIdea, apiSynthesize } from '@/lib/api'
import { adaptGraph, adaptSynthesis } from '@/lib/adapters'
import type { AssumptionNode, ExecutionPlan, GraphLink, Persona } from '@/lib/types'
import { Loader2 } from 'lucide-react'

type FlowStage = 'idle' | 'building' | 'attacking' | 'ready' | 'synthesizing'

interface AppState {
  stage: FlowStage
  error: string | null
  graphId: string | null
  nodes: AssumptionNode[]
  links: GraphLink[]
  personas: Persona[]
  plan: ExecutionPlan | null
  pivotData: unknown | null
}

const INITIAL: AppState = {
  stage: 'idle',
  error: null,
  graphId: null,
  nodes: [],
  links: [],
  personas: [],
  plan: null,
  pivotData: null,
}

export default function Page() {
  const [section, setSection] = useState<Section>('intake')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [app, setApp] = useState<AppState>(INITIAL)
  const [ideaInput, setIdeaInput] = useState('')
  const [showPersonaIntro, setShowPersonaIntro] = useState(false)

  const stats = useMemo(() => computeStats(app.nodes), [app.nodes])
  const selectedNode = useMemo(
    () => app.nodes.find((n) => n.id === selectedId) ?? null,
    [app.nodes, selectedId],
  )

  const handleAnalyze = useCallback(async (idea: string) => {
    setIdeaInput(idea)
    setApp((s) => ({ ...s, stage: 'building', error: null }))
    try {
      const rawGraph = await apiCreateIdea(idea)
      const { nodes, links, graphId, personas } = adaptGraph(rawGraph)
      setApp((s) => ({ ...s, nodes, links, personas, graphId, stage: 'ready' }))
      setShowPersonaIntro(true)
      const firstActive = nodes.find((n) => n.state === 'active')
      setSelectedId(firstActive?.id ?? nodes[0]?.id ?? null)
    } catch (err) {
      setApp((s) => ({ ...s, stage: 'idle', error: err instanceof Error ? err.message : String(err) }))
    }
  }, [])

  const handleChat = useCallback(async (nodeId: string, message: string) => {
    if (!app.graphId) return
    try {
      const chatRes = await apiChat(app.graphId, nodeId, message)
      const { nodes, links, personas } = adaptGraph(chatRes.graph)
      setApp((s) => ({ ...s, nodes, links, personas }))
      return chatRes
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setApp((s) => ({ ...s, error: errMsg }))
      throw err
    }
  }, [app.graphId])

  const handleSynthesize = useCallback(async () => {
    if (!app.graphId) return
    setApp((s) => ({ ...s, stage: 'synthesizing', error: null }))
    try {
      const result = await apiSynthesize(app.graphId)
      const adapted = adaptSynthesis(result, app.nodes)
      setApp((s) => ({
        ...s,
        stage: 'ready',
        plan: adapted.plan ?? null,
        pivotData: adapted.pivot ?? null,
      }))
    } catch (err) {
      setApp((s) => ({ ...s, stage: 'ready', error: err instanceof Error ? err.message : String(err) }))
    }
  }, [app.graphId, app.nodes])

  // Auto-trigger synthesis when navigating to synthesis tab
  function handleSectionChange(s: Section) {
    setSection(s)
    setShowPersonaIntro(false)
    if (s === 'synthesis' && app.graphId && !app.plan && app.stage === 'ready') {
      handleSynthesize()
    }
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    setShowPersonaIntro(false)
    setSection('graph')
  }

  const isLoading = app.stage === 'building' || app.stage === 'attacking' || app.stage === 'synthesizing'

  const loadingLabel: Record<FlowStage, string> = {
    idle: '',
    building: 'Decomposing idea into assumption graph…',
    attacking: 'Evaluating chat response…',
    ready: '',
    synthesizing: 'Synthesizing execution plan…',
  }

  const activePlan = app.plan ?? mockPlan


  return (
    <div className="relative z-10 flex h-screen w-full overflow-hidden bg-transparent text-foreground">
      <AmbientField />
      <Sidebar active={section} onChange={handleSectionChange} graphId={app.graphId ?? '—'} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader stats={stats} validationScore={activePlan.validationScore} graphId={app.graphId ?? '—'} />

        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
                {loadingLabel[app.stage]}
              </span>
            </div>
          </div>
        )}

        {app.error && (
          <div className="border-b border-red-900/40 bg-red-950/30 px-5 py-2 font-mono text-[11px] text-red-400">
            {app.error}
            <button className="ml-4 underline opacity-70 hover:opacity-100" onClick={() => setApp((s) => ({ ...s, error: null }))}>
              dismiss
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          <main className="relative min-w-0 flex-1">
            {showPersonaIntro ? (
              <PersonaIntro
                onBegin={() => {
                  setShowPersonaIntro(false)
                  setSection('graph')
                }}
              />
            ) : (
              <>
                {section === 'intake' && (
                  <IdeaIntake
                    nodes={app.nodes}
                    ideaInput={ideaInput}
                    onIdeaChange={setIdeaInput}
                    onAnalyze={handleAnalyze}
                    onSelect={handleSelect}
                    isLoading={isLoading}
                  />
                )}
                {section === 'graph' && (
                  <GraphPanel nodes={app.nodes} links={app.links} selectedId={selectedId} onSelect={setSelectedId} />
                )}
                {section === 'personas' && (
                  <PersonaAttacks nodes={app.nodes} onSelect={handleSelect} />
                )}
                {section === 'synthesis' && (
                  <SynthesisReport
                    plan={activePlan}
                    pivot={app.pivotData as any}
                    onSynthesize={app.graphId ? handleSynthesize : undefined}
                    isSynthesizing={app.stage === 'synthesizing'}
                  />
                )}
              </>
            )}
          </main>

          {!showPersonaIntro && section === 'graph' && (
            <aside className="hidden w-[360px] shrink-0 m-3 border border-border/40 rounded-[20px] liquid-glass lg:block">
              <NodeDetailsPanel
                node={selectedNode}
                allNodes={app.nodes}
                personas={app.personas}
                onSelect={setSelectedId}
                onChat={handleChat}
                onTriggerSynthesis={handleSynthesize}
                onSectionChange={handleSectionChange}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
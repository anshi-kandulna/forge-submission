// lib/adapters.ts
// Maps raw backend shapes → frontend display types.

import type { BackendGraph, BackendNode, SynthesisPlan, SynthesisResult } from './api'
import type { AssumptionNode, Dimension, ExecutionPlan, GraphLink, Layer, NodeState, Persona } from './types'

// ── Layer ─────────────────────────────────────────────────────────────────────

const LAYER_MAP: Record<number, Layer> = {
  0: 'Foundational',
  1: 'Structural',
  2: 'Surface',
}

function toLayer(n: number): Layer {
  return LAYER_MAP[n] ?? 'Foundational'
}

// ── Dimension ─────────────────────────────────────────────────────────────────

function toDimension(raw: string): Dimension {
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  const valid: Dimension[] = ['Market', 'Technical', 'Customer', 'Operations', 'Financial', 'Distribution']
  return (valid.includes(cap as Dimension) ? cap : 'Technical') as Dimension
}

// ── NodeState ─────────────────────────────────────────────────────────────────

function toNodeState(raw: string): NodeState {
  const map: Record<string, NodeState> = {
    surviving: 'surviving',
    contested: 'contested',
    killed: 'killed',
    blocked: 'blocked',
    locked: 'locked',
    active: 'active',
    pending: 'pending',
  }
  return map[raw] ?? 'locked'
}

// ── Node ──────────────────────────────────────────────────────────────────────

function adaptNode(node: BackendNode, allNodes: Record<string, BackendNode>): AssumptionNode {
  const hasParents = Object.values(allNodes).some((n) => n.depends_on.includes(node.id))
  const isRoot = !node.depends_on.length && !hasParents
    ? true
    : node.depends_on.length === 0

  return {
    id: node.id,
    label: node.text,
    assumption: node.text,
    dimension: toDimension(node.dimension),
    layer: toLayer(node.layer),
    confidence: node.confidence ?? 50,
    state: toNodeState(node.state),
    isRoot: node.depends_on.length === 0,
    reasoning: node.reasoning ?? 'Pending review.',
    dependencies: node.depends_on,
    personaId: node.persona_id ?? undefined,
    chatHistory: node.chat_history || [],
    exchangesUsed: node.exchanges_used ?? 0,
  }
}

// ── Graph ─────────────────────────────────────────────────────────────────────

export interface AdaptedGraph {
  graphId: string
  idea: string
  ideaType: string
  nodes: AssumptionNode[]
  links: GraphLink[]
  personas: Persona[]
}

export function adaptGraph(raw: BackendGraph): AdaptedGraph {
  const nodes = Object.values(raw.nodes).map((n) => adaptNode(n, raw.nodes))
  const links: GraphLink[] = Object.values(raw.nodes).flatMap((n) =>
    n.depends_on.map((dep) => ({ source: dep, target: n.id })),
  )
  return {
    graphId: raw.graph_id,
    idea: raw.idea,
    ideaType: raw.idea_type,
    nodes,
    links,
    personas: raw.personas || [],
  }
}

// ── Synthesis → ExecutionPlan ─────────────────────────────────────────────────

export interface AdaptedSynthesis {
  status: 'plan_generated' | 'pivot_recommended'
  plan?: ExecutionPlan
  pivot?: {
    summary: string
    pivot_points: { assumption: string; why_it_failed: string; possible_pivot: string }[]
  }
}

function planToExecutionPlan(plan: SynthesisPlan, score: number): ExecutionPlan {
  return {
    validationScore: score,
    primaryStrategy: plan.primary_strategy,
    fallbackStrategy: plan.fallback_strategy ?? 'No fallback identified.',
    topRisks: plan.top_risks.map((r) => ({
      title: r,
      detail: r,
      severity: 'Medium' as const,
    })),
    plan30: [plan.plan_30_60_90['30']],
    plan60: [plan.plan_30_60_90['60']],
    plan90: [plan.plan_30_60_90['90']],
    firstAction: plan.first_action,
    uncertaintyNotes: plan.uncertainty_notes,
  }
}

export function adaptSynthesis(
  result: SynthesisResult,
  nodes: AssumptionNode[],
): AdaptedSynthesis {
  if (result.status === 'pivot_recommended') {
    return { status: 'pivot_recommended', pivot: result.pivot }
  }

  // Derive a rough validation score from surviving node count + avg confidence
  const surviving = nodes.filter((n) => n.state === 'surviving')
  const avgConf =
    surviving.length > 0
      ? surviving.reduce((s, n) => s + n.confidence, 0) / surviving.length
      : 0
  const score = Math.round((surviving.length / Math.max(nodes.length, 1)) * 50 + avgConf * 0.5)

  return {
    status: 'plan_generated',
    plan: planToExecutionPlan(result.plan, score),
  }
}
import type { Persona } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ── Raw backend shapes ────────────────────────────────────────────────────────

export type BackendNodeState =
  | 'locked'
  | 'active'
  | 'surviving'
  | 'contested'
  | 'killed'
  | 'blocked'
  | 'pending'

export interface BackendChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface BackendNode {
  id: string
  text: string
  dimension: string   // lowercase: 'technical', 'market', etc.
  depends_on: string[]
  state: BackendNodeState
  layer: number       // 0, 1, 2 …
  reasoning: string | null
  confidence: number | null
  persona_id: string | null
  chat_history: BackendChatMessage[]
  exchanges_used: number
}

export interface BackendGraph {
  graph_id: string
  idea: string
  idea_type: string
  personas: Persona[]
  nodes: Record<string, BackendNode>
}

export interface SynthesisPlan {
  primary_strategy: string
  fallback_strategy: string | null
  top_risks: string[]
  plan_30_60_90: { '30': string; '60': string; '90': string }
  first_action: string
  uncertainty_notes: string[]
}

export type SynthesisResult =
  | { status: 'plan_generated'; plan: SynthesisPlan }
  | {
      status: 'pivot_recommended'
      pivot: {
        summary: string
        pivot_points: { assumption: string; why_it_failed: string; possible_pivot: string }[]
      }
    }

export interface BackendChatResponse {
  persona_reply: string
  convinced: boolean
  node_state: BackendNodeState
  exchanges_used: number
  exchanges_remaining: number
  resolved: boolean
  roadmap_unlocked: boolean
  graph: BackendGraph
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** POST /api/idea — decompose an idea into a graph */
export function apiCreateIdea(idea: string): Promise<BackendGraph> {
  return post('/api/idea', { idea })
}

/** POST /api/chat — send a message to a node's persona */
export function apiChat(
  graph_id: string,
  node_id: string,
  message: string,
): Promise<BackendChatResponse> {
  return post('/api/chat', { graph_id, node_id, message })
}

/** POST /api/synthesize — generate execution plan from surviving path */
export function apiSynthesize(graph_id: string): Promise<SynthesisResult> {
  return post('/api/synthesize', { graph_id })
}

/** GET /api/graph/:id — fetch saved graph by id */
export function apiGetGraph(graph_id: string): Promise<BackendGraph> {
  return get(`/api/graph/${graph_id}`)
}
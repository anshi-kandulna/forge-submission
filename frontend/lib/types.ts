export type NodeState = 'locked' | 'active' | 'surviving' | 'killed' | 'blocked' | 'pending'

export type Dimension =
  | 'Market'
  | 'Technical'
  | 'Customer'
  | 'Operations'
  | 'Financial'
  | 'Distribution'

export type Layer = 'Foundational' | 'Structural' | 'Surface'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type PersonaName =
  | 'Market Skeptic'
  | 'Technical Expert'
  | 'Customer Persona'
  | 'Operations Expert'

export interface Persona {
  id: string
  name: string
  role: string
  concern: string
}


export interface AssumptionNode {
  id: string
  /** Short label rendered inside the graph node */
  label: string
  /** Full assumption statement */
  assumption: string
  dimension: Dimension
  layer: Layer
  confidence: number
  state: NodeState
  isRoot?: boolean
  reasoning: string
  /** ids of assumptions this node depends on */
  dependencies: string[]
  personaId?: string
  chatHistory?: ChatMessage[]
  exchangesUsed?: number
}

export interface GraphLink {
  source: string
  target: string
}

export interface ExecutionPlan {
  validationScore: number
  primaryStrategy: string
  fallbackStrategy: string
  topRisks: { title: string; detail: string; severity: 'High' | 'Medium' | 'Low' }[]
  plan30: string[]
  plan60: string[]
  plan90: string[]
  firstAction: string
  uncertaintyNotes: string[]
}


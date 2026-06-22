import type {
  AssumptionNode,
  ExecutionPlan,
  GraphLink,
  NodeState,
} from './types'

export const IDEA = {
  title: 'Autonomous AP/AR Agent for Mid-Market Finance Teams',
  thesis:
    'An AI agent that ingests invoices, reconciles payments, and executes approval workflows end-to-end, reducing finance headcount cost by 40% for companies with $20M–$250M revenue.',
  submittedBy: 'operator@northwind.vc',
  submittedAt: '2026-06-18T14:22:00Z',
}

export const STATE_META: Record<
  NodeState,
  { label: string; color: string; description: string }
> = {
  locked: {
    label: 'Locked',
    color: '#737373',
    description: 'Gated by unresolved upstream assumptions.',
  },
  active: {
    label: 'Active',
    color: '#f59e0b',
    description: 'Ready for review. Chat with the persona to validate.',
  },
  surviving: {
    label: 'Surviving',
    color: '#22d3ee',
    description: 'Withstood adversarial scrutiny and validated.',
  },
  contested: {
    label: 'Contested',
    color: '#f59e0b',
    description: 'Under active validation chat.',
  },
  killed: {
    label: 'Killed',
    color: '#ef4444',
    description: 'Failed validation; excluded from execution plan.',
  },
  blocked: {
    label: 'Blocked',
    color: '#525252',
    description: 'Gated by a rejected upstream dependency.',
  },
  pending: {
    label: 'Pending',
    color: '#a855f7',
    description: 'Waiting for all other assumptions to resolve.',
  },
}


export const assumptions: AssumptionNode[] = [
  {
    id: 'a1',
    label: 'Reconciliation can be automated',
    assumption:
      'Core invoice-to-payment reconciliation can be automated to >97% accuracy without human review for mid-market transaction volumes.',
    dimension: 'Technical',
    layer: 'Foundational',
    confidence: 82,
    state: 'surviving',
    isRoot: true,
    reasoning:
      'Ledger reconciliation is a structured, high-signal problem. Modern extraction models plus deterministic matching rules clear the accuracy bar on standardized ERP exports. Edge cases concentrate in non-standard vendor formats, which are a minority of volume.',
    dependencies: [],
    personaVerdicts: [
      {
        persona: 'Technical Expert',
        role: 'Principal ML Engineer',
        verdict: 'Validated',
        confidence: 84,
        analysis:
          'Document extraction at 97%+ is achievable with current models on structured ERP data. Deterministic post-processing handles the long tail. Risk is concentrated in unstructured PDF vendors, which fall back to human review.',
        timestamp: '2026-06-18T15:02:00Z',
      },
      {
        persona: 'Operations Expert',
        role: 'VP Finance Operations',
        verdict: 'Validated',
        confidence: 78,
        analysis:
          'Matches my experience running a 14-person AP team. The 3% exception rate is exactly where humans add value, so a human-in-the-loop fallback is operationally acceptable.',
        timestamp: '2026-06-18T15:09:00Z',
      },
    ],
  },
  {
    id: 'a2',
    label: 'ERP integrations are tractable',
    assumption:
      'We can build and maintain reliable, write-capable integrations with the top 5 mid-market ERPs (NetSuite, Sage Intacct, Dynamics, QuickBooks, Xero).',
    dimension: 'Technical',
    layer: 'Foundational',
    confidence: 64,
    state: 'contested',
    isRoot: true,
    reasoning:
      'Read access is well-documented; write access for payment execution is gated, rate-limited, and version-fragile. NetSuite and Intacct have the deepest mid-market penetration but the most restrictive write APIs.',
    dependencies: [],
    personaVerdicts: [
      {
        persona: 'Technical Expert',
        role: 'Principal ML Engineer',
        verdict: 'Contested',
        confidence: 58,
        analysis:
          'Write-path certification for NetSuite SuiteApps takes months and the surface changes per release. Maintenance burden scales with each ERP, not amortized. This is an integration company disguised as an AI company.',
        timestamp: '2026-06-18T15:14:00Z',
      },
      {
        persona: 'Operations Expert',
        role: 'VP Finance Operations',
        verdict: 'Validated',
        confidence: 71,
        analysis:
          'Customers will tolerate read-only + export-driven execution in year one. Full write-back can be phased. The integration moat is real once built.',
        timestamp: '2026-06-18T15:20:00Z',
      },
    ],
  },
  {
    id: 'a3',
    label: 'Finance leaders will delegate execution',
    assumption:
      'Finance leaders will grant an AI agent authority to execute payment approvals up to a defined threshold without per-transaction sign-off.',
    dimension: 'Customer',
    layer: 'Structural',
    confidence: 38,
    state: 'killed',
    reasoning:
      'Fiduciary and SOX control requirements make unattended payment execution a hard no for most controllers. Interviews indicate willingness to automate preparation but not final disbursement authority in the near term.',
    dependencies: ['a1'],
    personaVerdicts: [
      {
        persona: 'Customer Persona',
        role: 'Corporate Controller, $90M SaaS',
        verdict: 'Rejected',
        confidence: 88,
        analysis:
          'I will never sign off on unattended disbursement. SOX segregation-of-duties requires a human approver of record. Automate the prep, but a person presses send. Full stop.',
        timestamp: '2026-06-18T15:31:00Z',
      },
      {
        persona: 'Market Skeptic',
        role: 'Fintech Investor',
        verdict: 'Rejected',
        confidence: 80,
        analysis:
          'The wedge that requires giving up disbursement control is the same wedge every AP startup has failed on. Liability for a wrong payment lands on the buyer, not the vendor.',
        timestamp: '2026-06-18T15:36:00Z',
      },
    ],
  },
  {
    id: 'a4',
    label: 'Assisted approvals are acceptable',
    assumption:
      'Finance teams will adopt an AI agent that prepares and recommends approvals while a human retains final authority, capturing 70% of the time savings.',
    dimension: 'Customer',
    layer: 'Structural',
    confidence: 79,
    state: 'surviving',
    reasoning:
      'Reframing from autonomous execution to assisted approval preserves the control structure while retaining most of the labor savings. This is the viable wedge after a3 was killed.',
    dependencies: ['a1', 'a3'],
    personaVerdicts: [
      {
        persona: 'Customer Persona',
        role: 'Corporate Controller, $90M SaaS',
        verdict: 'Validated',
        confidence: 85,
        analysis:
          'This I would buy tomorrow. If the agent stages everything and I approve a batch in two clicks, I cut my AP cycle in half without touching my control framework.',
        timestamp: '2026-06-18T15:44:00Z',
      },
      {
        persona: 'Operations Expert',
        role: 'VP Finance Operations',
        verdict: 'Validated',
        confidence: 76,
        analysis:
          'The 70% time-savings estimate is credible. The remaining 30% is the judgment work that justifies keeping a person in the loop.',
        timestamp: '2026-06-18T15:49:00Z',
      },
    ],
  },
  {
    id: 'a5',
    label: 'Mid-market will pay $2.5K+/mo',
    assumption:
      'Mid-market finance teams will pay $2,500–$6,000 / month for assisted AP/AR automation, justified by displaced headcount cost.',
    dimension: 'Financial',
    layer: 'Structural',
    confidence: 67,
    state: 'contested',
    reasoning:
      'A single AP clerk fully loaded is ~$65K/yr. Replacing 0.7 FTE of work easily covers the price. The contested point is procurement cycle length and willingness to displace, not raw ROI.',
    dependencies: ['a4'],
    personaVerdicts: [
      {
        persona: 'Market Skeptic',
        role: 'Fintech Investor',
        verdict: 'Contested',
        confidence: 62,
        analysis:
          'ROI math works on paper. But mid-market finance buys slowly and rarely fires staff to fund software. Expect 4–6 month sales cycles and budget framed as efficiency, not headcount cut.',
        timestamp: '2026-06-18T15:55:00Z',
      },
      {
        persona: 'Operations Expert',
        role: 'VP Finance Operations',
        verdict: 'Validated',
        confidence: 73,
        analysis:
          'At $3K/mo this is a rounding error against the cost of the team. Budget exists if it is sold as capacity expansion rather than layoffs.',
        timestamp: '2026-06-18T16:01:00Z',
      },
    ],
  },
  {
    id: 'a6',
    label: 'Bottom-up GTM can land mid-market',
    assumption:
      'A product-led, bottom-up motion can reach mid-market finance buyers without a heavy enterprise sales org.',
    dimension: 'Distribution',
    layer: 'Surface',
    confidence: 41,
    state: 'killed',
    reasoning:
      'Finance tooling with write access to the ledger is a top-down, security-reviewed purchase. Self-serve signups stall at the security questionnaire. PLG signals are weak for this buyer.',
    dependencies: ['a5'],
    personaVerdicts: [
      {
        persona: 'Market Skeptic',
        role: 'Fintech Investor',
        verdict: 'Rejected',
        confidence: 83,
        analysis:
          'Nobody swipes a card for software that touches disbursements. This is a sales-led, SOC 2 + security-review motion. PLG is a fantasy for this category.',
        timestamp: '2026-06-18T16:08:00Z',
      },
    ],
  },
  {
    id: 'a7',
    label: 'Design-partner led GTM works',
    assumption:
      'A design-partner-led motion through fractional CFO networks and ERP implementation partners can drive the first 25 logos efficiently.',
    dimension: 'Distribution',
    layer: 'Surface',
    confidence: 72,
    state: 'surviving',
    reasoning:
      'Fractional CFOs and ERP resellers are trusted, repeat distribution channels with direct access to the buyer. This replaces the killed PLG hypothesis as the GTM wedge.',
    dependencies: ['a5', 'a6'],
    personaVerdicts: [
      {
        persona: 'Market Skeptic',
        role: 'Fintech Investor',
        verdict: 'Validated',
        confidence: 70,
        analysis:
          'Channel through fractional CFOs is the right early motion. They sit across many clients and their endorsement clears the trust barrier the product itself cannot.',
        timestamp: '2026-06-18T16:15:00Z',
      },
      {
        persona: 'Operations Expert',
        role: 'VP Finance Operations',
        verdict: 'Validated',
        confidence: 74,
        analysis:
          'ERP implementation partners are gold. They are already inside the systems we integrate with and are looking for adjacent value to resell.',
        timestamp: '2026-06-18T16:21:00Z',
      },
    ],
  },
  {
    id: 'a8',
    label: 'Compliance & audit trail is defensible',
    assumption:
      'The agent can produce a SOX-compliant, immutable audit trail that satisfies external auditors of mid-market public and pre-IPO companies.',
    dimension: 'Operations',
    layer: 'Surface',
    confidence: 55,
    state: 'blocked',
    reasoning:
      'Audit-grade evidence depends on certified write-back integrations (a2), which are themselves contested. Until ERP write certification is resolved, auditability of agent actions cannot be guaranteed.',
    dependencies: ['a2', 'a4'],
    personaVerdicts: [
      {
        persona: 'Operations Expert',
        role: 'VP Finance Operations',
        verdict: 'Inconclusive',
        confidence: 50,
        analysis:
          'Auditors will accept an agent log only if it ties to the system of record. That hinges entirely on certified ERP write-back, which is still unresolved upstream.',
        timestamp: '2026-06-18T16:28:00Z',
      },
    ],
  },
]

export const links: GraphLink[] = assumptions.flatMap((node) =>
  node.dependencies.map((dep) => ({ source: dep, target: node.id })),
)

export const executionPlan: ExecutionPlan = {
  validationScore: 68,
  primaryStrategy:
    'Ship an assisted-approval AP agent (human retains disbursement authority) to mid-market finance teams, sold through fractional-CFO and ERP-implementation channels.',
  fallbackStrategy:
    'If certified ERP write-back stalls, launch as a read-only reconciliation + approval-staging layer that exports to the existing ERP, deferring write automation to phase two.',
  topRisks: [
    {
      title: 'ERP write-back certification',
      detail:
        'NetSuite / Intacct write certification is slow and version-fragile; it gates the SOX audit-trail claim (a8).',
      severity: 'High',
    },
    {
      title: 'Mid-market procurement velocity',
      detail:
        'Security review and slow finance procurement extend sales cycles to 4–6 months, pressuring early burn.',
      severity: 'Medium',
    },
    {
      title: 'Channel dependency',
      detail:
        'Heavy reliance on fractional-CFO and reseller goodwill creates concentration risk in the first 25 logos.',
      severity: 'Medium',
    },
  ],
  plan30: [
    'Lock the assisted-approval scope; explicitly cut unattended disbursement from v1.',
    'Sign 3 design partners via fractional-CFO network with read-only reconciliation.',
    'Stand up SOC 2 Type I readiness and security questionnaire kit.',
  ],
  plan60: [
    'Ship reconciliation + approval-staging on QuickBooks and Xero (lowest-friction write paths).',
    'Begin NetSuite SuiteApp write-back certification process.',
    'Instrument time-savings telemetry to substantiate the 70% claim with real data.',
  ],
  plan90: [
    'Convert 2 design partners to paid at $3K/mo; publish a quantified ROI case study.',
    'Sign 2 ERP-implementation reseller agreements.',
    'Resolve audit-trail (a8) by tying agent logs to certified write-back where available.',
  ],
  firstAction:
    'Schedule 5 fractional-CFO interviews this week to confirm the assisted-approval wedge and recruit the first 3 design partners.',
  uncertaintyNotes: [
    'Pricing band ($2.5K–$6K) is unvalidated above the low end; willingness-to-pay testing required.',
    'Audit-trail defensibility (a8) remains blocked pending ERP write certification (a2).',
    'Channel economics with ERP resellers (rev-share, support load) are still unmodeled.',
  ],
}

export function computeStats(nodes: AssumptionNode[]) {
  const total = nodes.length
  const surviving = nodes.filter((n) => n.state === 'surviving').length
  const contested = nodes.filter((n) => n.state === 'contested').length
  const killed = nodes.filter((n) => n.state === 'killed').length
  const blocked = nodes.filter((n) => n.state === 'blocked').length
  return { total, surviving, contested, killed, blocked }
}

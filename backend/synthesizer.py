from groq_client import GRAPH_MODEL, call_groq_json
from models import GraphState, Node

PLAN_SYSTEM_PROMPT = """\
You are an execution planner. You are given an early-stage idea and the outcome of
its assumption stress-test — which assumptions the founder successfully defended
(green), which they failed to defend (red), and which were never reached (pending).

Build a realistic execution plan that rests ONLY on the green assumptions. Do not
paper over the red ones. If there are red assumptions that are foundational, call
that out explicitly in top_risks.

Return ONLY valid JSON, no markdown fences, no commentary:
{
  "primary_strategy": "...",
  "fallback_strategy": "... or null if no real fallback exists",
  "top_risks": ["...", "...", "..."],
  "plan_30_60_90": {
    "30": "...",
    "60": "...",
    "90": "..."
  },
  "first_action": "...",
  "uncertainty_notes": ["...one note per unresolved or red assumption..."]
}"""

PIVOT_SYSTEM_PROMPT = """\
You are an idea-validation engine. The founder failed to defend enough foundational
assumptions for an execution plan to be viable. Do not invent a fake plan.

Identify the 3 assumptions most worth pivoting around, and explain concretely what
a revised version of each assumption could look like — a smaller scope, a different
target user, a different delivery mechanism, etc.

Return ONLY valid JSON, no markdown fences, no commentary:
{
  "summary": "1-2 sentence honest read on why this didn't survive",
  "pivot_points": [
    {"assumption": "...", "why_it_failed": "...", "possible_pivot": "..."}
  ]
}"""


def _has_viable_path(graph: GraphState) -> bool:
    """True if at least one root node (no dependents pointing at it) is green."""
    depended_on: set[str] = set()
    for n in graph.nodes.values():
        depended_on.update(n.depends_on)
    roots = [n for n in graph.nodes.values() if n.id not in depended_on]
    return any(r.state == "green" for r in roots)


def _graph_summary(graph: GraphState) -> str:
    lines = []
    for n in graph.nodes.values():
        exchanges = f"{n.exchanges_used}/3 exchanges"
        lines.append(
            f"- [{n.state.upper()}] (layer {n.layer}, {n.dimension}, {exchanges}) {n.text}"
        )
    return "\n".join(lines)


def synthesize(graph: GraphState) -> dict:
    summary = _graph_summary(graph)
    user = (
        f"Idea: {graph.idea}\n"
        f"Idea type: {graph.idea_type}\n\n"
        f"Assumption outcomes:\n{summary}"
    )

    if not _has_viable_path(graph):
        data = call_groq_json(PIVOT_SYSTEM_PROMPT, user, model=GRAPH_MODEL)
        return {"status": "pivot_recommended", "pivot": data}

    data = call_groq_json(PLAN_SYSTEM_PROMPT, user, model=GRAPH_MODEL)
    return {"status": "plan_generated", "plan": data}
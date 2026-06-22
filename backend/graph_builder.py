import uuid

from groq_client import GRAPH_MODEL, call_groq_json
from models import GraphState, Node, Persona

GRAPH_SYSTEM_PROMPT = """\
You are an idea-validation engine. Given a raw early-stage idea, do three things
in one pass:

1. CLASSIFY the idea type. Pick exactly one:
   startup | class_project | research_project | social_initiative

2. GENERATE exactly 4 skeptical personas tailored to this idea type and domain.
   Each persona is a real archetype who would pressure-test this specific idea
   (e.g. for a startup: a Series A investor, a potential customer, a competing
   founder, a domain expert). Give each a short name, a one-line role, and the
   core concern they would raise about this idea in one sentence.

3. EXTRACT 5-8 specific, testable assumptions the idea rests on. Each assumption
   must be a concrete falsifiable claim, not a vague restatement of the idea.
   For each assumption, list which other assumption ids it depends on being true
   first (depends_on). Foundational assumptions have empty depends_on. The graph
   must be a real DAG with branching — not a flat list and not a single chain.
   Tag each assumption with one dimension:
     desirability | feasibility | viability

   Dimension meanings by idea type:
   - startup: desirability=do users want it, feasibility=can you build it,
     viability=unit economics and market
   - class_project: desirability=solves a real problem, feasibility=team can
     execute in time, viability=meets evaluation criteria
   - research_project: desirability=addresses a real gap, feasibility=executable
     with available resources, viability=publishable or fundable
   - social_initiative: desirability=beneficiaries need this, feasibility=
     operational reality, viability=funding and long-term sustainability

   Assign one persona (by persona id) to each assumption node. Spread assignments
   so each persona covers at least one node.

Return ONLY valid JSON, no markdown fences, no commentary:
{
  "idea_type": "startup",
  "personas": [
    {"id": "p1", "name": "...", "role": "...", "concern": "..."},
    {"id": "p2", "name": "...", "role": "...", "concern": "..."},
    {"id": "p3", "name": "...", "role": "...", "concern": "..."},
    {"id": "p4", "name": "...", "role": "...", "concern": "..."}
  ],
  "nodes": [
    {"id": "n1", "text": "...", "dimension": "desirability", "depends_on": [], "persona_id": "p1"},
    {"id": "n2", "text": "...", "dimension": "feasibility", "depends_on": ["n1"], "persona_id": "p2"}
  ]
}"""


def compute_layers(nodes: dict[str, Node]) -> None:
    """Longest-path layering. Layer 0 = foundational (no deps) = bottom of tree.
    Roadmap node will sit above the highest layer."""
    memo: dict[str, int] = {}
    visiting: set[str] = set()

    def layer_of(node_id: str) -> int:
        if node_id in memo:
            return memo[node_id]
        if node_id in visiting:
            return 0  # cycle fallback
        visiting.add(node_id)
        deps = [d for d in nodes[node_id].depends_on if d in nodes]
        memo[node_id] = 0 if not deps else 1 + max(layer_of(d) for d in deps)
        visiting.discard(node_id)
        return memo[node_id]

    for node_id in nodes:
        layer_of(node_id)
    for node_id, node in nodes.items():
        node.layer = memo.get(node_id, 0)


def activate_root_nodes(nodes: dict[str, Node]) -> None:
    """Layer 0 nodes (no dependencies) are active immediately — fights start here."""
    for node in nodes.values():
        if not node.depends_on:
            node.state = "active"


def inject_roadmap_node(nodes: dict[str, Node]) -> None:
    """
    Add a special 'roadmap' node at the top of the tree.
    It depends on every node that nothing else depends on (the current top-layer nodes).
    It has no persona — clicking it triggers synthesize(), not a chat.
    Its layer is maxLayer + 1 so it always renders at the very top.
    """
    # find nodes that are not depended on by anything (current "tips" of the DAG)
    depended_on: set[str] = set()
    for n in nodes.values():
        depended_on.update(n.depends_on)
    tip_ids = [nid for nid in nodes if nid not in depended_on]

    max_layer = max(n.layer for n in nodes.values()) if nodes else 0

    roadmap_node = Node(
        id="roadmap",
        text="Generate Roadmap",
        dimension="viability",   # doesn't really matter, frontend treats it specially
        depends_on=tip_ids,
        state="pending",
        layer=max_layer + 1,
        persona_id="",           # no persona — clicking triggers synthesize
    )
    nodes["roadmap"] = roadmap_node


def build_graph(idea: str) -> GraphState:
    data = call_groq_json(GRAPH_SYSTEM_PROMPT, idea, model=GRAPH_MODEL)

    personas: list[Persona] = []
    for p in data.get("personas", []):
        personas.append(Persona(
            id=p["id"],
            name=p["name"],
            role=p["role"],
            concern=p["concern"],
        ))

    nodes: dict[str, Node] = {}
    for rn in data["nodes"]:
        nodes[rn["id"]] = Node(
            id=rn["id"],
            text=rn["text"],
            dimension=rn.get("dimension", "desirability"),
            depends_on=rn.get("depends_on", []),
            persona_id=rn.get("persona_id", ""),
        )

    compute_layers(nodes)
    activate_root_nodes(nodes)
    inject_roadmap_node(nodes)   # always last — needs layers computed first

    return GraphState(
        graph_id=str(uuid.uuid4())[:8],
        idea=idea,
        idea_type=data.get("idea_type", "startup"),
        personas=personas,
        nodes=nodes,
    )
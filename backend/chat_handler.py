"""
chat_handler.py — handles the per-node user↔persona conversation.

Rules:
- Each node gets max 3 exchanges (one exchange = one user message + one persona reply).
- If the persona is convinced at any point → node goes green immediately.
- After exchange 3 without conviction → node goes red.
- Green propagates upward: children whose all parents are green flip to active.
- Red propagates downward: all descendants reset to pending.
- The special 'roadmap' node has no persona. It goes active when all its
  parents (the tip nodes) are green. Frontend detects this and calls /api/synthesize.
"""

import os
import re
import json

from groq import Groq
from groq_client import PERSONA_MODEL
from models import GraphState, Node, Persona

client = Groq(api_key=os.environ["GROQ_API_KEY"])

PERSONA_SYSTEM_TEMPLATE = """\
You are {name}, {role}.

Your core concern about this idea: {concern}

You are reviewing one specific assumption from an early-stage idea. The founder will
try to convince you the assumption holds. You are skeptical but fair — you can be
convinced by good evidence, clear reasoning, or concrete plans. You cannot be
convinced by vague promises, wishful thinking, or restating the assumption more
confidently.

The assumption you are reviewing: "{assumption_text}"
Idea context: {idea}

Rules:
- Stay in character as {name} the entire time.
- Respond in 2-4 sentences. Be direct. Raise specific follow-up concerns if not
  yet convinced. Do not ramble.
- If the founder has genuinely addressed your concern, say so clearly.
- End EVERY response with this exact line (no markdown fences):
  VERDICT:{{"convinced": true/false, "final": false}}
  Set convinced=true only if you are actually convinced.
  Set final=true only on exchange 3 (your last allowed response) — you must commit."""


def _get_persona(graph: GraphState, persona_id: str) -> Persona | None:
    for p in graph.personas:
        if p.id == persona_id:
            return p
    return None


def _build_system_prompt(persona: Persona, node: Node, idea: str) -> str:
    return PERSONA_SYSTEM_TEMPLATE.format(
        name=persona.name,
        role=persona.role,
        concern=persona.concern,
        assumption_text=node.text,
        idea=idea,
    )


def _build_messages(system: str, chat_history: list[dict]) -> list[dict]:
    messages = [{"role": "system", "content": system}]
    for entry in chat_history:
        role = "user" if entry["role"] == "user" else "assistant"
        messages.append({"role": role, "content": entry["content"]})
    return messages


def _parse_verdict(raw: str) -> dict:
    match = re.search(r"VERDICT:(\{.*?\})", raw)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    return {"convinced": False, "final": False}


def _strip_verdict(raw: str) -> str:
    return re.sub(r"\nVERDICT:\{.*?\}", "", raw).strip()


def _descendants_of(graph: GraphState, node_id: str) -> set[str]:
    """All nodes that transitively depend on node_id (i.e. above it in the tree)."""
    children: dict[str, list[str]] = {}
    for n in graph.nodes.values():
        for dep in n.depends_on:
            children.setdefault(dep, []).append(n.id)

    seen: set[str] = set()
    stack = [node_id]
    while stack:
        current = stack.pop()
        for child in children.get(current, []):
            if child not in seen:
                seen.add(child)
                stack.append(child)
    return seen


def _propagate(graph: GraphState, changed_node_id: str) -> None:
    node = graph.nodes[changed_node_id]

    if node.state == "green":
        # check every node that depends on this one — if all their parents
        # are now green, flip them to active (including the roadmap node)
        for n in graph.nodes.values():
            if n.state == "pending" and changed_node_id in n.depends_on:
                if all(
                    graph.nodes[dep].state == "green"
                    for dep in n.depends_on
                    if dep in graph.nodes
                ):
                    n.state = "active"

    elif node.state == "red":
        # collapse everything above this node back to pending and wipe their chat
        for desc_id in _descendants_of(graph, changed_node_id):
            desc = graph.nodes[desc_id]
            if desc.state != "pending":
                desc.state = "pending"
                desc.chat_history = []
                desc.exchanges_used = 0


def chat_turn(graph: GraphState, node_id: str, user_message: str) -> dict:
    """
    Process one user message for a node.

    Returns:
      {
        "persona_reply": str,
        "convinced": bool,
        "node_state": str,
        "exchanges_used": int,
        "exchanges_remaining": int,
        "resolved": bool,
        "roadmap_unlocked": bool,   # True if roadmap node just became active
      }
    """
    node = graph.nodes.get(node_id)
    if node is None:
        raise ValueError(f"Node {node_id} not found")
    if node.id == "roadmap":
        raise ValueError("The roadmap node has no persona — call /api/synthesize instead")
    if node.state == "pending":
        raise ValueError(f"Node {node_id} is not yet reachable")
    if node.state in ("green", "red"):
        raise ValueError(f"Node {node_id} is already resolved ({node.state})")

    persona = _get_persona(graph, node.persona_id)
    if persona is None:
        raise ValueError(f"Persona {node.persona_id} not found for node {node_id}")

    node.chat_history.append({"role": "user", "content": user_message})
    node.exchanges_used += 1
    is_final = node.exchanges_used >= 3

    system = _build_system_prompt(persona, node, graph.idea)
    if is_final:
        system += (
            f"\n\nThis is exchange {node.exchanges_used} of 3 — your LAST response. "
            "You must now give a definitive final verdict. Set final=true in VERDICT."
        )

    messages = _build_messages(system, node.chat_history)
    resp = client.chat.completions.create(
        model=PERSONA_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=400,
    )
    raw_reply = resp.choices[0].message.content

    verdict = _parse_verdict(raw_reply)
    display_reply = _strip_verdict(raw_reply)

    node.chat_history.append({"role": "persona", "content": display_reply})

    resolved = False
    if verdict.get("convinced"):
        node.state = "green"
        resolved = True
        _propagate(graph, node_id)
    elif is_final:
        node.state = "red"
        resolved = True
        _propagate(graph, node_id)

    roadmap_unlocked = graph.nodes.get("roadmap", None) is not None \
        and graph.nodes["roadmap"].state == "active"

    return {
        "persona_reply": display_reply,
        "convinced": verdict.get("convinced", False),
        "node_state": node.state,
        "exchanges_used": node.exchanges_used,
        "exchanges_remaining": max(0, 3 - node.exchanges_used),
        "resolved": resolved,
        "roadmap_unlocked": roadmap_unlocked,
    }
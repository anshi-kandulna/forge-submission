from typing import Literal, Optional
from pydantic import BaseModel, Field

NodeStateType = Literal["pending", "active", "green", "red"]


class Node(BaseModel):
    id: str
    text: str
    dimension: Literal["desirability", "feasibility", "viability"]
    depends_on: list[str] = Field(default_factory=list)
    state: NodeStateType = "pending"
    layer: int = 0
    # which persona is assigned to defend/attack this node
    persona_id: str = ""
    # full chat history: [{"role": "user"|"persona", "content": "..."}]
    chat_history: list[dict] = Field(default_factory=list)
    # 0-3; when it hits 3 and state is not green, node goes red
    exchanges_used: int = 0


class Persona(BaseModel):
    id: str
    name: str
    role: str
    # the core concern this persona surfaces about the idea
    concern: str


class GraphState(BaseModel):
    graph_id: str
    idea: str
    idea_type: str
    personas: list[Persona] = Field(default_factory=list)
    nodes: dict[str, Node]


class IdeaRequest(BaseModel):
    idea: str


class GraphIdRequest(BaseModel):
    graph_id: str


class ChatRequest(BaseModel):
    graph_id: str
    node_id: str
    message: str
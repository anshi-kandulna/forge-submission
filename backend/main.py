from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import state
from chat_handler import chat_turn
from graph_builder import build_graph
from models import ChatRequest, GraphIdRequest, IdeaRequest
from synthesizer import synthesize

app = FastAPI(title="Zero-to-One Builder")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/idea")
def create_idea(req: IdeaRequest):
    """
    Submit a raw idea. Returns the full graph with:
    - 4 tailored personas
    - 5-8 assumption nodes (foundational nodes already active, rest pending)
    """
    graph = build_graph(req.idea)
    state.save_graph(graph)
    return graph


@app.post("/api/chat")
def chat(req: ChatRequest):
    """
    Send one user message to the persona assigned to a node.
    The persona replies in character. After 3 exchanges without conviction → red.
    If convinced at any point → green and children may unlock.
    Returns the persona reply + updated node state.
    """
    try:
        graph = state.get_graph(req.graph_id)
    except KeyError:
        raise HTTPException(404, "graph not found")

    try:
        result = chat_turn(graph, req.node_id, req.message)
    except ValueError as e:
        raise HTTPException(400, str(e))

    state.save_graph(graph)

    # return the chat result + the updated full graph so the frontend
    # can re-render node states without a separate fetch
    return {
        **result,
        "graph": graph,
    }


@app.post("/api/synthesize")
def synth(req: GraphIdRequest):
    """
    Generate final execution plan (or pivot recommendation) based on
    which nodes the user successfully defended.
    """
    try:
        graph = state.get_graph(req.graph_id)
    except KeyError:
        raise HTTPException(404, "graph not found")
    return synthesize(graph)


@app.get("/api/graph/{graph_id}")
def get_graph(graph_id: str):
    try:
        return state.get_graph(graph_id)
    except KeyError:
        raise HTTPException(404, "graph not found")
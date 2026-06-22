from models import GraphState

GRAPHS: dict[str, GraphState] = {}


def save_graph(graph: GraphState) -> None:
    GRAPHS[graph.graph_id] = graph


def get_graph(graph_id: str) -> GraphState:
    if graph_id not in GRAPHS:
        raise KeyError(f"graph {graph_id} not found")
    return GRAPHS[graph_id]
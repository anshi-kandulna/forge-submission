import json
import os

from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

# graph construction needs more reasoning (extraction + dependency mapping in one shot)
# persona attacks are simpler per-call and run more often, so use the faster model
GRAPH_MODEL = os.environ.get("GROQ_MODEL_GRAPH", "llama-3.3-70b-versatile")
PERSONA_MODEL = os.environ.get("GROQ_MODEL_PERSONA", "llama-3.1-8b-instant")


def call_groq_json(system: str, user: str, model: str) -> dict:
    """Calls Groq, forces JSON output, retries once if parsing fails."""
    last_error = None

    for attempt in range(2):
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        raw = resp.choices[0].message.content
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            last_error = e
            user = (
                user
                + "\n\nYour previous response was not valid JSON. "
                "Return ONLY valid JSON, no markdown fences, no commentary."
            )

    raise RuntimeError(f"Groq did not return valid JSON after retry: {last_error}")
"""The six agent stages. Each function takes the pipeline state and returns
a partial state update - this is the shape LangGraph expects from a node.
"""

import re
import difflib

import networkx as nx

from .llm import call_json
from .state import PipelineState


def _combined_visits_text(state: PipelineState) -> str:
    return "\n\n---\n\n".join(
        f"Visit date: {v['date']}\n{v['text']}" for v in state["visits"]
    )


# ---------------------------------------------------------------------------
# 1. Extraction & NER agent
# ---------------------------------------------------------------------------

EXTRACTION_PROMPT = """You are a clinical entity extraction assistant. Given one visit note, extract structured entities. Respond with a single JSON object only, no other text, no markdown.

Schema:
{
  "diagnoses": ["..."],
  "medications": ["..."],
  "labs": ["..."],
  "key_findings": ["..."]
}

If a category has nothing relevant in this note, return an empty list for it."""


def extract_entities(state: PipelineState) -> dict:
    extracted = []
    for visit in state["visits"]:
        result = call_json(
            EXTRACTION_PROMPT,
            f"Visit date: {visit['date']}\n{visit['text']}",
            max_tokens=500,
        )
        extracted.append({"date": visit["date"], **result})
    return {"extracted": extracted}


# ---------------------------------------------------------------------------
# 2. Summarization agent
# ---------------------------------------------------------------------------

SUMMARY_PROMPT = """You are a clinical summarization assistant. Given a patient's notes across multiple visits, produce one combined structured summary. Respond with a single JSON object only, no other text, no markdown.

Schema:
{
  "chief_complaint": "one short sentence, based on the most relevant or recent visit",
  "findings": "one or two short sentences synthesizing findings across all visits",
  "plan": "one or two short sentences on the current plan"
}"""


def summarize(state: PipelineState) -> dict:
    result = call_json(SUMMARY_PROMPT, _combined_visits_text(state), max_tokens=400)
    return {"summary": result}


# ---------------------------------------------------------------------------
# 3. Critical-finding flagging agent
# ---------------------------------------------------------------------------

CRITICAL_FINDINGS_PROMPT = """You are a clinical triage assistant. Given a patient's visit notes, identify any findings that genuinely warrant closer attention than routine, well-controlled care - an unexplained or newly abnormal value, a red-flag symptom, a finding of uncertain significance, or something recommended but not completed. Respond with a single JSON object only, no other text, no markdown.

Schema:
{
  "flags": [
    { "finding": "short label", "reason": "one short sentence on why it needs attention", "source_excerpt": "the exact sentence or phrase from a note this is based on", "visit_date": "the date of the visit it came from" }
  ]
}

If nothing meets the bar, return an empty flags array. Do not flag routine or expected findings."""


def flag_critical_findings(state: PipelineState) -> dict:
    result = call_json(CRITICAL_FINDINGS_PROMPT, _combined_visits_text(state), max_tokens=700)
    return {"flags": result.get("flags", [])}


# ---------------------------------------------------------------------------
# 4. Timeline agent (backed by a lightweight in-memory knowledge graph)
# ---------------------------------------------------------------------------

TIMELINE_PROMPT = """You are building a concise visit-by-visit timeline for a patient. Given the visits below, write one short line per visit summarizing what happened at that visit. Respond with a single JSON object only, no other text, no markdown.

Schema:
{ "timeline": [ { "date": "...", "summary": "one short line" } ] }

Keep the same order as the input visits."""


def build_timeline(state: PipelineState) -> dict:
    result = call_json(TIMELINE_PROMPT, _combined_visits_text(state), max_tokens=400)
    timeline = result.get("timeline", [])

    # A real longitudinal knowledge graph would live in Neo4j; this in-memory
    # graph captures the same structure (visit nodes, chronological edges)
    # without requiring an external database for the demo. Swap `graph`
    # for a Neo4j session here if you want it persisted.
    graph = nx.DiGraph()
    for i, entry in enumerate(timeline):
        graph.add_node(entry["date"], summary=entry.get("summary", ""))
        if i > 0:
            graph.add_edge(timeline[i - 1]["date"], entry["date"], relation="followed_by")

    timeline_graph = {
        "nodes": list(graph.nodes()),
        "edges": [{"from": u, "to": v} for u, v in graph.edges()],
    }

    return {"timeline": timeline, "timeline_graph": timeline_graph}


# ---------------------------------------------------------------------------
# 5. Care-gap detection agent
# ---------------------------------------------------------------------------

CARE_GAP_PROMPT = """You are a preventive-care assistant. Given a patient's visit notes and the guideline reminders below, identify any care gaps - things that were recommended, ordered, or due, but not completed. Respond with a single JSON object only, no other text, no markdown.

Guideline reminders to check against:
- Diabetic patients should have a dilated eye exam at least once every 12 months.
- Any imaging or lab test explicitly ordered or recommended in a note should be completed by the next visit unless the note documents otherwise.
- Any finding described as "uncertain significance" should have a documented follow-up plan.

Schema:
{ "care_gaps": [ { "gap": "short label", "reason": "one short sentence on why" } ] }

Only include a gap if a note directly indicates something recommended, ordered, or due was not completed. If nothing meets the bar, return an empty array."""


def detect_care_gaps(state: PipelineState) -> dict:
    result = call_json(CARE_GAP_PROMPT, _combined_visits_text(state), max_tokens=400)
    return {"care_gaps": result.get("care_gaps", [])}


# ---------------------------------------------------------------------------
# 6. Grounding & verification agent
# ---------------------------------------------------------------------------

VERIFY_PROMPT = """You are a fact-checking assistant. You will be given a claimed finding, the excerpt it's supposedly based on, and the original visit note. Decide if the excerpt genuinely appears in, or is a fair paraphrase of, the note. Respond with a single JSON object only, no other text, no markdown.

Schema:
{ "supported": true or false }"""


def _best_match_ratio(excerpt: str, text: str) -> float:
    if not excerpt or not text:
        return 0.0
    if excerpt.lower() in text.lower():
        return 1.0
    best = 0.0
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        ratio = difflib.SequenceMatcher(None, excerpt.lower(), sentence.lower()).ratio()
        best = max(best, ratio)
    return best


def verify_flags(state: PipelineState) -> dict:
    """Checks each flag's source_excerpt against the actual visit text.

    Cheap string matching handles the common case (the model quoted the note
    correctly); only ambiguous cases fall through to an extra LLM call. This
    is the step that keeps the system from presenting every claim with equal
    confidence - a flag that can't be traced back to the source gets marked
    as such instead of being reported at face value.
    """
    visits_by_date = {v["date"]: v["text"] for v in state["visits"]}
    verified = []
    for flag in state.get("flags", []):
        source_text = visits_by_date.get(flag.get("visit_date"), "")
        ratio = _best_match_ratio(flag.get("source_excerpt", ""), source_text)

        if ratio >= 0.75:
            confidence = "grounded"
        elif ratio >= 0.4:
            confidence = "partially_grounded"
        else:
            try:
                result = call_json(
                    VERIFY_PROMPT,
                    f"Claimed finding: {flag.get('finding')}\n"
                    f"Excerpt: {flag.get('source_excerpt')}\n"
                    f"Note: {source_text}",
                    max_tokens=100,
                )
                confidence = "grounded" if result.get("supported") else "unsupported"
            except Exception:
                confidence = "unsupported"

        verified.append({**flag, "confidence": confidence})

    return {"flags": verified}

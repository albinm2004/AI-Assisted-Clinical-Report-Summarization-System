"""Wires the six agent stages together as a LangGraph state machine."""

from langgraph.graph import StateGraph, END

from .state import PipelineState
from .nodes import (
    extract_entities,
    summarize,
    flag_critical_findings,
    build_timeline,
    detect_care_gaps,
    verify_flags,
)


def build_pipeline():
    g = StateGraph(PipelineState)

    g.add_node("extract", extract_entities)
    g.add_node("summarize", summarize)
    g.add_node("flag_critical", flag_critical_findings)
    g.add_node("timeline", build_timeline)
    g.add_node("care_gaps", detect_care_gaps)
    g.add_node("verify", verify_flags)

    g.set_entry_point("extract")
    g.add_edge("extract", "summarize")
    g.add_edge("summarize", "flag_critical")
    g.add_edge("flag_critical", "timeline")
    g.add_edge("timeline", "care_gaps")
    g.add_edge("care_gaps", "verify")
    g.add_edge("verify", END)

    return g.compile()


# Built once at import time and reused across requests.
pipeline = build_pipeline()

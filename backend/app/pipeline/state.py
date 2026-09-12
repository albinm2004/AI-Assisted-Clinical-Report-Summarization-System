"""Shared state schema passed between every node in the LangGraph pipeline."""

from typing import TypedDict, List, Dict, Any


class Visit(TypedDict):
    date: str
    text: str


class PipelineState(TypedDict, total=False):
    patient_id: str
    patient_name: str
    visits: List[Visit]

    # Filled in by each stage, in order:
    extracted: List[Dict[str, Any]]        # extract_entities
    summary: Dict[str, Any]                # summarize
    flags: List[Dict[str, Any]]            # flag_critical_findings -> later enriched by verify_flags
    timeline: List[Dict[str, Any]]         # build_timeline
    timeline_graph: Dict[str, Any]         # build_timeline (nodes/edges, JSON-friendly)
    care_gaps: List[Dict[str, Any]]        # detect_care_gaps

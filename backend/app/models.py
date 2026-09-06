"""Pydantic data models for the Clinical Report Summarizer."""

from typing import List, Optional
from pydantic import BaseModel


class Visit(BaseModel):
    date: str
    note: str


class PatientListItem(BaseModel):
    id: str
    name: str
    source: Optional[str] = None


class PatientDetail(BaseModel):
    id: str
    name: str
    age: Optional[int] = None
    sex: str = "unknown"
    visits: List[Visit]
    source: Optional[str] = None
    """Citation/attribution for real, literature-sourced patients. None for the
    synthetic demo patients."""


# --- Stage 1 output: per-visit extraction -----------------------------------

class VisitFinding(BaseModel):
    finding: str
    source_sentence: str


class VisitExtractionFields(BaseModel):
    """What we ask the model to produce for stage 1 (no date -- we already know it)."""

    chief_complaint: str
    one_line_summary: str
    findings: List[VisitFinding]
    plan: str


class VisitExtraction(BaseModel):
    date: str
    chief_complaint: str
    one_line_summary: str
    findings: List[VisitFinding]
    plan: str


# --- Stage 2 output: cross-visit synthesis ----------------------------------

class TimelineEntry(BaseModel):
    date: str
    summary: str


class OverallSummary(BaseModel):
    chief_complaint: str
    findings: str
    plan: str


class Flag(BaseModel):
    finding: str
    reason: str
    source_excerpt: str


class CareGap(BaseModel):
    gap: str
    reason: str


class AnalyzeResponse(BaseModel):
    timeline: List[TimelineEntry]
    summary: OverallSummary
    flags: List[Flag]
    care_gaps: List[CareGap]

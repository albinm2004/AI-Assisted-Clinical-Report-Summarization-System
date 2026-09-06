"""
The entire "pipeline" for this project: two sequential LLM calls per patient,
run against Google's Gemini API.

  1. extract_visit()      -- run once per visit note. Structured per-visit
                              extraction (chief complaint, one-line summary,
                              cited findings, plan).
  2. synthesize_patient()  -- run once per patient, given all of that
                              patient's per-visit extractions. Produces the
                              cross-visit timeline, an overall summary,
                              critical flags (each grounded in a source
                              sentence), and care-gap checks against a short
                              hardcoded guideline list.

No agent framework, no orchestration graph, no vector DB -- just two prompts
and two calls to the Gemini API, using Gemini's native structured-output
support (response_schema) so responses parse straight into our pydantic
models instead of hand-rolled JSON parsing.
"""

import os

from google import genai
from google.genai import types

from .guidelines import CARE_GAP_GUIDELINES
from .models import AnalyzeResponse, VisitExtraction, VisitExtractionFields

MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Copy backend/.env.example to "
                "backend/.env and add your key from https://aistudio.google.com/apikey."
            )
        _client = genai.Client(api_key=api_key)
    return _client


def _structured_call(prompt: str, schema):
    """Send a prompt and parse the response straight into the given pydantic model."""
    client = _get_client()
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
        ),
    )
    if response.parsed is None:
        raise RuntimeError(f"Gemini did not return parseable output for schema {schema.__name__}.")
    return response.parsed


# --- Stage 1: per-visit extraction ------------------------------------------

def extract_visit(date: str, note: str) -> VisitExtraction:
    prompt = f"""You are assisting with clinical documentation review. Read the following single
visit note and extract structured information from it.

For each finding you list, "source_sentence" must be an exact, verbatim sentence copied from
the note below (not paraphrased) so the finding can be traced back to its source. List every
clinically notable finding, including subtle or easy-to-miss ones (e.g. a new symptom mentioned
in passing, a pending referral, a medication gap) -- not just the primary complaint.

Visit date: {date}

Visit note:
\"\"\"{note}\"\"\"
"""
    fields: VisitExtractionFields = _structured_call(prompt, VisitExtractionFields)
    return VisitExtraction(date=date, **fields.model_dump())


# --- Stage 2: cross-visit synthesis -----------------------------------------

def synthesize_patient(patient_name: str, per_visit: list[VisitExtraction]) -> AnalyzeResponse:
    visits_json = "\n".join(v.model_dump_json(indent=2) for v in per_visit)

    prompt = f"""You are assisting with longitudinal clinical review for patient {patient_name}.
Below are structured extractions from each of this patient's visits, in chronological order,
followed by a short reference list of care guidelines.

Instructions:
- "timeline": one entry per visit, each with a one-line summary of what happened.
- "summary": a combined summary of the chief complaint(s), findings, and plan across all visits
  (not just the most recent one -- synthesize the arc of care).
- "flags": critical findings a clinician should not miss, considering the FULL history together
  (e.g. a symptom that recurs or escalates across visits, a new finding that contradicts an
  earlier assessment, something that was mentioned once and never followed up on). Each flag's
  "source_excerpt" MUST be copied verbatim from one of the "source_sentence" fields in the visit
  data below -- do not paraphrase it.
- "care_gaps": compare this patient's full visit history against the guideline list below, and
  list any gaps you find (e.g. a recommended exam never completed, a recommended medication never
  started, a referral placed but never completed). Only list gaps genuinely supported by the
  visit history -- do not invent gaps that aren't evidenced in the notes.

Per-visit extractions:
{visits_json}

Reference care-gap guidelines:
{CARE_GAP_GUIDELINES}
"""
    return _structured_call(prompt, AnalyzeResponse)


def run_pipeline(patient: dict) -> AnalyzeResponse:
    """The full two-stage pipeline for one patient."""
    per_visit = [extract_visit(v["date"], v["note"]) for v in patient["visits"]]
    return synthesize_patient(patient["name"], per_visit)

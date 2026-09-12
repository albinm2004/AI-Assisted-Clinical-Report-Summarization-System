import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .data import PATIENTS
from .pipeline.graph import pipeline

app = FastAPI(title="AI-Assisted Clinical Report Summarization System")

# Wide open for local development. Restrict allow_origins before this ever
# runs anywhere other than your own machine.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _find_patient(patient_id: str):
    return next((p for p in PATIENTS if p["id"] == patient_id), None)


@app.get("/patients")
def list_patients():
    return PATIENTS


@app.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    patient = _find_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.post("/patients/{patient_id}/analyze")
def analyze_patient(patient_id: str):
    patient = _find_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not set. Add it to backend/.env and restart the server.",
        )

    initial_state = {
        "patient_id": patient["id"],
        "patient_name": patient["name"],
        "visits": patient["visits"],
    }
    result = pipeline.invoke(initial_state)

    return {
        "summary": result.get("summary"),
        "timeline": result.get("timeline"),
        "timeline_graph": result.get("timeline_graph"),
        "flags": result.get("flags"),
        "care_gaps": result.get("care_gaps"),
    }

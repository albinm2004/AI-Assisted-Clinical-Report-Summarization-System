from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .data import PATIENTS, get_patient
from .llm import run_pipeline
from .models import AnalyzeResponse, PatientDetail, PatientListItem

app = FastAPI(title="Clinical Report Summarizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache so re-viewing a patient doesn't re-run the LLM pipeline.
_analysis_cache: dict[str, AnalyzeResponse] = {}


@app.get("/patients", response_model=list[PatientListItem])
def list_patients():
    return [{"id": p["id"], "name": p["name"], "source": p.get("source")} for p in PATIENTS]


@app.get("/patients/{patient_id}", response_model=PatientDetail)
def get_patient_detail(patient_id: str):
    patient = get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.post("/patients/{patient_id}/analyze", response_model=AnalyzeResponse)
def analyze_patient(patient_id: str):
    patient = get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    if patient_id in _analysis_cache:
        return _analysis_cache[patient_id]

    try:
        result = run_pipeline(patient)
    except Exception as exc:  # surfaced as a clean 500 rather than a stack trace to the frontend
        raise HTTPException(status_code=500, detail=str(exc))

    _analysis_cache[patient_id] = result
    return result


@app.get("/")
def root():
    return {"status": "ok", "service": "clinical-report-summarizer"}

# AI-Assisted Clinical Report Summarization System

A small tool that takes a patient's history across a few visits and produces:

- a combined summary of the patient's history,
- a timeline of visit-by-visit events,
- flagged critical findings, each citing the exact sentence it's based on, and
- a care-gap check against a short, hardcoded guideline list.

It's built from **two sequential LLM calls per patient**, using Google's
Gemini API — no agent framework, no vector database, no custom NER models.
Just:

1. **Per-visit extraction** — run once per visit note. Produces structured
   findings for that visit, each grounded in a verbatim source sentence.
2. **Cross-visit synthesis** — takes all of a patient's per-visit outputs and
   produces the timeline, care-gap list, and critical flags (each flag citing
   its source sentence).

The demo ships with 3 synthetic patients (2–3 visits each) — fabricated for
this project, not drawn from MIMIC-III/IV or any real clinical dataset. See
"Using real patient data" below for an optional add-on that pulls in a couple
of real, published, de-identified case reports.

## Project layout

```
backend/
  app/
    data.py        # synthetic patients + visits
    guidelines.py   # hardcoded care-gap guideline list
    llm.py          # the two-call pipeline (Gemini API)
    models.py       # pydantic request/response models
    main.py         # FastAPI app + 3 endpoints
    real_patients.py  # generated, gitignored -- see "Using real patient data"
  scripts/
    fetch_real_patients.py  # optional: pull real cases from PMC-Patients
    requirements.txt
  requirements.txt
  .env.example
frontend/
  src/
    App.jsx
    api.js
    components/
      PatientSelector.jsx     # folder-tab patient picker
      VisitTimelineStrip.jsx  # date chips above the raw-note panel
      ReviewPanel.jsx         # summary / timeline / flags / care-gaps
    styles.css      # sage/teal palette, ruled-paper panel, stamped flags
  package.json
```

## API

- `GET /patients` — list of patients (id + name)
- `GET /patients/{id}` — that patient's visits and raw notes
- `POST /patients/{id}/analyze` — runs the two-call pipeline and returns:

```json
{
  "timeline": [{ "date": "...", "summary": "one line" }],
  "summary": { "chief_complaint": "...", "findings": "...", "plan": "..." },
  "flags": [{ "finding": "...", "reason": "...", "source_excerpt": "..." }],
  "care_gaps": [{ "gap": "...", "reason": "..." }]
}
```

Analysis results are cached in memory per patient, so re-viewing a patient
doesn't re-run the LLM calls.

## Running it

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # then add your GEMINI_API_KEY (get one at https://aistudio.google.com/apikey)
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). The frontend
expects the backend at `http://localhost:8000` by default — override with a
`VITE_API_URL` env var if needed.

## What "done" looks like

Select a patient, see their visit timeline, click "Analyze patient history",
and get back a combined summary, a timeline, at least one flagged finding
with a visible source citation, and at least one detected care gap — all
from two LLM calls per patient.

## Using real patient data (optional)

The default demo patients are synthetic. If you'd rather show at least one
real case, `backend/scripts/fetch_real_patients.py` pulls a couple of real,
published, de-identified case reports from the [PMC-Patients dataset](https://huggingface.co/datasets/zhengyun21/PMC-Patients)
(CC BY-NC-SA 4.0) and drops them into the patient list alongside the
synthetic ones:

```bash
cd backend
pip install -r scripts/requirements.txt
python scripts/fetch_real_patients.py --count 2
```

This has to be run locally rather than something this project's build
environment could do for you — that sandbox's network access doesn't reach
huggingface.co. The script writes `app/real_patients.py` (gitignored, since
it's generated and carries the dataset's non-commercial/share-alike license),
which `app/data.py` picks up automatically on the next backend restart. Real
patients show a source citation in the UI; synthetic ones don't.

**On real Indian clinical report data specifically**: we looked for an open,
non-credentialed dataset of real Indian clinical notes/discharge summaries
and didn't find one. The closest related work
([arXiv:2407.05887](https://arxiv.org/abs/2407.05887)) used 99 real
de-identified summaries from a hospital in Lucknow, but that data requires
the treating institution's own IRB approval and was never made public —
facing the same wall, that paper's authors generated LLM-synthesized
summaries styled after Indian documentation practice instead of using real
records. `fetch_real_patients.py --india-only` does a best-effort keyword
filter for PMC-Patients case reports connected to Indian hospitals, since
that dataset does include some, but there's no guaranteed hit rate.
Real, freely-downloadable, non-credentialed Indian clinical text at any
volume doesn't appear to currently exist — which is itself worth noting if
this project's writeup discusses dataset availability.

## Scope notes

- No LangGraph orchestration, no Neo4j/Weaviate, no custom NER models
  (ScispaCy/med7), no separate claim-by-claim verification agent — grounding
  is done inline as part of the same extraction/synthesis calls.
- Synthetic patients by default; real, literature-sourced patients are an
  opt-in extra (see above) rather than MIMIC-III/IV or i2b2/n2c2 access,
  which require credentialing this project doesn't attempt.

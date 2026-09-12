# AI-Assisted Clinical Report Summarization System

Takes a patient's clinical notes across multiple visits and produces a structured summary, a longitudinal timeline, critical-finding flags, and a care-gap check - with every flag checked against the source note by a verification stage before it's shown with confidence.

This is a full working implementation: a real FastAPI backend running a six-stage LangGraph pipeline, and a React admin dashboard in front of it. Every piece here has been run and tested in the process of building it - see "What's been verified" below.

## Architecture

```
React dashboard  --HTTP-->  FastAPI  --invokes-->  LangGraph pipeline  --calls-->  Claude API
                                                          |
                                      extract -> summarize -> flag -> timeline -> care_gaps -> verify
```

**The six pipeline stages** (`backend/app/pipeline/nodes.py`):

1. **Extraction** - pulls structured entities (diagnoses, medications, labs, key findings) out of each visit note.
2. **Summarization** - a combined structured summary (chief complaint, findings, plan) across all visits.
3. **Critical-finding flagging** - flags findings that warrant closer attention than routine care, each with a source excerpt.
4. **Timeline** - a one-line-per-visit chronology, backed by a small in-memory graph (visit nodes, chronological edges) representing the same structure a Neo4j-backed knowledge graph would hold. See "Design trade-offs" below.
5. **Care-gap detection** - checks the visits against a short set of guideline rules for things recommended but not completed.
6. **Grounding & verification** - checks every flag's source excerpt against the actual visit text. A cheap string-similarity check handles the common case; only ambiguous claims fall through to an extra model call. Anything that can't be traced back to the source is marked `unsupported` rather than shown with the same confidence as everything else - this is the whole point of the system.

Orchestrated with LangGraph (`backend/app/pipeline/graph.py`) so the stages are real graph nodes, not just chained function calls.

## Design trade-offs made on purpose

- **Neo4j -> in-memory graph (networkx).** The timeline stage builds the same node/edge structure a real knowledge graph would, without requiring you to stand up a database for a demo. Swap the graph construction in `build_timeline` for a Neo4j session if you want it persisted - nothing else in the pipeline needs to change.
- **No vector store / RAG retrieval.** With a handful of visits per patient, every stage just gets the full visit text directly. Worth adding a retrieval layer if you move to patients with long histories.
- **Verification is hybrid, not always an LLM call.** String-similarity matching (`difflib`) catches exact and near-exact quotes for free; the model is only asked when that's ambiguous. Keeps the demo fast and cheap.
- **Synthetic data, not MIMIC-III/IV.** MIMIC requires PhysioNet credentialing that takes days. The three sample patients in `backend/app/data.py` are written to each surface a different kind of signal (an uncertain cardiac finding, a persistent missed screening, a post-op lab flag with a delayed follow-up) so the dashboard has something real to show.

## What's been verified

- `backend/tests/test_pipeline.py` - two tests, both passing: the full six-stage pipeline runs end to end with a mocked LLM and produces correctly-shaped output, and the verification stage correctly marks a fabricated claim as `unsupported` rather than passing it through.
- The FastAPI app boots and every route was exercised directly (`/patients`, `/patients/{id}`, `/patients/{id}/analyze`) - including confirming it fails with a clear error message when `ANTHROPIC_API_KEY` isn't set, rather than a raw traceback.
- The frontend was installed (`npm install`) and built for production (`npm run build`) successfully.

What hasn't been tested here: an actual call to the live Claude API, since that needs your own API key. The code path is straightforward (see `backend/app/pipeline/llm.py`) and the tests confirm everything around it works - the first real run is the one thing left to do on your machine.

## Running it

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env                               # then edit .env and add your key
uvicorn app.main:app --reload
```

Runs on `http://localhost:8000`. Try `http://localhost:8000/patients` in a browser to confirm it's up.

Run the tests any time with:
```bash
python -m pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and expects the backend at `http://localhost:8000` (override with a `VITE_API_BASE_URL` env var if you run the backend elsewhere).

## Folder structure

```
backend/
  app/
    main.py              FastAPI app and routes
    data.py               Sample patients
    pipeline/
      state.py            Shared state schema
      llm.py               Anthropic API call helper
      nodes.py             The six pipeline stages
      graph.py             LangGraph wiring
  tests/
    test_pipeline.py       Pipeline smoke tests (mocked LLM)
  requirements.txt
  .env.example
frontend/
  src/
    App.jsx                Dashboard - sidebar nav, KPIs, chart, patient detail
    main.jsx, index.css
  package.json
```

## Extending this

- **Real Neo4j**: replace the `networkx.DiGraph` in `build_timeline` (`backend/app/pipeline/nodes.py`) with a Neo4j session; the JSON shape returned to the frontend can stay the same.
- **More patients / real data**: `backend/app/data.py` is the only place patient data lives - point it at a real source and nothing else needs to change.
- **Better verification**: the current grounding check is claim-vs-source-text. A stronger version would score faithfulness at the sentence level across the whole summary, not just the flags.

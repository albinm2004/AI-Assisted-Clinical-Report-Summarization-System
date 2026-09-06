import { useEffect, useState } from "react";
import PatientSelector from "./components/PatientSelector.jsx";
import VisitTimelineStrip from "./components/VisitTimelineStrip.jsx";
import ReviewPanel from "./components/ReviewPanel.jsx";
import { fetchPatients, fetchPatientDetail, analyzePatient } from "./api.js";

export default function App() {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [visitIndex, setVisitIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients()
      .then((list) => {
        setPatients(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingDetail(true);
    setAnalysis(null);
    setVisitIndex(0);
    setError(null);
    fetchPatientDetail(selectedId)
      .then(setPatientDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  function handleAnalyze() {
    setAnalyzing(true);
    setError(null);
    analyzePatient(selectedId)
      .then(setAnalysis)
      .catch((e) => setError(e.message))
      .finally(() => setAnalyzing(false));
  }

  const currentVisit = patientDetail?.visits?.[visitIndex];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__title">
          <span className="app-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3h8a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1V4a1 1 0 0 1 1-1Z" />
              <path d="M9 3v3h6V3" />
              <path d="M8 12h3m0 0h3m-3 0v-3m0 6v-3" />
              <path d="M8 17h8" />
            </svg>
          </span>
          <div>
            <h1>Clinical Report Summarizer</h1>
            <p className="app-subtitle">Multi-visit history &rarr; timeline, cited flags, and care-gap review</p>
          </div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <PatientSelector patients={patients} selectedId={selectedId} onSelect={setSelectedId} />

      <main className="app-main">
        <section className="chart-column">
          {patientDetail && (
            <>
              <VisitTimelineStrip
                visits={patientDetail.visits}
                selectedIndex={visitIndex}
                onSelect={setVisitIndex}
              />
              <div className="chart-panel">
                <span className="chart-panel__clip" aria-hidden="true" />
                {loadingDetail && <p className="chart-panel__loading">Loading visit notes&hellip;</p>}
                {!loadingDetail && currentVisit && (
                  <>
                    <div className="chart-panel__meta">
                      <span className="chart-panel__patient">{patientDetail.name}</span>
                      <span className="chart-panel__date">{currentVisit.date}</span>
                    </div>
                    {patientDetail.source && (
                      <div className="source-badge" title={patientDetail.source}>
                        Real case &mdash; {patientDetail.source}
                      </div>
                    )}
                    <p className="chart-panel__note">{currentVisit.note}</p>
                  </>
                )}
              </div>
              <button className="analyze-button" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing && <span className="spinner" aria-hidden="true" />}
                {analyzing ? "Analyzing patient history…" : "Analyze patient history"}
              </button>
            </>
          )}
        </section>

        <section className="review-column">
          {!analysis && !analyzing && (
            <p className="empty-note">
              Select a patient and click &ldquo;Analyze patient history&rdquo; to generate a
              combined summary, timeline, flagged findings, and care-gap checklist.
            </p>
          )}
          {analyzing && !analysis && (
            <div className="review-loading">
              <span className="spinner spinner--large" aria-hidden="true" />
              <p>Running the two-call pipeline&hellip;</p>
            </div>
          )}
          <ReviewPanel analysis={analysis} />
        </section>
      </main>
    </div>
  );
}

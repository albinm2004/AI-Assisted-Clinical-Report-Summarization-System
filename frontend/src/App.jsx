import { useState, useEffect, useMemo } from "react";
import {
  Stethoscope,
  LayoutGrid,
  ChevronLeft,
  AlertTriangle,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const CONFIDENCE_STYLES = {
  grounded: { label: "Grounded", color: "#2E6B5E", bg: "#E7F0EC" },
  partially_grounded: { label: "Partially grounded", color: "#B8842E", bg: "#F7EFE0" },
  unsupported: { label: "Needs review", color: "#A8442C", bg: "#F6E9E5" },
};

function StatusDot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

export default function App() {
  const [patients, setPatients] = useState([]);
  const [patientsError, setPatientsError] = useState(null);
  const [patientsLoading, setPatientsLoading] = useState(true);

  const [view, setView] = useState("overview");
  const [activePatientId, setActivePatientId] = useState(null);
  const [activeVisitIndex, setActiveVisitIndex] = useState(0);
  const [results, setResults] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [lastAnalyzed, setLastAnalyzed] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/patients`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        setPatients(data);
        if (data.length) setActivePatientId(data[0].id);
      })
      .catch(() => {
        setPatientsError(
          `Couldn't reach the backend at ${API_BASE}. Make sure it's running (uvicorn app.main:app --reload).`
        );
      })
      .finally(() => setPatientsLoading(false));
  }, []);

  const activePatient = patients.find((p) => p.id === activePatientId);
  const activeResult = activePatientId ? results[activePatientId] : null;

  const analyzedCount = Object.keys(results).length;
  const kpis = useMemo(() => {
    const vals = Object.values(results);
    const flagCount = vals.reduce((sum, r) => sum + (r.flags?.length || 0), 0);
    const gapCount = vals.reduce((sum, r) => sum + (r.care_gaps?.length || 0), 0);
    return { flagCount, gapCount };
  }, [results]);

  const chartData = patients.map((p) => ({
    name: p.name,
    flags: results[p.id]?.flags?.length ?? 0,
  }));

  async function analyzePatient(patient) {
    setLoadingId(patient.id);
    setErrors((e) => ({ ...e, [patient.id]: null }));
    try {
      const response = await fetch(`${API_BASE}/patients/${patient.id}/analyze`, {
        method: "POST",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Request failed");
      }
      const data = await response.json();
      setResults((r) => ({ ...r, [patient.id]: data }));
      setLastAnalyzed(new Date());
    } catch (err) {
      setErrors((e) => ({ ...e, [patient.id]: err.message || "Couldn't analyze this patient. Try again." }));
    } finally {
      setLoadingId(null);
    }
  }

  function openPatient(id) {
    setActivePatientId(id);
    setActiveVisitIndex(0);
    setView("patient");
  }

  const colors = {
    ink: "#1C2624",
    paper: "#F2F4F1",
    panel: "#FFFFFF",
    line: "#D6DBD6",
    teal: "#2E6B5E",
    rust: "#A8442C",
    rustBg: "#F6E9E5",
    amber: "#B8842E",
    amberBg: "#F7EFE0",
    muted: "#4C5A56",
    sidebarMuted: "#9FB0AC",
  };

  if (patientsError) {
    return (
      <div
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          background: colors.paper,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "420px", textAlign: "center" }}>
          <ShieldAlert size={28} style={{ color: colors.rust, marginBottom: "12px" }} />
          <p style={{ fontSize: "14px", color: colors.ink }}>{patientsError}</p>
        </div>
      </div>
    );
  }

  if (patientsLoading || !activePatient) {
    return (
      <div
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          background: colors.paper,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={22} className="animate-spin" style={{ color: colors.teal }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: colors.ink, minHeight: "100vh" }}>
      <style>{`
        .cns-serif { font-family: 'Source Serif 4', serif; }
        .cns-navbtn { transition: background-color 120ms ease, color 120ms ease; }
        .cns-navbtn:hover { background-color: rgba(255,255,255,0.06); }
        .cns-lined {
          background-image: repeating-linear-gradient(to bottom, transparent, transparent 27px, #E3E7E2 28px);
          line-height: 28px;
        }
        .cns-stamp { border-radius: 3px; transform: rotate(-0.5deg); }
        .cns-chip { transition: border-color 120ms ease, color 120ms ease; }
        .cns-btn { transition: background-color 120ms ease, opacity 120ms ease; }
        .cns-btn:hover:not(:disabled) { background-color: #26584D; }
        .cns-row:hover { background-color: #F7F8F6; }
        .cns-focus:focus-visible { outline: 2px solid #2E6B5E; outline-offset: 2px; }
        .cns-shell { display: flex; min-height: 100vh; }
        @media (max-width: 760px) {
          .cns-shell { flex-direction: column; }
          .cns-sidebar { width: 100% !important; flex-direction: row !important; align-items: center; overflow-x: auto; }
          .cns-sidebar-section { display: none !important; }
        }
      `}</style>

      <div className="cns-shell">
        <div
          className="cns-sidebar"
          style={{
            width: "220px",
            flexShrink: 0,
            background: colors.ink,
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            padding: "18px 14px",
          }}
        >
          <div className="flex items-center gap-2 px-2" style={{ marginBottom: "22px" }}>
            <Stethoscope size={18} style={{ color: "#7FB3A3" }} />
            <span className="cns-serif" style={{ fontSize: "15px", fontWeight: 600 }}>
              Chart Review
            </span>
          </div>

          <button
            className="cns-navbtn cns-focus"
            onClick={() => setView("overview")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 10px",
              borderRadius: "5px",
              background: view === "overview" ? "rgba(255,255,255,0.08)" : "none",
              border: "none",
              color: "#FFFFFF",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <LayoutGrid size={15} />
            Overview
          </button>

          <div className="cns-sidebar-section" style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "12px", color: colors.sidebarMuted, padding: "0 10px", marginBottom: "6px" }}>
              Patients
            </p>
            <div className="flex flex-col gap-1">
              {patients.map((p) => {
                const r = results[p.id];
                const dotColor = !r ? "#4C5A56" : r.flags?.length ? colors.rust : colors.teal;
                const active = view === "patient" && activePatientId === p.id;
                return (
                  <button
                    key={p.id}
                    className="cns-navbtn cns-focus"
                    onClick={() => openPatient(p.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "8px 10px",
                      borderRadius: "5px",
                      background: active ? "rgba(255,255,255,0.08)" : "none",
                      border: "none",
                      color: active ? "#FFFFFF" : colors.sidebarMuted,
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <StatusDot color={dotColor} />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "16px" }}>
            <p style={{ fontSize: "11px", color: "#5C6B67" }}>Demo data only</p>
          </div>
        </div>

        <div style={{ flex: 1, background: colors.paper, minWidth: 0 }}>
          <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "28px 32px" }}>
            {view === "overview" ? (
              <>
                <header style={{ marginBottom: "22px" }}>
                  <h1 className="cns-serif" style={{ fontSize: "21px", fontWeight: 600 }}>
                    Overview
                  </h1>
                  <p style={{ fontSize: "13px", color: colors.muted, marginTop: "3px" }}>
                    {analyzedCount === 0
                      ? "No patients analyzed yet"
                      : `${analyzedCount} of ${patients.length} patients analyzed${
                          lastAnalyzed ? " - last run just now" : ""
                        }`}
                  </p>
                </header>

                <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "22px" }}>
                  {[
                    { label: "Patients", value: patients.length },
                    { label: "Active flags", value: analyzedCount ? kpis.flagCount : "\u2014" },
                    { label: "Care gaps found", value: analyzedCount ? kpis.gapCount : "\u2014" },
                  ].map((k) => (
                    <div
                      key={k.label}
                      style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "6px", padding: "16px 18px" }}
                    >
                      <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "6px" }}>{k.label}</p>
                      <p className="cns-serif" style={{ fontSize: "26px", fontWeight: 600 }}>
                        {k.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "6px", padding: "18px", marginBottom: "22px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "12px" }}>Flags by patient</p>
                  <div style={{ height: "180px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke={colors.line} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.muted }} axisLine={{ stroke: colors.line }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: colors.muted }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip contentStyle={{ fontSize: "12px", border: `1px solid ${colors.line}`, borderRadius: "4px" }} />
                        <Bar dataKey="flags" fill={colors.teal} radius={[3, 3, 0, 0]} maxBarSize={46} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "6px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${colors.line}` }}>
                        {["Patient", "Visits", "Flags", "Care gaps", ""].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 16px", color: colors.muted, fontWeight: 500 }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p) => {
                        const r = results[p.id];
                        return (
                          <tr key={p.id} className="cns-row" style={{ borderBottom: `1px solid ${colors.line}` }}>
                            <td style={{ padding: "10px 16px" }}>{p.name}</td>
                            <td style={{ padding: "10px 16px", color: colors.muted }}>{p.visits.length}</td>
                            <td style={{ padding: "10px 16px", color: r?.flags?.length ? colors.rust : colors.muted }}>
                              {r ? r.flags?.length ?? 0 : "\u2014"}
                            </td>
                            <td style={{ padding: "10px 16px", color: r?.care_gaps?.length ? colors.amber : colors.muted }}>
                              {r ? r.care_gaps?.length ?? 0 : "\u2014"}
                            </td>
                            <td style={{ padding: "10px 16px", textAlign: "right" }}>
                              <button
                                className="cns-focus"
                                onClick={() => openPatient(p.id)}
                                style={{ fontSize: "13px", color: colors.teal, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                              >
                                Open
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <button
                  className="cns-focus"
                  onClick={() => setView("overview")}
                  style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: colors.muted, background: "none", border: "none", cursor: "pointer", marginBottom: "10px", padding: 0 }}
                >
                  <ChevronLeft size={14} />
                  Overview
                </button>

                <header className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: "16px" }}>
                  <h1 className="cns-serif" style={{ fontSize: "21px", fontWeight: 600 }}>
                    {activePatient.name}
                  </h1>
                  <button
                    className="cns-btn cns-focus"
                    onClick={() => analyzePatient(activePatient)}
                    disabled={loadingId === activePatient.id}
                    style={{
                      background: colors.teal,
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "5px",
                      padding: "9px 15px",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: loadingId === activePatient.id ? "default" : "pointer",
                      opacity: loadingId === activePatient.id ? 0.8 : 1,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    {loadingId === activePatient.id && <Loader2 size={14} className="animate-spin" />}
                    {activeResult ? "Re-analyze" : "Analyze visits"}
                  </button>
                </header>

                <div className="flex gap-2" style={{ marginBottom: "16px", flexWrap: "wrap" }}>
                  {activePatient.visits.map((v, i) => (
                    <button
                      key={v.date}
                      className="cns-chip cns-focus"
                      onClick={() => setActiveVisitIndex(i)}
                      style={{
                        fontSize: "12px",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        border: `1px solid ${activeVisitIndex === i ? colors.teal : colors.line}`,
                        color: activeVisitIndex === i ? colors.teal : colors.muted,
                        background: colors.panel,
                        cursor: "pointer",
                      }}
                    >
                      {v.date}
                    </button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "6px" }}>
                    <div className="p-5">
                      <div className="cns-lined" style={{ fontSize: "14px", whiteSpace: "pre-wrap" }}>
                        {activePatient.visits[activeVisitIndex].text}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "8px" }} className="p-5">
                    {errors[activePatient.id] && (
                      <p style={{ color: colors.rust, fontSize: "13px", marginBottom: "10px" }}>{errors[activePatient.id]}</p>
                    )}

                    {!activeResult && !errors[activePatient.id] && (
                      <p style={{ fontSize: "14px", color: colors.muted }}>
                        Run the analysis to see a combined summary, a visit timeline, cited flags, and any care gaps.
                      </p>
                    )}

                    {activeResult && (
                      <div className="flex flex-col gap-6">
                        <div>
                          <h2 className="cns-serif" style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
                            Summary
                          </h2>
                          <dl style={{ fontSize: "13px", lineHeight: 1.6 }}>
                            <dt style={{ color: colors.muted }}>Chief complaint</dt>
                            <dd style={{ marginBottom: "6px" }}>{activeResult.summary?.chief_complaint}</dd>
                            <dt style={{ color: colors.muted }}>Findings</dt>
                            <dd style={{ marginBottom: "6px" }}>{activeResult.summary?.findings}</dd>
                            <dt style={{ color: colors.muted }}>Plan</dt>
                            <dd>{activeResult.summary?.plan}</dd>
                          </dl>
                        </div>

                        <div>
                          <h2 className="cns-serif" style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
                            Timeline
                          </h2>
                          <div className="flex flex-col gap-2">
                            {activeResult.timeline?.map((t, i) => (
                              <div key={i} style={{ fontSize: "13px", display: "flex", gap: "10px" }}>
                                <span style={{ color: colors.muted, minWidth: "78px" }}>{t.date}</span>
                                <span>{t.summary}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h2 className="cns-serif" style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
                            Flagged findings
                          </h2>
                          {activeResult.flags?.length ? (
                            <div className="flex flex-col gap-3">
                              {activeResult.flags.map((f, i) => {
                                const conf = CONFIDENCE_STYLES[f.confidence] || CONFIDENCE_STYLES.unsupported;
                                return (
                                  <div
                                    key={i}
                                    className="cns-stamp"
                                    style={{ padding: "10px 12px", background: colors.rustBg, border: `1.5px solid ${colors.rust}` }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                      <AlertTriangle size={13} style={{ color: colors.rust }} />
                                      <span style={{ color: colors.rust, fontWeight: 500, fontSize: "13px" }}>{f.finding}</span>
                                      <span
                                        style={{
                                          marginLeft: "auto",
                                          fontSize: "11px",
                                          fontWeight: 500,
                                          color: conf.color,
                                          background: conf.bg,
                                          borderRadius: "999px",
                                          padding: "2px 8px",
                                        }}
                                      >
                                        {conf.label}
                                      </span>
                                    </div>
                                    <p style={{ fontSize: "13px", color: "#7A3B2C", marginTop: "6px" }}>{f.reason}</p>
                                    {f.source_excerpt && (
                                      <p style={{ fontSize: "12px", color: colors.muted, marginTop: "5px", fontStyle: "italic" }}>
                                        "{f.source_excerpt}" - {f.visit_date}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p style={{ fontSize: "13px", color: colors.muted }}>Nothing flagged across these visits.</p>
                          )}
                        </div>

                        <div>
                          <h2 className="cns-serif" style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
                            Care gaps
                          </h2>
                          {activeResult.care_gaps?.length ? (
                            <div className="flex flex-col gap-2">
                              {activeResult.care_gaps.map((g, i) => (
                                <div key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", background: colors.amberBg, borderRadius: "4px", padding: "8px 10px" }}>
                                  <ShieldAlert size={14} style={{ color: colors.amber, flexShrink: 0, marginTop: "1px" }} />
                                  <div>
                                    <span style={{ fontWeight: 500 }}>{g.gap}</span>
                                    <p style={{ color: "#6B5222", marginTop: "2px" }}>{g.reason}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: "13px", color: colors.muted }}>No care gaps detected.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

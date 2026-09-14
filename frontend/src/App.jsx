import { useState, useEffect, useMemo } from "react";
import {
  Stethoscope,
  LayoutGrid,
  ChevronLeft,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Users,
  Flag,
  ClipboardList,
  HeartPulse,
  Pill,
  FlaskConical,
  Activity,
  Printer,
  FileText,
  Lock,
  LogOut,
  User,
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

// Demo-only login gate. There's no backend user store behind this - it's a
// client-side check so the app has a real login/logout flow to demo, not a
// production auth system. Swap this for a real backend auth call before
// this ever holds real patient data.
const AUTH_STORAGE_KEY = "medicity_auth_user";
const DEMO_USER = { username: "doctor", password: "medicity2026", displayName: "Dr. on Duty" };

const CONFIDENCE_STYLES = {
  grounded: { label: "Grounded", color: "#2E6B5E", bg: "#E7F0EA" },
  partially_grounded: { label: "Partially grounded", color: "#9C6B1F", bg: "#F5EBD8" },
  unsupported: { label: "Needs review", color: "#A8442C", bg: "#F5E6E1" },
};

const colors = {
  ink: "#1C2624",
  paper: "#F3F1E8",
  panel: "#FFFFFF",
  line: "#DED8C7",
  hairline: "#EAE5D6",
  teal: "#2E6B5E",
  tealDeep: "#1E4F44",
  tealTint: "#E7F0EA",
  rust: "#A8442C",
  rustBg: "#F5E6E1",
  amber: "#9C6B1F",
  amberBg: "#F5EBD8",
  slate: "#3E5C76",
  slateBg: "#E8EDF2",
  muted: "#5B6763",
  faint: "#8B948F",
  sidebarMuted: "#9FAFA9",
};

// Config for the four entity-extraction categories every visit is broken
// into by the first pipeline stage. Each gets its own icon/tint so the
// "Extracted entities" panel reads as a quick-scan dashboard rather than
// a wall of text.
const ENTITY_CATEGORIES = [
  { key: "diagnoses", label: "Diagnoses", icon: HeartPulse, color: colors.teal, bg: colors.tealTint },
  { key: "medications", label: "Medications", icon: Pill, color: colors.slate, bg: colors.slateBg },
  { key: "labs", label: "Labs", icon: FlaskConical, color: colors.amber, bg: colors.amberBg },
  { key: "key_findings", label: "Key findings", icon: Activity, color: colors.rust, bg: colors.rustBg },
];

function initialsOf(name) {
  const parts = name.replace(".", "").trim().split(/\s+/);
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function Seal({ name, size = 34, tone = "teal" }) {
  const bg = tone === "rust" ? colors.rustBg : colors.tealTint;
  const fg = tone === "rust" ? colors.rust : colors.tealDeep;
  return (
    <span
      className="cns-serif"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 600,
        flexShrink: 0,
        border: `1px solid ${tone === "rust" ? colors.rust : colors.teal}33`,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

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

function StatCard({ icon: Icon, label, value, tone }) {
  const tint = tone === "rust" ? colors.rustBg : tone === "amber" ? colors.amberBg : colors.tealTint;
  const fg = tone === "rust" ? colors.rust : tone === "amber" ? colors.amber : colors.teal;
  return (
    <div
      style={{
        background: colors.panel,
        border: `1px solid ${colors.line}`,
        borderRadius: "8px",
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: "8px",
          background: tint,
          color: fg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={17} />
      </span>
      <div>
        <p style={{ fontSize: "12px", color: colors.muted, marginBottom: "3px" }}>{label}</p>
        <p className="cns-serif" style={{ fontSize: "22px", fontWeight: 600, lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHeading({ children, count }) {
  return (
    <h2
      className="cns-serif"
      style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}
    >
      {children}
      {count != null && (
        <span
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 500,
            fontSize: "11px",
            color: colors.muted,
            background: colors.hairline,
            borderRadius: "999px",
            padding: "1px 8px",
          }}
        >
          {count}
        </span>
      )}
    </h2>
  );
}

function EntityCategory({ label, Icon, color, bg, items }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "6px",
            background: bg,
            color,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={12} />
        </span>
        <span style={{ fontSize: "12px", fontWeight: 500, color: colors.ink }}>{label}</span>
      </div>
      {items?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {items.map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: "12px",
                color: colors.ink,
                background: colors.paper,
                border: `1px solid ${colors.line}`,
                borderRadius: "999px",
                padding: "3px 10px",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: "12px", color: colors.faint, fontStyle: "italic" }}>None noted</p>
      )}
    </div>
  );
}

// --- Login ------------------------------------------------------------------

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    // Simulated network delay so the login feels real rather than instant.
    setTimeout(() => {
      if (username.trim() === DEMO_USER.username && password === DEMO_USER.password) {
        onLogin(username.trim());
      } else {
        setError("Incorrect username or password.");
      }
      setSubmitting(false);
    }, 350);
  }

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
      <style>{`.cns-serif { font-family: 'Source Serif 4', serif; }`}</style>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 46,
              height: 46,
              borderRadius: "10px",
              background: colors.tealTint,
              color: colors.tealDeep,
              marginBottom: "12px",
            }}
          >
            <Stethoscope size={22} />
          </span>
          <h1 className="cns-serif" style={{ fontSize: "22px", fontWeight: 600, color: colors.ink }}>
            MediCity
          </h1>
          <p style={{ fontSize: "13px", color: colors.muted, marginTop: "2px" }}>Chart Review &middot; Bengaluru</p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "10px", padding: "26px" }}
        >
          <h2 className="cns-serif" style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
            Sign in
          </h2>
          <p style={{ fontSize: "12.5px", color: colors.muted, marginBottom: "18px" }}>
            Enter your credentials to access the chart review dashboard.
          </p>

          <label style={{ display: "block", fontSize: "12px", color: colors.muted, marginBottom: "5px" }}>Username</label>
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <User size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: colors.faint }} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="doctor"
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 12px 9px 34px",
                fontSize: "13.5px",
                border: `1px solid ${colors.line}`,
                borderRadius: "6px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <label style={{ display: "block", fontSize: "12px", color: colors.muted, marginBottom: "5px" }}>Password</label>
          <div style={{ position: "relative", marginBottom: "6px" }}>
            <Lock size={15} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: colors.faint }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 12px 9px 34px",
                fontSize: "13.5px",
                border: `1px solid ${colors.line}`,
                borderRadius: "6px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {error && <p style={{ color: colors.rust, fontSize: "12.5px", marginTop: "8px" }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              marginTop: "18px",
              background: colors.teal,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              padding: "10px 16px",
              fontSize: "13.5px",
              fontWeight: 500,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.8 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
            }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "11.5px", color: colors.faint, marginTop: "16px" }}>
          Demo credentials: <strong>doctor</strong> / <strong>medicity2026</strong>
        </p>
      </div>
    </div>
  );
}

// --- Printable lab-style report -------------------------------------------
// A self-contained, print-friendly rendering of one patient's analysis -
// letterhead, patient info block, and the same underlying data as the
// dashboard, laid out the way a diagnostic/lab report reads: dense,
// black-on-white, sectioned with rules, ending in a sign-off line.

function ReportSection({ title, children, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : "20px" }}>
      <p
        style={{
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          color: "#333333",
          borderBottom: "1px solid #1a1a1a",
          paddingBottom: "4px",
          marginBottom: "10px",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function ReportField({ label, value }) {
  if (!value) return null;
  return (
    <p style={{ fontSize: "12.5px", marginBottom: "6px", lineHeight: 1.5 }}>
      <span style={{ color: "#555555", fontWeight: 600 }}>{label}: </span>
      {value}
    </p>
  );
}

function ReportListField({ label, items }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <span style={{ fontWeight: 600, color: "#333333" }}>{label}: </span>
      <span>{items?.length ? items.join(", ") : "—"}</span>
    </div>
  );
}

function ReportView({ patient, result, onBack }) {
  const generatedAt = useMemo(() => new Date(), []);
  const firstVisit = patient.visits[0]?.date;
  const lastVisit = patient.visits[patient.visits.length - 1]?.date;
  const reportId = `${patient.id.toUpperCase()}-${generatedAt.getTime().toString().slice(-6)}`;

  return (
    <div>
      <div className="no-print flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: "16px" }}>
        <button
          className="cns-focus"
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: colors.muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <ChevronLeft size={14} />
          Back to chart
        </button>
        <button
          className="cns-btn cns-focus"
          onClick={() => window.print()}
          style={{
            background: colors.teal,
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            padding: "9px 16px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
          }}
        >
          <Printer size={14} />
          Print / Save as PDF
        </button>
      </div>

      <div
        className="cns-report-sheet"
        style={{
          background: "#FFFFFF",
          border: `1px solid ${colors.line}`,
          borderRadius: "4px",
          padding: "40px 48px",
          color: "#1A1A1A",
        }}
      >
        <div style={{ textAlign: "center", borderBottom: "2px solid #1A1A1A", paddingBottom: "14px", marginBottom: "22px" }}>
          <p className="cns-serif" style={{ fontSize: "19px", fontWeight: 700, letterSpacing: "0.3px" }}>
            MediCity Hospital
          </p>
          <p style={{ fontSize: "11px", color: "#555555", marginTop: "2px" }}>
            Bengaluru, Karnataka &middot; Department of Medicine
          </p>
          <p
            className="cns-serif"
            style={{ fontSize: "13.5px", fontWeight: 600, marginTop: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
          >
            AI-Assisted Clinical Summary Report
          </p>
        </div>

        <table style={{ width: "100%", fontSize: "12.5px", marginBottom: "22px", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "3px 0", color: "#555555", width: "18%" }}>Patient name</td>
              <td style={{ padding: "3px 0", fontWeight: 600, width: "32%" }}>{patient.name}</td>
              <td style={{ padding: "3px 0", color: "#555555", width: "18%" }}>Report ID</td>
              <td style={{ padding: "3px 0" }}>{reportId}</td>
            </tr>
            <tr>
              <td style={{ padding: "3px 0", color: "#555555" }}>Visits reviewed</td>
              <td style={{ padding: "3px 0" }}>
                {patient.visits.length} ({firstVisit} to {lastVisit})
              </td>
              <td style={{ padding: "3px 0", color: "#555555" }}>Generated</td>
              <td style={{ padding: "3px 0" }}>{generatedAt.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <ReportSection title="Clinical Summary">
          <ReportField label="Chief complaint" value={result.summary?.chief_complaint} />
          <ReportField label="Findings" value={result.summary?.findings} />
          <ReportField label="Plan" value={result.summary?.plan} />
        </ReportSection>

        <ReportSection title="Visit-wise Extracted Findings">
          {patient.visits.map((v, i) => {
            const ex = result.extracted?.[i];
            const isLast = i === patient.visits.length - 1;
            return (
              <div
                key={v.date}
                style={{
                  marginBottom: isLast ? 0 : "14px",
                  paddingBottom: isLast ? 0 : "14px",
                  borderBottom: isLast ? "none" : "1px solid #E5E5E5",
                }}
              >
                <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "5px" }}>{v.date}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: "12px" }}>
                  <ReportListField label="Diagnoses" items={ex?.diagnoses} />
                  <ReportListField label="Medications" items={ex?.medications} />
                  <ReportListField label="Labs" items={ex?.labs} />
                  <ReportListField label="Key findings" items={ex?.key_findings} />
                </div>
              </div>
            );
          })}
        </ReportSection>

        <ReportSection title="Visit Timeline">
          <ol style={{ paddingLeft: "18px", fontSize: "12.5px", margin: 0 }}>
            {result.timeline?.map((t, i) => (
              <li key={i} style={{ marginBottom: "4px" }}>
                <strong>{t.date}:</strong> {t.summary}
              </li>
            ))}
          </ol>
        </ReportSection>

        <ReportSection title="Flagged Findings">
          {result.flags?.length ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Finding", "Reason", "Source excerpt", "Visit", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #999999", padding: "4px 6px", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.flags.map((f, i) => (
                  <tr key={i}>
                    <td style={{ padding: "5px 6px", borderBottom: "1px solid #EEEEEE", fontWeight: 600, verticalAlign: "top" }}>{f.finding}</td>
                    <td style={{ padding: "5px 6px", borderBottom: "1px solid #EEEEEE", verticalAlign: "top" }}>{f.reason}</td>
                    <td style={{ padding: "5px 6px", borderBottom: "1px solid #EEEEEE", fontStyle: "italic", verticalAlign: "top" }}>
                      &ldquo;{f.source_excerpt}&rdquo;
                    </td>
                    <td style={{ padding: "5px 6px", borderBottom: "1px solid #EEEEEE", verticalAlign: "top", whiteSpace: "nowrap" }}>{f.visit_date}</td>
                    <td style={{ padding: "5px 6px", borderBottom: "1px solid #EEEEEE", verticalAlign: "top", whiteSpace: "nowrap" }}>
                      {(CONFIDENCE_STYLES[f.confidence] || CONFIDENCE_STYLES.unsupported).label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: "12.5px", color: "#555555" }}>No findings flagged for closer attention.</p>
          )}
        </ReportSection>

        <ReportSection title="Care Gaps" last>
          {result.care_gaps?.length ? (
            <ul style={{ paddingLeft: "18px", fontSize: "12.5px", margin: 0 }}>
              {result.care_gaps.map((g, i) => (
                <li key={i} style={{ marginBottom: "4px" }}>
                  <strong>{g.gap}:</strong> {g.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "12.5px", color: "#555555" }}>No care gaps identified.</p>
          )}
        </ReportSection>

        <div style={{ marginTop: "30px", paddingTop: "14px", borderTop: "1px solid #CCCCCC", fontSize: "10.5px", color: "#777777" }}>
          <p>
            This report was generated by an AI-assisted summarization pipeline from the visit notes on file. It is
            intended to support, not replace, clinical review. Every flagged finding above has been checked against
            the source note for grounding before being shown here.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "26px", fontSize: "11px", color: "#333333" }}>
            <p>Reviewed by: ______________________</p>
            <p>Date: ______________</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

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

  function handleLogin(username) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, username);
    } catch {
      // localStorage can be unavailable (private browsing, blocked cookies);
      // the session still works, it just won't survive a refresh.
    }
    setCurrentUser(username);
  }

  function handleLogout() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* see note above */
    }
    setCurrentUser(null);
    setView("overview");
  }

  useEffect(() => {
    if (!currentUser) return;
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
  }, [currentUser]);

  const activePatient = patients.find((p) => p.id === activePatientId);
  const activeResult = activePatientId ? results[activePatientId] : null;
  const activeExtracted = activeResult?.extracted?.[activeVisitIndex];

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

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
          background-image: repeating-linear-gradient(to bottom, transparent, transparent 27px, #E7E2D2 28px);
          line-height: 28px;
        }
        .cns-stamp { border-radius: 4px; transform: rotate(-0.6deg); box-shadow: 0 1px 0 rgba(168,68,44,0.15); }
        .cns-chip { transition: border-color 120ms ease, color 120ms ease; }
        .cns-btn { transition: background-color 120ms ease, opacity 120ms ease; }
        .cns-btn:hover:not(:disabled) { background-color: ${colors.tealDeep}; }
        .cns-row:hover { background-color: #FAF8F1; }
        .cns-focus:focus-visible { outline: 2px solid ${colors.teal}; outline-offset: 2px; }
        .cns-shell { display: flex; min-height: 100vh; }
        .cns-step-line { position: absolute; left: 5px; top: 14px; bottom: -18px; width: 1px; background: ${colors.line}; }
        @media (max-width: 760px) {
          .cns-shell { flex-direction: column; }
          .cns-sidebar { width: 100% !important; flex-direction: row !important; align-items: center; overflow-x: auto; }
          .cns-sidebar-section { display: none !important; }
        }
        @media print {
          .cns-sidebar, .no-print { display: none !important; }
          .cns-content-wrap { max-width: none !important; padding: 0 !important; }
          body, .cns-paper-bg { background: #FFFFFF !important; }
          .cns-report-sheet { border: none !important; padding: 0 !important; }
        }
      `}</style>

      <div className="cns-shell">
        <div
          className="cns-sidebar"
          style={{
            width: "232px",
            flexShrink: 0,
            background: colors.ink,
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            padding: "20px 14px",
          }}
        >
          <div style={{ padding: "0 6px 16px 6px", marginBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: "4px" }}>
              <Stethoscope size={17} style={{ color: "#7FB3A3" }} />
              <span className="cns-serif" style={{ fontSize: "14.5px", fontWeight: 600, letterSpacing: "0.2px" }}>
                MediCity
              </span>
            </div>
            <p style={{ fontSize: "11px", color: colors.sidebarMuted, paddingLeft: "24px" }}>
              Chart Review &middot; Bengaluru
            </p>
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
            <p style={{ fontSize: "11.5px", color: colors.sidebarMuted, padding: "0 10px", marginBottom: "8px" }}>
              Patients under review
            </p>
            <div className="flex flex-col gap-1">
              {patients.map((p) => {
                const r = results[p.id];
                const flagged = r?.flags?.length > 0;
                const active = view === "patient" && activePatientId === p.id;
                return (
                  <button
                    key={p.id}
                    className="cns-navbtn cns-focus"
                    onClick={() => openPatient(p.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "7px 8px",
                      borderRadius: "6px",
                      background: active ? "rgba(255,255,255,0.08)" : "none",
                      border: "none",
                      color: active ? "#FFFFFF" : colors.sidebarMuted,
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      className="cns-serif"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: flagged ? "rgba(168,68,44,0.22)" : "rgba(127,179,163,0.18)",
                        color: flagged ? "#E39E8C" : "#9FD4C0",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {initialsOf(p.name)}
                    </span>
                    <span style={{ flex: 1 }}>{p.name}</span>
                    {!r && <StatusDot color="#4C5A56" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="flex items-center gap-2" style={{ padding: "6px 6px 10px 6px" }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "rgba(127,179,163,0.18)",
                  color: "#9FD4C0",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={13} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "12px", color: "#FFFFFF", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentUser}
                </p>
                <p style={{ fontSize: "10.5px", color: "#5C6B67" }}>Demo data only</p>
              </div>
            </div>
            <button
              className="cns-navbtn cns-focus"
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "7px 8px",
                borderRadius: "6px",
                background: "none",
                border: "none",
                color: colors.sidebarMuted,
                fontSize: "12.5px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </div>

        <div className="cns-paper-bg" style={{ flex: 1, background: colors.paper, minWidth: 0 }}>
          <div className="cns-content-wrap" style={{ maxWidth: "1040px", margin: "0 auto", padding: "28px 32px" }}>
            {view === "report" && activePatient && activeResult ? (
              <ReportView patient={activePatient} result={activeResult} onBack={() => setView("patient")} />
            ) : view === "overview" ? (
              <>
                <header style={{ marginBottom: "22px" }}>
                  <h1 className="cns-serif" style={{ fontSize: "23px", fontWeight: 600 }}>
                    Ward overview
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
                  <StatCard icon={Users} label="Patients" value={patients.length} tone="teal" />
                  <StatCard icon={Flag} label="Active flags" value={analyzedCount ? kpis.flagCount : "—"} tone="rust" />
                  <StatCard icon={ClipboardList} label="Care gaps found" value={analyzedCount ? kpis.gapCount : "—"} tone="amber" />
                </div>

                <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "8px", padding: "18px", marginBottom: "22px" }}>
                  <p className="cns-serif" style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>
                    Flags by patient
                  </p>
                  <div style={{ height: "180px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke={colors.hairline} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.muted }} axisLine={{ stroke: colors.line }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: colors.muted }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip contentStyle={{ fontSize: "12px", border: `1px solid ${colors.line}`, borderRadius: "4px" }} />
                        <Bar dataKey="flags" fill={colors.teal} radius={[3, 3, 0, 0]} maxBarSize={46} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: `1px solid ${colors.line}` }}>
                    <p className="cns-serif" style={{ fontSize: "14px", fontWeight: 600 }}>Patient register</p>
                  </div>
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
                      {patients.map((p, idx) => {
                        const r = results[p.id];
                        return (
                          <tr
                            key={p.id}
                            className="cns-row"
                            style={{
                              borderBottom: `1px solid ${colors.hairline}`,
                              background: idx % 2 === 1 ? "#FBFAF4" : "transparent",
                            }}
                          >
                            <td style={{ padding: "10px 16px" }}>
                              <div className="flex items-center gap-2">
                                <Seal name={p.name} size={26} tone={r?.flags?.length ? "rust" : "teal"} />
                                {p.name}
                              </div>
                            </td>
                            <td style={{ padding: "10px 16px", color: colors.muted }}>{p.visits.length}</td>
                            <td style={{ padding: "10px 16px" }}>
                              {r ? (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    padding: "2px 9px",
                                    borderRadius: "999px",
                                    color: r.flags?.length ? colors.rust : colors.muted,
                                    background: r.flags?.length ? colors.rustBg : colors.hairline,
                                  }}
                                >
                                  {r.flags?.length ?? 0}
                                </span>
                              ) : (
                                <span style={{ color: colors.faint }}>&mdash;</span>
                              )}
                            </td>
                            <td style={{ padding: "10px 16px" }}>
                              {r ? (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    padding: "2px 9px",
                                    borderRadius: "999px",
                                    color: r.care_gaps?.length ? colors.amber : colors.muted,
                                    background: r.care_gaps?.length ? colors.amberBg : colors.hairline,
                                  }}
                                >
                                  {r.care_gaps?.length ?? 0}
                                </span>
                              ) : (
                                <span style={{ color: colors.faint }}>&mdash;</span>
                              )}
                            </td>
                            <td style={{ padding: "10px 16px", textAlign: "right" }}>
                              <button
                                className="cns-focus"
                                onClick={() => openPatient(p.id)}
                                style={{ fontSize: "13px", color: colors.teal, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                              >
                                Open chart
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
                  style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: colors.muted, background: "none", border: "none", cursor: "pointer", marginBottom: "12px", padding: 0 }}
                >
                  <ChevronLeft size={14} />
                  Overview
                </button>

                <header className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: "18px" }}>
                  <div className="flex items-center gap-3">
                    <Seal name={activePatient.name} size={40} tone={activeResult?.flags?.length ? "rust" : "teal"} />
                    <div>
                      <h1 className="cns-serif" style={{ fontSize: "21px", fontWeight: 600, lineHeight: 1.15 }}>
                        {activePatient.name}
                      </h1>
                      <p style={{ fontSize: "12px", color: colors.muted }}>
                        {activePatient.visits.length} visits on file
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeResult && (
                      <button
                        className="cns-focus"
                        onClick={() => setView("report")}
                        style={{
                          background: colors.panel,
                          color: colors.teal,
                          border: `1px solid ${colors.teal}`,
                          borderRadius: "6px",
                          padding: "9px 14px",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <FileText size={14} />
                        View report
                      </button>
                    )}
                    <button
                      className="cns-btn cns-focus"
                      onClick={() => analyzePatient(activePatient)}
                      disabled={loadingId === activePatient.id}
                      style={{
                        background: colors.teal,
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "6px",
                        padding: "9px 16px",
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
                  </div>
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
                  <div className="flex flex-col gap-5">
                    <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "8px", overflow: "hidden" }}>
                      <div
                        style={{
                          padding: "10px 16px",
                          borderBottom: `1px solid ${colors.hairline}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <span className="cns-serif" style={{ fontSize: "13px", fontWeight: 600, color: colors.tealDeep }}>
                          OPD Case Sheet
                        </span>
                        <span style={{ fontSize: "11px", color: colors.faint }}>
                          {activePatient.visits[activeVisitIndex].date}
                        </span>
                      </div>
                      <div className="p-5">
                        <div className="cns-lined" style={{ fontSize: "14px", whiteSpace: "pre-wrap" }}>
                          {activePatient.visits[activeVisitIndex].text}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: colors.panel, border: `1px solid ${colors.line}`, borderRadius: "8px", overflow: "hidden" }}>
                      <div
                        style={{
                          padding: "10px 16px",
                          borderBottom: `1px solid ${colors.hairline}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <span className="cns-serif" style={{ fontSize: "13px", fontWeight: 600, color: colors.tealDeep }}>
                          Extracted entities
                        </span>
                        <span style={{ fontSize: "11px", color: colors.faint }}>this visit</span>
                      </div>
                      <div className="p-5">
                        {activeExtracted ? (
                          <div className="flex flex-col gap-4">
                            {ENTITY_CATEGORIES.map((cat) => (
                              <EntityCategory
                                key={cat.key}
                                label={cat.label}
                                Icon={cat.icon}
                                color={cat.color}
                                bg={cat.bg}
                                items={activeExtracted[cat.key]}
                              />
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: "13px", color: colors.muted }}>
                            Run the analysis to see diagnoses, medications, labs, and key findings pulled out of this visit.
                          </p>
                        )}
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
                          <SectionHeading>Clinical summary</SectionHeading>
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
                          <SectionHeading count={activeResult.timeline?.length ?? 0}>Visit timeline</SectionHeading>
                          <div className="flex flex-col">
                            {activeResult.timeline?.map((t, i) => {
                              const isLast = i === activeResult.timeline.length - 1;
                              return (
                                <div key={i} style={{ display: "flex", gap: "12px", position: "relative", paddingBottom: isLast ? 0 : "16px" }}>
                                  {!isLast && <span className="cns-step-line" />}
                                  <span
                                    style={{
                                      width: 11,
                                      height: 11,
                                      borderRadius: "50%",
                                      background: colors.teal,
                                      marginTop: "3px",
                                      flexShrink: 0,
                                      zIndex: 1,
                                    }}
                                  />
                                  <div>
                                    <p style={{ fontSize: "12px", color: colors.muted, fontWeight: 500 }}>{t.date}</p>
                                    <p style={{ fontSize: "13px", marginTop: "2px" }}>{t.summary}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <SectionHeading count={activeResult.flags?.length ?? 0}>Flagged findings</SectionHeading>
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
                          <SectionHeading count={activeResult.care_gaps?.length ?? 0}>Care gaps</SectionHeading>
                          {activeResult.care_gaps?.length ? (
                            <div className="flex flex-col gap-2">
                              {activeResult.care_gaps.map((g, i) => (
                                <div key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", background: colors.amberBg, borderRadius: "5px", padding: "9px 11px" }}>
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

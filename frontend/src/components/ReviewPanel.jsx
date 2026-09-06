import { useState } from "react";

const ICON_PATHS = {
  summary: (
    <>
      <path d="M8 3h8a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1V4a1 1 0 0 1 1-1Z" />
      <path d="M9 3v3h6V3" />
      <path d="M8 12h8M8 16h5" />
    </>
  ),
  timeline: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h13l-3 4 3 4H5" />
    </>
  ),
  careGap: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>
  ),
};

function SectionIcon({ name }) {
  return (
    <svg
      className="review-section__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function TimelineSection({ timeline }) {
  return (
    <div className="review-section">
      <h3 className="review-section__title">
        <SectionIcon name="timeline" />
        Timeline
      </h3>
      <ol className="mini-timeline">
        {timeline.map((entry, i) => (
          <li key={i} className="mini-timeline__item">
            <span className="mini-timeline__date">{entry.date}</span>
            <span className="mini-timeline__summary">{entry.summary}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SummarySection({ summary }) {
  return (
    <div className="review-section">
      <h3 className="review-section__title">
        <SectionIcon name="summary" />
        Overall Summary
      </h3>
      <dl className="summary-grid">
        <dt>Chief complaint</dt>
        <dd>{summary.chief_complaint}</dd>
        <dt>Findings</dt>
        <dd>{summary.findings}</dd>
        <dt>Plan</dt>
        <dd>{summary.plan}</dd>
      </dl>
    </div>
  );
}

function FlagsSection({ flags }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="review-section">
      <h3 className="review-section__title">
        <SectionIcon name="flag" />
        Flagged Findings
      </h3>
      {flags.length === 0 && <p className="empty-note">No critical flags found.</p>}
      <div className="flag-list">
        {flags.map((f, i) => (
          <div
            key={i}
            className="flag-stamp"
            onMouseEnter={() => setOpenIndex(i)}
            onMouseLeave={() => setOpenIndex((cur) => (cur === i ? null : cur))}
            onClick={() => setOpenIndex((cur) => (cur === i ? null : i))}
            tabIndex={0}
            role="button"
            aria-expanded={openIndex === i}
          >
            <div className="flag-stamp__header">
              <span className="flag-stamp__badge">Flagged</span>
              <span className="flag-stamp__finding">{f.finding}</span>
            </div>
            <p className="flag-stamp__reason">{f.reason}</p>
            {openIndex === i && (
              <blockquote className="flag-stamp__source">&ldquo;{f.source_excerpt}&rdquo;</blockquote>
            )}
            {openIndex !== i && <p className="flag-stamp__hint">hover or click for source</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CareGapsSection({ careGaps }) {
  return (
    <div className="review-section">
      <h3 className="review-section__title">
        <SectionIcon name="careGap" />
        Care-Gap Checklist
      </h3>
      {careGaps.length === 0 && <p className="empty-note">No care gaps detected.</p>}
      <ul className="care-gap-list">
        {careGaps.map((g, i) => (
          <li key={i} className="care-gap-item">
            <span className="care-gap-item__box" aria-hidden="true">
              ☐
            </span>
            <div>
              <p className="care-gap-item__gap">{g.gap}</p>
              <p className="care-gap-item__reason">{g.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReviewPanel({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="review-panel">
      <SummarySection summary={analysis.summary} />
      <TimelineSection timeline={analysis.timeline} />
      <FlagsSection flags={analysis.flags} />
      <CareGapsSection careGaps={analysis.care_gaps} />
    </div>
  );
}

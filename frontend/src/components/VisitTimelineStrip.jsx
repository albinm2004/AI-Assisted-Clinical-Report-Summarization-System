function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function VisitTimelineStrip({ visits, selectedIndex, onSelect }) {
  return (
    <div className="visit-strip">
      {visits.map((v, i) => (
        <button
          key={v.date + i}
          className={`date-chip ${i === selectedIndex ? "date-chip--active" : ""}`}
          onClick={() => onSelect(i)}
        >
          <span className="date-chip__index">Visit {i + 1}</span>
          <span className="date-chip__date">{formatDate(v.date)}</span>
        </button>
      ))}
    </div>
  );
}

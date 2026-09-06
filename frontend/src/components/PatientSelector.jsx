export default function PatientSelector({ patients, selectedId, onSelect }) {
  return (
    <div className="folder-tabs" role="tablist" aria-label="Patients">
      {patients.map((p) => (
        <button
          key={p.id}
          role="tab"
          aria-selected={p.id === selectedId}
          className={`folder-tab ${p.id === selectedId ? "folder-tab--active" : ""}`}
          onClick={() => onSelect(p.id)}
        >
          {p.name}
          {p.source && (
            <span className="folder-tab__badge" title="Real, published case report">
              real
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

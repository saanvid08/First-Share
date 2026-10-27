export default function ProgressBar({ value, label }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="progress">
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="muted small">{label}</p>
    </div>
  );
}

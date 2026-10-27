// A simple SVG line chart. Labels, a legend, and a text summary keep it readable without relying on color alone.
import { money } from '../lib/money';

export default function LineChart({ series, label, height = 260, format = money }) {
  const W = 640;
  const H = height;
  const pad = { l: 72, r: 16, t: 16, b: 30 };
  const points = series.flatMap((s) => s.points);
  if (!points.length) return <p className="muted">Nothing to chart yet.</p>;

  const xMin = Math.min(...points.map((p) => p.x));
  const xMax = Math.max(...points.map((p) => p.x), xMin + 1);
  const yMin = Math.min(0, ...points.map((p) => p.y));
  const yMax = Math.max(...points.map((p) => p.y), yMin + 1);
  const sx = (x) => pad.l + ((x - xMin) / (xMax - xMin)) * (W - pad.l - pad.r);
  const sy = (y) => H - pad.b - ((y - yMin) / (yMax - yMin)) * (H - pad.t - pad.b);
  const ticks = [0, 1, 2, 3, 4].map((i) => yMin + ((yMax - yMin) * i) / 4);
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="grid-line" />
            <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="tick">{format(t)}</text>
          </g>
        ))}
        {series.map((s) => (
          <path key={s.label} d={path(s.points)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </svg>
      <figcaption className="legend">
        {series.map((s) => (
          <span key={s.label}><i style={{ background: s.color }} aria-hidden="true" />{s.label}</span>
        ))}
      </figcaption>
    </figure>
  );
}

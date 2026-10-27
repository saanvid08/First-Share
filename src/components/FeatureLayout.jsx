// Every feature uses this layout: a side panel of sections on the left (a row of tabs on phones), and the chosen section on the right.
export default function FeatureLayout({ title, subtitle, sections, activeId, onSelect }) {
  const active = sections.find((s) => s.id === activeId) || sections[0];
  return (
    <div className="feature">
      <header className="feature-head">
        <h1>{title}</h1>
        {subtitle && <p className="lead">{subtitle}</p>}
      </header>
      <div className="feature-body">
        <nav className="subpanel" aria-label={`${title} sections`}>
          {sections.map((s) => (
            <button
              key={s.id}
              className={s.id === active.id ? 'sub on' : 'sub'}
              aria-current={s.id === active.id ? 'true' : undefined}
              onClick={() => onSelect(s.id)}
            >
              <span>{s.label}</span>
              {s.badge && <span className="badge">{s.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="feature-content">{active.render()}</div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import FeatureLayout from '../components/FeatureLayout';
import { LESSONS } from '../data/lessons';

export default function Progress({ state, setTab }) {
  const [activeId, setActiveId] = useState('overview');
  const done = LESSONS.filter((l) => state.lessons[l.id]);
  const todo = LESSONS.filter((l) => !state.lessons[l.id]);
  const trades = state.market.portfolio.transactions.length;

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      render: () => (
        <>
          <p className="lead">Progress is measured by what you have learned and tried, not by how much virtual money you have.</p>
          <div className="stats">
            <div className="stat"><span className="label">Lessons complete</span><strong>{done.length} of {LESSONS.length}</strong></div>
            <div className="stat"><span className="label">Life scenarios finished</span><strong>{state.scenarioRuns}</strong></div>
            <div className="stat"><span className="label">Market trades</span><strong>{trades}</strong></div>
          </div>
          <div className="card">
            <p className="label">Next</p>
            {todo.length ? (
              <>
                <p>Revisit <strong>{todo[0].title}</strong> to finish the basics.</p>
                <button className="btn primary" onClick={() => setTab('learn')}>Open lessons</button>
              </>
            ) : (
              <>
                <p>You have finished every lesson. Try a different path in the life scenario, or compare two starting ages.</p>
                <button className="btn primary" onClick={() => setTab('simulate')}>Go to Simulate</button>
              </>
            )}
          </div>
        </>
      ),
    },
    {
      id: 'lessons',
      label: 'Lessons',
      render: () => (
        <ul className="checklist">
          {LESSONS.map((l) => (
            <li key={l.id}>
              <span className={state.lessons[l.id] ? 'dot done' : 'dot'} aria-hidden="true" />
              {l.title} <span className="muted small">{state.lessons[l.id] ? 'Complete' : 'Not yet'}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'activity',
      label: 'Activity',
      render: () => (
        <>
          <p className="muted">Your recent market trades, newest first.</p>
          {trades === 0 ? (
            <p className="empty">No trades yet. Try buying a fictional share in Simulate, then Virtual market.</p>
          ) : (
            <ul className="events">
              {[...state.market.portfolio.transactions].reverse().slice(0, 10).map((t, i) => (
                <li key={i}>{t.type === 'buy' ? 'Bought' : 'Sold'} {t.shares} {t.ticker} at ${t.price.toFixed(2)} (total ${t.total.toFixed(2)})</li>
              ))}
            </ul>
          )}
        </>
      ),
    },
  ];

  return (
    <FeatureLayout
      title="My Progress"
      subtitle="A simple record of what you have learned and tried."
      sections={sections}
      activeId={activeId}
      onSelect={setActiveId}
    />
  );
}

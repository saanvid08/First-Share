import { useState } from 'react';
import FeatureLayout from '../components/FeatureLayout';
import LineChart from '../components/LineChart';
import Market from './Market';
import { startState, choose, worth, billChoices, dropChoices, ALLOCATIONS, summary, TITLES, STEP_TEXT, PRICE } from '../lib/scenario';
import { money, signedMoney } from '../lib/money';

const START_MONEY = 700;

export default function Simulate({ state, update }) {
  const [activeId, setActiveId] = useState('life');
  const sections = [
    { id: 'life', label: 'Life decision', render: () => <LifeScenario state={state} update={update} /> },
    { id: 'market', label: 'Practice market', render: () => <Market market={state.market} update={update} /> },
  ];
  return (
    <FeatureLayout
      title="Simulate"
      subtitle="Practice with fictional money. Watch how each decision changes what you have left."
      sections={sections}
      activeId={activeId}
      onSelect={setActiveId}
    />
  );
}

function Delta({ value }) {
  return <span className={value >= 0 ? 'up' : 'down'}>{signedMoney(value)}</span>;
}

function LifeScenario({ state, update }) {
  const s0 = state.scenario || startState();
  const s = { ...s0, history: s0.history || [{ label: 'Start', value: START_MONEY }] };
  const now = worth(s);
  const feedback = state.scenarioFeedback;
  const [error, setError] = useState('');

  const act = (id) => {
    const res = choose(s, id);
    if (res.error) return setError(res.error);
    setError('');
    const finished = res.state.step === 3 && s.step !== 3;
    update({
      scenario: res.state,
      scenarioFeedback: { ...res.feedback, change: worth(res.state) - now },
      scenarioRuns: finished ? state.scenarioRuns + 1 : state.scenarioRuns,
    });
  };

  const restart = () => {
    setError('');
    update({ scenario: startState(), scenarioFeedback: null, lastRun: summary(s) });
  };

  const previewOf = (id) => {
    const r = choose(s, id);
    return r.state ? worth(r.state) : null;
  };

  const options =
    s.step === 0 ? ALLOCATIONS.map((a) => ({ id: a.id, title: a.title, detail: a.detail, enabled: true }))
    : s.step === 1 ? billChoices(s).map((c) => ({ id: c.id, title: c.title, detail: c.enabled ? '' : c.reason, enabled: c.enabled }))
    : s.step === 2 ? dropChoices(s).map((c) => ({ id: c.id, title: c.title, detail: c.enabled ? '' : c.reason, enabled: c.enabled }))
    : [];

  return (
    <div className="life">
      <div className="life-top">
        <div className="card money-box">
          <p className="label">Money you have left</p>
          <p className="big">{money(now)}</p>
          <p className="small">Change since you started: <Delta value={now - START_MONEY} /></p>
          <dl className="ledger">
            <div><dt>Spendable cash</dt><dd>{money(s.cash)}</dd></div>
            <div><dt>Emergency savings</dt><dd>{money(s.emergency)}</dd></div>
            <div><dt>NVSW shares ({s.shares} at {money(s.price)})</dt><dd>{money(s.shares * s.price)}</dd></div>
            <div><dt>Debt</dt><dd>{s.debt ? `-${money(s.debt)}` : money(0)}</dd></div>
          </dl>
        </div>

        <div className="card">
          <p className="label">How your money moved</p>
          <LineChart
            height={210}
            label="Money you have left after each step"
            series={[{ label: 'Money left', color: '#1f7a7a', points: s.history.map((h, i) => ({ x: i, y: h.value })) }]}
          />
          <ol className="path">
            {s.history.map((h, i) => (
              <li key={i}>
                <strong>{h.label}</strong> {money(h.value)}
                {i > 0 && <> <Delta value={h.value - s.history[i - 1].value} /></>}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="muted small">Step {Math.min(s.step + 1, 4)} of 4: {TITLES[s.step]}</p>
      <article className="card">
        <h2>{TITLES[s.step]}</h2>
        <p>{STEP_TEXT[s.step]}</p>
      </article>

      {feedback ? (
        <article className="card feedback" aria-live="polite">
          {feedback.title && <p className="label">Your choice: {feedback.title}</p>}
          <p><strong>Money change from this choice:</strong> <Delta value={feedback.change} /></p>
          <p><strong>What happened:</strong> {feedback.happened}</p>
          <p><strong>Trade-off:</strong> {feedback.tradeoff}</p>
          <p><strong>Concept:</strong> {feedback.concept}</p>
          <p className="muted small">{feedback.notGuaranteed}</p>
          <button className="btn primary" onClick={() => update({ scenarioFeedback: null })}>
            {s.step === 3 ? 'See your results' : 'Continue'}
          </button>
        </article>
      ) : s.step < 3 ? (
        <div className="options" role="group" aria-label="Choose one option">
          {options.map((o) => {
            const after = o.enabled ? previewOf(o.id) : null;
            return (
              <button key={o.id} className="card option" disabled={!o.enabled} onClick={() => act(o.id)}>
                <strong>{o.title}</strong>
                {o.detail && <span className="muted small">{o.detail}</span>}
                {after !== null && (
                  <span className="preview">After this choice: {money(after)} (<Delta value={after - now} />)</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <Results s={s} lastRun={state.lastRun} onRestart={restart} />
      )}

      {error && <p className="error" role="alert">{error}</p>}
      {s.step === 0 && !feedback && (
        <p className="muted small">Scenario prices are fictional. NovaSoft starts at ${PRICE.start.toFixed(2)}, and the bill is $400.</p>
      )}
    </div>
  );
}

function Results({ s, lastRun, onRestart }) {
  const r = summary(s);
  return (
    <article className="card results">
      <p className="label">Your results</p>
      <div className="stats">
        <div className="stat"><span className="label">Net worth</span><strong>{money(r.netWorth)}</strong></div>
        <div className="stat"><span className="label">Shares at $40.80</span><strong>{money(r.marketValue)}</strong></div>
        <div className="stat"><span className="label">On-paper change</span><strong>{signedMoney(r.unrealized)}</strong></div>
        <div className="stat"><span className="label">Locked-in result</span><strong>{signedMoney(r.realized)}</strong></div>
      </div>
      <p>This is one path through one scenario. Seeing the consequences of each choice is the point. The same choices would not guarantee the same results in real life.</p>
      <p><strong>What to notice:</strong> {r.shares > 0
        ? 'Your investing money depended on a single company. A different company could have moved the other way, which is why spreading money across companies matters.'
        : 'Keeping money reachable protected you from selling at a bad time, though it may not grow as much.'}</p>

      {lastRun && (
        <div className="compare-box">
          <p className="label">Compared with your previous path</p>
          <table>
            <thead><tr><th>Measure</th><th>Previous</th><th>This path</th></tr></thead>
            <tbody>
              <tr><td>Net worth</td><td>{money(lastRun.netWorth)}</td><td>{money(r.netWorth)}</td></tr>
              <tr><td>Emergency savings</td><td>{money(lastRun.emergency)}</td><td>{money(r.emergency)}</td></tr>
              <tr><td>Shares owned</td><td>{lastRun.shares}</td><td>{r.shares}</td></tr>
              <tr><td>Debt</td><td>{money(lastRun.debt)}</td><td>{money(r.debt)}</td></tr>
            </tbody>
          </table>
          <p className="muted small">A better number in one path does not prove the same choice works in real life.</p>
        </div>
      )}

      <button className="btn primary" onClick={onRestart}>Try a different path</button>
    </article>
  );
}

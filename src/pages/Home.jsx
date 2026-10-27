import { LESSONS } from '../data/lessons';
import ProgressBar from '../components/ProgressBar';

export default function Home({ state, setTab }) {
  const done = LESSONS.filter((l) => state.lessons[l.id]).length;
  const next = LESSONS.find((l) => !state.lessons[l.id]);

  return (
    <section>
      <p className="eyebrow">Welcome back</p>
      <h1>Your next step</h1>

      <div className="card hero">
        <h2>{next ? next.title : 'Every lesson is complete'}</h2>
        <p>{next ? next.blurb : 'Try a simulation next, or compare two starting ages.'}</p>
        <button className="btn primary" onClick={() => setTab(next ? 'learn' : 'simulate')}>
          {next ? 'Continue learning' : 'Start a simulation'}
        </button>
        <ProgressBar value={done / LESSONS.length} label={`${done} of ${LESSONS.length} lessons complete`} />
      </div>

      <div className="grid three">
        <button className="card choice" onClick={() => setTab('simulate')}>
          <h3>Simulate</h3>
          <p className="muted">Make a first paycheck decision, then trade fictional shares.</p>
        </button>
        <button className="card choice" onClick={() => setTab('compare')}>
          <h3>Compare</h3>
          <p className="muted">See how starting at 18 and at 28 changes the same plan.</p>
        </button>
        <button className="card choice" onClick={() => setTab('progress')}>
          <h3>My Progress</h3>
          <p className="muted">Review what you have learned and what to revisit.</p>
        </button>
      </div>
    </section>
  );
}

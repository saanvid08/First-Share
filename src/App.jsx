import { useEffect, useState } from 'react';
import { loadState, saveState, defaultState } from './lib/storage';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Simulate from './pages/Simulate';
import Compare from './pages/Compare';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';

const NAV = [
  { key: 'home', label: 'Home' },
  { key: 'learn', label: 'Learn' },
  { key: 'simulate', label: 'Simulate' },
  { key: 'compare', label: 'Compare' },
  { key: 'progress', label: 'My Progress' },
  { key: 'settings', label: 'Settings' },
];

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('home');

  useEffect(() => { saveState(state); }, [state]);

  const update = (patch) =>
    setState((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  const reset = () => setState({ ...defaultState(), onboarded: true });

  if (!state.onboarded) {
    return <Welcome onStart={() => update({ onboarded: true })} />;
  }

  const pages = { home: Home, learn: Learn, simulate: Simulate, compare: Compare, progress: Progress, settings: Settings };
  const Page = pages[tab];

  return (
    <div className="shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setTab('home')}>
          <span className="brand-mark" aria-hidden="true" />
          First Share
        </button>
        <nav className="side-nav" aria-label="Main">
          {NAV.map((item) => (
            <button
              key={item.key}
              className={tab === item.key ? 'nav-item on' : 'nav-item'}
              aria-current={tab === item.key ? 'page' : undefined}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <p className="sidebar-foot">Fictional companies and prices. Educational only. Not investment advice.</p>
      </aside>

      <main className="content">
        <ErrorBoundary key={tab} onReset={reset}>
          <Page state={state} update={update} setTab={setTab} reset={reset} />
        </ErrorBoundary>
      </main>
    </div>
  );
}

import { useState } from 'react';
import FeatureLayout from '../components/FeatureLayout';
import { newMarketState } from '../lib/storage';

export default function Settings({ update, reset }) {
  const [activeId, setActiveId] = useState('data');
  const [confirm, setConfirm] = useState(false);
  const [word, setWord] = useState('');
  const [msg, setMsg] = useState('');

  const resetMarket = () => {
    update({ market: newMarketState() });
    setMsg('The virtual market was reset. Your lessons and scenarios were kept.');
  };

  const resetAll = () => {
    if (word !== 'RESET') return;
    reset();
    setConfirm(false);
    setWord('');
    setMsg('All progress was erased from this browser.');
  };

  const sections = [
    {
      id: 'data',
      label: 'Your data',
      render: () => (
        <div className="card">
          <h2>Your data</h2>
          <p className="muted">Progress is stored only in this browser. It will not appear on other devices, and it is never sent anywhere.</p>
        </div>
      ),
    },
    {
      id: 'market',
      label: 'Virtual market',
      render: () => (
        <div className="card">
          <h2>Reset the virtual market</h2>
          <p className="muted">Starts a new practice year with $10,000 in virtual cash, no holdings, and day 0 on the clock. Lessons stay as they are.</p>
          <button className="btn" onClick={resetMarket}>Reset virtual market</button>
        </div>
      ),
    },
    {
      id: 'reset',
      label: 'Reset everything',
      render: () => (
        <div className="card danger-card">
          <h2>Reset all progress</h2>
          <p className="muted">Erases lessons, scenario history, and the virtual market. This cannot be undone.</p>
          {!confirm ? (
            <button className="btn danger" onClick={() => setConfirm(true)}>Reset all progress</button>
          ) : (
            <>
              <label htmlFor="reset-word">Type RESET to confirm</label>
              <input id="reset-word" value={word} onChange={(e) => setWord(e.target.value)} autoComplete="off" />
              <div className="row">
                <button className="btn danger" disabled={word !== 'RESET'} onClick={resetAll}>Erase everything</button>
                <button className="btn ghost" onClick={() => { setConfirm(false); setWord(''); }}>Cancel</button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <FeatureLayout
        title="Settings"
        subtitle="Manage the data saved in this browser."
        sections={sections}
        activeId={activeId}
        onSelect={setActiveId}
      />
      {msg && <p className="ok" role="status">{msg}</p>}
    </>
  );
}

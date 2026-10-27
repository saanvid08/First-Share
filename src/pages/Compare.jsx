import { useState } from 'react';
import FeatureLayout from '../components/FeatureLayout';
import LineChart from '../components/LineChart';
import { growthSeries } from '../lib/growth';
import { money } from '../lib/money';

const RETIRE_AGE = 65;
const INFLATION = 0.025;

export default function Compare() {
  const [activeId, setActiveId] = useState('compare');
  const [earlyAge, setEarlyAge] = useState(18);
  const [lateAge, setLateAge] = useState(28);
  const [monthly, setMonthly] = useState(100);
  const [ret, setRet] = useState(6);
  const [inflate, setInflate] = useState(false);
  const [stress, setStress] = useState(false);

  const validAge = (a) => Number.isInteger(a) && a >= 14 && a < RETIRE_AGE;
  const valid = validAge(earlyAge) && validAge(lateAge) && earlyAge < lateAge;
  const rateFor = (yearIndex) => (stress && yearIndex === 1 ? -0.2 : ret / 100);
  const run = (startAge) =>
    growthSeries({ monthly, years: RETIRE_AGE - startAge, annualRate: rateFor, inflation: inflate ? INFLATION : 0 });

  const early = valid ? run(earlyAge) : [];
  const late = valid ? run(lateAge) : [];
  const toPoints = (series, startAge) => series.map((p) => ({ x: startAge + p.year, y: inflate ? p.real : p.balance }));
  const endEarly = early[early.length - 1];
  const endLate = late[late.length - 1];
  const endValue = (p) => (p ? (inflate ? p.real : p.balance) : 0);

  const sections = [
    {
      id: 'compare',
      label: 'Two starting ages',
      render: () => (
        <>
          <p className="lead">Two people invest the same amount each month until age {RETIRE_AGE}. Only the starting age is different.</p>
          <div className="card controls">
            <div className="field">
              <label htmlFor="ea">Strategy A starts at age</label>
              <input id="ea" type="number" min="14" max="64" value={earlyAge} onChange={(e) => setEarlyAge(Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="la">Strategy B starts at age</label>
              <input id="la" type="number" min="14" max="64" value={lateAge} onChange={(e) => setLateAge(Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="mo">Monthly contribution: {money(monthly)}</label>
              <input id="mo" type="range" min="25" max="1000" step="25" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="rt">Assumed yearly return: {ret}%</label>
              <input id="rt" type="range" min="0" max="12" step="0.5" value={ret} onChange={(e) => setRet(Number(e.target.value))} />
            </div>
            <label className="check"><input type="checkbox" checked={inflate} onChange={(e) => setInflate(e.target.checked)} /> Show amounts adjusted for inflation (2.5% a year)</label>
            <label className="check"><input type="checkbox" checked={stress} onChange={(e) => setStress(e.target.checked)} /> Stress test: the second year returns -20%</label>
          </div>

          {!valid && <p className="error" role="alert">Use whole ages from 14 to 64, with Strategy A starting younger than Strategy B.</p>}

          {valid && (
            <>
              <LineChart
                label={`Hypothetical balance by age for strategies starting at ${earlyAge} and ${lateAge}`}
                series={[
                  { label: `Starts at ${earlyAge}`, color: '#1f7a7a', points: toPoints(early, earlyAge) },
                  { label: `Starts at ${lateAge}`, color: '#b07d3a', points: toPoints(late, lateAge) },
                ]}
              />
              <div className="grid two">
                <div className="card">
                  <p className="label">Strategy A, starts at {earlyAge}</p>
                  <p>You contribute <strong>{money(endEarly.contributed)}</strong></p>
                  <p>Hypothetical balance at {RETIRE_AGE}: <strong>{money(endValue(endEarly))}</strong></p>
                </div>
                <div className="card">
                  <p className="label">Strategy B, starts at {lateAge}</p>
                  <p>You contribute <strong>{money(endLate.contributed)}</strong></p>
                  <p>Hypothetical balance at {RETIRE_AGE}: <strong>{money(endValue(endLate))}</strong></p>
                </div>
              </div>
              <p>Starting earlier means more years of growth. Strategy A contributes {money(endEarly.contributed - endLate.contributed)} more, and its balance is {money(endValue(endEarly) - endValue(endLate))} higher.</p>
            </>
          )}
        </>
      ),
    },
    {
      id: 'method',
      label: 'How this is calculated',
      render: () => (
        <div className="card method">
          <p>Each month, the contribution is added, then one twelfth of the yearly return is applied to the total. This is compound growth: growth is earned on earlier growth too.</p>
          <p>Returns are hypothetical and may be negative. Real returns vary, and individual circumstances differ. Inflation, when shown, reduces buying power over time using a fixed 2.5% rate. This is an illustration, not a prediction or advice.</p>
        </div>
      ),
    },
  ];

  return (
    <FeatureLayout
      title="Compare"
      subtitle="Future Replay: the same plan, started at different ages."
      sections={sections}
      activeId={activeId}
      onSelect={setActiveId}
    />
  );
}

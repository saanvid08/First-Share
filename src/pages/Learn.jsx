import { useState } from 'react';
import FeatureLayout from '../components/FeatureLayout';
import { LESSONS } from '../data/lessons';
import { growthSeries } from '../lib/growth';
import { money } from '../lib/money';
import { simulateIncome, portfolioChange, SHOCK_SIZE, MARKET_SIZE } from '../lib/returns';
import LineChart from '../components/LineChart';

function Explain({ title, children }) {
  return (
    <aside className="explain">
      <p className="label">{title}</p>
      <p>{children}</p>
    </aside>
  );
}

function Complete({ done, ready, onComplete }) {
  if (done) return <p className="ok">Lesson complete.</p>;
  return (
    <div className="row">
      <button className="btn primary" disabled={!ready} onClick={onComplete}>Mark lesson complete</button>
      {!ready && <span className="muted small">Try the interactive part first.</span>}
    </div>
  );
}

// Colors a choice green if it is correct and red if the learner picked a wrong one.
// Text labels are added too, so the answer does not depend on color alone.
function answerClass(key, chosen, correct) {
  if (!chosen) return 'btn small';
  if (key === correct) return 'btn small correct';
  if (key === chosen) return 'btn small wrong';
  return 'btn small';
}

function LessonStock({ done, onComplete }) {
  const TOTAL = 1000;
  const [owned, setOwned] = useState(100);
  const [touched, setTouched] = useState(false);
  const pct = (owned / TOTAL) * 100;
  const filled = Math.round(owned / 10);
  return (
    <>
      <p>Imagine Brightwell Bakery, a fictional company split into 1,000 equal shares. Each share is a small piece of the business.</p>
      <div className="ownership" aria-hidden="true">
        {Array.from({ length: 100 }, (_, i) => <span key={i} className={i < filled ? 'cell on' : 'cell'} />)}
      </div>
      <label htmlFor="owned">You own {owned} shares, which is {pct.toFixed(1)}% of the company</label>
      <input id="owned" type="range" min="0" max="1000" step="10" value={owned}
        onChange={(e) => { setOwned(Number(e.target.value)); setTouched(true); }} />
      <p className="muted small">Each square is 1% of the company. Owning more gives you a bigger share of its profits and its losses.</p>
      <Explain title="Why it matters">Owning a share does not let you run the company. It means you own a fraction of it, and that fraction rises and falls with the company's value.</Explain>
      <Complete done={done} ready={touched} onComplete={onComplete} />
    </>
  );
}

const NEWS = [
  { id: 'n1', text: 'NovaSoft launches a product that many users praise.', guess: 'up',
    reveal: 'Good news often lifts prices, but investors may have expected some of it already. The move depends on whether results beat expectations.' },
  { id: 'n2', text: 'A competitor cuts its prices sharply for the whole year.', guess: 'down',
    reveal: 'Lower prices can squeeze profits at a company that sells similar products, which can pull its share price down.' },
  { id: 'n3', text: 'A harsh winter raises food prices across the country for a few months.', guess: 'unclear',
    reveal: 'Grocery companies can gain or lose from higher prices. Several effects compete, so the direction is hard to predict.' },
];
const GUESS_LABEL = { up: 'Likely up', down: 'Likely down', unclear: 'Hard to say' };

function LessonNews({ done, onComplete }) {
  const [answers, setAnswers] = useState({});
  const ready = Object.keys(answers).length === NEWS.length;
  return (
    <>
      <p>Before reading an explanation, predict how each piece of news might affect a fictional company's share price.</p>
      {NEWS.map((n) => {
        const chosen = answers[n.id];
        return (
          <article className="card news" key={n.id}>
            <p>{n.text}</p>
            <div className="row" role="group" aria-label={`Your prediction for: ${n.text}`}>
              {Object.entries(GUESS_LABEL).map(([k, label]) => (
                <button
                  key={k}
                  className={answerClass(k, chosen, n.guess)}
                  aria-pressed={chosen === k}
                  disabled={!!chosen}
                  onClick={() => setAnswers({ ...answers, [n.id]: k })}
                >
                  {label}
                </button>
              ))}
            </div>
            {chosen && (
              <>
                <p className={`answer-note ${chosen === n.guess ? 'ok' : 'error'}`}>
                  {chosen === n.guess ? 'Matches the common view.' : `Not quite. The common view is "${GUESS_LABEL[n.guess]}" (shown in green).`}
                </p>
                <p className="reveal">{n.reveal}</p>
              </>
            )}
          </article>
        );
      })}
      <Explain title="Key idea">News does not set prices with certainty. Expectations, competition, and the wider market all matter, and reasonable guesses can still be wrong.</Explain>
      <Complete done={done} ready={ready} onComplete={onComplete} />
    </>
  );
}

const GOALS = [
  { id: 'rent', text: 'Rent of $1,100 is due in two months.', best: 'save',
    why: 'Money needed soon should stay easy to reach. A market drop just before the due date could leave you short.' },
  { id: 'fund', text: 'An emergency fund for surprise bills.', best: 'save',
    why: 'Emergency money has to be available right away, so it belongs somewhere stable and reachable.' },
  { id: 'retire', text: 'Retirement savings you will not touch for 40 years.', best: 'invest',
    why: 'With decades ahead, short-term swings matter less, and stocks have historically grown more over long periods. Past results do not guarantee future returns, and stocks can lose value.' },
];
const CHOICE_LABEL = { save: 'Keep in savings', invest: 'Invest in stocks', unsure: 'Not sure' };

function LessonSaving({ done, onComplete }) {
  const [answers, setAnswers] = useState({});
  const ready = Object.keys(answers).length === GOALS.length;
  return (
    <>
      <p>Where money belongs depends on when you need it. Choose a home for each goal.</p>
      {GOALS.map((g) => {
        const chosen = answers[g.id];
        return (
          <article className="card news" key={g.id}>
            <p>{g.text}</p>
            <div className="row" role="group" aria-label={`Where to keep money for: ${g.text}`}>
              {Object.entries(CHOICE_LABEL).map(([k, label]) => (
                <button
                  key={k}
                  className={chosen === 'unsure' && k === 'unsure' ? 'btn small on' : answerClass(k, chosen, g.best)}
                  aria-pressed={chosen === k}
                  disabled={!!chosen}
                  onClick={() => setAnswers({ ...answers, [g.id]: k })}
                >
                  {label}
                </button>
              ))}
            </div>
            {chosen && (
              <>
                <p className={`answer-note ${chosen === g.best ? 'ok' : 'error'}`}>
                  {chosen === g.best
                    ? 'Good match.'
                    : `A common approach here is to ${g.best === 'save' ? 'keep the money in savings' : 'invest it'} (shown in green).`}
                </p>
                <p className="reveal">{g.why}</p>
              </>
            )}
          </article>
        );
      })}
      <Explain title="Key idea">Short-term money needs stability. Long-term money can accept more ups and downs, in exchange for the possibility of higher growth.</Explain>
      <Complete done={done} ready={ready} onComplete={onComplete} />
    </>
  );
}

function LessonDividends({ done, onComplete }) {
  const [priceChange, setPriceChange] = useState(5);
  const [yieldRate, setYieldRate] = useState(3);
  const [reinvest, setReinvest] = useState(false);
  const [touched, setTouched] = useState(false);
  const r = simulateIncome({ principal: 1000, priceChange: priceChange / 100, yieldRate: yieldRate / 100, years: 5, reinvest });
  return (
    <>
      <p>A company can help you earn in two separate ways. Its share price can rise, which is a <strong>price gain</strong>. It can also pay a <strong>dividend</strong>, a share of profits paid to owners. Dividends are not guaranteed, and some companies pay none.</p>
      <div className="sliders">
        <div>
          <label htmlFor="pc">Yearly change in share price: {priceChange}%</label>
          <input id="pc" type="range" min="-10" max="20" step="1" value={priceChange}
            onChange={(e) => { setPriceChange(Number(e.target.value)); setTouched(true); }} />
        </div>
        <div>
          <label htmlFor="dy">Yearly dividend as a share of your holding: {yieldRate}%</label>
          <input id="dy" type="range" min="0" max="6" step="0.5" value={yieldRate}
            onChange={(e) => { setYieldRate(Number(e.target.value)); setTouched(true); }} />
        </div>
      </div>
      <label className="check">
        <input type="checkbox" checked={reinvest} onChange={(e) => { setReinvest(e.target.checked); setTouched(true); }} />
        Reinvest dividends to buy more shares
      </label>
      <div className="stats">
        <div className="stat"><span className="label">Price gain</span><strong>{money(r.priceGain)}</strong></div>
        <div className="stat"><span className="label">Dividends received</span><strong>{money(r.dividendsTotal)}</strong></div>
        <div className="stat"><span className="label">Value after 5 years</span><strong>{money(r.total)}</strong></div>
      </div>
      <p className="muted small">Simplified example: $1,000 invested for 5 years at the same yearly change and dividend. Real results vary, and the share price can fall.</p>
      <Explain title="Key idea">Reinvesting means a dividend buys more shares, which can then grow too. Taking dividends as cash gives you money now, but the holding grows more slowly.</Explain>
      <Complete done={done} ready={touched} onComplete={onComplete} />
    </>
  );
}

const DIVERSIFY_COMPANIES = [
  { t: 'NVSW', name: 'NovaSoft' },
  { t: 'HBRF', name: 'Harbor Foods' },
  { t: 'SLRS', name: 'Solaris' },
  { t: 'MRDH', name: 'Meridian' },
];

function LessonDiversify({ done, onComplete }) {
  const [weights, setWeights] = useState({ NVSW: 100, HBRF: 0, SLRS: 0, MRDH: 0 });
  const [event, setEvent] = useState('NVSW');
  const [touched, setTouched] = useState(false);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const change = portfolioChange(weights, event);
  const eventLabel = event === 'market' ? 'The whole market falls 10%' : `${DIVERSIFY_COMPANIES.find((c) => c.t === event).name} has a major setback (-30%)`;

  return (
    <>
      <p>Imagine $1,000 split across four fictional companies. Set how much goes into each, then choose an event to see what happens.</p>
      <div className="sliders">
        {DIVERSIFY_COMPANIES.map((c) => (
          <div key={c.t}>
            <label htmlFor={`w-${c.t}`}>{c.name}: {weights[c.t]}%</label>
            <input id={`w-${c.t}`} type="range" min="0" max="100" step="5" value={weights[c.t]}
              onChange={(e) => { setWeights({ ...weights, [c.t]: Number(e.target.value) }); setTouched(true); }} />
          </div>
        ))}
      </div>
      <label htmlFor="event">Event</label>
      <select id="event" value={event} onChange={(e) => { setEvent(e.target.value); setTouched(true); }}>
        {DIVERSIFY_COMPANIES.map((c) => <option key={c.t} value={c.t}>{c.name} setback</option>)}
        <option value="market">Whole market falls</option>
      </select>
      {total === 0 ? (
        <p className="error">Give at least one company some money to see a result.</p>
      ) : (
        <div className="stats">
          <div className="stat"><span className="label">Event</span><strong>{eventLabel}</strong></div>
          <div className="stat"><span className="label">Your portfolio</span><strong>{(change * 100).toFixed(1)}%</strong></div>
          <div className="stat"><span className="label">On $1,000</span><strong>{money(1000 + change * 1000)}</strong></div>
        </div>
      )}
      <Explain title="Key idea">Spreading money reduces the damage from one company's bad news. It cannot remove risk that hits everything, such as a market-wide fall ({MARKET_SIZE * 100}%). Company setbacks in this example are {SHOCK_SIZE * 100}%.</Explain>
      <Complete done={done} ready={touched && total > 0} onComplete={onComplete} />
    </>
  );
}

function LessonGrowth({ done, onComplete }) {
  const [monthly, setMonthly] = useState(200);
  const [years, setYears] = useState(30);
  const [rate, setRate] = useState(6);
  const [touched, setTouched] = useState(false);
  const series = growthSeries({ monthly, years, annualRate: () => rate / 100 });
  const last = series[series.length - 1];
  const growth = last.balance - last.contributed;
  const change = (setter) => (e) => { setter(Number(e.target.value)); setTouched(true); };
  return (
    <>
      <p>This is a hypothetical example. Contributions are added every month, and each month's growth is earned on everything already invested.</p>
      <div className="sliders">
        <div>
          <label htmlFor="monthly">Monthly contribution: {money(monthly)}</label>
          <input id="monthly" type="range" min="50" max="500" step="10" value={monthly} onChange={change(setMonthly)} />
        </div>
        <div>
          <label htmlFor="years">Years invested: {years}</label>
          <input id="years" type="range" min="5" max="40" step="1" value={years} onChange={change(setYears)} />
        </div>
        <div>
          <label htmlFor="rate">Assumed yearly return: {rate}%</label>
          <input id="rate" type="range" min="0" max="12" step="0.5" value={rate} onChange={change(setRate)} />
        </div>
      </div>
      <LineChart
        label="Total contributions compared with the hypothetical balance over time"
        series={[
          { label: 'Total you contributed', color: '#8a94a6', points: series.map((p) => ({ x: p.year, y: p.contributed })) },
          { label: 'Hypothetical balance', color: '#1f7a7a', points: series.map((p) => ({ x: p.year, y: p.balance })) },
        ]}
      />
      <div className="stats">
        <div className="stat"><span className="label">You contributed</span><strong>{money(last.contributed)}</strong></div>
        <div className="stat"><span className="label">Hypothetical balance</span><strong>{money(last.balance)}</strong></div>
        <div className="stat"><span className="label">Growth earned</span><strong>{money(growth)}</strong></div>
      </div>
      <p className="muted small">Returns vary and can be negative in some years. This illustration does not predict what any investment will do.</p>
      <Complete done={done} ready={touched} onComplete={onComplete} />
    </>
  );
}

const BODY = { stock: LessonStock, news: LessonNews, saving: LessonSaving, dividends: LessonDividends, diversify: LessonDiversify, growth: LessonGrowth };

export default function Learn({ state, update }) {
  const [activeId, setActiveId] = useState(LESSONS[0].id);
  const complete = (id) => update({ lessons: { ...state.lessons, [id]: true } });

  const sections = LESSONS.map((l, i) => ({
    id: l.id,
    label: `${i + 1}. ${l.title}`,
    badge: state.lessons[l.id] ? 'Done' : null,
    render: () => {
      const Body = BODY[l.id];
      return (
        <>
          <p className="eyebrow">Lesson {i + 1} of {LESSONS.length}</p>
          <h2>{l.title}</h2>
          <p className="muted">{l.blurb}</p>
          <Body done={!!state.lessons[l.id]} onComplete={() => complete(l.id)} />
        </>
      );
    },
  }));

  return (
    <FeatureLayout
      title="Learn"
      subtitle="Short lessons with something to do in each one. Pick a lesson from the panel."
      sections={sections}
      activeId={activeId}
      onSelect={setActiveId}
    />
  );
}

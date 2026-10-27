import { useEffect, useRef, useState } from 'react';
import { COMPANIES } from '../data/companies';
import { buy, sell, valuation } from '../lib/portfolio';
import { money, signedMoney } from '../lib/money';
import { marketData, DAYS } from '../lib/marketSim';
import LineChart from '../components/LineChart';

const pricesOn = (data, t) => Object.fromEntries(COMPANIES.map((c) => [c.ticker, data[c.ticker].prices[t]]));

function Delta({ value }) {
  return <span className={value >= 0 ? 'up' : 'down'}>{signedMoney(value)}</span>;
}

export default function Market({ market, update }) {
  const { portfolio, tick, history, seed } = market;
  const data = marketData(seed);
  const [openTicker, setOpenTicker] = useState(COMPANIES[0].ticker);
  const [qty, setQty] = useState('1');
  const [note, setNote] = useState(null);
  const [playing, setPlaying] = useState(false);

  const prices = pricesOn(data, tick);
  const v = valuation(portfolio, prices);
  const company = COMPANIES.find((c) => c.ticker === openTicker);
  const save = (next) => update({ market: { ...market, ...next } });

  const advance = (days) => {
    const to = Math.min(DAYS, tick + days);
    if (to === tick) { setPlaying(false); return; }
    const added = [];
    for (let t = tick + 1; t <= to; t++) {
      added.push({ tick: t, netWorth: valuation(portfolio, pricesOn(data, t)).netWorth });
    }
    save({ tick: to, history: [...history, ...added] });
    setNote({ ok: true, text: `Moved forward ${to - tick} trading day${to - tick === 1 ? '' : 's'}. Day ${to} of ${DAYS}.` });
    if (to === DAYS) setPlaying(false);
  };

  // Play moves the market one day at a time. The ref keeps the interval using the latest state.
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => advanceRef.current(1), 1200);
    return () => clearInterval(id);
  }, [playing]);

  const trade = (kind) => {
    if (!company) return;
    const n = Number(qty);
    const price = prices[company.ticker];
    const res = kind === 'buy'
      ? buy(portfolio, company.ticker, n, price, tick)
      : sell(portfolio, company.ticker, n, price, tick);
    if (res.error) return setNote({ ok: false, text: res.error });
    save({ portfolio: res.portfolio });
    setNote({ ok: true, text: `${kind === 'buy' ? 'Bought' : 'Sold'} ${n} share${n === 1 ? '' : 's'} of ${company.ticker} at ${money(price)} on day ${tick}.` });
  };

  const news = COMPANIES.flatMap((c) =>
    data[c.ticker].news.filter((n) => n.tick <= tick).map((n) => ({ ...n, ticker: c.ticker, name: c.name }))
  ).sort((a, b) => b.tick - a.tick).slice(0, 5);

  const finished = tick >= DAYS;

  return (
    <div className="market">
      <div className="practice-note" role="note">
        <strong>Practice only.</strong> These prices are generated for learning. They are not real stocks, not real news, and not a prediction of anything.
      </div>

      <div className="card clock">
        <div>
          <p className="label">Practice day</p>
          <p className="big-small">Day {tick} of {DAYS}</p>
        </div>
        <div className="row">
          <button className="btn" disabled={finished} onClick={() => advance(1)}>+1 day</button>
          <button className="btn" disabled={finished} onClick={() => advance(5)}>+1 week</button>
          <button className="btn" disabled={finished} onClick={() => advance(21)}>+1 month</button>
          <button className="btn play" aria-pressed={playing} disabled={finished} onClick={() => setPlaying(!playing)}>
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>
        {note && <p className={note.ok ? 'ok' : 'error'} role="status">{note.text}</p>}
        {finished && <p className="muted small">The practice year has ended. Reset the virtual market in Settings to start a new one.</p>}
      </div>

      <div className="stats">
        <div className="stat"><span className="label">Net worth</span><strong>{money(v.netWorth)}</strong></div>
        <div className="stat"><span className="label">Cash</span><strong>{money(v.cash)}</strong></div>
        <div className="stat"><span className="label">Holdings</span><strong>{money(v.marketValue)}</strong></div>
        <div className="stat"><span className="label">Unrealized</span><strong>{signedMoney(v.unrealized)}</strong></div>
        <div className="stat"><span className="label">Realized</span><strong>{signedMoney(v.realized)}</strong></div>
      </div>

      <div className="market-grid">
        <div>
          <h2>Market today</h2>
          <div className="grid two">
            {COMPANIES.map((c) => {
              const p = data[c.ticker].prices[tick];
              const prev = tick > 0 ? data[c.ticker].prices[tick - 1] : p;
              const change = p - prev;
              const pct = prev ? (change / prev) * 100 : 0;
              return (
                <button
                  key={c.ticker}
                  className={`card company ${openTicker === c.ticker ? 'selected' : ''}`}
                  aria-pressed={openTicker === c.ticker}
                  onClick={() => setOpenTicker(c.ticker)}
                >
                  <p className="label">Fictional, {c.sector}</p>
                  <h3>{c.name} <span className="muted small">({c.ticker})</span></h3>
                  <p className="price">{money(p)}</p>
                  <p className="small">
                    <span className={change >= 0 ? 'up' : 'down'}>{change >= 0 ? '▲' : '▼'} {signedMoney(change)} ({pct.toFixed(1)}%)</span> since yesterday
                  </p>
                </button>
              );
            })}
          </div>

          {company && (
            <section className="card detail">
              <h3>{company.name}</h3>
              <p className="muted small">{company.description}</p>
              <LineChart
                height={220}
                label={`Practice price history for fictional company ${company.name}`}
                series={[{ label: `${company.ticker} price`, color: '#1f7a7a', points: data[company.ticker].prices.slice(0, tick + 1).map((p, i) => ({ x: i, y: p })) }]}
              />
              <div className="trade">
                <label htmlFor="qty">Whole shares</label>
                <input id="qty" type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} />
                <p className="muted small">Price today: {money(prices[company.ticker])}</p>
                <div className="row">
                  <button className="btn primary" disabled={finished} onClick={() => trade('buy')}>Buy</button>
                  <button className="btn" disabled={finished} onClick={() => trade('sell')}>Sell</button>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="market-side">
          <div className="card">
            <h3>Headlines</h3>
            {news.length === 0 ? (
              <p className="muted small">No news yet. Move the clock forward to see what happens.</p>
            ) : (
              <ul className="feed">
                {news.map((n) => (
                  <li key={`${n.ticker}-${n.tick}`}>
                    <span className={n.up ? 'up' : 'down'}>{n.up ? 'Up' : 'Down'}</span> {n.text}.
                    <span className="muted small"> {n.name}, day {n.tick}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <h3>Net worth</h3>
            <LineChart
              height={200}
              label="Practice net worth over time"
              series={[{ label: 'Net worth', color: '#14233b', points: history.map((h) => ({ x: h.tick, y: h.netWorth })) }]}
            />
          </div>
        </aside>
      </div>

      <h2>Your holdings</h2>
      {v.lines.length === 0 ? (
        <p className="empty">You do not own any practice shares yet. Pick a company above and buy your first share.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Company</th><th>Shares</th><th>Average cost</th><th>Price today</th><th>Value</th><th>Gain or loss</th></tr>
            </thead>
            <tbody>
              {v.lines.map((l) => (
                <tr key={l.ticker}>
                  <td>{l.ticker}</td>
                  <td>{l.shares}</td>
                  <td>{money(l.avgCost)}</td>
                  <td>{money(l.price)}</td>
                  <td>{money(l.value)}</td>
                  <td><Delta value={l.gain} /> <span className="muted small">{l.gain >= 0 ? '(gain on paper)' : '(loss on paper)'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

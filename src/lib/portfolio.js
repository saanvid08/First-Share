// Virtual portfolio math. Pure functions only: nothing here touches the screen or storage.
// Only whole shares are supported, which keeps every calculation easy to check by hand.
import { round2 } from './money.js';

export const START_CASH = 10000;

export function newPortfolio(cash = START_CASH) {
  return { cash, holdings: {}, transactions: [], realized: 0 };
}

const isWholeShares = (n) => Number.isInteger(n) && n > 0;

export function buy(p, ticker, shares, price, month) {
  if (!isWholeShares(shares)) return { error: 'Enter a whole number of shares, 1 or more.' };
  const cost = round2(shares * price);
  if (cost > p.cash) {
    return { error: `Not enough virtual cash. This costs ${cost.toFixed(2)} and you have ${p.cash.toFixed(2)}.` };
  }
  const held = p.holdings[ticker] || { shares: 0, cost: 0 };
  return {
    portfolio: {
      ...p,
      cash: round2(p.cash - cost),
      holdings: { ...p.holdings, [ticker]: { shares: held.shares + shares, cost: round2(held.cost + cost) } },
      transactions: [...p.transactions, { type: 'buy', ticker, shares, price, total: cost, month }],
    },
  };
}

export function sell(p, ticker, shares, price, month) {
  const held = p.holdings[ticker];
  if (!isWholeShares(shares)) return { error: 'Enter a whole number of shares, 1 or more.' };
  if (!held || shares > held.shares) {
    return { error: `You only own ${held ? held.shares : 0} share(s) of ${ticker}.` };
  }
  const avg = held.cost / held.shares;
  const proceeds = round2(shares * price);
  const gain = round2((price - avg) * shares);
  const left = held.shares - shares;
  const holdings = { ...p.holdings };
  if (left === 0) delete holdings[ticker];
  else holdings[ticker] = { shares: left, cost: round2(held.cost - avg * shares) };
  return {
    portfolio: {
      ...p,
      cash: round2(p.cash + proceeds),
      holdings,
      realized: round2(p.realized + gain),
      transactions: [...p.transactions, { type: 'sell', ticker, shares, price, total: proceeds, gain, month }],
    },
  };
}

// prices: { TICKER: currentPrice }. Returns everything the screen needs.
export function valuation(p, prices) {
  let marketValue = 0;
  let unrealized = 0;
  const lines = Object.entries(p.holdings).map(([ticker, h]) => {
    const price = prices[ticker];
    const value = round2(h.shares * price);
    const gain = round2(value - h.cost);
    marketValue += value;
    unrealized += gain;
    return { ticker, shares: h.shares, avgCost: h.cost / h.shares, price, value, gain };
  });
  return {
    lines,
    cash: p.cash,
    marketValue: round2(marketValue),
    unrealized: round2(unrealized),
    realized: p.realized,
    netWorth: round2(p.cash + marketValue),
  };
}

// Run with: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { newPortfolio, buy, sell, valuation } from '../src/lib/portfolio.js';
import { growthSeries } from '../src/lib/growth.js';
import { startState, choose, summary } from '../src/lib/scenario.js';
import { COMPANIES } from '../src/data/companies.js';

test('buying reduces virtual cash by the exact cost', () => {
  const r = buy(newPortfolio(1000), 'NVSW', 10, 48, 0);
  assert.equal(r.portfolio.cash, 520);
  assert.equal(r.portfolio.holdings.NVSW.shares, 10);
});

test('buying more than the available cash is rejected', () => {
  const r = buy(newPortfolio(100), 'NVSW', 10, 48, 0);
  assert.ok(r.error);
  assert.equal(r.portfolio, undefined);
});

test('selling more shares than owned is rejected', () => {
  const p = buy(newPortfolio(1000), 'NVSW', 2, 40, 0).portfolio;
  const r = sell(p, 'NVSW', 3, 45, 1);
  assert.ok(r.error);
});

test('fractional or zero shares are rejected', () => {
  assert.ok(buy(newPortfolio(1000), 'NVSW', 1.5, 40, 0).error);
  assert.ok(buy(newPortfolio(1000), 'NVSW', 0, 40, 0).error);
});

test('selling adds proceeds and records the realized gain', () => {
  const p = buy(newPortfolio(1000), 'NVSW', 10, 40, 0).portfolio; // cash 600
  const r = sell(p, 'NVSW', 5, 50, 1);
  assert.equal(r.portfolio.cash, 850);
  assert.equal(r.portfolio.realized, 50); // (50 - 40) * 5
  assert.equal(r.portfolio.holdings.NVSW.shares, 5);
  assert.equal(r.portfolio.holdings.NVSW.cost, 200);
});

test('valuation matches shares times price and the unrealized gain', () => {
  const p = buy(newPortfolio(1000), 'NVSW', 10, 40, 0).portfolio;
  const v = valuation(p, { NVSW: 45 });
  assert.equal(v.marketValue, 450);
  assert.equal(v.unrealized, 50);
  assert.equal(v.netWorth, 1050);
});

test('compound growth with a 0% return equals total contributions', () => {
  const s = growthSeries({ monthly: 100, years: 2, annualRate: () => 0 });
  assert.equal(s.at(-1).balance, 2400);
  assert.equal(s.at(-1).contributed, 2400);
});

test('compound growth matches the hand-calculated 12-month value', () => {
  // 100 at the start of each month, 12% a year split into monthly rates of 1%.
  const s = growthSeries({ monthly: 100, years: 1, annualRate: () => 0.12 });
  assert.ok(Math.abs(s.at(-1).balance - 1280.93) < 0.01);
});

test('the same scenario choices always produce the same result', () => {
  const run = () => {
    let s = startState();
    s = choose(s, 'growth').state;
    s = choose(s, 'sell').state;
    s = choose(s, 'hold').state;
    return s;
  };
  assert.deepEqual(run(), run());
});

test('a disabled scenario option is rejected', () => {
  const s = choose(startState(), 'safety').state; // only $200 in cash
  const r = choose(s, 'cash');
  assert.ok(r.error);
});

test('paying a bill from savings reduces the emergency fund by $400', () => {
  const s = choose(startState(), 'safety').state; // $500 saved
  const r = choose(s, 'savings');
  assert.equal(r.state.emergency, 100);
  assert.equal(r.state.step, 2);
});

test('summary net worth adds cash, savings, and shares at the drop price', () => {
  let s = startState();
  s = choose(s, 'growth').state; // 10 shares, $220 cash
  s = choose(s, 'sell').state;   // sells 9 shares to pay the $400 bill
  const r = summary(s);
  assert.equal(r.netWorth, round(r.cash + r.emergency + r.shares * 40.8 - r.debt));
});

test('every company has twelve monthly prices and a unique ticker', () => {
  const tickers = new Set(COMPANIES.map((c) => c.ticker));
  assert.equal(tickers.size, COMPANIES.length);
  COMPANIES.forEach((c) => assert.equal(c.prices.length, 12));
});

function round(n) {
  return Math.round(n * 100) / 100;
}

import { simulateIncome, portfolioChange, SHOCK_SIZE, MARKET_SIZE } from '../src/lib/returns.js';

test('reinvested dividends grow the holding faster than cash dividends', () => {
  const cash = simulateIncome({ principal: 1000, priceChange: 0.05, yieldRate: 0.03, years: 5, reinvest: false });
  const re = simulateIncome({ principal: 1000, priceChange: 0.05, yieldRate: 0.03, years: 5, reinvest: true });
  assert.ok(re.total > cash.total);
});

test('with no price change and no dividend, value stays at the principal', () => {
  const r = simulateIncome({ principal: 1000, priceChange: 0, yieldRate: 0, years: 5, reinvest: true });
  assert.equal(r.total, 1000);
  assert.equal(r.priceGain, 0);
});

test('a single-company portfolio takes the full company setback', () => {
  assert.equal(portfolioChange({ NVSW: 100, HBRF: 0, SLRS: 0, MRDH: 0 }, 'NVSW'), SHOCK_SIZE);
});

test('spreading across four companies reduces a single-company setback', () => {
  const spread = portfolioChange({ NVSW: 25, HBRF: 25, SLRS: 25, MRDH: 25 }, 'NVSW');
  assert.ok(Math.abs(spread) < Math.abs(SHOCK_SIZE));
  assert.ok(Math.abs(spread - SHOCK_SIZE / 4) < 1e-9);
});

test('a market-wide fall hits a diversified portfolio the same as a concentrated one', () => {
  const spread = portfolioChange({ NVSW: 25, HBRF: 25, SLRS: 25, MRDH: 25 }, 'market');
  const single = portfolioChange({ NVSW: 100, HBRF: 0, SLRS: 0, MRDH: 0 }, 'market');
  assert.equal(spread, MARKET_SIZE);
  assert.equal(single, MARKET_SIZE);
});

import { buildMarket, marketData, DAYS } from '../src/lib/marketSim.js';
import { worth } from '../src/lib/scenario.js';

test('the practice market is reproducible for the same seed', () => {
  assert.deepEqual(buildMarket(42), buildMarket(42));
});

test('practice prices stay positive and cover every day of the year', () => {
  const data = buildMarket(42);
  Object.values(data).forEach((c) => {
    assert.equal(c.prices.length, DAYS + 1);
    assert.ok(c.prices.every((p) => p > 0));
  });
});

test('marketData returns the same object for the same seed', () => {
  assert.equal(marketData(7), marketData(7));
});

test('money left after the first choice is unchanged when a fund is started', () => {
  const s = choose(startState(), 'safety').state;
  assert.equal(worth(s), 700);
  assert.equal(s.history.length, 2);
});

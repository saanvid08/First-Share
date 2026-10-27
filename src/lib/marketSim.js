// A practice market: 252 imaginary trading days for four fictional companies.
// Prices come from a seeded pseudo-random generator, so the same seed always gives the same year.
// This is for practice only. It is not real market data and does not predict anything.
import { COMPANIES } from '../data/companies.js';
import { round2 } from './money.js';

export const DAYS = 252;
export const DEFAULT_SEED = 20260;

const PARAMS = {
  NVSW: { vol: 0.014, drift: 0.0004 },
  HBRF: { vol: 0.006, drift: 0.0002 },
  SLRS: { vol: 0.011, drift: 0.0002 },
  MRDH: { vol: 0.009, drift: 0.0003 },
};

const HEADLINES = {
  NVSW: {
    up: ['NovaSoft beats expectations on subscription growth', 'A new NovaSoft product draws strong early reviews'],
    down: ['A competitor launches a cheaper rival tool', 'NovaSoft delays a product release'],
  },
  HBRF: {
    up: ['Harbor Foods opens two new stores ahead of schedule', 'Grocery sales hold steady through the season'],
    down: ['Food costs rise and squeeze Harbor Foods margins', 'A supplier dispute slows deliveries'],
  },
  SLRS: {
    up: ['Solaris wins a large solar contract', 'A grid storage project is approved'],
    down: ['Government funding for a Solaris project is delayed', 'Panel prices fall across the industry'],
  },
  MRDH: {
    up: ['Meridian Health receives approval for a device', 'A major hospital renews its contract'],
    down: ['A clinical trial shows mixed results', 'Regulators ask for more data on a Meridian device'],
  },
};

const hashStr = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// Returns a number from 0 up to (not including) 1, based only on the inputs.
export function hash01(seed, key, t) {
  let x = (seed ^ hashStr(key) ^ Math.imul(t, 374761393)) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) >>> 0;
  x = Math.imul(x ^ (x >>> 12), 0x297a2d39) >>> 0;
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

export function buildMarket(seed = DEFAULT_SEED) {
  const out = {};
  COMPANIES.forEach((c) => {
    const p = PARAMS[c.ticker];
    const prices = [c.prices[0]];
    const news = [];
    for (let t = 1; t <= DAYS; t++) {
      const z = hash01(seed, c.ticker, t) * 2 - 1;
      let jump = 0;
      if (hash01(seed, c.ticker + ':news', t) > 0.985) {
        const up = hash01(seed, c.ticker + ':dir', t) > 0.5;
        const list = HEADLINES[c.ticker][up ? 'up' : 'down'];
        const text = list[Math.floor(hash01(seed, c.ticker + ':pick', t) * list.length)];
        jump = up ? 0.05 : -0.05;
        news.push({ tick: t, text, up });
      }
      prices.push(round2(prices[t - 1] * (1 + p.drift + p.vol * z + jump)));
    }
    out[c.ticker] = { prices, news };
  });
  return out;
}

let cache = null;
export function marketData(seed = DEFAULT_SEED) {
  if (!cache || cache.seed !== seed) cache = { seed, data: buildMarket(seed) };
  return cache.data;
}

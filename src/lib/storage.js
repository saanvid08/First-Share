// Local progress is saved in this browser only. A version number lets future changes reset old data safely.
import { newPortfolio, START_CASH } from './portfolio.js';
import { DEFAULT_SEED, DAYS } from './marketSim.js';

const KEY = 'first-share:v1';
const VERSION = 1;

export function newMarketState(seed = DEFAULT_SEED) {
  return { seed, portfolio: newPortfolio(), tick: 0, history: [{ tick: 0, netWorth: START_CASH }] };
}

export function defaultState() {
  return {
    version: VERSION,
    onboarded: false,
    lessons: {},
    scenario: null,
    scenarioFeedback: null,
    scenarioRuns: 0,
    lastRun: null,
    market: newMarketState(),
  };
}

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!raw || raw.version !== VERSION) return defaultState();
    const base = defaultState();
    const m = raw.market;
    const valid = m && m.portfolio && typeof m.portfolio.cash === 'number' && m.portfolio.holdings
      && typeof m.tick === 'number' && Array.isArray(m.history);
    const market = valid
      ? { ...newMarketState(), ...m, tick: Math.min(DAYS, Math.max(0, m.tick)) }
      : base.market;
    // Older saved data may lack fields the screens now need. Discard only the parts that do not match.
    const historyOk = market.history.every((h) => h && typeof h.tick === 'number' && typeof h.netWorth === 'number');
    const cleanMarket = historyOk ? market : { ...market, history: [{ tick: market.tick, netWorth: START_CASH }] };
    const scenarioOk = raw.scenario && Array.isArray(raw.scenario.history) && typeof raw.scenario.price === 'number';
    return {
      ...base,
      ...raw,
      lessons: raw.lessons || {},
      scenario: scenarioOk ? raw.scenario : null,
      scenarioFeedback: scenarioOk ? raw.scenarioFeedback || null : null,
      market: cleanMarket,
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage may be full or disabled. The app still works for this visit.
  }
}

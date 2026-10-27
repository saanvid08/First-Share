// The life decision scenario. A fictional 18-year-old gets a first paycheck.
// Every step is deterministic: the same choices always give the same result.
import { round2, money } from './money.js';

export const PRICE = { start: 48, drop: 40.8 }; // fictional NovaSoft price before and after an earnings miss
export const BILL = 400;
export const SELL_SHARES = Math.ceil(BILL / PRICE.start); // 9 shares

export const TITLES = ['Your first paycheck', 'An unexpected bill', 'Earnings news', 'Your results'];

export const STEP_TEXT = [
  'You receive your first paycheck: $1,800 after taxes. Rent and food ($1,100) are covered, leaving $700 for you to decide about.',
  'A $400 phone repair bill arrives. You cannot avoid it. Choose how to pay.',
  'NovaSoft reports earnings below what investors expected. Its share price falls 15%, from $48.00 to $40.80.',
  'Here is where your choices have led.',
];

export function startState() {
  return {
    step: 0, cash: 700, emergency: 0, shares: 0, costBasis: 0, debt: 0, realized: 0,
    price: PRICE.start,
    history: [{ label: 'Start', value: 700 }],
  };
}

// Money you have left: spendable cash, savings, shares at the current price, minus debt.
export function worth(s) {
  return round2(s.cash + s.emergency + s.shares * s.price - s.debt);
}

const avgCost = (s) => (s.shares ? s.costBasis / s.shares : 0);
const signed = (n) => (n > 0 ? '+' : n < 0 ? '-' : '') + money(Math.abs(n));

function buyAt(s, amount, price) {
  const n = Math.floor(amount / price);
  const cost = round2(n * price);
  return { ...s, cash: round2(s.cash - cost), shares: s.shares + n, costBasis: round2(s.costBasis + cost) };
}

// Step 0: how to split the $700.
export const ALLOCATIONS = [
  {
    id: 'safety',
    title: 'Safety first',
    detail: 'Save $500 for surprises and keep $200 in your account.',
    apply: (s) => ({ ...s, emergency: s.emergency + 500, cash: round2(s.cash - 500) }),
    explain: (s) => `You set aside $500 in savings and kept ${money(s.cash)} in your account. You own no shares, so this money cannot fall with a company.`,
    tradeoff: 'The money is easy to reach, but it may lose buying power to inflation over many years.',
    concept: 'Liquidity: money you may need soon belongs somewhere you can reach quickly.',
  },
  {
    id: 'growth',
    title: 'Invest for growth',
    detail: 'Buy shares of NovaSoft Software (NVSW) with $500. Keep the rest in cash.',
    apply: (s) => buyAt(s, 500, PRICE.start),
    explain: (s) => `You bought ${s.shares} shares at $48.00 for ${money(s.costBasis)}. Your account holds ${money(s.cash)}, and your emergency savings are $0.`,
    tradeoff: 'Your money can grow, but it can also fall. With no savings, a surprise bill could force you to sell at a bad time.',
    concept: 'Risk and liquidity: investing ties money up in prices that move.',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    detail: 'Save $250 for emergencies and invest $250 in NVSW.',
    apply: (s) => buyAt({ ...s, emergency: s.emergency + 250, cash: round2(s.cash - 250) }, 250, PRICE.start),
    explain: (s) => `You saved $250 and bought ${s.shares} shares for ${money(s.costBasis)}. Your account holds ${money(s.cash)}.`,
    tradeoff: 'You keep some money reachable and still invest some. The investment is smaller, so its growth potential is smaller too.',
    concept: 'Matching money to purpose: short-term needs and long-term goals are handled separately.',
  },
];

// Step 1: the bill.
export function billChoices(s) {
  return [
    { id: 'savings', title: 'Pay from safety savings', enabled: s.emergency >= BILL, reason: 'Needs $400 in savings.' },
    { id: 'cash', title: 'Pay from account cash', enabled: s.cash >= BILL, reason: 'Needs $400 in your account.' },
    { id: 'sell', title: `Sell ${SELL_SHARES} NVSW shares`, enabled: s.shares >= SELL_SHARES, reason: `Needs ${SELL_SHARES} shares.` },
    { id: 'card', title: 'Use a credit card', enabled: true, reason: '' },
  ];
}

function applyBill(s, id) {
  if (id === 'savings') return { ...s, emergency: round2(s.emergency - BILL) };
  if (id === 'cash') return { ...s, cash: round2(s.cash - BILL) };
  if (id === 'sell') {
    const avg = avgCost(s);
    const proceeds = round2(SELL_SHARES * PRICE.start);
    const gain = round2((PRICE.start - avg) * SELL_SHARES);
    return {
      ...s,
      cash: round2(s.cash + proceeds - BILL),
      shares: s.shares - SELL_SHARES,
      costBasis: round2(s.costBasis - avg * SELL_SHARES),
      realized: round2(s.realized + gain),
    };
  }
  return { ...s, debt: s.debt + BILL };
}

function billFeedback(id, before, after) {
  const map = {
    savings: {
      happened: `You paid $400 from savings. ${money(after.emergency)} is left as your emergency fund.`,
      tradeoff: 'Your safety net is smaller now, so the next surprise could be harder to cover.',
      concept: 'An emergency fund protects you from selling investments at a bad time.',
    },
    cash: {
      happened: `You paid $400 from your account. ${money(after.cash)} remains.`,
      tradeoff: 'Your spare money is smaller, and you have nothing set aside for later surprises.',
      concept: 'Cash you can spend is still liquidity, but it is not the same as a planned emergency fund.',
    },
    sell: {
      happened: `You sold ${SELL_SHARES} shares at $48.00 and paid the bill. The sale produced a ${signed(after.realized - before.realized)} gain or loss.`,
      tradeoff: 'You avoided debt, but you gave up any future growth on those shares.',
      concept: 'Realized vs. unrealized: a gain or loss becomes final when you sell.',
    },
    card: {
      happened: 'You owe $400 on a card. At a 25% yearly rate, that costs about $8 a month in interest until it is paid off.',
      tradeoff: 'You kept your investments and savings intact, but the bill now grows while it stays unpaid.',
      concept: 'Debt has a price: interest adds to the cost of anything bought on credit.',
    },
  };
  return { ...map[id], notGuaranteed: 'Each option has costs. The best choice depends on your situation.' };
}

// Step 2: the price drop.
export function dropChoices(s) {
  const buyable = Math.floor(s.cash / PRICE.drop);
  return [
    { id: 'hold', title: 'Hold the shares', enabled: true, reason: '' },
    { id: 'sell', title: 'Sell all shares', enabled: s.shares > 0, reason: 'You own no shares.' },
    { id: 'buy', title: `Buy ${buyable} more with spare cash`, enabled: buyable > 0, reason: 'Needs at least $40.80 of cash.' },
  ];
}

function applyDrop(s, id) {
  if (id === 'sell') {
    const gain = round2((PRICE.drop - avgCost(s)) * s.shares);
    return { ...s, cash: round2(s.cash + s.shares * PRICE.drop), shares: 0, costBasis: 0, realized: round2(s.realized + gain) };
  }
  if (id === 'buy') return buyAt(s, s.cash, PRICE.drop);
  return s;
}

function dropFeedback(id, before, after) {
  const onPaper = round2(before.shares * (PRICE.start - PRICE.drop));
  const base = `NovaSoft fell to $40.80. Your ${before.shares} shares lost about ${money(onPaper)} in value on paper.`;
  const map = {
    hold: {
      happened: `${base} You kept them.`,
      tradeoff: 'Holding keeps your options open. The price may recover, or it may fall further.',
      concept: 'Unrealized loss: the loss only becomes real when you sell.',
    },
    sell: {
      happened: `${base} You sold everything at $40.80. The sale locked in a ${signed(after.realized - before.realized)} result.`,
      tradeoff: 'You stop further losses, but you also give up any recovery.',
      concept: 'Selling after a drop makes that loss final, which is a common emotional reaction.',
    },
    buy: {
      happened: `${base} You used your spare cash to buy ${after.shares - before.shares} more shares at the lower price.`,
      tradeoff: 'A lower price can be a bargain, or a sign of a real problem. You now have more money in one company.',
      concept: 'Concentration risk: putting more into one company means one event matters more.',
    },
  };
  return { ...map[id], notGuaranteed: 'A lower price does not mean the price will rise again.' };
}

const LABELS = ['Paycheck split', 'Bill paid', 'Price move'];

// Adds a point to the money history after each step, so the graph can show every decision.
function record(prev, state, step) {
  return { ...state, history: [...prev.history, { label: LABELS[step], value: worth(state) }] };
}

// Applies one choice. Returns { state, feedback } or { error }.
export function choose(s, id) {
  if (s.step === 0) {
    const a = ALLOCATIONS.find((x) => x.id === id);
    if (!a) return { error: 'Choose one of the options.' };
    const state = record(s, { ...a.apply(s), step: 1 }, 0);
    return {
      state,
      feedback: { title: a.title, happened: a.explain(state), tradeoff: a.tradeoff, concept: a.concept, notGuaranteed: 'Nothing here predicts how NovaSoft will perform.' },
    };
  }
  if (s.step === 1) {
    const c = billChoices(s).find((x) => x.id === id);
    if (!c) return { error: 'Choose one of the options.' };
    if (!c.enabled) return { error: c.reason };
    const state = record(s, { ...applyBill(s, id), step: 2 }, 1);
    return { state, feedback: billFeedback(id, s, state) };
  }
  if (s.step === 2) {
    const c = dropChoices(s).find((x) => x.id === id);
    if (!c) return { error: 'Choose one of the options.' };
    if (!c.enabled) return { error: c.reason };
    const state = record(s, { ...applyDrop(s, id), price: PRICE.drop, step: 3 }, 2);
    return { state, feedback: dropFeedback(id, s, state) };
  }
  return { error: 'This path is finished. Start again to make new choices.' };
}

// Final numbers. Shares are valued at the drop price, the latest price in this scenario.
export function summary(s) {
  const marketValue = round2(s.shares * PRICE.drop);
  return {
    cash: s.cash,
    emergency: s.emergency,
    debt: s.debt,
    shares: s.shares,
    marketValue,
    unrealized: round2(marketValue - s.costBasis),
    realized: s.realized,
    netWorth: round2(s.cash + s.emergency + marketValue - s.debt),
  };
}

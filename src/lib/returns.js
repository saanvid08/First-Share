// Simplified return math for the lessons. Every number is a fixed example, not a prediction.

// Dividends example. Each year the stake changes by priceChange, then pays yieldRate of its value.
// With reinvest, the dividend buys more shares. Without it, the dividend is kept as cash.
export function simulateIncome({ principal, priceChange, yieldRate, years, reinvest }) {
  let value = principal;
  let cash = 0;
  let dividendsTotal = 0;
  for (let y = 0; y < years; y++) {
    value = value * (1 + priceChange);
    const dividend = value * yieldRate;
    dividendsTotal += dividend;
    if (reinvest) value += dividend;
    else cash += dividend;
  }
  const total = value + cash;
  return {
    total: Math.round(total * 100) / 100,
    cashDividends: Math.round(cash * 100) / 100,
    dividendsTotal: Math.round(dividendsTotal * 100) / 100,
    priceGain: Math.round((total - principal - dividendsTotal) * 100) / 100,
  };
}

export const SHOCK_SIZE = -0.3;   // a company-specific setback
export const MARKET_SIZE = -0.1;  // a broad market fall

// weights: { TICKER: number }. event: a ticker (company-specific setback) or 'market'.
// Returns the portfolio's percentage change as a decimal, using normalized weights.
export function portfolioChange(weights, event) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (!total) return 0;
  return Object.entries(weights).reduce((sum, [ticker, w]) => {
    const shock = event === 'market' ? MARKET_SIZE : event === ticker ? SHOCK_SIZE : 0;
    return sum + (w / total) * shock;
  }, 0);
}

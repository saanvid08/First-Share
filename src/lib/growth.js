// Monthly compound growth, documented so it can be checked by hand.
// Each month: contribute at the start of the month, then apply that month's growth.
// The annual rate is split into 12 equal monthly rates. Inflation is applied yearly.
// Balance after a month: balance = (balance + monthly) * (1 + annualRate / 12)
export function growthSeries({ monthly, years, annualRate = () => 0, inflation = 0 }) {
  const points = [];
  let balance = 0;
  let contributed = 0;
  for (let m = 1; m <= years * 12; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const monthlyRate = annualRate(yearIndex) / 12;
    balance = (balance + monthly) * (1 + monthlyRate);
    contributed += monthly;
    if (m % 12 === 0) {
      const year = m / 12;
      points.push({
        year,
        contributed: Math.round(contributed * 100) / 100,
        balance: Math.round(balance * 100) / 100,
        real: Math.round((balance / Math.pow(1 + inflation, year)) * 100) / 100,
      });
    }
  }
  return points;
}

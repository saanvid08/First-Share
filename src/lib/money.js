// Small formatting and rounding helpers. Money is rounded to cents after every calculation.
export const round2 = (n) => Math.round(n * 100) / 100;

export const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const signedMoney = (n) => (n > 0 ? '+' : n < 0 ? '-' : '') + money(Math.abs(n));

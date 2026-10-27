# First Share

An interactive financial literacy simulator. Learn how stocks, investing, and risk work through fictional companies and fictional decisions.

**Educational only. Not investment advice, and not a trading platform.** All companies and prices are fictional.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Test it

```bash
npm test
```

The tests check buying and selling, portfolio valuation, compound growth, dividend and diversification math, and deterministic scenario results.

## Build for deployment

```bash
npm run build
```

This creates a `dist` folder of static files. Upload it to any static host (for example Netlify, Vercel, or GitHub Pages). No server or API keys are needed.

## What is included
- **Home:** your next lesson, quick links, and progress.
- **Learn:** six interactive lessons in a side panel: what a stock is, why prices change, saving vs. investing, how investors make money (price gains and dividends), why to diversify, and compound growth.
- **Simulate:** a life decision scenario (three decisions with trade-off feedback and a comparison with your previous path), and a virtual market with four fictional companies, buying and selling, a net worth chart, and transaction history.
- **Compare:** Future Replay, comparing two starting ages, with an optional inflation view and a bad-year stress test.
- **My Progress:** lessons, scenarios, and trades, saved in this browser.
- **Settings:** reset the virtual market, or reset all progress.

## Layout
Each feature has a side panel of sections on the left. On phones, that panel becomes a row of tabs above the content.

## Where things live
- `src/lib/`: financial calculations (portfolio, growth, scenario, returns). Pure functions, no screen code.
- `src/data/`: fictional companies, price histories, and lesson list.
- `src/pages/`: screens.
- `src/components/`: side panel layout, charts, progress bar.
- `test/`: automated checks for the calculations.

## Saved data
Progress is stored in this browser's localStorage under a versioned key. Settings → Reset removes it.

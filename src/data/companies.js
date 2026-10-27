// All companies and prices are fictional and written for this lesson. They are not real stocks.
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const COMPANIES = [
  {
    ticker: 'NVSW', name: 'NovaSoft Software', sector: 'Technology', risk: 'Higher risk',
    description: 'Makes productivity software for small businesses. Its share price can move sharply on product launches and earnings.',
    prices: [48, 50, 53, 51, 57, 62, 58, 55, 60, 66, 63, 70],
    events: [
      { month: 2, title: 'Launches a well-reviewed product', effect: 'up', note: 'Good news can lift a price, but investors may have expected some of it already.' },
      { month: 5, title: 'A rival releases a cheaper alternative', effect: 'down', note: 'Competition can pressure prices and profits.' },
      { month: 8, title: 'Earnings fall short of expectations', effect: 'down', note: 'Expectations matter as much as the results themselves.' },
      { month: 10, title: 'Signs major new contracts', effect: 'up', note: 'New business can support future earnings, but nothing is guaranteed.' },
    ],
  },
  {
    ticker: 'HBRF', name: 'Harbor Foods', sector: 'Grocery', risk: 'Lower risk',
    description: 'Runs a chain of grocery stores. Sales tend to be steadier, but profit margins can be squeezed by costs.',
    prices: [32.5, 32.8, 33.1, 33.0, 33.4, 33.9, 33.7, 34.2, 34.6, 34.4, 35.0, 35.3],
    events: [
      { month: 4, title: 'Food costs rise and squeeze margins', effect: 'down', note: 'Higher costs can shrink profit even when sales hold steady.' },
      { month: 9, title: 'Opens stores in two new regions', effect: 'up', note: 'Growth can add value over time, but new stores take years to pay off.' },
    ],
  },
  {
    ticker: 'SLRS', name: 'Solaris Energy', sector: 'Renewable energy', risk: 'Medium risk',
    description: 'Builds solar farms and sells the power they produce. Government policy and equipment prices both matter.',
    prices: [21, 20, 19.5, 18.2, 19.8, 21.5, 23, 22.4, 21, 20.2, 22.1, 24],
    events: [
      { month: 3, title: 'Government funding is delayed', effect: 'down', note: 'Projects can stall when funding timelines slip.' },
      { month: 6, title: 'Signs a large solar contract', effect: 'up', note: 'Long contracts can make future income easier to predict.' },
      { month: 9, title: 'Panel prices fall across the industry', effect: 'down', note: 'Cheaper competitors can reduce margins for everyone.' },
      { month: 11, title: 'Wins a grid storage deal', effect: 'up', note: 'New projects can add value, but they also carry execution risk.' },
    ],
  },
  {
    ticker: 'MRDH', name: 'Meridian Health', sector: 'Healthcare', risk: 'Medium risk',
    description: 'Develops medical devices and treatments. Results depend heavily on scientific trials and government approval.',
    prices: [64, 63.5, 65, 66.2, 65.8, 64.9, 63, 64.4, 66.5, 68, 67.2, 69],
    events: [
      { month: 2, title: 'A clinical trial shows mixed results', effect: 'down', note: 'Mixed results can leave investors unsure about the future.' },
      { month: 7, title: 'Receives approval for a new device', effect: 'up', note: 'Approval can open new sales, but demand still has to materialize.' },
      { month: 10, title: 'Renews a major hospital contract', effect: 'up', note: 'Stable customers can make earnings more predictable.' },
    ],
  },
];

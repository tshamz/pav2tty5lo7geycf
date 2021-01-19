const min = require('lodash/min');
const max = require('lodash/max');

const admin = require('@services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date().setHours(now.getHours() - 1);

    const [prices, priceHistories] = await Promise.all([
      admin.getPath({ path: 'prices' }),
      admin.getPath({ db: admin.priceHistory }),
    ]);

    // prettier-ignore
    const updates = Object.entries(prices).reduce((updates, [id, data]) => {
      const open = data.open || null;
      const close = data.lastTrade || null;
      const priceHistory = priceHistories[id] || {};
      const pricesInLastHour = Object.entries(priceHistory)
        .filter(([timestamp]) => parseInt(timestamp) > oneHourAgo)
        .filter(([timestamp]) => parseInt(timestamp) < now.getTime())
        .map((entry) => entry[1]);
      const low = min([open, close, ...pricesInLastHour]);
      const high = max([open, close, ...pricesInLastHour]);

      return {
        prices: {
          ...updates.prices,
          [`${id}/open`]: close,
        },
        ohlc: {
          ...updates.ohlc,
          [`${id}/${now.getTime()}`]: { open, high, low, close },
        },
      };
    }, { prices: {}, ohlc: {}});

    await Promise.all([
      admin.setPath('prices')(updates.prices),
      admin.setPath({ db: admin.priceOHLC })(updates.ohlc),
    ]);

    if (res && res.status) {
      res.status(200).json({});
    }

    return;
  } catch (error) {
    console.error(error);

    if (res && res.status) {
      res.status(500).json({});
    }

    return { error };
  }
};

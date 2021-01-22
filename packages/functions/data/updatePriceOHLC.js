const min = require('lodash/min');
const max = require('lodash/max');

const firebase = require('@services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date().setHours(now.getHours() - 1);

    const [prices, priceHistories] = await Promise.all([
      firebase.db.get('prices'),
      firebase.priceHistory.get(),
    ]);

    const priceEntries = Object.entries(prices);

    const priceUpdates = priceEntries.reduce((updates, [id, data]) => {
      return {
        ...updates,
        [`${id}/open`]: data.lastTrade || null,
      };
    }, {});

    const ohlcUpdates = priceEntries.reduce((updates, [id, data]) => {
      const open = data.open || null;
      const close = data.lastTrade || null;
      const priceHistory = priceHistories[id] || {};
      const pricesInLastHour = Object.entries(priceHistory)
        .filter(([timestamp]) => parseInt(timestamp) > oneHourAgo)
        .filter(([timestamp]) => parseInt(timestamp) < now.getTime())
        .map((entry) => entry[1]);
      const low = min([open, close, ...pricesInLastHour]);
      const high = max([open, close, ...pricesInLastHour]);
      const key = `${id}/${now.getTime()}`;

      return { ...updates.ohlc, [key]: { open, high, low, close } };
    }, {});

    await Promise.all([
      firebase.db.set('prices', priceUpdates),
      firebase.priceOhlc.set(ohlcUpdates),
    ]);

    return;
  } catch (error) {
    console.error(error);

    return { error };
  } finally {
    if (res && res.status) {
      res.status(200).json({});
    }
  }
};

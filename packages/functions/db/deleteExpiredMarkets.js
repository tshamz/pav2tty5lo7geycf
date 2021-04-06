const firebase = require('@services/firebase');

module.exports = async (context, res) => {
  try {
    const createUpdate = (...keys) =>
      keys.reduce((updates, key) => ({ ...updates, [key]: null }), {});

    const allMarkets = Object.values(await firebase.db.get(`markets`));
    const markets = allMarkets.filter(({ daysLeft }) => daysLeft < 0);

    const marketIds = markets.map(({ id }) => id);
    const contractIds = markets.map(({ contracts }) => contracts).flat();
    const marketKeys = marketIds.map((id) => `markets/${id}`);
    const contractKeys = contractIds.map((id) => `contracts/${id}`);
    const priceKeys = contractIds.map((id) => `prices/${id}`);
    const orderBookKeys = contractIds.map((id) => `orderBooks/${id}`);

    const timespansUpdate = createUpdate(...marketIds);
    const priceHistoryUpdate = createUpdate(...contractIds);
    const defaultUpdate = createUpdate(
      ...marketKeys,
      ...contractKeys,
      ...priceKeys,
      ...orderBookKeys
    );

    await Promise.all([
      firebase.db.set(defaultUpdate),
      firebase.timespans.set(timespansUpdate),
      firebase.priceHistory.set(priceHistoryUpdate),
    ]);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }

    return null;
  }
};

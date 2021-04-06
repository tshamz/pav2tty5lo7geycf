const firebase = require('@services/firebase');

module.exports = async (change, { params }) => {
  try {
    if (change.after.val() > -1) return;

    const createUpdate = (...keys) =>
      keys.reduce((updates, key) => ({ ...updates, [key]: null }), {});

    const market = await firebase.db.get(`markets/${params.market}`);

    const contractKeys = market.contracts.map((id) => `contracts/${id}`);
    const pricesKeys = market.contracts.map((id) => `prices/${id}`);
    const orderBooksKeys = market.contracts.map((id) => `orderBooks/${id}`);

    const timespansUpdate = createUpdate(params.market);
    const priceHistoryUpdate = createUpdate(market.contracts);
    const defaultUpdate = createUpdate(
      `markets/${params.market}`,
      contractKeys,
      pricesKeys,
      orderBooksKeys
    );

    await Promise.all([
      firebase.db.set(defaultUpdate),
      firebase.timespans.set(timespansUpdate),
      firebase.priceHistory.set(priceHistoryUpdate),
    ]);
  } catch (error) {
    firebase.logger.error(error.message);
  }
};

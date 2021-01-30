const firebase = require('@services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const marketsSnapshot = await firebase.db.get('markets');

    const closedIds = Object.entries(marketsSnapshot)
      .filter(([id, { active }]) => active === false)
      .map(([market, { contracts }]) => ({ market, contracts }));

    const closedMarkets = closedIds.map(({ market }) => parseInt(market));
    const closedContracts = closedIds.map(({ contracts }) => contracts).flat();

    const marketUpdates = closedMarkets.reduce(
      (updates, id) => ({ ...updates, [`markets/${id}`]: null }),
      {}
    );

    const contractUpdates = closedContracts.reduce(
      (updates, id) => ({ ...updates, [`contracts/${id}`]: null }),
      {}
    );

    const priceUpdates = closedContracts.reduce(
      (updates, id) => ({ ...updates, [`prices/${id}`]: null }),
      {}
    );

    const orderBookUpdates = closedContracts.reduce(
      (updates, id) => ({ ...updates, [`orderBook/${id}`]: null }),
      {}
    );

    const priceDatabaseUpdates = closedContracts.reduce(
      (updates, id) => ({ ...updates, [id]: null }),
      {}
    );

    const databaseUpdate = {
      ...marketUpdates,
      ...contractUpdates,
      ...priceUpdates,
      ...orderBookUpdates,
    };

    await Promise.all([
      firebase.db.set(databaseUpdate),
      firebase.priceHistory.set(priceDatabaseUpdates),
      firebase.priceInterval.set(priceDatabaseUpdates),
      firebase.priceOhlc.set(priceDatabaseUpdates),
    ]);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.status) {
      res.sendStatus(200);
    }

    return null;
  }
};

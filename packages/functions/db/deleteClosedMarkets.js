const firebase = require('@services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const marketsSnapshot = await firebase.db.get('markets');
    const isMarketClosed = (market) =>
      market.active === false || market.dateEnd < Date.now();

    const closedMarkets = Object.values(marketsSnapshot).filter(isMarketClosed);
    const closedMarketIds = closedMarkets.map(({ id }) => id);
    const closedContractIds = closedMarkets
      .map(({ contracts }) => contracts)
      .flat()
      .map(({ id }) => id);

    // .map(({ id: market, contracts }) => ({ market, contracts: contracts.map(({ id }) => id) }))
    // .reduce((ids, { id, contracts }) => )

    const closedMarketsIds = closedMarkets.map(({ market }) =>
      parseInt(market)
    );
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

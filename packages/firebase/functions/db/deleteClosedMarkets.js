const admin = require('@services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const marketsSnapshot = await admin.getPath({ path: 'markets' });
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
      admin.setPath()(databaseUpdate),
      admin.setPath({ db: admin.priceHistory })(priceDatabaseUpdates),
      admin.setPath({ db: admin.priceInterval })(priceDatabaseUpdates),
      admin.setPath({ db: admin.priceOHLC })(priceDatabaseUpdates),
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

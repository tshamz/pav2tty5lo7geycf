const admin = require('@services/firebase');

module.exports = async (...args) => {
  const res = args[1];

  try {
    const dbSnapshot = await admin.getPath();
    const marketEntries = Object.entries(dbSnapshot.markets);
    const contractEntries = Object.entries(dbSnapshot.contracts);
    const pricesEntries = Object.entries(dbSnapshot.prices);

    const marketsUpdates = marketEntries.reduce((updates, [id, value]) => {
      return {
        ...updates,
        [`markets/${id}/_id`]: null,
        [`markets/${id}/_type`]: null,
        [`markets/${id}/_updateSource`]: null,
        [`markets/${id}/id`]: null,
        [`markets/${id}/updatedAt`]: null,
        [`markets/${id}/status`]: null,
      };
    }, {});

    const contractsUpdates = contractEntries.reduce((updates, [id, value]) => {
      return {
        ...updates,
        [`contracts/${id}/id`]: null,
        [`contracts/${id}/_id`]: null,
        [`contracts/${id}/_type`]: null,
        [`contracts/${id}/_updateSource`]: null,
        [`contracts/${id}/bestBuyNoCost`]: null,
        [`contracts/${id}/bestBuyYesCost`]: null,
        [`contracts/${id}/bestSellNoCost`]: null,
        [`contracts/${id}/bestSellYesCost`]: null,
        [`contracts/${id}/bestNoPrice`]: null,
        [`contracts/${id}/bestYesPrice`]: null,
        [`contracts/${id}/lastClosePrice`]: null,
        [`contracts/${id}/lastTradePrice`]: null,
        [`contracts/${id}/updatedAt`]: null,
        [`contracts/${id}/buyNo`]: null,
        [`contracts/${id}/buyYes`]: null,
        [`contracts/${id}/lastTrade`]: null,
        [`contracts/${id}/sellNo`]: null,
        [`contracts/${id}/sellYes`]: null,
        [`contracts/${id}/status`]: null,
      };
    }, {});

    const pricesUpdate = pricesEntries.reduce((updates, [id, value]) => {
      return {
        ...updates,
        [`prices/${id}/history`]: null,
        [`prices/${id}/interval`]: null,
        [`prices/${id}/id`]: null,
        [`prices/${id}/_id`]: null,
        [`prices/${id}/_type`]: null,
        [`prices/${id}/_updateSource`]: null,
        [`prices/${id}/bestBuyNoCost`]: null,
        [`prices/${id}/bestBuyYesCost`]: null,
        [`prices/${id}/bestSellNoCost`]: null,
        [`prices/${id}/bestSellYesCost`]: null,
        [`prices/${id}/bestNoPrice`]: null,
        [`prices/${id}/bestYesPrice`]: null,
        [`prices/${id}/lastClosePrice`]: null,
        [`prices/${id}/lastTradePrice`]: null,
        [`prices/${id}/updatedAt`]: null,
        [`prices/${id}/close`]: null,
      };
    }, {});

    await admin.setPath()({
      ...marketsUpdates,
      ...contractsUpdates,
      ...pricesUpdate,
      stats: null,
      orderBook: null,
      [`contracts/contracts`]: null,
    });

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

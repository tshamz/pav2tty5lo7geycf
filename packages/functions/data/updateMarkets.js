const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = async (context, res) => {
  try {
    const markets = await predictit.fetchAllMarkets();

    markets.forEach((market) => {
      const dateEnd = new Date(market.contracts[0].dateEnd + 'Z').getTime();
      const daysLeft = (dateEnd - Date.now()) / (24 * 60 * 60 * 1000);

      // prettier-ignore
      const marketUpdates = {
        [`markets/${market.id}/id`]: market.id.toString(),
        [`markets/${market.id}/contracts`]: market.contracts.map(({ id }) => id.toString()),
        [`markets/${market.id}/url`]: market.url,
        [`markets/${market.id}/name`]: market.name,
        [`markets/${market.id}/shortName`]: market.shortName,
        [`markets/${market.id}/image`]: market.image,
        [`markets/${market.id}/active`]: market.status === 'Open',
        [`markets/${market.id}/dateEnd`]: dateEnd || false,
        [`markets/${market.id}/daysLeft`]: Math.floor(daysLeft) || false,
      };

      const contractUpdates = market.contracts.reduce(
        (updates, contract) => ({
          ...updates,
          [`contracts/${contract.id}/id`]: contract.id.toString(),
          [`contracts/${contract.id}/market`]: market.id.toString(),
          [`contracts/${contract.id}/url`]: market.url,
          [`contracts/${contract.id}/name`]: contract.name,
          [`contracts/${contract.id}/shortName`]: contract.shortName,
          [`contracts/${contract.id}/image`]: contract.image,
          [`contracts/${contract.id}/displayOrder`]: contract.displayOrder,
        }),
        {}
      );

      const priceUpdates = market.contracts.reduce(
        (updates, contract) => ({
          ...updates,
          [`prices/${contract.id}/id`]: contract.id.toString(),
          [`prices/${contract.id}/market`]: market.id.toString(),
          [`prices/${contract.id}/buyNo`]: contract.bestBuyNoCost,
          [`prices/${contract.id}/buyYes`]: contract.bestBuyYesCost,
          [`prices/${contract.id}/sellNo`]: contract.bestSellNoCost,
          [`prices/${contract.id}/sellYes`]: contract.bestSellYesCost,
        }),
        {}
      );

      firebase.db.set({
        ...marketUpdates,
        ...contractUpdates,
        ...priceUpdates,
      });
    });
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};

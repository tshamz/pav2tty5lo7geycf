const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = async (context, res) => {
  try {
    const markets = await predictit.fetchAllMarkets();

    const update = markets.reduce((updates, { contracts, ...market }) => {
      const dateEnd = new Date(contracts[0].dateEnd + 'Z').getTime();
      const daysLeft = (dateEnd - Date.now()) / (24 * 60 * 60 * 1000);

      const marketUpdates = {
        [`markets/${market.id}/id`]: `${market.id}`,
        [`markets/${market.id}/contracts`]: contracts.map(({ id }) => `${id}`),
        [`markets/${market.id}/url`]: market.url,
        [`markets/${market.id}/name`]: market.name,
        [`markets/${market.id}/shortName`]: market.shortName,
        [`markets/${market.id}/image`]: market.image,
        [`markets/${market.id}/active`]: market.status === 'Open',
        [`markets/${market.id}/dateEnd`]: dateEnd || false,
        [`markets/${market.id}/daysLeft`]: Math.floor(daysLeft) || false,
      };

      const contractUpdates = contracts.reduce(
        (updates, contract) => ({
          ...updates,
          [`contracts/${contract.id}/id`]: `${contract.id}`,
          [`contracts/${contract.id}/market`]: `${market.id}`,
          [`contracts/${contract.id}/url`]: market.url,
          [`contracts/${contract.id}/name`]: contract.name,
          [`contracts/${contract.id}/shortName`]: contract.shortName,
          [`contracts/${contract.id}/image`]: contract.image,
          [`contracts/${contract.id}/displayOrder`]: contract.displayOrder,
        }),
        {}
      );

      const priceUpdates = contracts.reduce(
        (updates, contract) => ({
          ...updates,
          [`prices/${contract.id}/id`]: `${contract.id}`,
          [`prices/${contract.id}/market`]: `${market.id}`,
          [`prices/${contract.id}/buyNo`]: contract.bestBuyNoCost,
          [`prices/${contract.id}/buyYes`]: contract.bestBuyYesCost,
          [`prices/${contract.id}/sellNo`]: contract.bestSellNoCost,
          [`prices/${contract.id}/sellYes`]: contract.bestSellYesCost,
        }),
        {}
      );

      return {
        ...updates,
        ...marketUpdates,
        ...contractUpdates,
        ...priceUpdates,
      };
    }, {});

    await firebase.db.set(update);

    firebase.logger.info(`updated market data from predictit`);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};

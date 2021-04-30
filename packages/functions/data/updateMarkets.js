const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = async (context, res) => {
  try {
    const markets = await predictit.fetchAllMarkets();

    const update = markets.reduce(
      (updates, { contracts, ...market }) => {
        const dateEnd = new Date(contracts[0].dateEnd + 'Z').getTime();
        const daysLeft = (dateEnd - Date.now()) / (24 * 60 * 60 * 1000);

        const marketsUpdates = {
          [`${market.id}/id`]: `${market.id}`,
          [`${market.id}/contracts`]: contracts.map(({ id }) => `${id}`),
          [`${market.id}/url`]: market.url,
          [`${market.id}/name`]: market.name,
          [`${market.id}/shortName`]: market.shortName,
          [`${market.id}/image`]: market.image,
          [`${market.id}/active`]: market.status === 'Open',
          [`${market.id}/dateEnd`]: dateEnd || false,
          [`${market.id}/daysLeft`]: Math.floor(daysLeft) || false,
        };

        const contractsUpdates = contracts.reduce(
          (updates, contract) => ({
            ...updates,
            [`${contract.id}/id`]: `${contract.id}`,
            [`${contract.id}/market`]: `${market.id}`,
            [`${contract.id}/url`]: market.url,
            [`${contract.id}/name`]: contract.name,
            [`${contract.id}/shortName`]: contract.shortName,
            [`${contract.id}/image`]: contract.image,
            [`${contract.id}/displayOrder`]: contract.displayOrder,
          }),
          {}
        );

        const pricesUpdates = contracts.reduce(
          (updates, contract) => ({
            ...updates,
            [`${contract.id}/id`]: `${contract.id}`,
            [`${contract.id}/contract`]: `${contract.id}`,
            [`${contract.id}/market`]: `${market.id}`,
            [`${contract.id}/buyNo`]: contract.bestBuyNoCost,
            [`${contract.id}/buyYes`]: contract.bestBuyYesCost,
            [`${contract.id}/sellNo`]: contract.bestSellNoCost,
            [`${contract.id}/sellYes`]: contract.bestSellYesCost,
          }),
          {}
        );

        return {
          markets: {
            ...updates.markets,
            ...marketsUpdates,
          },
          contracts: {
            ...updates.contracts,
            ...contractsUpdates,
          },
          prices: {
            ...updates.prices,
            ...pricesUpdates,
          },
        };
      },
      { markets: {}, contracts: {}, prices: {} }
    );

    await Promise.all([
      firebase.markets.set(update.markets),
      firebase.contracts.set(update.contracts),
      firebase.prices.set(update.prices),
    ]);

    firebase.logger.info(`updated predictit market, contract, and price data`);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};

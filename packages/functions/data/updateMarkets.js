const fetch = require('node-fetch');
const firebase = require('@services/firebase');

module.exports = async (context, res) => {
  try {
    const url = 'https://www.predictit.org/api/marketdata/all';

    const headers = {
      Accept: '*/*',
      Host: 'www.predictit.org',
      'User-Agent': 'curl/7.64.1',
    };

    const markets = await fetch(url, { headers })
      .then((response) => response.json())
      .then((data) => data.markets);

    markets.forEach((market) => {
      const dateEnd = new Date(market.contracts[0].dateEnd + 'Z').getTime();
      const daysLeft = (dateEnd - Date.now()) / (24 * 60 * 60 * 1000);

      // prettier-ignore
      const marketUpdates = {
        [`markets/${market.id}/id`]: market.id,
        [`markets/${market.id}/contracts`]: market.contracts.map(({ id }) => id),
        [`markets/${market.id}/url`]: market.url,
        [`markets/${market.id}/name`]: market.name,
        [`markets/${market.id}/shortName`]: market.shortName,
        [`markets/${market.id}/image`]: market.image,
        [`markets/${market.id}/active`]: market.status === 'Open',
        [`markets/${market.id}/dateEnd`]: dateEnd || null,
        [`markets/${market.id}/daysLeft`]: Math.floor(daysLeft) || null,
        [`markets/${market.id}/_timestamp`]: Date.now(),
        [`markets/${market.id}/_updatedAt`]: new Date().toLocaleString(),
      };

      const contractUpdates = market.contracts.reduce(
        (updates, contract) => ({
          ...updates,
          [`contracts/${contract.id}/id`]: contract.id,
          [`contracts/${contract.id}/url`]: market.url,
          [`contracts/${contract.id}/name`]: contract.name,
          [`contracts/${contract.id}/shortName`]: contract.shortName,
          [`contracts/${contract.id}/market`]: market.id,
          [`contracts/${contract.id}/image`]: contract.image,
          [`contracts/${contract.id}/displayOrder`]: contract.displayOrder,
          [`contracts/${contract.id}/_timestamp`]: Date.now(),
          [`contracts/${contract.id}/_updatedAt`]: new Date().toLocaleString(),
        }),
        {}
      );

      const priceUpdates = market.contracts.reduce(
        (updates, contract) => ({
          ...updates,
          [`prices/${market.id}/${contract.id}/id`]: contract.id,
          [`prices/${market.id}/${contract.id}/buyNo`]: contract.bestBuyNoCost,
          [`prices/${market.id}/${contract.id}/buyYes`]: contract.bestBuyYesCost,
          [`prices/${market.id}/${contract.id}/sellNo`]: contract.bestSellNoCost,
          [`prices/${market.id}/${contract.id}/sellYes`]: contract.bestSellYesCost,
          [`prices/${market.id}/${contract.id}/market`]: market.id,
          [`prices/${market.id}/${contract.id}/_timestamp`]: Date.now(),
          [`prices/${market.id}/${contract.id}/_updatedAt`]: new Date().toLocaleString(),
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

    return null;
  }
};

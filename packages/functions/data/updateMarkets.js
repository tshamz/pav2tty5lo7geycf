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

      const marketUpdate = {
        id: market.id,
        url: market.url,
        name: market.name,
        shortName: market.shortName,
        image: market.image,
        active: market.status === 'Open',
        contracts: market.contracts.map(({ id }) => id),
        dateEnd: dateEnd || null,
        daysLeft: Math.floor(daysLeft) || null,
      };

      const contractsUpdate = market.contracts.reduce(
        (updates, contract) => ({
          ...updates,
          [contract.id]: {
            id: contract.id,
            url: market.url,
            name: contract.name,
            shortName: contract.shortName,
            market: market.id,
            image: contract.image,
            displayOrder: contract.displayOrder,
          },
        }),
        {}
      );

      const pricesUpdate = market.contracts.reduce(
        (updates, contract) => ({
          ...updates,
          [contract.id]: {
            id: contract.id,
            buyNo: contract.bestBuyNoCost,
            buyYes: contract.bestBuyYesCost,
            sellNo: contract.bestSellNoCost,
            sellYes: contract.bestSellYesCost,
            market: market.id,
          },
        }),
        {}
      );

      Promise.all([
        firebase.db.set(`markets/${market.id}`, marketUpdate),
        firebase.db.set('contracts', contractsUpdate),
        firebase.db.set('prices', pricesUpdate),
      ]);
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

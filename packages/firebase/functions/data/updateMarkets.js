const fetch = require('node-fetch');
const equals = require('deep-equal');

const log = require('@services/logger');
const admin = require('@services/firebase');

module.exports = async (context, res) => {
  try {
    const Accept = '*/*';
    const Host = 'www.predictit.org';
    const headers = { Accept, Host, 'User-Agent': 'curl/7.64.1' };
    const url = `https://www.predictit.org/api/marketdata/all`;
    const response = await fetch(url, { headers }).then((res) => res.json());
    const data = await response.json();
    const current = (await admin.getPath()) || {};
    const currentMarkets = current.markets || {};
    const update = {
      ...(await getInactiveMarkets(data.markets, currentMarkets)),
      ...getMarketsUpdate(data.markets, currentMarkets),
      ...getContractsAndPricesUpdate(data.markets, current),
    };

    await admin.setPath()(update);

    if (res && res.status) {
      res.status(200).json({ update });
    }

    return update;
  } catch (error) {
    log.error(error);

    if (res && res.status) {
      res.status(500).json({});
    }

    return { error };
  }
};

const getInactiveMarkets = async (markets, current) => {
  try {
    return Object.keys(current)
      .map((id) => parseInt(id))
      .filter((id) => !markets.map((market) => market.id).includes(id))
      .reduce((updates, id) => {
        return { ...updates, [`markets/${id}/active`]: false };
      }, {});
  } catch (error) {
    log.error(error);
    return {};
  }
};

const prepareUpdate = ({ update, node, id, current = {} }) => {
  const keyEntry = ([key, value]) => [`${node}/${id}/${key}`, value];
  const keyedEntries = Object.entries(update).map(keyEntry);

  delete current._timestamp;
  delete current._updatedAt;

  if (equals(current, update)) return {};

  return {
    ...Object.fromEntries(keyedEntries),
    [`${node}/${id}/_timestamp`]: Date.now(),
    [`${node}/${id}/_updatedAt`]: new Date().toUTCString(),
  };
};

const getMarketsUpdate = (markets, current) => {
  return markets.reduce((updates, market) => {
    const msLeft = new Date(market.contracts[0].dateEnd).getTime() - Date.now();
    return {
      ...updates,
      ...prepareUpdate({
        node: 'markets',
        id: market.id,
        current: current[market.id],
        update: {
          id: market.id,
          url: market.url,
          name: market.name,
          shortName: market.shortName,
          image: market.image,
          active: market.status === 'Open',
          dateEnd: new Date(market.contracts[0].dateEnd) || null,
          daysLeft: Math.floor(msLeft / (24 * 60 * 60 * 1000)) || null,
          contracts: market.contracts.map(({ id }) => id),
        },
      }),
    };
  }, {});
};

const getContractsAndPricesUpdate = (markets, current) => {
  const currentContracts = current.contracts || {};
  const currentPrices = current.prices || {};
  return markets.reduce((updates, market) => {
    return {
      ...updates,
      ...market.contracts.reduce((updates, contract) => {
        return {
          ...updates,
          ...prepareUpdate({
            id: contract.id,
            node: 'contracts',
            current: currentContracts[contract.id],
            update: {
              id: contract.id,
              url: market.url,
              name: contract.name,
              shortName: contract.shortName,
              market: market.id,
              image: contract.image,
              displayOrder: contract.displayOrder,
            },
          }),
          ...prepareUpdate({
            id: contract.id,
            node: 'prices',
            current: currentPrices[contract.id],
            update: {
              id: contract.id,
              buyNo: contract.bestBuyNoCost,
              buyYes: contract.bestBuyYesCost,
              sellNo: contract.bestSellNoCost,
              sellYes: contract.bestSellYesCost,
              lastTrade: contract.lastTradePrice,
              market: market.id,
            },
          }),
        };
      }, {}),
    };
  }, {});
};

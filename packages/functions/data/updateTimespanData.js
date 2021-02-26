const csv = require('csvtojson');
const fetch = require('node-fetch');
const firebase = require('@services/firebase');
const groupBy = require('lodash/groupBy');
const mapValues = require('lodash/mapValues');

module.exports = (timespans) => async (context, res) => {
  try {
    const _markets = await firebase.db.get(`markets`);
    const markets = Object.values(_markets)
      .filter((market) => market.id)
      .filter((market) => market.contracts && market.contracts.length);
    const contracts = await firebase.db.get(`contracts`);
    const urlBase = `https://www.predictit.org/Resource/DownloadMarketChartData`;
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
    };

    const fetchDownloadAndParse = (timespan) => async (market) => {
      try {
        const url = urlBase + `?timespan=${timespan}&marketid=${market.id}`;
        const response = await fetch(url, { headers });
        const text = await response.text();
        const data = await csv().fromString(text);

        return data
          .map((row) => {
            const byName = (name) => ({ shortName }) => name === shortName;
            const contract = market.contracts
              .map((id) => ({ ...contracts[id], id }))
              .find(byName(row.ContractName));

            return { ...row, contract: contract && contract.id };
          })
          .filter(({ contract }) => contract)
          .map((row) => {
            return {
              timespan,
              market: parseInt(market.id),
              contract: parseInt(row.contract),
              date: row.Date,
              name: row.ContractName,
              open: parseFloat(row.OpenSharePrice.slice(1)),
              high: parseFloat(row.HighSharePrice.slice(1)),
              low: parseFloat(row.LowSharePrice.slice(1)),
              close: parseFloat(row.CloseSharePrice.slice(1)),
              volume: parseInt(row.TradeVolume),
            };
          });
      } catch (error) {
        console.log('error', error);
      }
    };

    const groupByContract = (market) => groupBy(market, 'contract');

    const prepareUpdate = async (timespan) => {
      const requests = markets.map(fetchDownloadAndParse(timespan));
      const data = await Promise.all(requests);
      const groupedByMarket = groupBy(data.flat(), 'market');
      const groups = mapValues(groupedByMarket, groupByContract);

      return Object.entries(groups).reduce((update, [market, contracts]) => {
        return Object.entries(contracts).reduce((update, [contract, group]) => {
          return {
            ...update,
            [`${market}/${contract}/${timespan}`]: group,
          };
        }, update);
      }, {});
    };

    const update = timespans.reduce(async (updates, timespan) => {
      return {
        ...updates,
        ...(await prepareUpdate(timespan)),
      };
    }, {});

    await firebase.timespans.set(await update);
  } catch (error) {
    firebase.logger.error(error.message);
    return;
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};

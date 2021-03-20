const csv = require('csvtojson');
const fetch = require('node-fetch');
const firebase = require('@services/firebase');

module.exports = (frequency) => async (context, res) => {
  try {
    const markets = await firebase.db.get(`markets`);
    const contracts = await firebase.db.get(`contracts`);

    const fetchData = (marketId) => (timespan) => {
      const url = `https://www.predictit.org/Resource/DownloadMarketChartData`;
      const params = `?timespan=${timespan}&marketid=${marketId}`;
      const headers = {
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36`,
      };

      const attachMarketAndTimespan = (row) => ({ ...row, marketId, timespan });

      return fetch(url + params, { headers })
        .then((response) => response.text())
        .then((text) => csv().fromString(text))
        .then((rows) => rows.map(attachMarketAndTimespan))
        .then(parseData)
        .catch(console.error);
    };

    const parseData = (data) => {
      return data.reduce((update, row) => {
        const contract = Object.values(contracts)
          .filter((contract) => contract.market === row.marketId)
          .find((contract) => contract.shortName === row.ContractName);

        if (contract) {
          const path = `${row.marketId}/${contract.id}/${row.timespan}`;

          return {
            ...update,
            [path]: [
              ...(update[path] || []),
              {
                timespan: row.timespan,
                market: parseInt(row.marketId),
                contract: parseInt(contract.id),
                date: row.Date,
                name: row.ContractName,
                open: parseFloat(row.OpenSharePrice.slice(1)),
                high: parseFloat(row.HighSharePrice.slice(1)),
                low: parseFloat(row.LowSharePrice.slice(1)),
                close: parseFloat(row.CloseSharePrice.slice(1)),
                volume: parseInt(row.TradeVolume),
              },
            ],
          };
        }

        console.log(`no contact found in market: ${row.marketId} for`, row);

        return update;
      }, {});
    };

    const requests = Object.values(markets).map(async (market) => {
      const fetchTimespanData = fetchData(market.id);

      if (!market.id) {
        console.log('market', market);
        return {};
      }

      if (frequency === 'hourly') {
        const parseHourly = (hourly, entry) => {
          const path = entry[0].replace('24h', '1h');
          const data = entry[1].slice(-1);
          return { ...hourly, [path]: data };
        };

        const daily = fetchTimespanData('24h');
        const hourly = Object.entries(daily).reduce(parseHourly, {});
        return [hourly, daily];
      } else if (frequency === 'daily') {
        return await Promise.all([
          fetchTimespanData('7d'),
          fetchTimespanData('30d'),
          fetchTimespanData('90d'),
        ]);
      }
    });

    const update = await Promise.all(requests)
      .then((results) => results.flat())
      .then((data) =>
        data.reduce((update, result) => ({ ...update, ...result }), {})
      );

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

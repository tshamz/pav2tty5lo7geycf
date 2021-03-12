const csv = require('csvtojson');
const fetch = require('node-fetch');
const firebase = require('@services/firebase');

module.exports = async (context, res) => {
  try {
    const allContracts = await firebase.db.get(`contracts`);

    const mapContracts = ({ contracts, ...market }) => ({
      ...market,
      contracts: contracts.map((id) => ({ ...allContracts[id], id })),
    });

    const markets = Object.values(await firebase.db.get(`markets`))
      .filter((market) => market.id)
      .filter((market) => market.contracts && market.contracts.length)
      .map(mapContracts);

    const getContract = (name, market) =>
      market.contracts.find((contract) => contract.shortName === name);

    const fetchData = (market) => async (timespan) => {
      try {
        const url = `https://www.predictit.org/Resource/DownloadMarketChartData`;
        const params = `?timespan=${timespan}&marketid=${market.id}`;
        const headers = {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
        };

        const response = await fetch(url + params, { headers });
        const text = await response.text();
        const data = await csv().fromString(text);

        return data.reduce((update, row) => {
          const contract = getContract(row.ContractName, market);

          if (contract && contract.id) {
            const path = `${market.id}/${contract.id}/${timespan}`;

            return {
              ...update,
              [path]: [
                ...(update[path] || []),
                {
                  timespan,
                  market: parseInt(market.id),
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

          return update;
        }, {});
      } catch (error) {
        console.log('error', error);
      }
    };

    const fetchMarketData = async (market) => {
      const fetchDataWithMarket = fetchData(market);
      const daily = await fetchDataWithMarket('24h');
      const hourly = Object.entries(daily).reduce(
        (data, [path, hours]) => ({
          ...data,
          [path.replace('24h', '1h')]: hours.slice(-1),
        }),
        {}
      );

      return {
        ...daily,
        ...hourly,
      };
    };

    const data = await Promise.all(markets.map(fetchMarketData));

    const update = data.reduce(
      (update, market) => ({ ...update, ...market }),
      {}
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

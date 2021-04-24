const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = (timespans) => async (context, res) => {
  try {
    const markets = await predictit.fetchAllMarkets();

    const mergePaths = (paths) =>
      paths.reduce((result, paths) => ({ ...result, ...paths }), {});

    const parseData = ({ market, timespan }) => (data) => {
      const getContract = (name) =>
        market.contracts.find(({ shortName }) => shortName === name);

      return data.map((row) => ({
        timespan,
        market: market.id,
        contract: getContract(row.ContractName)?.id,
        date: row.Date,
        name: row.ContractName,
        open: parseFloat(row.OpenSharePrice.slice(1)),
        high: parseFloat(row.HighSharePrice.slice(1)),
        low: parseFloat(row.LowSharePrice.slice(1)),
        close: parseFloat(row.CloseSharePrice.slice(1)),
        volume: parseInt(row.TradeVolume),
      }));
    };

    const prepareUpdate = (rows) => {
      return rows.reduce((update, row) => {
        if (!row.market || !row.contract || !row.timespan) return update;

        const path = `${row.market}/${row.contract}/${row.timespan}`;
        const pathData = update[path] || [];

        return {
          ...update,
          [path]: [...pathData, row],
        };
      }, {});
    };

    const fetchMarketTimespan = (timespan) => async (market) => {
      return predictit
        .fetchMarketChartData({ marketid: market.id, timespan })
        .then(parseData({ market, timespan }))
        .then(prepareUpdate);
    };

    const fetchTimespans = (timespan) => {
      const fetchTimespan = fetchMarketTimespan(timespan);
      return Promise.all(markets.map(fetchTimespan)).then(mergePaths);
    };

    await Promise.all(timespans.map(fetchTimespans))
      .then(mergePaths)
      .then(firebase.timespans.set);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};

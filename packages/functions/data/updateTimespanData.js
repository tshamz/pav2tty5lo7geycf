const mapValues = require('lodash/mapValues');

const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

const getPrices = (key) => (row) => row[key];
const getTotal = (key) => (sum, row) => sum + row[key];
const mergeResults = (results) =>
  results.reduce((data, result) => ({ ...data, ...result }), {});

const parseData = (values) => ({
  open: values.reduce(getTotal('open'), 0) / values.length,
  high: values.map(getPrices('high')).sort()[values.length - 1],
  low: values.map(getPrices('low')).sort()[0],
  close: values.reduce(getTotal('close'), 0) / values.length,
  volume: values.reduce(getTotal('volume'), 0),
});

const groupDataByContract = (timespan) => (rows) => {
  return rows.reduce((update, row) => {
    const path = `${row.contract}/${timespan}`;
    const pathData = update[path] || [];
    return {
      ...update,
      [path]: [...pathData, row],
    };
  }, {});
};

const fetchMarketChartData = (timespan) => (market) => {
  if (timespan === '1h') {
    return predictit
      .fetchMarketChartData(market, '24h')
      .then(groupDataByContract('1h'))
      .then((data) => mapValues(data, (value) => value.slice(-1)));
  }

  return predictit
    .fetchMarketChartData(market, timespan)
    .then(groupDataByContract(timespan));
};

module.exports = (timespan) => async (contextOrRequest, response) => {
  try {
    const markets = await predictit.fetchAllMarkets();
    const requests = markets.map(fetchMarketChartData(timespan));
    const results = await Promise.all(requests).then(mergeResults);
    const update = mapValues(results, parseData);

    await firebase.timespans.set(update);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (response && response.sendStatus) {
      response.sendStatus(200);
    }
  }
};

const wait = require('wait');
const awaity = require('awaity');
const mapValues = require('lodash/mapValues');

const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

const timespanIntervals = {
  hourly: ['24h'],
  daily: ['7d', '30d', '90d'],
};

const getPrices = (key) => (row) => row[key];
const getTotal = (key) => (sum, row) => sum + row[key];

const parseData = (values) => ({
  open: values.reduce(getTotal('open'), 0) / values.length,
  high: values.map(getPrices('high')).sort()[values.length - 1],
  low: values.map(getPrices('low')).sort()[0],
  close: values.reduce(getTotal('close'), 0) / values.length,
  volume: values.reduce(getTotal('volume'), 0),
});

module.exports = (timespan) => async (contextOrRequest, response) => {
  try {
    const timespans = timespanIntervals[timespan];
    const markets = await predictit.fetchAllMarkets();

    const prepareUpdate = (rows) => {
      return rows.reduce((update, row) => {
        const path = `${row.contract}/${row.timespan}`;
        const pathData = update[path] || [];
        return {
          ...update,
          [path]: [...pathData, row],
        };
      }, {});
    };

    const fetchData = async (results, timespan, index) => {
      if (index > 0) await wait(30000);

      const requests = markets
        .map((market) => [market, timespan])
        .map((args) => predictit.fetchMarketChartData(...args));

      const data = await Promise.all(requests);
      const update = prepareUpdate(data.flat());

      if (timespan === '24h') {
        const updateValues = (values) => values.slice(-1);
        const updateTimespan = (row) => ({ ...row, timespan: '1h' });
        const data2 = prepareUpdate(data.flat().map(updateTimespan));
        const update2 = mapValues(data2, updateValues);

        return { ...results, ...update, ...update2 };
      }

      return { ...results, ...update };
    };

    const data = await awaity.reduce(timespans, fetchData, {});
    const update = mapValues(data, parseData);

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

const csv = require('csvtojson');
const fetch = require('node-fetch');
const fakeUserAgent = require('fake-useragent');

const fromPredictit = async ({ path, params, asJson = true }) => {
  try {
    const url = new URL(path, `https://www.predictit.org`);
    url.search = new URLSearchParams(params);

    const headers = { 'User-Agent': fakeUserAgent() };
    const response = await fetch(url.toString(), { headers });

    return asJson ? await response.json() : await response.text();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const fetchMarket = (marketId) => {
  const path = `/api/marketdata/markets/${marketId}`;

  return fromPredictit({ path });
};

const fetchAllMarkets = () => {
  const path = '/api/marketdata/all';

  return fromPredictit({ path }).then(({ markets }) => markets);
};

const fetchMarketChartData = (params) => {
  const path = `/Resource/DownloadMarketChartData`;
  const parseTextAsCsv = (text) => csv().fromString(text);

  return fromPredictit({ path, params, asJson: false }).then(parseTextAsCsv);
};

module.exports = {
  fetchMarket,
  fetchAllMarkets,
  fetchMarketChartData,
};

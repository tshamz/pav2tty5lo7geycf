const csv = require('csvtojson');
const fetch = require('node-fetch');
const fakeUserAgent = require('fake-useragent');

const fromPredictit = async (path, params) => {
  try {
    const headers = { 'User-Agent': fakeUserAgent() };
    const url = new URL(path, `https://www.predictit.org`);
    url.search = new URLSearchParams(params);
    const response = await fetch(url.toString(), { headers });
    const clone = response.clone();
    const [asText, asJson] = await Promise.all([clone.text(), response.json()]);
    const isJson = asText[0] === '{';
    return isJson ? asJson : asText;
  } catch (error) {
    console.error('error', error);
  }
};

const fetchMarket = (marketId) => {
  return fromPredictit(`/api/marketdata/markets/${marketId}`);
};

const fetchAllMarkets = () => {
  return fromPredictit('/api/marketdata/all').then((data) => data.markets);
};

const fetchMarketChartData = (params) => {
  return fromPredictit(`/Resource/DownloadMarketChartData`, params)
    .then((text) => csv().fromString(text))
    .then((rows) => rows.map((row) => ({ ...row, marketId, timespan })));
};

module.exports = {
  fetchMarket,
  fetchAllMarkets,
  fetchMarketChartData,
};

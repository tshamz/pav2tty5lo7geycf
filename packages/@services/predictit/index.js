const csv = require('csvtojson');
const fetch = require('node-fetch');
const fakeUserAgent = require('fake-useragent');

const headers = { 'User-Agent': fakeUserAgent() };

const fetchMarket = async (marketId) => {
  try {
    const url = `https://www.predictit.org/api/marketdata/markets/${marketId}`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};

const fetchAllMarkets = async () => {
  try {
    const url = 'https://www.predictit.org/api/marketdata/all';
    const response = await fetch(url, { headers });
    const data = await response.json();

    return data.markets;
  } catch (error) {
    throw error;
  }
};

const fetchMarketChartData = async (market, timespan) => {
  try {
    const url = 'https://www.predictit.org/Resource/DownloadMarketChartData';
    const params = `?marketid=${market.id}&timespan=${timespan}`;
    const response = await fetch(url + params, { headers });
    const text = await response.text();
    const data = await csv().fromString(text);

    const getContract = (name) =>
      market.contracts.find((contract) => contract.shortName === name) || {};

    return data.map((row) => ({
      timespan,
      market: `${market.id}`,
      contract: `${getContract(row.ContractName).id}`,
      date: row.Date,
      name: row.ContractName,
      open: parseFloat(row.OpenSharePrice.slice(1)),
      high: parseFloat(row.HighSharePrice.slice(1)),
      low: parseFloat(row.LowSharePrice.slice(1)),
      close: parseFloat(row.CloseSharePrice.slice(1)),
      volume: parseInt(row.TradeVolume),
    }));
  } catch (error) {
    throw error;
  }
};

const fetchOrderBooks = async () => {
  try {
    const url = `https://predictit-f497e.firebaseio.com/contractOrderBook.json`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchMarket,
  fetchAllMarkets,
  fetchMarketChartData,
  fetchOrderBooks,
};

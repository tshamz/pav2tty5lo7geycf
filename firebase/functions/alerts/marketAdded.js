const TinyURL = require('tinyurl');
const fetch = require('node-fetch');

const log = require('@local/services/logger');
const twilio = require('@local/services/twilio');

module.exports = async (snapshot, context) => {
  try {
    const marketName = context.params.market;
    const Accept = '*/*';
    const Host = 'www.predictit.org';
    const headers = { Accept, Host, 'User-Agent': 'curl/7.64.1' };
    const url = `https://www.predictit.org/api/marketdata/markets/${marketName}`;
    const market = await fetch(url, { headers }).then((res) => res.json());
    const contracts = (market.contracts || [])
      .sort((a, b) => a.displayOrder < b.displayOrder)
      .map(({ shortName }) => `• ${shortName}`);

    log.info(`Market Added: ${market.shortname}`);

    await twilio.sendMessage([
      `Market Added!`,
      [`Market:`, market.shortName],
      [`Contracts:`, contracts.join('\n')],
      await TinyURL.shorten(market.url),
    ]);

    return;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

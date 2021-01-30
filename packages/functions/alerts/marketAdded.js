const TinyURL = require('tinyurl');
const fetch = require('node-fetch');

const twilio = require('@services/twilio');

module.exports = async (snapshot, context) => {
  try {
    const url = `https://www.predictit.org/api/marketdata/markets/${context.params.market}`;

    const headers = {
      Accept: '*/*',
      Host: 'www.predictit.org',
      'User-Agent': 'curl/7.64.1',
    };

    const response = await fetch(url, { headers });
    const market = await response.json();
    const contracts = (market.contracts || [])
      .sort((a, b) => a.displayOrder < b.displayOrder)
      .map(({ shortName }) => `• ${shortName}`);

    await twilio.sendMessage([
      `Market Added!`,
      [`Market:`, market.shortName],
      [`Contracts:`, contracts.join('\n')],
      await TinyURL.shorten(market.url),
    ]);

    firebase.logger.debug(`Market Added: ${market.shortname}`);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

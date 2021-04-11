const TinyURL = require('tinyurl');

const twilio = require('@services/twilio');
const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = async (snapshot, context) => {
  try {
    const market = await predictit.fetchMarket(context.params.market);

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
  }
};

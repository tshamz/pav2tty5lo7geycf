const TinyURL = require('tinyurl');

const twilio = require('@services/twilio');
const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    if (snapshot.after.val() !== 1) return;

    const id = context.params.market;
    const market = await firebase.db.get(`markets/${id}`);

    const getContract = async (id) => ({
      ...(await firebase.db.get(`prices/${id}`)),
      ...(await firebase.db.get(`contracts/${id}`)),
    });

    const contracts = await Promise.all(market.contracts.map(getContract));

    const contractsAndPrices = contracts
      .sort((a, b) => a.displayOrder < b.displayOrder)
      .map(({ shortName, buyNo, buyYes }) => {
        const yes = buyYes ? parseFloat(buyYes).toFixed(2) : ' - ';
        const no = buyNo ? parseFloat(buyNo).toFixed(2) : ' - ';
        return `• ${shortName} - ${yes}/${no}`;
      });

    await twilio.sendMessage([
      `Market Closing!`,
      [`Market:`, market.shortName],
      ['Contracts', contractsAndPrices.join('\n')],
      await TinyURL.shorten(market.url),
    ]);

    firebase.logger.info(`Market Closing: ${market.shortname}`);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};
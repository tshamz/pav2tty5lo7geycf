const TinyURL = require('tinyurl');

const log = require('@services/logger');
const twilio = require('@services/twilio');
const admin = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    if (snapshot.after.val() !== 1) return;

    const path = `markets/${context.params.market}`;
    const market = await admin.getPath({ path });
    const getContract = async (id) => ({
      ...(await admin.getPath({ path: `contracts/${id}` })),
      ...(await admin.getPath({ path: `prices/${id}` })),
    });
    const contracts = await Promise.all(market.contracts.map(getContract));
    const contractsAndPrices = contracts
      .sort((a, b) => a.displayOrder < b.displayOrder)
      .map(({ shortName, buyNo, buyYes }) => {
        const yes = buyYes ? parseFloat(buyYes).toFixed(2) : ' - ';
        const no = buyNo ? parseFloat(buyNo).toFixed(2) : ' - ';
        return `• ${shortName} - ${yes}/${no}`;
      });

    log.info(`Market Closing: ${market.shortname}`);

    await twilio.sendMessage([
      `Market Closing!`,
      [`Market:`, market.shortName],
      ['Contracts', contractsAndPrices.join('\n')],
      await TinyURL.shorten(market.url),
    ]);

    return;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

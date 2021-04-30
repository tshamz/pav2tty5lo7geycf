const TinyURL = require('tinyurl');
const isEqual = require('lodash/isEqual');
const differenceWith = require('lodash/differenceWith');

const twilio = require('@services/twilio');
const firebase = require('@services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const after = snapshot.after.val();
    const before = snapshot.before.val();
    const added = differenceWith(after, before, isEqual).filter(Boolean);
    const removed = differenceWith(before, after, isEqual).filter(Boolean);

    if (!added.length && !removed.length) return;

    await require('wait')(1500);

    const market = await firebase.markets.get(context.params.market);
    const contracts = await firebase.contracts.get();
    const newContracts = added.map((id) => `• ${contracts[id].shortName}`);
    const oldContracts = removed.map((id) => `• ${contracts[id].shortName}`);

    await twilio.sendMessage([
      `Contracts Updated!`,
      [`Market:`, market.shortName],
      added.length && [`Contracts Added:`, newContracts.join('\n')],
      removed.length && [`Contracts Removed:`, oldContracts.join('\n')],
      await TinyURL.shorten(market.url),
    ]);

    firebase.logger.info(`Contracts Updated: ${market.shortName}`);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};

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

    const id = context.params.market;
    const market = await firebase.db.get(`markets/${id}`);
    const contracts = await firebase.db.get('contracts');
    const getContractName = (id) => `• ${contracts[id].shortName}`;
    const addedContracts = added.map(getContractName);
    const removedContracts = removed.map(getContractName);

    await twilio.sendMessage([
      `Contracts Updated!`,
      [`Market:`, market.shortName],
      added.length && [`Contracts Added:`, addedContracts.join('\n')],
      removed.length && [`Contracts Removed:`, removedContracts.join('\n')],
      await TinyURL.shorten(market.url),
    ]);

    firebase.logger.info(`Contracts Updated: ${market.shortname}`);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

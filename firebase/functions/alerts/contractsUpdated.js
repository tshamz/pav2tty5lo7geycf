const TinyURL = require('tinyurl');
const isEqual = require('lodash/isEqual');
const differenceWith = require('lodash/differenceWith');

const log = require('services/logger');
const utils = require('services/utils');
const twilio = require('services/twilio');
const admin = require('services/firebase');

module.exports = async (snapshot, context) => {
  try {
    const after = snapshot.after.val();
    const before = snapshot.before.val();
    const added = differenceWith(after, before, isEqual).filter(Boolean);
    const removed = differenceWith(before, after, isEqual).filter(Boolean);

    if (!added.length && !removed.length) return;

    await utils.pause(1500);

    const marketPath = `markets/${context.params.market}`;
    const market = await admin.getPath({ path: marketPath });
    const contracts = await admin.getPath({ path: 'contracts' });
    const getContractName = (id) => `• ${contracts[id].shortName}`;
    const addedContracts = added.map(getContractName);
    const removedContracts = removed.map(getContractName);

    log.info(`Contracts Updated: ${market.shortname}`);

    await twilio.sendMessage([
      `Contracts Updated!`,
      [`Market:`, market.shortName],
      added.length && [`Contracts Added:`, addedContracts.join('\n')],
      removed.length && [`Contracts Removed:`, removedContracts.join('\n')],
      await TinyURL.shorten(market.url),
    ]);

    return;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

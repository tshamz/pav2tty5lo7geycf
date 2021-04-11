const firebase = require('@services/firebase');

const purgeMarkets = require('./purgeMarkets');
const cleanupDatabase = require('./cleanupDatabase');
const removeMarketData = require('./removeMarketData');
const removeContractData = require('./removeContractData');

// prettier-ignore
exports.cleanUpDatabase__manual = firebase.functions
  .https.onRequest(cleanupDatabase);

// prettier-ignore
exports.purgeMarkets = firebase.functions
  .pubsub.schedule('every 24 hours')
  .onRun(purgeMarkets);

// prettier-ignore
exports.purgeMarkets__manual = firebase.functions
  .https.onRequest(purgeMarkets);

// prettier-ignore
exports.removeMarketData = firebase.functions.database
  .ref('markets/{id}')
  .onDelete(removeMarketData);

// prettier-ignore
exports.removeContractData = firebase.functions.database
  .ref('contracts/{id}')
  .onDelete(removeContractData);

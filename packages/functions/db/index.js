const firebase = require('@services/firebase');

const purgeMarkets = require('./purgeMarkets');
const removeMarketData = require('./removeMarketData');
const removeContractData = require('./removeContractData');

// prettier-ignore
exports.purgeMarkets = firebase.functions
  .pubsub
  .schedule('every 24 hours')
  .onRun(purgeMarkets);

// prettier-ignore
exports.purgeMarkets__manual = firebase.functions
  .https
  .onRequest(purgeMarkets);

// prettier-ignore
exports.removeMarketData = firebase.functions
  .database
  .instance('pav2tty5lo7geycf-markets')
  .ref('{id}')
  .onDelete(removeMarketData);

// prettier-ignore
exports.removeContractData = firebase.functions
  .database
  .instance('pav2tty5lo7geycf-contracts')
  .ref('{id}')
  .onDelete(removeContractData);

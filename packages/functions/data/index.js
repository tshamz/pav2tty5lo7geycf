const firebase = require('@services/firebase');

const updateMarket = require('./updateMarket');
const updateMarkets = require('./updateMarkets');
const updateAccountFunds = require('./updateAccountFunds');
const updateContractPrice = require('./updateContractPrice');
const updatePriceHistory = require('./updatePriceHistory');

// prettier-ignore
exports.updateMarkets__manual = firebase.functions.https
  .onRequest(updateMarkets);

// prettier-ignore
exports.updateAccountFunds = firebase.functions.https
  .onCall(updateAccountFunds);

// prettier-ignore
exports.updateContractPrice = firebase.functions.https
  .onCall(updateContractPrice);

// prettier-ignore
exports.updateMarket = firebase.functions.https
  .onCall(updateMarket);

// prettier-ignore
exports.updateMarkets = firebase.functions.pubsub
  .schedule('every 1 minutes')
  .onRun(updateMarkets);

// prettier-ignore
exports.updatePriceHistory = firebase.functions.database
  .ref('prices/{contract}/lastTrade')
  .onWrite(updatePriceHistory);

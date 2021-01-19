const firebase = require('@services/firebase');

const updateMarket = require('./updateMarket');
const updateMarkets = require('./updateMarkets');
const updateMarketPosition = require('./updateMarketPosition');
const updateOrderBook = require('./updateOrderBook');
const updateAccountFunds = require('./updateAccountFunds');
const updateTradeHistory = require('./updateTradeHistory');
const updateOpenOrders = require('./updateOpenOrders');
const updateContractPosition = require('./updateContractPosition');
const updateContractPrice = require('./updateContractPrice');
const updatePriceHistory = require('./updatePriceHistory');
// const updatePriceInterval = require('./updatePriceInterval');
const updatePriceOHLC = require('./updatePriceOHLC');

// prettier-ignore
exports.updateAccountFunds = firebase.functions.https
  .onCall(updateAccountFunds);

// prettier-ignore
exports.updateContractPosition = firebase.functions.https
  .onCall(updateContractPosition);

// prettier-ignore
exports.updateContractPrice = firebase.functions.https
  .onCall(updateContractPrice);

// prettier-ignore
exports.updateMarket = firebase.functions.https
  .onCall(updateMarket);

// prettier-ignore
exports.updateMarketPosition = firebase.functions.https
  .onCall(updateMarketPosition);

exports.updateMarkets = firebase.functions.pubsub
  .schedule('every 1 minutes')
  .onRun(updateMarkets);

// prettier-ignore
exports.updateMarkets__manual = firebase.functions.https
  .onRequest(updateMarkets);

// prettier-ignore
exports.updateOpenOrders = firebase.functions.https
  .onCall(updateOpenOrders);

exports.updateOrderBook = firebase.functions.pubsub
  .schedule('every 1 minutes')
  .onRun(updateOrderBook);

// prettier-ignore
exports.updateOrderBook__manual = firebase.functions.https
  .onRequest(updateOrderBook);

exports.updatePriceHistory = firebase.functions.database
  .ref('prices/{contract}/lastTrade')
  .onWrite(updatePriceHistory);

// exports.updatePriceInterval = firebase.functions.pubsub
//   .schedule('*/10 * * * *')
//   .onRun(updatePriceInterval);

// exports.updatePriceOHLC = firebase.functions.pubsub
//   .schedule('00 * * * *')
//   .onRun(updatePriceOHLC);

// prettier-ignore
exports.updatePriceOHLC__manual = firebase.functions.https
  .onRequest(updatePriceOHLC);

// prettier-ignore
exports.updateTradeHistory = firebase.functions.https
  .onCall(updateTradeHistory);
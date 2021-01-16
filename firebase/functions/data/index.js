const functions = require('firebase-functions');

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
exports.updateAccountFunds = functions.https
  .onCall(updateAccountFunds);

// prettier-ignore
exports.updateContractPosition = functions.https
  .onCall(updateContractPosition);

// prettier-ignore
exports.updateContractPrice = functions.https
  .onCall(updateContractPrice);

// prettier-ignore
exports.updateMarket = functions.https
  .onCall(updateMarket);

// prettier-ignore
exports.updateMarketPosition = functions.https
  .onCall(updateMarketPosition);

exports.updateMarkets = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(updateMarkets);

// prettier-ignore
exports.updateMarkets__manual = functions.https
  .onRequest(updateMarkets);

// prettier-ignore
exports.updateOpenOrders = functions.https
  .onCall(updateOpenOrders);

exports.updateOrderBook = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(updateOrderBook);

// prettier-ignore
exports.updateOrderBook__manual = functions.https
  .onRequest(updateOrderBook);

exports.updatePriceHistory = functions.database
  .ref('prices/{contract}/lastTrade')
  .onWrite(updatePriceHistory);

// exports.updatePriceInterval = functions.pubsub
//   .schedule('*/10 * * * *')
//   .onRun(updatePriceInterval);

// exports.updatePriceOHLC = functions.pubsub
//   .schedule('00 * * * *')
//   .onRun(updatePriceOHLC);

// prettier-ignore
exports.updatePriceOHLC__manual = functions.https
  .onRequest(updatePriceOHLC);

// prettier-ignore
exports.updateTradeHistory = functions.https
  .onCall(updateTradeHistory);

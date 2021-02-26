const firebase = require('@services/firebase');

const updateMarket = require('./updateMarket');
const updateMarkets = require('./updateMarkets');
const updateAccountFunds = require('./updateAccountFunds');
const updateContractPrice = require('./updateContractPrice');
const updatePriceHistory = require('./updatePriceHistory');
const updateHourlyTimespanData = require('./updateHourlyTimespanData');
const updateDailyTimespanData = require('./updateDailyTimespanData');

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

// prettier-ignore
exports.updateHourlyTimespanData = firebase.functions
  // .runWith({ timeoutSeconds: 540 })
  .pubsub
  .schedule('05 * * * *')
  .onRun(updateHourlyTimespanData);

// prettier-ignore
exports.updateDailyTimespanData = firebase.functions
  // .runWith({ timeoutSeconds: 540 })
  .pubsub
  .schedule('every day 16:05')
  .onRun(updateDailyTimespanData);

exports.updateDailyTimespanData__manual = firebase.functions.https.onRequest(
  updateDailyTimespanData
);
// .runWith({ timeoutSeconds: 540 })

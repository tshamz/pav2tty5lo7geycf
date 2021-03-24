const firebase = require('@services/firebase');

const updateMarket = require('./updateMarket');
const updateMarkets = require('./updateMarkets');
const updateAccountFunds = require('./updateAccountFunds');
const updateContractPrice = require('./updateContractPrice');
// const updatePriceHistory = require('./updatePriceHistory');
const updateTimespanData = require('./updateTimespanData');

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
// exports.updatePriceHistory = firebase.functions.database
//   .ref('prices/{contract}/lastTrade')
//   .onWrite(updatePriceHistory);

// prettier-ignore
exports.updateHourlyTimespanData = firebase.functions.pubsub
  .schedule('05 * * * *')
  .onRun(updateTimespanData('hourly'));

// prettier-ignore
exports.updateDailyTimespanData = firebase.functions.pubsub
  .schedule('every day 16:05')
  .onRun(updateTimespanData('daily'));

// prettier-ignore
exports.updateHourlyTimespanData__manual = firebase.functions.https
  .onRequest(updateTimespanData('hourly'));

// prettier-ignore
exports.updateDailyTimespanData__manual = firebase.functions.https
  .onRequest(updateTimespanData('daily'));

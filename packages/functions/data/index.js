const firebase = require('@services/firebase');

const updateMarket = require('./updateMarket');
const updateMarkets = require('./updateMarkets');
const updateContractPrice = require('./updateContractPrice');
const updateTimespanData = require('./updateTimespanData');
// const updateAccountFunds = require('./updateAccountFunds');
// const updatePriceHistory = require('./updatePriceHistory');

// prettier-ignore
exports.updateContractPrice = firebase.functions.https
  .onCall(updateContractPrice);

// prettier-ignore
exports.updateMarket = firebase.functions.https
  .onCall(updateMarket);

exports.updateMarkets = firebase.functions.pubsub
  .schedule('every 10 mins')
  .onRun(updateMarkets);

exports.updateHourlyTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 90 })
  .pubsub.schedule('every 60 mins')
  .onRun(updateTimespanData(['24h']));

exports.updateDailyTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 90 })
  .pubsub.schedule('every day 16:05')
  .onRun(updateTimespanData(['7d', '30d', '90d']));

// prettier-ignore
exports.updateMarkets__manual = firebase.functions.https
  .onRequest(updateMarkets);

exports.updateHourlyTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 90 })
  .https.onRequest(updateTimespanData(['24h']));

exports.updateDailyTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 90 })
  .https.onRequest(updateTimespanData(['7d', '30d', '90d']));

// // prettier-ignore
// exports.updateAccountFunds = firebase.functions.https
//   .onCall(updateAccountFunds);

// exports.updatePriceHistory = firebase.functions.database
//   .ref('prices/{contract}/lastTrade')
//   .onWrite(updatePriceHistory);

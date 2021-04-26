const firebase = require('@services/firebase');

const updateMarket = require('./updateMarket');
const updateMarkets = require('./updateMarkets');
const updateContractPrice = require('./updateContractPrice');
const updateTimespanData = require('./updateTimespanData');
// const updateAccountFunds = require('./updateAccountFunds');

const HOURLY_TIMESPANS = ['24h'];
const DAILY_TIMESPANS = ['7d', '30d', '90d'];

// prettier-ignore
exports.updateMarket = firebase.functions
  .https
  .onCall(updateMarket);

// prettier-ignore
exports.updateMarkets = firebase.functions
  .pubsub
  .schedule('every 10 mins')
  .onRun(updateMarkets);

// prettier-ignore
exports.updateMarkets__manual = firebase.functions
  .https
  .onRequest(updateMarkets);

// prettier-ignore
exports.updateContractPrice = firebase.functions
  .https
  .onCall(updateContractPrice);

// prettier-ignore
exports.updateHourlyTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('every 60 mins')
  .onRun(updateTimespanData(HOURLY_TIMESPANS));

// prettier-ignore
exports.updateHourlyTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData(HOURLY_TIMESPANS));

// prettier-ignore
exports.updateDailyTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('every day 16:05')
  .onRun(updateTimespanData(DAILY_TIMESPANS));

// prettier-ignore
exports.updateDailyTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData(DAILY_TIMESPANS));

// // prettier-ignore
// exports.updateAccountFunds = firebase.functions
//   .https
//   .onCall(updateAccountFunds);

const firebase = require('@services/firebase');

const updateMarket = require('./updateMarket');
const updateMarkets = require('./updateMarkets');
const updateContractPrice = require('./updateContractPrice');
const updateTimespanData = require('./updateTimespanData');
// const updateOrderBooks = require('./updateOrderBooks');
const updateContractOrderBook = require('./updateContractOrderBook');

// prettier-ignore
exports.updateMarket = firebase.functions
  .https
  .onCall(updateMarket);

// prettier-ignore
exports.updateContractPrice = firebase.functions
  .https
  .onCall(updateContractPrice);

// prettier-ignore
exports.updateContractOrderBook = firebase.functions
  .https
  .onCall(updateContractOrderBook);

// // prettier-ignore
// exports.updateOrderBooks = firebase.functions
//   .pubsub
//   .schedule('every 60 mins')
//   .onRun(updateOrderBooks);

// // prettier-ignore
// exports.updateOrderBooks__manual = firebase.functions
//   .https
//   .onRequest(updateOrderBooks);

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
exports.update1hTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('every 60 mins')
  .onRun(updateTimespanData('1h'));

// prettier-ignore
exports.update1hTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('1h'));

// prettier-ignore
exports.update24hTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('every 60 mins')
  .onRun(updateTimespanData('24h'));

// prettier-ignore
exports.update24hTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('24h'));

// prettier-ignore
exports.update7dTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('every 24 hours')
  .onRun(updateTimespanData('7d'));

// prettier-ignore
exports.update7dTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('7d'));

// prettier-ignore
exports.update30dTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('every 24 hours')
  .onRun(updateTimespanData('30d'));

// prettier-ignore
exports.update30dTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('30d'));

// prettier-ignore
exports.update90dTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('every 24 hours')
  .onRun(updateTimespanData('90d'));

// prettier-ignore
exports.update90dTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('90d'));

const firebase = require('@services/firebase');

const updateMarket = require('./updateMarket');
const updateMarkets = require('./updateMarkets');
const updateContractPrice = require('./updateContractPrice');
const updateTimespanData = require('./updateTimespanData');
const updateContractOrderBook = require('./updateContractOrderBook');

/**
 * Markets
 */

// prettier-ignore
exports.updateMarket = firebase.functions
  .https
  .onCall(updateMarket);

// prettier-ignore
exports.updateMarkets = firebase.functions
  .pubsub
  .schedule('every 10 mins')
  .onRun(updateMarkets);

/**
 * Contracts
 */

// prettier-ignore
exports.updateContractPrice = firebase.functions
  .https
  .onCall(updateContractPrice);

/**
 * Order Books
 */

// prettier-ignore
exports.updateContractOrderBook = firebase.functions
  .https
  .onCall(updateContractOrderBook);

/**
 * Timespans
 */

// prettier-ignore
exports.update1hTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('00 * * * *')
  .onRun(updateTimespanData('1h'));

// prettier-ignore
exports.update24hTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('02 * * * *')
  .onRun(updateTimespanData('24h'));

// prettier-ignore
exports.update7dTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('03 17 * * *')
  .onRun(updateTimespanData('7d'));

// prettier-ignore
exports.update30dTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('04 17 * * *')
  .onRun(updateTimespanData('30d'));

// prettier-ignore
exports.update90dTimespanData = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .pubsub
  .schedule('05 17 * * *')
  .onRun(updateTimespanData('90d'));

/**
 * Manual
 */

// prettier-ignore
exports.update90dTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('90d'));

// prettier-ignore
exports.updateMarkets__manual = firebase.functions
  .https
  .onRequest(updateMarkets);

// prettier-ignore
exports.update1hTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('1h'));

// prettier-ignore
exports.update24hTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('24h'));

// prettier-ignore
exports.update7dTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('7d'));

// prettier-ignore
exports.update30dTimespanData__manual = firebase.functions
  .runWith({ timeoutSeconds: 300, memory: '2GB' })
  .https
  .onRequest(updateTimespanData('30d'));

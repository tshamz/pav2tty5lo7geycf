const functions = require('firebase-functions');

const addCreatedAt = require('./addCreatedAt');
const cleanupDatabase = require('./cleanupDatabase');
const deleteClosedMarkets = require('./deleteClosedMarkets');
const deleteStalePriceData = require('./deleteStalePriceData');

exports.addCreatedAtToMarket = functions.database
  .ref('markets/{market}')
  .onCreate(addCreatedAt);

exports.addCreatedAtToContract = functions.database
  .ref('contracts/{contract}')
  .onCreate(addCreatedAt);

exports.cleanUpDatabase = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(cleanupDatabase);

exports.deleteClosedMarkets = functions.pubsub
  .schedule('every 24 hours')
  .onRun(deleteClosedMarkets);

exports.deleteStalePriceData = functions.pubsub
  .schedule('every 24 hours')
  .onRun(deleteStalePriceData);

// prettier-ignore
exports.deleteClosedMarkets__manual = functions.https
  .onRequest(deleteClosedMarkets);

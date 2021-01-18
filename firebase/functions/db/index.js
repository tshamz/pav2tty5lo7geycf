const firebase = require('@services/firebase');

const addCreatedAt = require('./addCreatedAt');
const cleanupDatabase = require('./cleanupDatabase');
const deleteClosedMarkets = require('./deleteClosedMarkets');
const deleteStalePriceData = require('./deleteStalePriceData');

exports.addCreatedAtToMarket = firebase.functions.database
  .ref('markets/{market}')
  .onCreate(addCreatedAt);

exports.addCreatedAtToContract = firebase.functions.database
  .ref('contracts/{contract}')
  .onCreate(addCreatedAt);

exports.cleanUpDatabase = firebase.functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(cleanupDatabase);

exports.deleteClosedMarkets = firebase.functions.pubsub
  .schedule('every 24 hours')
  .onRun(deleteClosedMarkets);

exports.deleteStalePriceData = firebase.functions.pubsub
  .schedule('every 24 hours')
  .onRun(deleteStalePriceData);

// prettier-ignore
exports.deleteClosedMarkets__manual = firebase.functions.https
  .onRequest(deleteClosedMarkets);

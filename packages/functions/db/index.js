const firebase = require('@services/firebase');

const addCreatedAt = require('./addCreatedAt');
const addUpdatedAt = require('./addUpdatedAt');
const cleanupDatabase = require('./cleanupDatabase');
const deleteClosedMarkets = require('./deleteClosedMarkets');
// const deleteStalePriceData = require('./deleteStalePriceData');

// prettier-ignore
exports.deleteClosedMarkets__manual = firebase.functions.https
  .onRequest(deleteClosedMarkets);

// prettier-ignore
exports.cleanUpDatabase__manual = firebase.functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(cleanupDatabase);

// prettier-ignore
exports.addCreatedAtToMarket = firebase.functions.database
  .ref('markets/{market}')
  .onCreate(addCreatedAt);

// prettier-ignore
exports.addCreatedAtToContract = firebase.functions.database
  .ref('contracts/{contract}')
  .onCreate(addCreatedAt);

// prettier-ignore
exports.addUpdatedAtToMarket = firebase.functions.database
  .ref('markets/{market}')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtToContract = firebase.functions.database
  .ref('contracts/{contract}')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtSession = firebase.functions.database
  .ref('session')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.deleteClosedMarkets = firebase.functions.pubsub
  .schedule('every 24 hours')
  .onRun(deleteClosedMarkets);

// prettier-ignore
// exports.deleteStalePriceData = firebase.functions.pubsub
//   .schedule('every 24 hours')
//   .onRun(deleteStalePriceData);
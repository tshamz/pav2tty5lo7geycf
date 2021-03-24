const firebase = require('@services/firebase');

const addUpdatedAt = require('./addUpdatedAt');
const addCreatedAt = require('./addCreatedAt');
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
// exports.addCreatedAtToContracts = firebase.functions.database
//   .ref('contracts/{id}')
//   .onCreate(addCreatedAt);

// prettier-ignore
// exports.addUpdatedAtToContracts = firebase.functions.database
//   .ref('contracts/{id}')
//   .onUpdate(addUpdatedAt);

// prettier-ignore
// exports.addUpdatedAtToMarkets = firebase.functions.database
//   .ref('markets/{id}')
//   .onUpdate(addUpdatedAt);

// prettier-ignore
// exports.addUpdatedAtToPrices = firebase.functions.database
//   .ref('prices/{id}')
//   .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtToSession = firebase.functions.database
  .ref('session')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtToFunds = firebase.functions.database
  .ref('funds')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.deleteClosedMarkets = firebase.functions.pubsub
  .schedule('every 24 hours')
  .onRun(deleteClosedMarkets);

// // prettier-ignore
// exports.deleteStalePriceData = firebase.functions.pubsub
//   .schedule('every 24 hours')
//   .onRun(deleteStalePriceData);

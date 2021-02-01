const firebase = require('@services/firebase');

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
exports.addUpdatedAtContracts = firebase.functions.database
  .ref('contracts/{id}')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtMarkets = firebase.functions.database
  .ref('markets/{id}')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtPrices = firebase.functions.database
  .ref('prices/{id}')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtSession = firebase.functions.database
  .ref('session')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtFunds = firebase.functions.database
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

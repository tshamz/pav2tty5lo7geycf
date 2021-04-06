const firebase = require('@services/firebase');

// const addCreatedAt = require('./addCreatedAt');
const addUpdatedAt = require('./addUpdatedAt');
const cleanupDatabase = require('./cleanupDatabase');
const deleteExpiredMarkets = require('./deleteExpiredMarkets');

// prettier-ignore
exports.cleanUpDatabase__manual = firebase.functions
  .https.onRequest(cleanupDatabase);

// prettier-ignore
exports.addUpdatedAtToSession = firebase.functions.database
  .ref('session')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.addUpdatedAtToFunds = firebase.functions.database
  .ref('funds')
  .onUpdate(addUpdatedAt);

// prettier-ignore
exports.runNightlyCleanup = firebase.functions
  .pubsub.schedule('every 24 hours')
  .onRun(deleteExpiredMarkets);

// prettier-ignore
exports.runNightlyCleanup__manual = firebase.functions
  .https.onRequest(deleteExpiredMarkets);

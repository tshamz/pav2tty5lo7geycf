const firebase = require('@services/firebase');

const marketAdded = require('./marketAdded');
const marketClosing = require('./marketClosing');
const contractsUpdated = require('./contractsUpdated');

// prettier-ignore
exports.contractsUpdated = firebase.functions
  .database
  .ref('markets/{market}/contracts')
  .onUpdate(contractsUpdated);

// prettier-ignore
exports.marketAdded = firebase.functions
  .database
  .ref('markets/{market}')
  .onCreate(marketAdded);

// prettier-ignore
exports.marketClosing = firebase.functions
  .database
  .ref('markets/{market}/daysLeft')
  .onUpdate(marketClosing);

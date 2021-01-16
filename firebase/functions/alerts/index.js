const functions = require('firebase-functions');

const marketAdded = require('./marketAdded');
const marketClosing = require('./marketClosing');
const contractsUpdated = require('./contractsUpdated');

exports.contractsUpdated = functions.database
  .ref('markets/{market}/contracts')
  .onUpdate(contractsUpdated);

exports.marketAdded = functions.database
  .ref('markets/{market}')
  .onCreate(marketAdded);

exports.marketClosing = functions.database
  .ref('markets/{market}/daysLeft')
  .onUpdate(marketClosing);

const firebase = require('@services/firebase');

const marketAdded = require('./marketAdded');
const marketClosing = require('./marketClosing');
const contractsUpdated = require('./contractsUpdated');

exports.contractsUpdated = firebase.functions.database
  .ref('markets/{market}/contracts')
  .onUpdate(contractsUpdated);

exports.marketAdded = firebase.functions.database
  .ref('markets/{market}')
  .onCreate(marketAdded);

exports.marketClosing = firebase.functions.database
  .ref('markets/{market}/daysLeft')
  .onUpdate(marketClosing);

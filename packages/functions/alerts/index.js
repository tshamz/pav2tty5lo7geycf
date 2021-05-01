const firebase = require('@services/firebase');

const marketAdded = require('./marketAdded');
const marketClosing = require('./marketClosing');

// prettier-ignore
exports.marketAdded = firebase.functions
  .database
  .instance('pav2tty5lo7geycf-markets')
  .ref('{market}')
  .onCreate(marketAdded);

// prettier-ignore
exports.marketClosing = firebase.functions
  .database
  .instance('pav2tty5lo7geycf-markets')
  .ref('{market}/daysLeft')
  .onUpdate(marketClosing);

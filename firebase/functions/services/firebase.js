const firebase = require('firebase');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const log = require('./logger');
const path = require('path').resolve(__dirname, '../../../.env');

require('dotenv').config({ path });

console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const getDatabaseUrl = (name) => {
  return `https://pav2tty5lo7geycf--${name}.firebaseio.com`;
};

const config = {
  credentials: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT,
  databaseURL: process.env.FIREBASE_DEFAULT_DATABASE_URL,
};

const getPath = ({ path, db } = {}) => {
  return admin
    .database(db)
    .ref(path)
    .once('value')
    .then((snapshot) => snapshot.val());
};

const setPath = (location) => (update) => {
  return admin
    .database(location.db)
    .ref(location.path || location)
    .update(update);
};

if (!firebase.apps.length) {
  admin.initializeApp(config);
  firebase.initializeApp(config);

  admin.priceHistory = admin.initializeApp(
    { ...config, databaseURL: getDatabaseUrl('price-history') },
    'priceHistory'
  );

  admin.priceInterval = admin.initializeApp(
    { ...config, databaseURL: getDatabaseUrl('price-interval') },
    'priceInterval'
  );

  admin.priceOHLC = admin.initializeApp(
    { ...config, databaseURL: getDatabaseUrl('price-ohlc') },
    'priceOHLC'
  );

  admin.tradeHistory = admin.initializeApp(
    { ...config, databaseURL: getDatabaseUrl('trade-history') },
    'tradeHistory'
  );

  if (process.env.NODE_ENV === 'development') {
    log.debug('Using emulator');
    firebase.functions().useEmulator('localhost', 5001);
  }
}

admin.getPath = getPath;
admin.setPath = setPath;
admin.functions = firebase.functions;
admin.config = functions.config;

module.exports = admin;

const firebase = require('firebase');
const admin = require('firebase-admin');

const log = require('services/logger');

const getDatabaseUrl = (name) => {
  return !name
    ? `https://kingmaker---firebase.firebaseio.com`
    : `https://kingmaker---firebase--${name}.firebaseio.com`;
};

const config = {
  projectId: process.env.GCLOUD_PROJECT,
  credentials: admin.credential.applicationDefault(),
  databaseURL: 'https://kingmaker---firebase.firebaseio.com',
};

const getPath = ({ path, database } = {}) => {
  return admin
    .database(database)
    .ref(path)
    .once('value')
    .then((snapshot) => snapshot.val())
    .catch((error) => log.error(error));
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

  if (process.env.npm_lifecycle_event === 'dev') {
    log.debug('Using emulator');
    firebase.functions().useEmulator('localhost', 5001);
  }
}

admin.getPath = getPath;
admin.functions = firebase.functions;

module.exports = admin;

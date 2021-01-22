require('@services/env');

const firebase = require('firebase');
const admin = require('firebase-admin');

const database = require('./database');
const functions = require('./functions');

const credentials = admin.credential.applicationDefault();
const databaseURL = 'https://pav2tty5lo7geycf-default-rtdb.firebaseio.com';

if (!firebase.apps.length) {
  admin.initializeApp({ credentials, databaseURL });
  firebase.initializeApp({ credentials, databaseURL });
}

if (process.env.NODE_ENV === 'development') {
  admin.database.enableLogging(false);
  firebase.functions().useEmulator('localhost', 5001);
}

module.exports = {
  ...database,
  ...functions,
  sdk: {
    admin,
    firebase,
    functions,
  },
};

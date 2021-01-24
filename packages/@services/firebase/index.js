require('@services/env');

const firebase = require('firebase');
const admin = require('firebase-admin');

if (!firebase.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT;
  const credentials = admin.credential.applicationDefault();
  const databaseURL = 'https://pav2tty5lo7geycf-default-rtdb.firebaseio.com';

  admin.initializeApp({ credentials, projectId, databaseURL });
  firebase.initializeApp({ credentials, projectId, databaseURL });
}

if (process.env.NODE_ENV === 'development') {
  firebase.functions().useEmulator('localhost', 5001);
}

const database = require('./database');
const functions = require('./functions');

module.exports = {
  ...database,
  ...functions,
  sdk: {
    admin,
    firebase,
    functions,
  },
};

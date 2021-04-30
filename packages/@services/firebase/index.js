require('@services/env');

const firebase = require('firebase');
const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT;
const credentials = admin.credential.applicationDefault();
const databaseAuthVariableOverride = { uid: 'superuser' };
const databaseURL = 'https://pav2tty5lo7geycf-default-rtdb.firebaseio.com';

if (!admin.apps.length) {
  admin.initializeApp({
    credentials,
    projectId,
    databaseURL,
    databaseAuthVariableOverride,
  });

  firebase.initializeApp({
    credentials,
    projectId,
    databaseURL,
    databaseAuthVariableOverride,
  });
}

if (process.env.NODE_ENV === 'development') {
  firebase.functions().useEmulator('localhost', 5001);
}

const database = require('./database');
const functions = require('./functions');

module.exports = {
  ...database,
  ...functions,
};

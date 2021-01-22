require('@services/env');

const admin = require('firebase-admin');
const firebase = require('firebase');

const database = require('./database');
const functions = require('./functions');

const projectId = process.env.GCLOUD_PROJECT;
const credentials = admin.credential.applicationDefault();
const databaseURL = process.env.FIREBASE_DEFAULT_DATABASE_URL;

if (!firebase.apps.length) {
  admin.initializeApp({ projectId, credentials, databaseURL });
  firebase.initializeApp({ projectId, credentials, databaseURL });
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

require('dotenv').config();

const firebase = require('firebase');
const admin = require('firebase-admin');

const log = require('./logger');

const config = {
  credentials: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

admin.initializeApp(config);
firebase.initializeApp(config);

if (process.env.npm_lifecycle_event === 'dev') {
  log.debug('Using emulator');
  firebase.functions().useEmulator('localhost', 5001);
}

admin.functions = firebase.functions;

module.exports = admin;

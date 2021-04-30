const firebase = require('@services/firebase');

const createSession = require('./createSession');

// prettier-ignore
exports.createSession__manual = firebase.functions
  .runWith({ timeoutSeconds: 120, memory: '2GB' })
  .https
  .onRequest(createSession);

// prettier-ignore
exports.createSession = firebase.functions
  .runWith({ timeoutSeconds: 120, memory: '2GB' })
  .https
  .onCall(createSession);

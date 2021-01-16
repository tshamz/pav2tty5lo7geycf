const functions = require('firebase-functions');

const createSession = require('./createSession');

// prettier-ignore
exports.updateSession = functions
  .runWith({ timeoutSeconds: 120, memory: '2GB' })
  .pubsub.schedule('every day 09:37')
  .onRun(createSession);

// prettier-ignore
exports.createSession = functions
  .runWith({ timeoutSeconds: 120, memory: '2GB' })
  .https.onCall(createSession);

// prettier-ignore
exports.createSession__manual = functions
  .runWith({ timeoutSeconds: 120, memory: '2GB' })
  .https.onRequest(createSession);

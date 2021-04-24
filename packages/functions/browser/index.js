const firebase = require('@services/firebase');

const createSession = require('./createSession');

exports.createSession__manual = firebase.functions
  .runWith({ timeoutSeconds: 120, memory: '2GB' })
  .https.onRequest(createSession);

exports.createSession = firebase.functions
  .runWith({ timeoutSeconds: 120, memory: '2GB' })
  .https.onCall(createSession);

// exports.updateSession = firebase.functions
//   .runWith({ timeoutSeconds: 120, memory: '2GB' })
//   .pubsub.schedule('every day 09:37')
//   .onRun(createSession);

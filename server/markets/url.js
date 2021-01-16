const log = require('services/logger');
const firebase = require('services/firebase');

module.exports = async () => {
  try {
    let session = await firebase
      .database()
      .ref('session')
      .once('value')
      .then((snapshot) => snapshot.val());

    if (!session || !session.wssHost) {
      const newSession = await firebase
        .functions()
        .httpsCallable('browser-createSession')();

      session = newSession.data;
    }

    const url = `wss://${session.wssHost}/.ws?v=5&ns=predictit-f497e`;

    log.debug(`Trying: ${url}`, { status: 'connecting' });

    return url;
  } catch (error) {
    log.error(error);
    throw error;
  }
};

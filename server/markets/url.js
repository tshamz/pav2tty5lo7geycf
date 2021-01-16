const log = require('services/logger');
const firebase = require('services/firebase');

module.exports = async () => {
  try {
    let wssHost = await firebase.getPath({ path: 'session/wssHost' });

    if (!wssHost) {
      wssHost = await firebase
        .functions()
        .httpsCallable('browser-createSession')()
        .then(({ data }) => data.wssHost);
    }

    const url = `wss://${wssHost}/.ws?v=5&ns=predictit-f497e`;

    log.debug(`Trying: ${url}`, { status: 'connecting' });

    return url;
  } catch (error) {
    log.error(error);
    throw error;
  }
};

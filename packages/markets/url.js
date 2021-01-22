const log = require('@services/logger');
const firebase = require('@services/firebase');

exports.get = async () => {
  try {
    let wssHost = await firebase.db.get('session/wssHost');

    if (!wssHost) {
      const response = await firebase.call.createSession();

      wssHost = response.data
        ? response.data.wssHost
        : `s-usc1c-nss-270.firebaseio.com`;
    }

    const url = `wss://${wssHost}/.ws?v=5&ns=predictit-f497e`;

    log.debug(`Trying: ${url}`, { status: 'connecting' });

    return url;
  } catch (error) {
    log.error(error);
    return null;
  }
};

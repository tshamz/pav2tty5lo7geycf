const fetch = require('node-fetch');

const log = require('@services/logger');
const firebase = require('@services/firebase');

const setTokens = async (headers, params, attempts = 0) => {
  try {
    log.debug('Setting bearer token', { status: 'connecting' });

    params.set('bearer', await firebase.db.get('session/token/value'));

    log.debug(`Bearer token set`, { status });

    log.debug('Setting connection token', { status: 'connecting' });

    const url = `https://hub.predictit.org/signalr/negotiate?${params.toString()}`;
    const response = await fetch(url, { headers: headers });
    const data = await response.json();

    params.set('connectionToken', data.ConnectionToken);

    log.debug(`Connection token set`, { status: 'connecting' });
  } catch (error) {
    if (attempts < 3) {
      log.warn(`Refreshing session and trying again`);

      return firebase.call.createSession()
        .then(() => setTokens(headers, params, ++attempts));
    }

    throw error;
  }
};

module.exports = {
  set: setTokens
};

const log = require('@services/logger');

const tokens = require('./tokens');

module.exports = async () => {
  try {
    const { params, setTokens } = tokens;

    await setTokens();

    params.set('tid', Math.floor(Math.random() * (10 - 1 + 1)) + 1);
    params.set('transport', 'webSockets');

    const url = `wss://hub.predictit.org/signalr/connect?${params.toString()}`;

    log.debug(`Trying: ${url}`, { status: 'connecting' });

    return url;
  } catch (error) {
    log.error(error);
  }
};

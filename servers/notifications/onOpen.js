const fetch = require('node-fetch');
const log = require('services/logger');

const { headers, params } = require('./tokens');

module.exports = async () => {
  try {
    const url = `https://hub.predictit.org/signalr/start?${params.toString()}`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    if (data.Response !== 'started') {
      throw new Error('Connection not started');
    }

    return;
  } catch (error) {
    log.error(error);
    throw error;
  }
};

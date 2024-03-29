const fetch = require('node-fetch');
const utils = require('@services/utils');
const raise = utils.raise;

const { headers, params } = require('./url');

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
    raise(error);
  }
};

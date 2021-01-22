const fetch = require('node-fetch');

const log = require('@services/logger');
const firebase = require('@services/firebase');

const headers = {
  Accept: `text/plain, */*; q=0.01`,
  Pragma: `no-cache`,
  Connection: `keep-alive`,
  Host: `hub.predictit.org`,
  Origin: `https://www.predictit.org`,
  Referer: `https://www.predictit.org/`,
  'Accept-Encoding': `gzip, deflate, br`,
  'Accept-Language': `en-US,en;q=0.9`,
  'Cache-Control': `no-cache`,
  'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
  'Sec-Fetch-Dest': `empty`,
  'Sec-Fetch-Mode': `cors`,
  'Sec-Fetch-Site': `same-site`,
  'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36`,
};

const params = new URLSearchParams({
  _: Date.now(),
  clientProtocol: '1.5',
  transport: 'webSockets',
  connectionData: '[{"name":"markethub"}]',
  tid: Math.floor(Math.random() * (10 - 1 + 1) + 1),
});

const setBearerToken = async () => {
  try {
    log.debug('Setting bearer token', { status: 'connecting' });

    const token = await firebase.db.get('session/token/value');

    params.set('bearer', token);
  } catch (error) {
    await firebase.call.createSession();
    throw new Error(`Refreshing session and trying again`);
  }
};

const setConnectionToken = async () => {
  try {
    log.debug('Setting connection token', { status: 'connecting' });

    const url = `https://hub.predictit.org/signalr/negotiate?${params.toString()}`;
    const response = await fetch(url, { headers });
    const data = await response.json();

    params.set('connectionToken', data.ConnectionToken);
  } catch (error) {
    await firebase.call.createSession();
    throw new Error(`Refreshing session and trying again`);
  }
};

const getUrl = async () => {
  try {
    await setBearerToken();
    await setConnectionToken();

    const url = `wss://hub.predictit.org/signalr/connect?${params.toString()}`;

    log.debug(`Trying: ${url}`, { status: 'connecting' });

    return url;
  } catch (error) {
    log.error(error);
    return null;
  }
};

module.exports = {
  params,
  headers,
  get: getUrl,
};

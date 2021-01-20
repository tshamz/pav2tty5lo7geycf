const fetch = require('node-fetch');

const log = require('@services/logger');
const firebase = require('@services/firebase');

const params = new URLSearchParams({
  _: Date.now(),
  clientProtocol: '1.5',
  connectionData: '[{"name":"markethub"}]',
});

const headers = {
  Accept: `text/plain, */*; q=0.01`,
  'Accept-Encoding': `gzip, deflate, br`,
  'Accept-Language': `en-US,en;q=0.9`,
  'Cache-Control': `no-cache`,
  Connection: `keep-alive`,
  'Content-Type': `application/x-www-form-urlencoded; charset=UTF-8`,
  Host: `hub.predictit.org`,
  Origin: `https://www.predictit.org`,
  Pragma: `no-cache`,
  Referer: `https://www.predictit.org/`,
  'Sec-Fetch-Dest': `empty`,
  'Sec-Fetch-Mode': `cors`,
  'Sec-Fetch-Site': `same-site`,
  'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36`,
};

const refreshSessionAndBearerToken = async () => {
  try {
    log.warn(`Refreshing session and bearer token`);

    return await firebase.call.createSession();
  } catch (error) {
    console.log('error', error);
    throw error;
  }
};

const setTokens = async (newSession) => {
  try {
    console.log('newSession', newSession);

    log.debug('Setting bearer token');
    const bearerToken = await firebase.db.get('session/token/value');
    params.set('bearer', bearerToken);
    log.debug(`Bearer token set`);

    log.debug('Setting connection token');
    const url = `https://hub.predictit.org/signalr/negotiate?${params.toString()}`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    console.log('data', data);

    params.set('connectionToken', data.ConnectionToken);
    log.debug(`Connection token set`);
  } catch (error) {
    if (!newSession) {
      return refreshSessionAndBearerToken().then(setTokens);
    }

    throw error;
  }
};

module.exports = {
  params,
  headers,
  setTokens,
};

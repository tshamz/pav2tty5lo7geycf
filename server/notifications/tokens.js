const fetch = require('node-fetch');

const log = require('services/logger');
const firebase = require('services/firebase');

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

const refreshSessionAndBearerToken = (retry) => async () => {
  try {
    log.warn(`Refreshing session and bearer token`);

    const session = await firebase
      .functions()
      .httpsCallable('browser-createSession')();

    if (!session.data) {
      throw new Error('No session');
    }

    return retry();
  } catch (error) {
    log.error(error);
    throw error;
  }
};

const setBearerToken = async () => {
  try {
    log.debug('Setting bearer token');

    console.log('firebase', firebase);
    const session = await firebase
      .database()
      .ref('session/token')
      .once('value')
      .then((snapshot) => snapshot.val());

    const token = JSON.parse(session.token).value;

    params.set('bearer', token);

    // .catch((error) => {
    //   log.error(error);
    //   refreshSessionAndBearerToken(setBearerToken)();
    // });

    log.debug(`Bearer token set`);

    return;
  } catch (error) {
    console.log('error', error);
    throw error;
  }
};

const setConnectionToken = async () => {
  try {
    log.debug('Setting connection token');

    const url = `https://hub.predictit.org/signalr/negotiate?${params.toString()}`;

    await fetch(url, { headers })
      .then((response) => response.json())
      .then((data) => params.set('connectionToken', data.ConnectionToken));
    // .catch(refreshSessionAndBearerToken(setConnectionToken));

    log.debug(`Connection token set`);

    return;
  } catch (error) {
    log.error(error);
    throw error;
  }
};

module.exports = {
  params,
  headers,
  setBearer: setBearerToken,
  setConnection: setConnectionToken,
};

const log = require('@services/logger');

const tokens = require('./tokens');

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

const params = new URLSearchParams({
  _: Date.now(),
  clientProtocol: '1.5',
  connectionData: '[{"name":"markethub"}]',
});

const getUrl = async () => {
  try {
    await tokens.set(headers, params);

    params.set('tid', Math.floor(Math.random() * (10 - 1 + 1)) + 1);
    params.set('transport', 'webSockets');

    const url = `wss://hub.predictit.org/signalr/connect?${params.toString()}`;
    console.log('url', url);

    log.debug(`Trying: ${url}`, { status: 'connecting' });

    return url;
  } catch (error) {
    log.error(error);
    return 'wss://dummy.url.com';
  }
}

module.exports = {
  params,
  headers,
  get: getUrl
}

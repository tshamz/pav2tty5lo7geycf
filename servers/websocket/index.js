const ws = require('ws');
const wait = require('wait');
const ReconnectingWs = require('reconnecting-websocket');

const log = require('services/logger');

const { OPEN, CLOSED } = ws;

exports.isOpen = ({ readyState }) => {
  return readyState == OPEN;
};

exports.send = ({ send }) => (message) => {
  log.silly(`Sending message`);
  send(message);
};

exports.open = ({ readyState, reconnect }) => {
  if (readyState !== OPEN) {
    log.debug(`Opening connection`, { status: 'connecting' });
    reconnect(1000);
  }
};

exports.close = ({ readyState, close }) => {
  if (readyState !== CLOSED) {
    log.debug(`Closing connection`, { status: 'connecting' });
    close(1000);
  }
};

exports.restart = async ({ close, reconnect }) => {
  log.debug(`Restarting connection`, { status: 'connecting' });
  close(1000);
  await wait(2500);
  reconnect(1000);
};

exports.connect = (url, options = {}) => {
  const connection = new ReconnectingWs(url, [], {
    WebSocket: ws,
    maxRetries: options.maxRetries || 3,
    startClosed: options.startClosed || true,
    minUptime: options.minUptime || 10000,
    maxReconnectionDelay: options.maxReconnectionDelay,
    minReconnectionDelay: options.minReconnectionDelay,
  });

  connection.addEventListener('open', () => {
    log.debug(`Connection opened`, { status: 'open' });
  });

  connection.addEventListener('close', ({ code }) => {
    log.debug(`Connection closed`, { code, status: 'closed' });
  });

  connection.addEventListener('message', (message) => {
    log.silly(`Message recieved`, { data: message });
  });

  connection.addEventListener('error', (error) => {
    log.error(`Connection error`, { error, status: 'closed' });
  });

  const heartbeat = () => {
    log.debug(connection.readyState == OPEN ? '✅' : '🚫');
  };

  setInterval(heartbeat, 60000);

  return connection;
};

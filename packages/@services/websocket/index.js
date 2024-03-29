const ws = require('ws');
const wait = require('wait');
const ReconnectingWs = require('reconnecting-websocket');

const log = require('@services/logger');

const { OPEN, CLOSED } = ws;

exports.isOpen = ({ readyState }) => {
  return readyState == OPEN;
};

exports.send = (connection) => (message) => {
  log.silly(`Sending message`);
  connection.send(message);
};

exports.open = (connection) => {
  if (connection.readyState !== OPEN) {
    log.debug(`Opening connection`, { status: 'connecting' });
    connection.reconnect(1000);
  }
};

exports.close = (connection) => {
  if (connection.readyState !== CLOSED) {
    log.debug(`Closing connection`, { status: 'connecting' });
    connection.close(1000);
  }
};

exports.restart = async (connection) => {
  log.debug(`Restarting connection`, { status: 'connecting' });
  connection.close(1000);
  await wait(2500);
  connection.reconnect(1000);
};

exports.connect = (url, options = {}) => {
  const connection = new ReconnectingWs(url, [], {
    WebSocket: ws,
    startClosed: true,
    minUptime: 10000,
    minReconnectionDelay: 20000 || options.reconnectionDelay,
    maxReconnectionDelay: 20000 || options.reconnectionDelay,
    ...options,
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

const log = require('services/logger');
const express = require('services/express');
const websocket = require('services/websocket');

const connection = websocket.connect(require('./url'));

connection.addEventListener('open', require('./onOpen'));
connection.addEventListener('message', require('./onMessage'));

const app = express.create();
const port = process.env.PORT || 8082;

app.get('/open', (req, res) => {
  websocket.open(connection);
  res.sendStatus(200);
});

app.get('/close', (req, res) => {
  websocket.close(connection);
  res.sendStatus(503);
});

app.get('/restart', (req, res) => {
  websocket.restart(connection);
  res.sendStatus(200);
});

app.get('/health', (req, res) => {
  res.sendStatus(websocket.isOpen(connection) ? 200 : 503);
});

app.get('/status', (req, res) => {
  const isOpen = websocket.isOpen(connection);

  res.json({
    schemaVersion: 1,
    isError: !isOpen,
    label: 'notifications',
    color: isOpen ? 'green' : 'red',
    message: isOpen ? 'connected' : 'down',
  });
});

app.listen(port, () => {
  log.debug(`Server started, listening on ${port}`);
  websocket.open(connection);
});

module.exports = app;

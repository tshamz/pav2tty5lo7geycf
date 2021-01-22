require('@services/env');
require('@services/debug');

const log = require('@services/logger');
const express = require('@services/express');

const app = express.create();
const port = process.env.STATUS_HOST_PORT || process.env.PORT;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  log.debug(`Server started, listening on ${port}`);
});

module.exports = app;

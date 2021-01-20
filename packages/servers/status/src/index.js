require('@services/debug');
require('@services/dotenv');

const log = require('@services/logger');
const express = require('@services/express');

const app = express.create();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  log.debug(`Server started, listening on ${port}`);
});

module.exports = app;

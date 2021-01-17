require('@google-cloud/trace-agent').start();

const debug = require('@google-cloud/debug-agent');

debug.start({ serviceContext: { enableCanary: true } });

const express = require('express');
const log = require('services').logger;

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  log.debug(`Server started, listening on ${port}`);
});

module.exports = app;

const trace = require('@google-cloud/trace-agent');
const debug = require('@google-cloud/debug-agent');

const express = require('express');
const log = require('@local/services/logger');

trace.start();
debug.start({ serviceContext: { enableCanary: true } });

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  log.debug(`Server started, listening on ${port}`);
});

module.exports = app;

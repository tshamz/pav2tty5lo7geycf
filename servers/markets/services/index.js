const fs = require('fs');

exports.logger = require('./logger');
exports.firebase = require('./firebase');

if (fs.existsSync('./express')) {
  exports.express = require('./express');
}

if (fs.existsSync('./websocket')) {
  exports.websocket = require('./websocket');
}

if (fs.existsSync('./twilio')) {
  exports.twilio = require('./twilio');
}

if (fs.existsSync('./utils')) {
  exports.utils = require('./utils');
}

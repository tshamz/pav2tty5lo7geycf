const twilio = require('twilio');
const firebase = require('@services/firebase');

const config = firebase.config('twilio');
const client = twilio(config.sid, config.token);

const formatMessage = (rawMessage = []) => {
  if (!Array.isArray(rawMessage)) {
    return rawMessage;
  }

  return rawMessage
    .filter(Boolean)
    .map((part) => {
      if (Array.isArray(part)) {
        return part.join('\n');
      }

      if (typeof part === 'string') {
        return part;
      }
    })
    .join('\n\n');
};

const sendMessage = (args) => {
  let message =
    Array.isArray(args) || typeof args === 'string'
      ? formatMessage(args)
      : args.body || formatMessage(args.message);

  if (!message && !args.body) return;

  console.log(`Sending message:\n${message}`);

  return client.api.messages.create({
    body: message,
    to: args.to || config.me,
    from: args.from || config.from,
  });
};

twilio.client = client;
twilio.sendMessage = sendMessage;
twilio.formatMessage = formatMessage;

module.exports = twilio;

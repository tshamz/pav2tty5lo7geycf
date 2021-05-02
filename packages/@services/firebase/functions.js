const get = require('lodash/get');
const firebase = require('firebase');
const functions = require('firebase-functions');

const isEmulator = process.env.IS_FIREBASE_CLI;
const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isEnabled = isProduction || (isDev && isEmulator);

const getConfig = (path) => {
  const config = functions.config();

  return get(config, path, config);
};

const triggerFunction = (name) => async (data) => {
  if (!isEnabled) return null;

  // prettier-ignore
  return firebase
    .functions()
    .httpsCallable(name)(data);
};

const callable = {
  createSession: triggerFunction('browser-createSession'),
  updateMarket: triggerFunction('data-updateMarket'),
  updateAccountFunds: triggerFunction('data-updateAccountFunds'),
  updateContractPrice: triggerFunction('data-updateContractPrice'),
  updateContractOrderBook: triggerFunction('data-updateContractOrderBook'),
  // updateOpenOrders: triggerFunction('data-updateOpenOrders'),
  // updateTradeHistory: triggerFunction('data-updateTradeHistory'),
  // updateMarketPosition: triggerFunction('data-updateMarketPosition'),
  // updateContractPosition: triggerFunction('data-updateContractPosition'),
};

module.exports = {
  functions,
  call: callable,
  config: getConfig,
  logger: functions.logger,
  HttpsError: functions.https.HttpsError,
};

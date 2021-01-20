const get = require('lodash/get');
const firebase = require('firebase');
const functions = require('firebase-functions');

const getConfig = (path) => {
  const config = functions.config();

  return get(config, path, config);
};

const triggerFunction = (name) => async (data) => {
  // prettier-ignore
  return firebase
    .functions()
    .httpsCallable(name)(data);
};

const callable = {
  createSession: triggerFunction('browser-createSession'),
  updateMarket: triggerFunction('data-updateMarket'),
  updateOpenOrders: triggerFunction('data-updateOpenOrders'),
  updateAccountFunds: triggerFunction('data-updateAccountFunds'),
  updateTradeHistory: triggerFunction('data-updateTradeHistory'),
  updateContractPrice: triggerFunction('data-updateContractPrice'),
  updateMarketPosition: triggerFunction('data-updateMarketPosition'),
  updateContractPosition: triggerFunction('data-updateContractPosition'),
};

module.exports = {
  functions,
  call: callable,
  config: getConfig,
  HttpsError: functions.https.HttpsError,
};

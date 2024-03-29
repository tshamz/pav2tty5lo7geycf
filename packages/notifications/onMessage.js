const log = require('@services/logger');
const firebase = require('@services/firebase');

module.exports = ({ data, target, type }) => {
  const message = JSON.parse(data);

  if (!Object.keys(message).length) return;

  const messages = message.M;

  messages.forEach(async (rawData) => {
    try {
      const [type, data] = rawData.A;
      console.log(type, data);

      if (type === 'market_status') {
        // firebase.call.???(data);
      }

      if (type === 'site_status') {
        // firebase.call.???(data);
      }

      if (type === 'accountfunds_data') {
        firebase.call.updateAccountFunds(data);
      }

      if (type === 'tradeConfirmed_data') {
        firebase.call.updateTradeHistory(data);
        // firebase.call.updateOpenOrders(data);
      }

      if (type === 'marketOwnershipUpdate_data') {
        // firebase.call.updateMarketPosition(data);
      }

      if (type === 'contractOwnershipUpdate_data') {
        // firebase.call.updateContractPosition(data);
      }

      if (type === 'notification_shares_traded') {
        // firebase.call.updateOpenOrders(data);
      }
    } catch (error) {
      log.error(error);
      throw error;
    }
  });
};

// accountfunds_data;
// contractOwnershipUpdate_data;
// marketOwnershipUpdate_data;
// notification_shares_traded;
// tradeConfirmed_data;

// Trade Types:
// • 0 - Buy No
// • 1 - Buy Yes
// • 2 - Sell No
// • 3 - Sell Yes

// Predictions:
//  • 0 - No
//  • 1 - Yes

// Market Types
//  • 0 - Binary
//  • 1 - ?????
//  • 2 - ?????
//  • 3 - ?????

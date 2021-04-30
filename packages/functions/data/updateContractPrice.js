const firebase = require('@services/firebase');

module.exports = async (data) => {
  try {
    await firebase.prices.set(data.id, {
      buyNo: data.BestNoPrice,
      buyYes: data.BestYesPrice,
      lastTrade: data.LastTradePrice,
    });

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};

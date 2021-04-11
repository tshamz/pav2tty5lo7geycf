const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const path = `prices/${data.id}`;

    const update = {
      buyNo: data.BestNoPrice,
      buyYes: data.BestYesPrice,
      lastTrade: data.LastTradePrice,
      _timestamp: Date.now(),
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  }
};

const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const update = {
      [`prices/${data.id}/buyNo`]: data.BestNoPrice,
      [`prices/${data.id}/buyYes`]: data.BestYesPrice,
      [`prices/${data.id}/lastTrade`]: data.LastTradePrice,
      [`prices/${data.id}/_timestamp`]: Date.now(),
      [`prices/${data.id}/_updatedAt`]: new Date().toLocaleString(),
    };

    await firebase.db.set(update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

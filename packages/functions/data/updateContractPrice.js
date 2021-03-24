const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const contract = await firebase.db.get(`contracts/${data.id}`);
    const pathPrefix = `prices/${contract.market}/${data.id}`;

    const update = {
      [`${pathPrefix}/buyNo`]: data.BestNoPrice,
      [`${pathPrefix}/buyYes`]: data.BestYesPrice,
      [`${pathPrefix}/lastTrade`]: data.LastTradePrice,
      [`${pathPrefix}/_timestamp`]: Date.now(),
      [`${pathPrefix}/_updatedAt`]: new Date().toLocaleString(),
    };

    await firebase.db.set(update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

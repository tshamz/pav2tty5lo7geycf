const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    // console.log('data', data);
    // const contract = await firebase.db.get(`contracts/${data.id}`);
    // console.log('contract', contract);
    // const pathPrefix = `prices/${contract.market}/${data.id}`;

    const update = {
      [`prices/${data.id}/buyNo`]: data.BestNoPrice,
      [`prices/${data.id}/buyYes`]: data.BestYesPrice,
      [`prices/${data.id}/lastTrade`]: data.LastTradePrice,
      [`prices/${data.id}/_timestamp`]: Date.now(),
      [`prices/${data.id}/_updatedAt`]: new Date().toLocaleString(),
      // [`${pathPrefix}/buyNo`]: data.BestNoPrice,
      // [`${pathPrefix}/buyYes`]: data.BestYesPrice,
      // [`${pathPrefix}/lastTrade`]: data.LastTradePrice,
      // [`${pathPrefix}/_timestamp`]: Date.now(),
      // [`${pathPrefix}/_updatedAt`]: new Date().toLocaleString(),
    };

    await firebase.db.set(update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const contract = await firebase.db.get(`contracts/${data.id}`);
    const path = `prices/${contract.market}/${data.id}`;

    const update = {
      buyNo: data.BestNoPrice,
      buyYes: data.BestYesPrice,
      lastTrade: data.LastTradePrice,
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

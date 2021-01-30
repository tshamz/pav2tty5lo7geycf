const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const path = `prices/${data.id}`;

    const update = {
      lastTrade: data.LastTradePrice,
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

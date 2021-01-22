const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const path = `prices/${data.id}`;
    const update = {
      lastTrade: data.LastTradePrice,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await firebase.db.set(path, update);

    return update;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

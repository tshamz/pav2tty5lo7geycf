const admin = require('services/firebase');

module.exports = async (data, context) => {
  try {
    const update = {
      lastTrade: data.LastTradePrice,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await admin.setPath(`prices/${data.id}`)(update);

    return update;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

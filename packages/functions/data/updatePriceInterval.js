const firebase = require('@services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const now = Date.now();
    const prices = await firebase.db.get('prices');
    const updates = Object.entries(prices).reduce((updates, [id, data]) => {
      return {
        ...updates,
        [`${id}/${now}`]: data.lastTrade,
      };
    }, {});

    await firebase.priceInterval.set(updates);

    return;
  } catch (error) {
    console.error(error);

    return { error };
  } finally {
    if (res && res.status) {
      res.status(200).json({});
    }
  }
};

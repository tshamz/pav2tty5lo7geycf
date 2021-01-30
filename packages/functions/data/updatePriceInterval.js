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
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.status) {
      res.sendStatus(200);
    }

    return null;
  }
};

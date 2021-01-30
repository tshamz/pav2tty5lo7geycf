const firebase = require('@services/firebase');

const getUpdates = async (database) => {
  const now = new Date();
  const then = now.setMonth(now.getMonth() - 1);
  const snapshot = await database.get();

  return Object.entries(snapshot).reduce((updates, [id, prices]) => {
    const pathsToDelete = Object.keys(prices)
      .filter((timestamp) => new Date(timestamp) < then)
      .map((timestamp) => `${id}/${timestamp}`)
      .reduce((updates, path) => ({ ...updates, [path]: null }), {});

    return {
      ...updates,
      ...pathsToDelete,
    };
  }, {});
};

module.exports = async (snapshot, res) => {
  try {
    const historyUpdates = getUpdates(firebase.priceHistory);
    const intervalUpdates = getUpdates(firebase.priceInterval);

    await Promise.all([
      firebase.priceHistory.set(historyUpdates),
      firebase.priceInterval.set(intervalUpdates),
    ]);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.status) {
      res.sendStatus(200);
    }

    return null;
  }
};

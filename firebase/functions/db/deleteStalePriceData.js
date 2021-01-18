const admin = require('@services/firebase');

const getUpdates = async (db) => {
  const now = new Date();
  const then = now.setMonth(now.getMonth() - 1);
  const snapshot = await admin.getPath({ db });

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
    const historyUpdates = getUpdates(admin.priceHistory);
    const intervalUpdates = getUpdates(admin.priceInterval);

    await Promise.all([
      admin.database(admin.priceHistory).ref().update(historyUpdates),
      admin.database(admin.priceInterval).ref().update(intervalUpdates),
    ]);

    if (res && res.status) {
      res.status(200).json({});
    }

    return;
  } catch (error) {
    console.error(error);

    if (res && res.status) {
      res.status(500).json({});
    }

    return { error };
  }
};

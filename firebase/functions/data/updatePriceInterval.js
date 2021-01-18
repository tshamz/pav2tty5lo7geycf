const admin = require('@local/services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const now = Date.now();
    const prices = await admin.getPath({ path: 'prices' });
    const updates = Object.entries(prices).reduce((updates, [id, data]) => {
      return {
        ...updates,
        [`${id}/${now}`]: data.lastTrade,
      };
    }, {});

    await admin.database(admin.priceInterval).ref().update(updates);

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

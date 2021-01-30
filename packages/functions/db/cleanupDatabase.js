const firebase = require('@services/firebase');

module.exports = async (data, res) => {
  try {
    const database = await firebase.db.get();

    // prettier-ignore
    const marketsUpdates = Object.keys(database.markets).reduce((updates, id) => {
      return {
        ...updates,
        // Put paths in here that you want to remove
        // [`markets/${id}/_updateSource`]: null,
        // [`markets/${id}/_timestamp`]: null,
        // [`markets/${id}/_updatedAt`]: null,
      };
    }, {});

    // prettier-ignore
    const contractsUpdates = Object.keys(database.contracts).reduce((updates, id) => {
      return {
        ...updates,
        // Put paths in here that you want to remove
        // [`contracts/${id}/_updateSource`]: null,
        // [`contracts/${id}/_timestamp`]: null,
        // [`contracts/${id}/_updatedAt`]: null,
      };
    }, {});

    // prettier-ignore
    const pricesUpdate = Object.keys(database.prices).reduce((updates, id) => {
      return {
        ...updates,
        // Put paths in here that you want to remove
        // [`prices/${id}/_updateSource`]: null,
        // [`prices/${id}/_timestamp`]: null,
        // [`prices/${id}/_updatedAt`]: null,
      };
    }, {});

    const update = {
      ...marketsUpdates,
      ...contractsUpdates,
      ...pricesUpdate,
      // Put paths in here that you want to remove
      // stats: null,
    };

    await firebase.db.set(update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.status) {
      res.sendStatus(200);
    }

    return null;
  }
};

const firebase = require('@services/firebase');

module.exports = async (...args) => {
  const res = args[1];

  try {
    const database = await firebase.db.get();

    // prettier-ignore
    const marketsUpdates = Object.keys(database.markets).reduce((updates, id) => {
      return {
        ...updates,
        // Put paths in here that you want to remove
        // [`markets/${id}/_updateSource`]: null,
      };
    }, {});

    // prettier-ignore
    const contractsUpdates = Object.keys(database.contracts).reduce((updates, id) => {
      return {
        ...updates,
        // Put paths in here that you want to remove
        // [`contracts/${id}/_updateSource`]: null,
      };
    }, {});

    // prettier-ignore
    const pricesUpdate = Object.keys(database.prices).reduce((updates, id) => {
      return {
        ...updates,
        // Put paths in here that you want to remove
        // [`prices/${id}/_updateSource`]: null,
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

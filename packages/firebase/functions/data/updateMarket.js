const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const path = `markets/${data.id}`;
    const update = {
      active: data.Status === 'Open',
      totalSharesTraded: data.TotalSharesTraded,
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

const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const path = `markets/${data.id}`;

    const update = {
      active: data.Status === 'Open',
      totalSharesTraded: data.TotalSharesTraded,
    };

    await firebase.db.set(path, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

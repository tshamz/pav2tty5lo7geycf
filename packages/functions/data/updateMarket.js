const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const pathPrefix = `markets/${data.id}`;

    const update = {
      [`${pathPrefix}/active`]: data.Status === 'Open',
      [`${pathPrefix}/totalSharesTraded`]: data.TotalSharesTraded,
      [`${pathPrefix}/_timestamp`]: Date.now(),
      [`${pathPrefix}/_updatedAt`]: new Date().toLocaleString(),
    };

    await firebase.db.set(update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

const firebase = require('@services/firebase');

module.exports = async (data) => {
  try {
    await firebase.db.set(`markets/${data.id}`, {
      active: data.Status === 'Open',
      totalSharesTraded: data.TotalSharesTraded,
    });

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  }
};

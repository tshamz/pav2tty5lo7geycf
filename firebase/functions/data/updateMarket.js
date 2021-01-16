const admin = require('services/firebase');

module.exports = async (data, context) => {
  try {
    const update = {
      active: data.Status === 'Open',
      totalSharesTraded: data.TotalSharesTraded,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await admin.database().ref(`markets/${data.id}`).update(update);

    return { update };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

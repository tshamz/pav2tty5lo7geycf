const admin = require('@local/services/firebase');

module.exports = async (data, context) => {
  try {
    const update = {
      active: data.Status === 'Open',
      totalSharesTraded: data.TotalSharesTraded,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await admin.setPath(`markets/${data.id}`)(update);

    return update;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = async (context, res) => {
  try {
    const marketsRef = firebase.db.ref('markets');
    const snapshot = await marketsRef.once('value');
    const firebaseIds = Object.keys(await snapshot.val());
    const predictitIds = await predictit
      .fetchAllMarkets()
      .then((markets) => markets.map(({ id }) => `${id}`));

    const missingIds = firebaseIds.filter((id) => !predictitIds.includes(id));

    const inactiveSnapshot = await marketsRef
      .orderByChild('active')
      .equalTo(false)
      .once('value');

    const negativeDaysLeft = await marketsRef
      .orderByChild('daysLeft')
      .startAt(-1)
      .endAt(0)
      .once('value');

    const keysToDelete = [...missingIds];

    negativeDaysLeft.forEach((snapshot) => keysToDelete.push(snapshot.key));
    inactiveSnapshot.forEach((snapshot) => keysToDelete.push(snapshot.key));

    const ids = [...new Set(keysToDelete)];

    const update = ids
      .map((id) => `markets/${id}`)
      .reduce((update, path) => ({ ...update, [path]: null }), {});

    await firebase.db.set(update);

    console.log(`deleted ${ids.length} market keys.`, ids);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }

    return null;
  }
};

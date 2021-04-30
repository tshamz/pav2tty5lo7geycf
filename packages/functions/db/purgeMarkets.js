const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = async (context, res) => {
  try {
    const snapshot = await firebase.markets.ref().once('value');
    const firebaseIds = Object.keys(await snapshot.val());
    const predictitIds = await predictit
      .fetchAllMarkets()
      .then((markets) => markets.map(({ id }) => `${id}`));

    const keysToDelete = firebaseIds.filter((id) => !predictitIds.includes(id));

    const inactiveSnapshot = await firebase.markets
      .ref()
      .orderByChild('active')
      .equalTo(false)
      .once('value');

    const negativeDaysLeft = await firebase.markets
      .ref()
      .orderByChild('daysLeft')
      .startAt(-1)
      .endAt(0)
      .once('value');

    negativeDaysLeft.forEach((snapshot) => keysToDelete.push(snapshot.key));
    inactiveSnapshot.forEach((snapshot) => keysToDelete.push(snapshot.key));

    const ids = [...new Set(keysToDelete)];

    const update = ids.reduce(
      (update, path) => ({ ...update, [path]: null }),
      {}
    );

    await firebase.markets.set(update);

    firebase.logger.info(`deleted ${ids.length} market keys.`);

    return;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};

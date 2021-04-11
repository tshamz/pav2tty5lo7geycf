const firebase = require('@services/firebase');

module.exports = async (context, res) => {
  try {
    const marketsRef = firebase.db.ref('markets');

    const inactiveSnapshot = await marketsRef
      .orderByChild('active')
      .equalTo(false)
      .once('value');

    const negativeDaysLeft = await marketsRef
      .orderByChild('daysLeft')
      .startAt(-1)
      .endAt(0)
      .once('value');

    const keysToDelete = [];

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

// const allMarkets = Object.values();
// const markets = allMarkets.filter(({ daysLeft }) => daysLeft < 0);

// const marketIds = markets.map(({ id }) => id);

// const marketKeys = marketIds.map((id) => `markets/${id}`);
// const contractKeys = contractIds.map((id) => `contracts/${id}`);
// const priceKeys = contractIds.map((id) => `prices/${id}`);
// const orderBookKeys = contractIds.map((id) => `orderBooks/${id}`);

// const timespansUpdate = createUpdate(...marketIds);
// const priceHistoryUpdate = createUpdate(...contractIds);
// const defaultUpdate = createUpdate(
//   ...marketKeys,
//   ...contractKeys,
//   ...priceKeys,
//   ...orderBookKeys
// );

// await Promise.all([
//   firebase.db.set(defaultUpdate),
//   firebase.timespans.set(timespansUpdate),
//   firebase.priceHistory.set(priceHistoryUpdate),
// ]);

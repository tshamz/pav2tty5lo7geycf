const fetch = require('node-fetch');

const admin = require('services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const Accept =
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
    const Host = 'predictit-f497e.firebaseio.com';
    const userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36`;
    const headers = { Accept, Host, 'User-Agent': userAgent };
    const url = `https://predictit-f497e.firebaseio.com/contractOrderBook.json`;
    const orderBooks = await fetch(url, { headers }).then((res) => res.json());

    const update = Object.entries(orderBooks).reduce((updates, [id, data]) => {
      const timestamp = Math.floor(parseFloat(data.timestamp) * 1000);

      return {
        ...updates,
        [id]: {
          noOrders: data.noOrders,
          yesOrdrs: data.yesOrders,
          _timestamp: timestamp || null,
          _updatedAt: new Date(timestamp).toUTCString() || null,
        },
      };
    }, {});

    await admin.database().ref(`orderBooks`).update(update);

    if (res && res.status) {
      res.status(200).json({});
    }

    return;
  } catch (error) {
    console.error(error);

    if (res && res.status) {
      res.status(500).json({});
    }

    return { error };
  }
};

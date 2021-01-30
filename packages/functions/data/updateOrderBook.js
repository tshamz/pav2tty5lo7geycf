const fetch = require('node-fetch');

const firebase = require('@services/firebase');

module.exports = async (snapshot, res) => {
  try {
    const url = `https://predictit-f497e.firebaseio.com/contractOrderBook.json`;

    const headers = {
      Accept: '*/*',
      Host: 'predictit-f497e.firebaseio.com',
      'User-Agent': 'curl/7.64.1',
    };

    const response = await fetch(url, { headers });
    const orderBooks = await response.json();
    const orderBooksEntries = Object.entries(orderBooks);

    const getUpdates = (updates, [id, data]) => {
      return {
        ...updates,
        [id]: {
          noOrders: data.noOrders,
          yesOrdrs: data.yesOrders,
        },
      };
    };

    const update = orderBooksEntries.reduce(getUpdates, {});

    await firebase.db.set(`orderBooks`, update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.status) {
      res.sendStatus(200);
    }

    return null;
  }
};

// const Accept =
//   'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
// const userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36`;
// const headers = { Accept, Host, 'User-Agent': userAgent };

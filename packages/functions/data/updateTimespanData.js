const firebase = require('@services/firebase');
const predictit = require('@services/predictit');

module.exports = (frequency) => async (context, res) => {
  try {
    const markets = await firebase.db.get(`markets`);
    const contracts = await firebase.db.get(`contracts`);

    const fetchData = (marketId) => (timespan) => {
      return predictit
        .fetchTimespanData({ marketId, timespan })
        .then(parseData)
        .catch(console.error);
    };

    const parseData = (data) => {
      return data.reduce((update, row) => {
        const contract = Object.values(contracts)
          .filter((contract) => contract.market === row.marketId)
          .find((contract) => contract.shortName === row.ContractName);

        if (contract) {
          const path = `${row.marketId}/${contract.id}/${row.timespan}`;

          return {
            ...update,
            [path]: [
              ...(update[path] || []),
              {
                timespan: row.timespan,
                market: parseInt(row.marketId),
                contract: parseInt(contract.id),
                date: row.Date,
                name: row.ContractName,
                open: parseFloat(row.OpenSharePrice.slice(1)),
                high: parseFloat(row.HighSharePrice.slice(1)),
                low: parseFloat(row.LowSharePrice.slice(1)),
                close: parseFloat(row.CloseSharePrice.slice(1)),
                volume: parseInt(row.TradeVolume),
              },
            ],
          };
        }

        console.log(`no contact found in market: ${row.marketId} for`, row);

        return update;
      }, {});
    };

    let update = {};

    for (const id in markets) {
      const market = markets[id];
      const fetchTimespanData = fetchData(market.id);

      if (!market.id) {
        console.log('market', market);
      }

      if (frequency === 'hourly') {
        const parseHourly = (hourly, entry) => {
          const path = entry[0].replace('24h', '1h');
          const data = entry[1].slice(-1);
          return { ...hourly, [path]: data };
        };

        const daily = await fetchTimespanData('24h');
        const hourly = Object.entries(daily).reduce(parseHourly, {});

        update = {
          ...update,
          ...hourly,
          ...daily,
        };
      } else if (frequency === 'daily') {
        update = {
          ...update,
          ...(await fetchTimespanData('7d')),
          ...(await fetchTimespanData('30d')),
          ...(await fetchTimespanData('90d')),
        };
      }
    }

    console.log('update', update);

    // const update = await Promise.all(requests)
    //   .then((results) => results.flat())
    //   .then((data) =>
    //     data.reduce((update, result) => ({ ...update, ...result }), {})
    //   );

    await firebase.timespans.set(await update);
  } catch (error) {
    firebase.logger.error(error.message);
    return;
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};

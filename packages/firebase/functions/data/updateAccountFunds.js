const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const update = {
      cash: data.AccountBalanceDecimal,
      invested: data.PortfolioBalanceDecimal,
      profitablePredictions: data.ProfitablePredictions,
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await firebase.db.set('funds', update);

    return update;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

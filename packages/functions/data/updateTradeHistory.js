const firebase = require('@services/firebase');

module.exports = async (data, context) => {
  try {
    const update = {
      market: data.MarketId,
      contract: data.Offer.ContractId,
      cost: data.TotalCost, // quantity - remainingQuantity * price
      profit: data.TotalProfit, // totalCost - totalRiskChange
      fees: data.TotalFees, // totalProfit * -1
      riskChange: data.TotalRiskChange, // totalCost - total profit
      quantity: data.Offer.Quantity - data.Offer.RemainingQuantity,
      price: data.Offer.PricePerShare,
      tradeType: data.Offer.TradeType,
    };

    await firebase.tradeHistory.push(update);
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    return null;
  }
};

// ```
// tradeConfirmed_data
// {
//   ContractId: 24373,
//   Name: 'Lily Eskelsen Garcia',
//   MarketId: 6978,
//   MarketName: 'Secretary of Education on Mar. 1?',
//   MarketUrl: 'Secretary-of-Education-on-Mar-1',
//   MarketType: 3,
//   ImageName: 'small_8af1c9b4-3181-4a69-af27-43fb462f629d.jpg',
//   TotalProfit: 0,
//   TotalFees: 0,
//   ShowRisk: false,
//   TotalRiskChange: 0,
//   TotalCost: 0,
//   Offer: {
//     OfferId: 49415172,
//     ContractId: 24373,
//     Quantity: 111,
//     RemainingQuantity: 111,
//     DateCreated: '2020-12-11T00:49:14.767',
//     TradeType: 0,
//     PricePerShare: 0.49
//   },
//   History: [],
//   TimeStamp: '1607647754.89341',
//   Guid: 'caaddcc8-0b51-443b-acc6-0759f2942096',
//   OfferId: 49415172,
//   Quantity: 111,
//   RemainingQuantity: 111,
//   DateCreated: '2020-12-11T00:49:14.767',
//   TradeType: 0,
//   PricePerShare: 0.49
// }
// ```

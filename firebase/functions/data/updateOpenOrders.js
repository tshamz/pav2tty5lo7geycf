const admin = require('services/firebase');

// Trade Types:
// • 0 - Buy No
// • 1 - Buy Yes
// • 2 - Sell No
// • 3 - Sell Yes
const getTradeType = async (data) => {
  try {
    if (data.Offer.TradeType) return data.Offer.TradeType;

    // prettier-ignore
    const tradeTypes = [[0, 1], [2, 3]];
    const action = data.Cash < 0 ? 0 : 1;
    const predictionPath = `positions/contracts/${data.contract}/prediction`;
    const prediction = await admin.getPath({ path: predictionPath });

    return tradeTypes[action][prediction];
  } catch (error) {
    throw error;
  }
};

module.exports = async (data, context) => {
  try {
    if (data.RemainingQuantity === 0) return;

    const market = data.MarketId;
    const contract = data.Offer.ContractId;
    const tradeType = await getTradeType(data);
    const priceInCents = data.Offer.PricePerShare * 100;
    const openOrderPath = `openOrders/${market}/${contract}/${tradeType}`;
    const changeInQuantity =
      data.Offer.RemainingQuantity || data.Offer.Quantity * -1;
    const newQuantityPath = `${openOrderPath}/${priceInCents}/quantity`;
    const newQuantity = await admin
      .getPath({ path: newQuantityPath })
      .then((quantity) => quantity + changeInQuantity);

    const update = {
      [priceInCents]: {
        quantity: newQuantity > 0 ? newQuantity : null,
        _timestamp: Date.now(),
        _updatedAt: new Date().toUTCString(),
      },
    };

    await admin.database().ref(openOrderPath).update(update);

    return { update };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

// ```
// type notification_shares_traded
// data {
//   NotificationId: 18738377,
//   Title: 'Your Offer has been Matched',
//   ImageUrl: 'https://az620379.vo.msecnd.net/images/Contracts/small_4c64890a-503c-454c-b02e-732319f1459f.jpg',
//   MarketId: 6950,
//   MarketName: 'Georgia presidential vote margin?',
//   ContractId: 24179,
//   ContractName: 'Biden by 12.5K - 15K',
//   Quantity: 1,
//   PricePerShare: 0.44,
//   Cash: -0.44,
//   ActionUrl: 'https://www.predictit.org/v2/markets/detail/6950',
//   MarketType: 3,
//   TimeStamp: 2020-12-04T08:47:41.891Z,
//   Guid: '6a4e3f05-611f-4594-94c5-043b606476f3',
//   UserPrediction: undefined
// }
// ```

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

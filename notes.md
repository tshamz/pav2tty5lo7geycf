# Notes
pAV2Tty5lo7geyCF

```env
# Logger
FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099',
FIREBASE_DATABASE_EMULATOR_HOST: 'localhost:9000',
FIREBASE_EMULATOR_HUB: 'localhost:4400',
GCLOUD_PROJECT: 'kingmaker---firebase',
HOME: '/Users/tylershambora',
INIT_CWD: '/Users/tylershambora/Code/Personal/kingmaker',
IS_FIREBASE_CLI: 'true',
LOGNAME: 'tylershambora',
NODE: '/Users/tylershambora/.nvm/versions/node/v12.18.0/bin/node',
npm_config_email: 'tyler@theshamboras.com',
npm_config_init_license: 'MIT',
npm_config_init_version: '1.0.0',
npm_config_username: 'tshamz',
npm_lifecycle_event: 'dev',
npm_package_engines_node: '12.18.0',
npm_package_license: 'MIT*',
npm_package_main: 'index.js',
npm_package_name: 'markets',
npm_package_version: '0.0.1',
PUBSUB_EMULATOR_HOST: 'localhost:8085',
PWD: '/Users/tylershambora/Code/Personal/kingmaker/servers/markets',
SHELL: '/bin/zsh',
USER: 'tylershambora',

# Function
FIREBASE_DATABASE_EMULATOR_HOST='localhost:9000'
FUNCTION_SIGNATURE_TYPE='http',
FUNCTION_TARGET='data.updateMarket',
FUNCTIONS_EMULATOR='true',
GCLOUD_PROJECT='kingmaker---firebase',
GOOGLE_APPLICATION_CREDENTIALS='/Users/tylershambora/.config/firebase/tyler_theshamboras_com_application_default_credentials.json',
IS_FIREBASE_CLI='true',
K_REVISION='1',
K_SERVICE='data-updateMarket',
LOGNAME='tylershambora',
NODE_ENV='development',
npm_config_bin_links='true',
npm_config_email='tyler@theshamboras.com',
npm_config_init_version='1.0.0',
npm_lifecycle_event='dev',
npm_lifecycle_script="firebase emulators:exec 'yarn run-p dev:servers' --ui --export-on-exit ./data --import ./data",
npm_node_execpath='/Users/tylershambora/.nvm/versions/node/v12.18.0/bin/node',
npm_package_name='kingmaker',
PORT='80',
```

>It’s called “painting the tape”.
>
>They want to print a higher or lower price to give the impression the contract is >moving in a certain direction.

For markets that are building towards a single event (e.g. an election w/ some uncertainty on a single date)
  - don't invest before and hold throughout the event
  - research and pick a position before
  – be willing to change your position as things change
  - ride the waves
  - settle into final position as things become more clear and concrete

## Questions

1. how much cash do you leave available in your account for possible spur of the moment opportunities?
2. what's the purpose of massive buy/sell "walls" in order books?
   1. are they there just to psych you out?
   2. who tf has that many shares to put up massive walls like that?
3. why does it always seem like someone sells right after I buy (I assume to bring down the last trade price)?
4. also, why does it seem like when you buy out all shares at a certain price, a few seconds later a few more shares (~100) pop up for sale at that same price again?
5. what's the point of leaving the breadcrumbs of sell offers in the orderbook? Is it to keep the price low or an attempt to trick someone into buying and driving the price up? or neither?
6. what does degenerate mean?
7. what are the mechanics of a pump?
   1. is a "pump" different than a stock market "pump"

## Indicators

- sma
- rsi
- macd

- relative strength
  - RSI
- moving average c d
  - short
  - mid
  - long
- point and figure charts
- momentum indicators
- stochastics indicators
- adx

"For something like that, if you had 10k shares of a bracket at say 6c, you could sell 5k at 9c and effectively bring the cost of the remaining down to 3c (+ the 10% profit fee for the other half). Even better is to sell enough to free roll the rest. Have $100 that turns into $300? Sell half and secure profit no matter the outcome. Having your cake and potentially eating it too."

"Your Risk in any contract is the sum of your profits and losses, across all contracts, should that contract resolve to 'Yes'. To work out this sum, add the 'If Yes' figure for the contract to the 'If No' figures for all other contracts."
"Your Investment in the market as a whole is equal to your greatest Risk in any one contract. This is the amount PredcitIt debits from your account to cover your position."
"Your Payout is the amount you would be credited if the contract resolves to Yes. It is the difference between your total Investment (greatest Risk) and the Risk in the winning contract."
"Share Value corresponds to the face value of your position in each contract (shares multiplied by average purchase price). This value cannot exceed $850."

https://www.predictit.org/api/Profile/Shares?sort=traded&sortParameter=TODAY

## ✅ WS

- on disconnect
  - ✅ wait
  - ✅ connect to different ws url
  - 🚫 try and get a new IP address (restart server?)
- 🚫 ? spoof user agent in ws connection
- ✅ clean up logging in gc

## Puppeteer

- ✅ spoof user agent to remove any references to "headless"
- make sure to pause after actions in human like fashion

## Trades

- keep track of market positions and contract positions

## Notifications

- ✅ Alert on new contracts and markets added
  - 🚫 can be done via firebase childAdded
  - ✅ send
    - 🚫 email
    - ✅ text message

## Utils

- time randomizer
- global timer tracking when last "task" was run
  - don't run function if timer is still active
- maintain "trading" hours so that automation's activity doesn't look suspicious or stand out

## Other

- alert for markets closing in less than 24 hours
- 🚫 compare 24 hour trend average price to 90 day trend -- are same?
- automatically sign up for google alert based on new positions added
  - remove alerts when position is closed
  - https://www.npmjs.com/package/google-alerts-api
- Use tools to identify if price increase is natural or pump and dump
  - Google trends
  - Google search volume
  - Twitter search
    - https://github.com/twitterdev/tweet-search
- alert when purchase drops below min at purchase time
- volume check - enough volume to make it worthwhile
- volitility = changes in last timeframe
- need markets with a consistent level of volitility not situational
- algo could care about ~30 data points for each market
  - each data point is a 20 min interval
    - 5 mins is too much and wont capture a sustained downtrend
    - each hour is prob way too slow)
    - moving average
  - so past 10 hours considered with maybe a slight weight for recency
    - weighted moving average
- Price changes on the lower end ($0.01 => $0.02 = x2)
  - yield a much higher return
  - more volume to move 5,000 shares vs 500
  - changes hurt more (e.g. $0.06 => $0.03 loss of half of investment)
- sometime you can have outcomes which were once possible, but at a certain point in time become next to impossible well before end date.
  - More often than not those markets still trade in the $0.95/0.05 range instead of the $0.99/0.01 range
  - Sometimes a market will reach $0.99/0.01 status, but still bounce around $0.98/0.02 or $0.97/0.03 and then back up to $0.99/0.01
- make sure volume is there before buy/sell in order to avoid getting stuck in a position
- max out on .01 on a market with a long life left
  - over the course of that market's lifespan slowly sell small chunks of shares at .02

## API

### predictit.org

- protocols: https
- base: predictit.org/api
- paths:
  - 🚫 /Trade/SubmitTrade
  - 🚫 /Trade/<trade_id>/OrderBook
  - 🚫 /Profile/contract/<contract_id>/Shares
  - ✅ /Profile/Shares?sort=traded&sortParameter=ALL
  - 🚫 /Market/<market_id>
  - 🚫 /Market/<market_id>/Contracts

```
type site_status
data {
  IsMaintenance: false,
  IsTradingSuspended: true,
  MaintenanceMessage: '',
  SystemMessage: '',
  TradingSuspendedMessage: 'We are currently performing routine site maintenance. PredictIt will re-open for trading at 5:00 AM Eastern Time.',
  TimeStamp: 2020-12-04T09:00:12.629Z,
  Guid: 'dbcc02e4-cfc6-41bf-bf2f-58859d537eae'
}
```

## NPM Packages

https://numpy.org
https://www.npmjs.com/package/@thi.ng/transducers-stats
https://www.npmjs.com/package/tulind
https://www.npmjs.com/package/technicalindicators
https://www.npmjs.com/package/talib
https://www.npmjs.com/package/trend
https://www.npmjs.com/package/regression-trend
https://www.npmjs.com/package/ta-math
https://www.npmjs.com/package/keltnerchannel
https://www.npmjs.com/package/trendline
https://www.npmjs.com/package/trading-signals
https://www.npmjs.com/package/pdfast
https://www.npmjs.com/package/basic-trend
https://www.npmjs.com/package/indicators
https://www.npmjs.com/package/trendyways
https://www.npmjs.com/package/is-monotonic
https://www.npmjs.com/package/@foretold/cdf
https://www.npmjs.com/package/pivotrade
https://www.npmjs.com/package/is-bullish
https://www.npmjs.com/package/gambitjs
https://www.npmjs.com/package/alphacate
https://www.npmjs.com/package/candlestick
https://www.npmjs.com/package/technical-analysis
https://www.npmjs.com/package/ta.js

## Github Repositories

https://github.com/TWSummer/PredictIt_Analyzer/blob/main/main.rb
https://github.com/zlex7/Predictit-Public/commit/9dcf86a0fd167539c691e5867059b14da3add77e
https://github.com/aebe/PredictitDiscordNew/commits/master
https://github.com/crunkilton/predictit/blob/master/arbitrage.py
https://github.com/capricorn/pi/blob/master/predictit/piws.py
https://github.com/erikbern/predictit/blob/master/opt.py
https://github.com/Maxi100a/predictit-riskless-arbitrage-algorithm/blob/master/multiple.py
https://github.com/anthonyebiner/PredictitDiscordNew/blob/master/discord_bot.py
https://github.com/harryposner/pypredictit
https://github.com/harryposner/pypredictit/blob/master/predictit/account.py
https://github.com/dang3r/go-predictit
https://github.com/danielkovtun/rpredictit
https://github.com/stephengardner/pyredictit
https://github.com/trautlein/node-predict-it
https://github.com/evbarnett/predictit-client
https://github.com/andersknospe/janky_predictit_recorder
https://github.com/RickWeber/predictit_api
https://github.com/dwasse/predictit-api
https://github.com/capricorn/pi
https://github.com/christopherfelt/PredictItAPIScripts
https://github.com/jjordanbaird/predictit-data
https://github.com/adamjoshuagray/PredictItPy
https://github.com/cran/rpredictit

## Formulas

### Number Of Shares To Buy

```
TOTAL_PRICE / PRICE_PER_SHARE = TOTAL_SHARES_TO_PURCHASE
```

### Profit/Loss On Sale

```
((850 / BUY) * SELL) - 850
```

### Empty Database

- Import empty object into database

> {}

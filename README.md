# 🤷🏻‍♀️ pav2tty5lo7geycf

![node](https://img.shields.io/badge/node-12.18.0-brightgreen?style=flat-square)
![node](https://img.shields.io/badge/yarn-2.4.0-blue?style=flat-square)
![firebase](https://img.shields.io/badge/firebase-8.1.2-orange?style=flat-square)
<!-- ![markets](https://img.shields.io/endpoint?url=https://us-central1-kingmaker---firebase.cloudfunctions.net/browser-getServerStatus/markets&style=flat-square&label=markets&message=unknown) -->
<!-- ![notifications](https://img.shields.io/endpoint?url=https://us-central1-kingmaker---firebase.cloudfunctions.net/browser-getServerStatus/notifications&style=flat-square&label=notifications&message=unknown) -->

<img
  src="https://kingmaker---firebase.web.app/whisper-song-baby.jpg"
  align="right"
  alt="here go the whisper song baby"
  height="275">
  
The main purpose for this "app" has been to gain a competitive advantage over other traders, specifically in the realm of tooling. Since developer access to Predictit is pretty limited, the tooling that's built for the platform also tends to be pretty limited. My theory has been that if you can figure out how to programmatically access the same data that users get and build tooling and automation around that data, you could stand to make a decent amount of money without having to do very much work (beyond initial setup).

## Table of Contents
<details>
  <summary>
    <strong>Expand / Collapse</strong>
  </summary>
  <p>
  
  1. [Getting Started](#getting-started)
      - [Requirements](#requirements)
      - [Google Cloud Platform Project](#google-cloud-platform-project)
      - [`firebase-tools` + Yarn 2](#firebase-tools-+-yarn-2)
      - [Project Installation](#project-installation)
      - [Environment Variables](#environment-variables)
      - [Usage](#usage)
  1. [Application Structure](#application-structure)
      - [Express Servers](#express-servers)
      - [Firebase Functions](#firebase-functions)
        - [Alerts](#alerts)
          - [`contractsUpdated.js`](#contractsUpdatedjs)
          - [`marketAdded.js`](#marketAddedjs)
          - [`marketClosing.js`](#marketClosingjs)
        - [Browser](#browser)
          - [`createSession.js`](#createSessionjs)
        - [Data](#data)
          - [`updateAccountFunds.js`](#updateAccountFundsjs)
          - [`updateContractPosition.js`](updateContractPositionjs) **[WIP]**
          - [`updateContractPrice.js`](#updateContractPricejs)
          - [`updateMarket.js`](#updateMarketjs)
          - [`updateMarketPosition.js`](updateMarketPositionjs) **[WIP]**
          - [`updateMarkets.js`](#updateMarketsjs)
          - [`updateOpenOrders.js`](updateOpenOrdersjs) **[WIP]**
          - [`updateOrderBook.js`](updateOrderBookjs) **[WIP]**
          - [`updatePriceHistory.js`](#updatePriceHistoryjs)
          - [`updatePriceInterval.js`](#updatePriceIntervaljs)
          - [`updatePriceOHLC.js`](#updatePriceOHLCjs)
          - [`updateTradeHistory.js`  ](updateTradeHistoryjs)
        - [DB](#db)
          - [`addCreatedAt.js`](#addCreatedAtjs)
          - [`cleanupDatabase.js`](#cleanupDatabasejs)
          - [`deleteClosedMarkets.js`](#deleteClosedMarketsjs)
          - [`deleteStalePriceData.js` ](deleteStalePriceDatajs) **[WIP]**
  1. [Database Structure](#database-structure)
  1. [Misc. Notes](#misc-notes)
      - [Strategy](#strategy)
      - [Questions](#questions)
      - [Indicators](#indicators)
      - [Quotes](#quotes)
      - [WS](#ws)
      - [Puppeteer](#puppeteer)
      - [Trades](#trades)
      - [Notifications](#notifications)
      - [Utils](#utils)
      - [Other](#other)
      - [API](#api)
        - [predictit.org](#predictit.org)
      - [Formulas](#formulas)
        - [Number Of Shares To Buy](#number-of-shares-to-buy)
        - [Profit Or Loss On Sale](#profit-or-loss-on-sale)
        - [Empty Database](#empty-database)
      - [Env Vars](#env-vars)
      - [NPM Packages](#npm-packages)
      - [Github Repositories](#github-repositories)
  
  </p>
</details>

## Getting Started

<details>
  <summary>
    <strong>Expand / Collapse</strong>
  </summary>
  <p>
  

### Requirements
- node: `12.18.0`
- yarn: `2.4.0`

### Google Cloud Platform Project
Make sure you have created a Google Cloud Platform project [here](https://console.cloud.google.com) and have installed the gcloud sdk [here](https://cloud.google.com/sdk/docs/install).

### `firebase-tools` + Yarn 2
```bash
# Install firebase-tools globally (you'll need to build and link version that works with yarn 2)
# see: https://github.com/firebase/firebase-tools/pull/2356#issuecomment-755245782
$ git clone https://github.com/firebase/firebase-tools
$ cd firebase-tools
$ git checkout ss-fix-yarn-2
$ npm install
$ npm run build
$ npm link
```

### Project Installation
```bash
# Clone this repository
$ git clone https://github.com/tshamz/pav2tty5lo7geycf

# Install dependencies (must use yarn)
$ yarn install
```

### Environment Variables
```bash
# Create .env file
$ touch .env
```

Sample env file:
```env
# filenames
DEPLOY_SCRIPT="deploy.sh"
BUILD_ARCHIVE=".build.zip"

# paths
PROJECT_ROOT="<absolute_path_to_project_root>"
FUNCTIONS_ROOT="<absolute_path_to_functions_root>"
MARKETS_ROOT="<absolute_path_to_markets_root>"
NOTIFICATIONS_ROOT="<absolute_path_to_notifications_root>"
SERVICES_ROOT="<absolute_path_to_services_root>"
STATUS_ROOT="<absolute_path_to_status_root>"

# ports
MAIN_PORT="8080"
MARKETS_HOST_PORT="8081"
NOTIFICATIONS_HOST_PORT="8082"
STATUS_HOST_PORT="8083"

# google
GCLOUD_PROJECT="<gcloud_project_id>"
GOOGLE_APPLICATION_CREDENTIALS="<path_to_application_default_credentials>" # [1]

# firebase
FIREBASE_PROJECT="<gcloud_project_id>"  # [2]
FIREBASE_DEFAULT_DATABASE_URL="<url_of_firebase_project_default_database>"

# [1] should be in root of project
# [2] same as GCLOUD_PROJECT
```

### Usage
To start developing
```bash
$ yarn dev:<server_name>

# e.g.
$ yarn dev:notifications

# see scripts in root package.json for more details
```
  </p>
</details>

## Application Structure

### • Express Servers
<details>
  <summary>
    <strong>Expand / Collapse</strong>
  </summary>
  <p>


There are two express servers that each open up a single websocket connection with Predictit, one for realtime market/contract updates (`markets/`), one for for platform notifications (`notifications/`). Both take care of opening up their connection with Predictit, reconnecting if the their link gets severed, and handling the receipt of messages pushed from Predictit. After parsing out the data from the received message, it's then sent to a firebase function for storage in our own realtime database. The servers are deployed as services to their own containers on Google App Engine.

**Notes:**
* The market/contract messages are sent from Predictit when:
  - Market volume changes
  - Contract price changes
  - Contract order book changes (order is bought/sold/added/removed)
    - These messages aren't sent unless explicitly subscribed to (see below)
* Messages that can be sent to Predictit include:
  - Asking Predictit to start/stop sending message for a specific order book's changes
* The market/contract websocket connection is unauthenticated

  </p>
</details>


### • Firebase Functions
<details>
  <summary>
    <strong>Expand / Collapse</strong>
  </summary>
  <p>

There's a suite of firebase serverless functions that are used for performing different actions throughout the app. These actions can be triggered by changes to the database, on a schedule, explicitly called from somewhere within the app, or manually through an http request. As of right now actions are grouped by: **alerts**, **browser**, **data**, and **db**.

#### 🚨 Alerts

##### [`contractsUpdated.js`](/packages/functions/alerts/contractsUpdated.js)
- Sends an sms when a contract is added to a market
- Triggered by [update](/packages/functions/alerts/index.js) to [`markets/{market}/contracts` node](/packages/functions/alerts/index.js)

##### [`marketAdded.js`](/packages/functions/alerts/marketAdded.js)
- Sends an sms when new market is created
- Triggered when [`markets/{market}` node](/packages/functions/alerts/index.js) is [created](/packages/functions/alerts/index.js)

##### [`marketClosing.js`](/packages/functions/alerts/marketClosing.js)
- Sends an sms when a market is closing in the next 24 hours
- Triggered when [`markets/{market}/daysLeft` property](/packages/functions/alerts/index.js) is [updated](/packages/functions/alerts/index.js)


#### 🌎 Browser

##### [`createSession.js`](/packages/functions/browser/createSession.js)
- Uses [puppeteer](https://github.com/puppeteer/puppeteer) to login to the site and store the `localStorage` session data to the database
- The session data can then be used to turn a future unauthenticated puppeteer instance into an authenticated one without the extra step of entering in credentials
- This is important because without it, if you are using puppeteer to perform 100's of automated actions through out the day, it will also create 100's of new authenticated sessions which is likely to arouse suspicion
- The session data includes the current websocket url used to connect to the Predictit market/contract websocket used mentioned above
- This function is [scheduled](/packages/functions/browser/index.js) to run automatically once a day in order to keep session data fresh or run [on call](/packages/functions/browser/index.js) when needed
    
**Notes**
- This technology can be used to automate buying and selling, which is a key part of how this whole system makes money
- Automation of anything is against Predictit's ToS and may get you a warning or even even banned (if you get caught)
- Headless automation is preferred over using the internal "private" api (`https://www.predictit.org/api`) because activity looks like it's coming from a real user, which can be further improved by using [puppeteer-extra](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra)

#### 📊 Data

##### [`updateAccountFunds.js`](/packages/functions/data/updateAccountFunds.js)
- Updates user's Predictit account fund [data](/packages/functions/data/updateAccountFunds.js):
  - available cash
  - amount invested
  - profitable predictions
- Data is under the [`funds`](/packages/functions/data/updateAccountFunds.js) node inside the default database
- Triggered by [`accountfunds_data`](/packages/notifications/onMessage.js) message sent from Predictit on `notifications` server

##### [`updateContractPrice.js`](/packages/functions/data/updateContractPrice.js)
- Updates realtime contract price [data](/packages/functions/data/updateContractPrice.js)
- Data is under the [`prices/{contract_id}/lastTrade`](/packages/functions/data/updateContractPrice.js) property in the default database
- Triggered by [`contractStats`](/packages/markets/onMessage.js) message sent from Predictit on `markets` server

##### [`updateMarket.js`](/packages/functions/data/updateMarket.js)
- Updates realtime information about [markets](/packages/functions/data/updateMarket.js):
  - market active
  - total trade volume
- Data is under the [`markets/{market_id}` nodes](/packages/functions/data/updateMarket.js) in the default database
- Triggered by [`marketStats`](/packages/markets/onMessage.js) message sent from Predictit on `markets` server

##### [`updateMarkets.js`](/packages/functions/data/updateMarkets.js)
- Updates [market](/packages/functions/data/updateMarkets.js) and [contract](/packages/functions/data/updateMarkets.js) metadata, as well as additional [price](/packages/functions/data/updateMarkets.js) data
  - Market data updated under the `markets/{market_id}` node:
    - id
    - url
    - name
    - short name
    - image
    - active
    - date end
    - days left
    - contract ids
  - Contract data updated under the `contracts/{contract_id}` node:
    - contract id
    - url
    - name
    - short name
    - market id
    - image
    - display order
  - Price data updated under the `prices/{contract_id}` node:
    - contract id
    - buy no
    - buy yes
    - sell no
    - sell yes
    - market
- Data is provided by the official Predictit public api, which is only updated once every 60 seconds and therefore is considered stale
  - Only metadata and non-critical price data is collected from this API
  - Data is only fetched [once every 60 seconds](/packages/functions/data/index.js)

##### [`updateTimespanData.js`](/packages/functions/data/updateTimespanData.js)
- 

#### 💾 DB

##### [`cleanupDatabase.js`](/packages/functions/db/cleanupDatabase.js)
- Utility function that is triggered [manually](/packages/functions/db/index.js) clean up databases

##### [`purgeMarkets.js`](/packages/functions/db/purgeMarkets.js)
- 

##### [`removeContractData.js`](/packages/functions/db/removeContractData.js)
- 

##### [`removeMarketData.js`](/packages/functions/db/removeMarketData.js)
- 

#### 🚧 WIP

##### [`updateOrderBook.js`](/packages/functions/data/updateOrderBook.js)
- ⚠️ **`WORK IN PROGRESS`**
- Updates the order book for all contracts
- Data is under the `orderBooks` node in the default database
- Data is provided by the unofficial Predicitit orderBook api (`https://predictit-f497e.firebaseio.com/contractOrderBook.json`)
- url is unauthenticated

##### [`updatePriceHistory.js`](/packages/functions/data/updatePriceHistory.js)
- ⚠️ sorta...**`WORK IN PROGRESS`**
- Tracks changes in `lastTrade` price of all contracts
- Responds to [writes](/packages/functions/data/index.js) to the [`prices/{contract_id}/lastTrade`](/packages/functions/data/index.js) property in the default database
- Updates the [`{contract_id}/{timestamp}`](/packages/functions/data/updatePriceHistory.js) property in the [`price-history`](/packages/functions/data/updatePriceHistory.js) database

##### [`updatePriceInterval.js`](/packages/functions/data/updatePriceInterval.js)
- ⚠️ sorta...**`WORK IN PROGRESS`**
- Tracks `lastTrade` price of all contracts at a consistent interval [(currently every 10 minutes)](/packages/functions/data/index.js)
- Uses data from `prices/{contract_id}/lastTrade` property in the default database
- Updates the `{contract_id}/{timestamp}` property in the `price-interval` database

##### [`updateTradeHistory.js`  ](/packages/functions/data/updateTradeHistory.js)
- Keeps a list of all trade data:
  - market id
  - contract id
  - cost
  - profit
  - fees
  - risk change
  - quantity
  - price
  - trade type
- Data is in the `trade-history` database
- Triggered by `tradeConfirmed_data` message sent from Predictit on `notifications` server
</p>
</details>

### • Databases Structure

<details>
  <summary>
    <strong>Expand / Collapse</strong>
  </summary>
  <p>

- Default Database (`default-rtdb`)
  - `contracts`
    - `{contract_id}`
      - `displayOrder`
      - `id`
      - `image`
      - `market`
      - `name`
      - `shortName`
      - `url`
  - `markets`
    - `{market_id}`
      - `active`
      - `id`
      - `image`
      - `name`
      - `shortName`
      - `url`
      - `contracts[]`
        - `{index}`: `{contract_id}`
  - `prices`
    - `{contract_id}`
        - `buyNo`
        - `buyYes`
        - `id`
        - `lastTrade`
        - `market`
        - `open`
        - `sellNo`
        - `sellYes`
  - `session` (some fields omitted)
    - `wssHost`
    - `username`
    - `eng_mt`
      - `numOfTimesMetricsSent`
      - `scrollDepth`
      - `sessionStartTime`
      - `timeOnSite`
      - `ver`
    - `token`
      - `value`
    - `tokenExpires`
    - `refreshToken`
    - `orderBooks`
    - `{contract_id}`
      - `_timestamp`
      - `_updateAt`
      - `noOrders[]`
        - `{index}`[]
          - `costPerShareNo`
          - `costPerShareYes`
          - `pricePerShare`
          - `quantity`
          - `tradeType`
      - yesOrders
        - `{index}`[]
          - `costPerShareNo`
          - `costPerShareYes`
          - `pricePerShare`
          - `quantity`
          - `tradeType`
    

- Price History (`price-history`)
  - `{contract_id}`
    - `{timestamp}`: `{price}`
    
- Price Interval(`price-interval`)
  - `{contract_id}`
    - `{timestamp}`: `{price}`

- Trade History (`trade-history`)
  - `{firebase_list_id}`
    - `contract`
    - `cost`
    - `fees`
    - `market`
    - `price`
    - `profit`
    - `quantity`
    - `riskChange`
    - `tradeType`

  </p>
</details>

## Misc. Notes

<details>
  <summary>
    <strong>Expand / Collapse</strong>
  </summary>
  <p>
  
For markets that are building towards a single event (e.g. an election w/ some uncertainty on a single date)
  - don't invest before and hold throughout the event
  - research and pick a position before
  – be willing to change your position as things change
  - ride the waves
  - settle into final position as things become more clear and concrete

> "For something like that, if you had 10k shares of a bracket at say 6c, you could sell 5k at 9c and effectively bring the cost of the remaining down to 3c (+ the 10% profit fee for the other half). Even better is to sell enough to free roll the rest. Have $100 that turns into $300? Sell half and secure profit no matter the outcome. Having your cake and potentially eating it too."

> "Your Risk in any contract is the sum of your profits and losses, across all contracts, should that contract resolve to 'Yes'. To work out this sum, add the 'If Yes' figure for the contract to the 'If No' figures for all other contracts."
> "Your Investment in the market as a whole is equal to your greatest Risk in any one contract. This is the amount PredcitIt debits from your account to cover your position."
> "Your Payout is the amount you would be credited if the contract resolves to Yes. It is the difference between your total Investment (greatest Risk) and the Risk in the winning contract."
> "Share Value corresponds to the face value of your position in each contract (shares multiplied by average purchase price). This value cannot exceed $850."

### Questions

1. what's the purpose of massive buy/sell "walls" in order books?
  1. are they there just to psych you out?
  1. who tf has that many shares to put up massive walls like that?
1. why does it always seem like someone sells right after I buy (I assume to bring down the last trade price)?
1. also, why does it seem like when you buy out all shares at a certain price, a few seconds later a few more shares (~100) pop up for sale at that same price again?
1. what's the point of leaving the breadcrumbs of sell offers in the orderbook? Is it to keep the price low or an attempt to trick someone into buying and driving the price up? or neither?

    >It’s called “painting the tape”.
    >
    >They want to print a higher or lower price to give the impression the contract is >moving in a certain direction.

### Indicators
- simple moving average
- rsi
- macd
  - short
  - mid
  - long
- point and figure charts
- momentum indicators
- stochastics indicators
- adx

### Utils

- time randomizer to make activities look more "human"
- datastore tracking the last timestamp an activity was run
  - purchase via automation
  - connect/login via headless browser
  - don't run function if timer is still active
- maintain "trading" hours so that automation's activity doesn't look suspicious or stand out

### Other

- alert for markets closing in less than 24 hours
- 🚫 compare 24 hour trend average price to 90 day trend -- are same?
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
- bot to sell of chucks of a large position as to not spook buyers

### API

#### predictit.org

- https://predictit-f497e.firebaseio.com/marketStats.json
- https://predictit-f497e.firebaseio.com/contractStats.json
- https://predictit-f497e.firebaseio.com/contractOrderBook/.json

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

  </p>
</details>


## Github / NPM

<details>
  <summary>
    <strong>Expand / Collapse</strong>
  </summary>
  <p>

### NPM Packages

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

### Github Repositories

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
  
  </p>
</details>



## 🪦 R.I.P.

<details>
  <summary>
    <strong>Expand / Collapse</strong>
  </summary>
  <p>

### Express Servers
* The `status` is there as the default Google App Engine service; it doesn't do anything noteworthy
* The notifications messages are sent from Predictit when:
  - Market is opened or closed
  - Site enters/exits maintenance mode
  - User sells shares, buys shares, deposits, withdraws
  - User opened new buy/sell order
  - User's open order in market is bought/sold
* The notifications connection is authenticated (messages are specific to authenticated user)

- automatically sign up for google alert based on new positions added
  - remove alerts when position is closed
  - https://www.npmjs.com/package/google-alerts-api
- Use tools to identify if price increase is natural or pump and dump
  - Google trends
  - Google search volume
  - Twitter search
    - https://github.com/twitterdev/tweet-search

##### [`updateContractPosition.js`](/packages/functions/data/updateContractPosition.js)
- ⚠️ **`WORK IN PROGRESS`**
- Updates all active contract position [data](/packages/functions/data/updateContractPosition.js):
  - market id
  - prediction (yes/no)
  - quantity
  - open buy orders
  - open sell orders
  - average price of owned shares
- Data is under the [`contractPositions`](/packages/functions/data/updateContractPosition.js) node in the default database
- Triggered by [`contractOwnershipUpdate_data`](/packages/notifications/onMessage.js) message sent from Predictit on `notifications` server

##### [`updateMarketPosition.js`](/packages/functions/data/updateMarketPosition.js)
- ⚠️ **`WORK IN PROGRESS`**
- Updates meta information about all active contract positions in a particular market
  - total investment
  - max payout
- Data is under the `marketPositions` node in the default database
- Triggered by `marketOwnershipUpdate_data` message sent from Predictit on `notifications` server

##### [`updateOpenOrders.js`](/packages/functions/data/updateOpenOrders.js)
- ⚠️ **`WORK IN PROGRESS`**
- Updates orders that have not been completely fulfilled yet
- Data is under the `openOrders` node in the default database
- Triggered by `tradeConfirmed_data` and `notification_shares_traded` messages sent from Predictit on `notifications` server

##### [`updatePriceOHLC.js`](/packages/functions/data/updatePriceOHLC.js)
- ⚠️ sorta...**`WORK IN PROGRESS`**
- Tracks "open", high, low, and "close" prices of all contracts at a consistent interval [(currently every 1 hour)](/packages/functions/data/index.js)
- Uses `lastTrade` and `open` property data from `prices/{contract_id}` nodes in the default database
- Updates the `{contract_id}/{timestamp}` node in the `price-ohlc` database

##### [`addCreatedAt.js`](/packages/functions/db/addCreatedAt.js)
- When a new contract or market is added under the [`contracts`](/packages/functions/db/index.js) or [`markets`](/packages/functions/db/index.js) node in the default database, this function adds a meta `_createdAt` property to the new node

##### [`deleteClosedMarkets.js`](/packages/functions/db/deleteClosedMarkets.js)
- [Scheduled](/packages/functions/db/index.js) function that is used to remove market, contract, price, and orderBook nodes from the database when a contract is removed from Predictit
- Helps prevent database from becoming large and increasing firebase costs

##### [`deleteStalePriceData.js`](/packages/functions/db/deleteStatePriceData.js)
- ⚠️ **`WORK IN PROGRESS`**
- [Scheduled](/packages/functions/db/index.js) function that is used to remove price data that is out of date
- Helps prevent database from becoming large and increasing firebase costs  

##### [`updateContractPrice.js`](/packages/functions/data/updateContractPrice.js)
- The data under the `prices` node is important because a number of other functions and databases depend on it:
  - [`updatePriceHistory.js`](/packages/functions/data/updatePriceHistory.js) and `price-history` database
  - [`updatePriceInterval.js`](/packages/functions/data/updatePriceInterval.js) and `price-interval` database
  - [`updatePriceOHLC.js`](/packages/functions/data/updatePriceOHLC.js) and `price-ohcl` database
  
  </p>
</details>



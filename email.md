<!--CODE
INSIGHTS
AUTOMATION
INFRASTRUCTURE
================-->

> Hey, sorry it's taken me a bit to get back to you. Also, sorry about the incoming wall of text.

The main purpose for my "app" has been to gain a competitive advantage over other traders, specifically in the realm of tooling. Since developer access to Predictit is pretty limited, the tooling that's built for the platform also tends to be pretty limited. My theory has been that if you can figure out how to programmatically access the same data that users get and build tooling and automation around that data, you could stand to make a decent amount of money without having to do very much work (beyond initial setup).

Obviously, the goals of my project may not align with the goals for your project. If you find nothing useful here or this ends up being way more than what you thought you were getting yourself into, that's fine. It's been a good exercise for me to try and summarize what I've been building. So without further ado...

The app is broken down into three parts:

## Express Servers

There are two express servers that each open up a single websocket connection with Predictit, one for realtime market/contract updates, one for for platform notifications. Both take care of opening up their connection with Predictit, reconnecting if the their link gets severed, and handling the receipt of messages pushed from Predictit. After parsing out the data from the received message, it's then sent to a firebase function for storage in our own realtime database. The servers are deployed to their own individual virtual machines on Google Compute Engine.

**Notes:**
* The market/contract messages are sent from Predictit when:
  - Market volume changes
  - Contract price changes
  - Contract order book changes (order is bought/sold/added/removed)
    - These messages aren't sent unless explicitly subscribed to (see below)
* The notifications messages are sent from Predictit when:
  - Market is opened or closed
  - Site enters/exits maintenance mode
  - User sells shares, buys shares, deposits, withdraws
  - User opened new buy/sell order
  - User's open order in market is bought/sold
* Messages that can be sent to Predictit include:
  - Asking Predictit to start/stop sending message for a specific order book's changes
* The market/contract websocket connection is unauthenticated
* The notifications connection is authenticated (messages are specific to authenticated user)

## Firebase Functions
There's a suite of firebase serverless functions that are used for performing different actions throughout the app. These actions can be triggered by changes to the database, on a schedule, explicitly called from somewhere within the app, or manually through an http request. As of right now actions are grouped by: alerts, browser, data, db and stats.

### 🚨 Alerts
`contractsUpdated.js`
- Sends an sms when a contract is added to a market

`marketAdded.js`
- Sends an sms when new market is created

`marketClosing.js`
- Sends an sms when a market is closing in the next 24 hours

### 🌎 Browser
`createSession.js`
- Uses [puppeteer](https://github.com/puppeteer/puppeteer) to login to the site and store the `localStorage` session data to the database
- The session data can then be used to turn a future unauthenticated puppeteer instance into an authenticated one without the extra step of entering in credentials
- This is important because without it, if you are using puppeteer to perform 100's of automated actions through out the day, it will also create 100's of new authenticated sessions which is likely to arouse suspicion
- The session data includes the current websocket url used to connect to the Predictit market/contract websocket used mentioned above
- This function is scheduled to run automatically once a day in order to keep session data fresh.

`getServerStatus.js`
- Returns json with current status of websocket connection
- Available routes: 
  - `/markets`
  - `/notifications` 
    
**Notes**
- This technology can be used to automate buying and selling, which is a key part of how this whole system makes money
- Automation of anything is against Predictit's ToS and may get you a warning or even even banned (if you get caught)
- Headless automation is preferred over using the internal "private" api (`https://www.predictit.org/api`) because activity looks like it's coming from a real user, which can be further improved by using [puppeteer-extra](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra)

### 📊 Data
* Store data to db
* Format data
* Fetch data on a schedule
* Respond to data changing somewhere else
  
`updateAccountFunds.js`  
`updateContractPosition.js`  
`updateContractPrice.js`  
`updateMarket.js`  
`updateMarketPosition.js`  
`updateMarkets.js`  
`updateOpenOrders.js`  
`updateOrderBook.js`  
`updatePriceHistory.js`  
`updatePriceInterval.js`  
`updatePriceOHLC.js`  
`updateTradeHistory.js`  

### 💾 DB
* common database utils (add "_createdAt"),
* database cleanup,
* deleting inactive nodes
  
`addCreatedAt.js`  
`cleanupDatabase.js`  
`deleteClosedMarkets.js`  
`deleteStalePriceData.js`  

**Notes:**
* Hosted on Firebase

## Frontend
  - Haven't spent much time on
  - Visualize some of the non-standard database
  - Chart technical indicators and stats
  - Next.js app hosted on firebase hosting

const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = require('puppeteer-extra').use(stealthPlugin());

const log = require('@services/logger');
const { was } = require('@services/utils');
const firebase = require('@services/firebase');

const config = firebase.config('predictit');

const throwBackoffError = (lastRan) => {
  const timeSince = Date.now() - lastRan.getTime();
  const timeLeft = (5 * 60 * 1000 - timeSince) / 1000 + ` seconds`;
  const data = { timeLeft, lastRan };
  const code = 'resource-exhausted';
  const message = `createSession run less than 5 minutes ago`;
  const messageTimes = `(timeLeft: ${timeLeft} lastRan: ${lastRan.toLocaleTimeString()})`;

  log.debug(`${message} ${messageTimes}`);

  throw new firebase.HttpsError(code, message, data);
};

const checkLastRan = async () => {
  try {
    const _lastRan = await firebase.db.get('session/_lastRan');
    const lastRan = new Date(_lastRan);

    if (was(lastRan).under('5 minutes ago')) {
      throwBackoffError(lastRan);
    }

    await firebase.db.set('session', { _lastRan: Date.now() });
  } catch (error) {
    throw error;
  }
};

const createNewBrowser = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: true,
  });

  return browser;
};

const createNewSession = async (browser = createNewBrowser(), attempt = 0) => {
  browser = await browser;
  const page = await browser.newPage();

  try {
    await page.goto(`https://predictit.org`);
    await page.waitForSelector('#login');
    await page.click('#login');
    await page.waitForSelector('#username');
    await page.waitForSelector('#password');
    await page.waitForTimeout(500);
    await page.type('#username', config.username);
    await page.type('#password', config.password);
    await page.$('#password').then((input) => input.press('Enter'));
    await page.waitForTimeout(10000);

    console.log('made it to checkpoint 1');

    const localStorage = await page.evaluate(() => ({
      ...window.localStorage,
    }));

    console.log('localStorage', localStorage);

    return { browser, page, localStorage };
  } catch (error) {
    await page.close();
    await browser.close();
    throw error;
  }
};

const parseSession = async ({ browser, page, localStorage }) => {
  const wssHostKey = 'firebase:host:predictit-f497e.firebaseio.com';
  const wssHost = JSON.parse(localStorage[wssHostKey] || null);
  console.log('wssHostKey', wssHostKey);
  console.log('wssHost', wssHost);

  if (!wssHost) {
    console.log('crash and burn!');
    return localStorage;
  } else {
    delete localStorage[wssHostKey];

    // may want to do something with these later...
    await page.close();
    await browser.close();

    console.log('made it to checkpoint 2');

    return {
      wssHost,
      username: config.username,
      token: JSON.parse(localStorage.token || null),
    };
  }
};

module.exports = async (data, res) => {
  try {
    const update = await checkLastRan()
      .then(createNewSession)
      .then(parseSession);

    console.log('update', update);

    firebase.db.set('session', update);

    return update;
  } catch (error) {
    firebase.logger.error(error.message);
  } finally {
    if (res && res.sendStatus) {
      res.sendStatus(200);
    }
  }
};

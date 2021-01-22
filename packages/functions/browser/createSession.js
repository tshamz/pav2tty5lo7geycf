const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

const log = require('@services/logger');
const utils = require('@services/utils');
const firebase = require('@services/firebase');
const config = firebase.config('predictit');
const was = utils.was;

puppeteer.use(stealthPlugin());

module.exports = async (...args) => {
  let page = null;
  let browser = null;

  const res = args[1];

  try {
    const _timestamp = Date.now();
    const _updatedAt = new Date().toUTCString();
    const lastRan = new Date(await firebase.db.get('session/_updatedAt'));

    if (was(lastRan).under('5 minutes ago')) {
      const now = _timestamp;
      const secondsRemaining =  (5 * 60) - (now - lastRan.getTime()) / 1000;
      const code = 'resource-exhausted';
      const message = `createSession run less than 5 minutes ago (${secondsRemaining} seconds remaining)`;
      throw new firebase.HttpsError(code, message);
    }


    await firebase.db.set('session', { _timestamp, _updatedAt });

    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    page = await browser.newPage();

    await page.goto(`https://predictit.org`);
    await page.waitForSelector('#login');
    await page.click('#login');
    await page.waitForSelector('#username');
    await page.waitForSelector('#password');
    await page.waitForTimeout(500);
    await page.type('#username', config.username);
    await page.type('#password', config.password);
    await page.$('#password').then((input) => input.press('Enter'));
    await page.waitForTimeout(1500);

    const data = await page.evaluate(() => ({ ...window.localStorage }));
    const wssHostKey = 'firebase:host:predictit-f497e.firebaseio.com';
    const wssHost = JSON.parse(data[wssHostKey] || null);

    delete data[wssHostKey];

    const update = {
      ...data,
      wssHost,
      username: config.username,
      token: JSON.parse(data.token),
      refreshToken: JSON.parse(data.refreshToken),
      tokenExpires: JSON.parse(data.tokenExpires),
      browseHeaders: JSON.parse(data.browseHeaders),
      eng_mt: JSON.parse(data.eng_mt),
      _timestamp: Date.now(),
      _updatedAt: new Date().toUTCString(),
    };

    await firebase.db.set('session', update);

    return update;
  } catch (error) {
    log.error(error);

    throw error;
  } finally {
    if (page) {
      await page.close();
    }

    if (browser) {
      await browser.close();
    }

    if (res && res.json) {
      res.status(200).send();
    }
  }
};

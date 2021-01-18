const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

const log = require('@local/services/logger');
const utils = require('@local/services/utils');
const admin = require('@local/services/firebase');

puppeteer.use(stealthPlugin());

const was = utils.was;

module.exports = async (...args) => {
  let browser = null;
  const res = args[1];

  try {
    const lastRan = await admin.getPath({ path: 'session/_updatedAt' });

    if (was(lastRan).under('5 minutes ago')) {
      log.debug('createSession run less than 5 minutes ago');
      throw new Error('createSession run less than 5 minutes ago');
    }

    browser = await puppeteer.launch({ args: ['--no-sandbox'] });

    const _timestamp = Date.now();
    const _updatedAt = new Date().toUTCString();

    await admin.setPath('session')({ _timestamp, _updatedAt });

    const page = await browser.newPage();
    const config = admin.config().predictit;
    const wssHostKey = 'firebase:host:predictit-f497e.firebaseio.com';
    const username = config.username.replace(/\"/g, '');

    await page.goto(`https://predictit.org`);
    await page.waitForSelector('#login');
    await page.click('#login');
    await Promise.all([
      page.waitForSelector('#username'),
      page.waitForSelector('#password'),
    ]);
    await page.waitForTimeout(500);

    await page.type('#username', config.username);
    await page.type('#password', config.password);
    await page.$('#password').then((input) => input.press('Enter'));
    await page.waitForTimeout(1500);

    const data = await page.evaluate(() => ({ ...window.localStorage }));
    const wssHost = JSON.parse(data[wssHostKey] || null);

    delete data[wssHostKey];

    const update = {
      ...data,
      wssHost,
      username,
      _timestamp,
      _updatedAt,
    };

    await admin.setPath('session')(update);
    await page.close();
    await browser.close();

    if (res && res.json) {
      res.json(update);
    }

    return update;
  } catch (error) {
    log.error(error);

    if (browser) {
      await browser.close();
    }

    if (res && res.status) {
      res.status(500).send();
    }

    throw error;
  }
};

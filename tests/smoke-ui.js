const puppeteer = require('puppeteer-core');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setBypassServiceWorker(true);
  const errors = [];

  page.on('pageerror', err => errors.push(`PAGEERROR: ${err.message}`));
  page.on('requestfailed', req => {
    const failure = req.failure();
    if (failure && !req.url().includes('favicon.ico')) {
      errors.push(`REQFAIL: ${req.url()} ${failure.errorText}`);
    }
  });

  await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('#btn-start', { timeout: 5000 });

  await page.click('.class-btn[data-class="mage"]');
  await page.select('#skin-options', 'valor');
  await page.select('#background-options', 'lava');
  await page.click('#btn-roguelike-toggle');
  await page.type('#player-name', 'Diana');
  await page.click('#btn-start');

  await page.waitForFunction(
    () => document.querySelector('.screen.active')?.id === 'battle-screen',
    { timeout: 8000 }
  );

  const result = await page.evaluate(() => ({
    activeScreen: document.querySelector('.screen.active')?.id,
    warriorName: document.getElementById('warrior-name')?.textContent || '',
    skinName: document.getElementById('warrior-skin-name')?.textContent || '',
  }));

  await browser.close();

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  if (result.activeScreen !== 'battle-screen') {
    console.error(`Unexpected screen: ${result.activeScreen}`);
    process.exit(1);
  }

  console.log('Smoke UI OK', result);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});

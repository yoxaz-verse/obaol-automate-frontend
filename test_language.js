const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();

    // Listen to console and page errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Get the default language
    console.log('Waiting for translation script to load...');
    await delay(2000);

    // Click the dropdown
    console.log('Clicking the language dropdown...');

    const button = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const langBtn = btns.find(b => b.textContent && (b.textContent.includes('English') || b.textContent.includes('Language')));
        if (langBtn) {
            langBtn.click();
            return true;
        }
        return false;
    });

    if (!button) {
        console.log('Could not find language dropdown button.');
        await browser.close();
        return;
    }

    console.log('Waiting for popover...');
    await delay(1000);

    // Click Spanish
    console.log('Clicking Spanish...');
    const clicked = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('li[role="option"]'));
        const esItem = items.find(i => i.textContent && i.textContent.includes('Spanish'));
        if (esItem) {
            esItem.click();
            return true;
        }
        return false;
    });

    if (!clicked) {
        console.log('Could not find Spanish option.');
    }

    console.log('Waiting to observe behavior...');
    await delay(5000);

    console.log('Test completed.');
    await browser.close();
})();

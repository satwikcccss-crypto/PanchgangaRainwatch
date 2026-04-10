import puppeteer from 'puppeteer';
import handler from 'serve-handler';
import http from 'http';

const server = http.createServer((request, response) => {
  return handler(request, response, { public: 'dist' });
});

server.listen(8080, async () => {
  console.log('Running at http://localhost:8080');
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
    
    await browser.close();
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
    process.exit();
  }
});

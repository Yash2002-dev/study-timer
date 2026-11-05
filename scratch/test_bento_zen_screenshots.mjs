import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('🚀 Launching Chrome for Bento UI & Zen Mode verification...');
  const profileDir = `C:\\Users\\dewan\\AppData\\Local\\Temp\\chrome-bento-${Date.now()}`;
  const screenshotsDir = 'C:\\Users\\dewan\\Documents\\Antigravity Projects\\study-timer';

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--disable-gpu',
    'http://localhost:5173/'
  ], { detached: true });

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      targets = await getJson('http://127.0.0.1:9222/json/list');
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  if (!targets || targets.length === 0) {
    throw new Error('Chrome did not open remote debugging port in time');
  }

  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('localhost:5173')) || targets[0];
  console.log(`Connected to target page: ${pageTarget.title} (${pageTarget.url})`);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.onopen = resolve);

  let idCounter = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  const evalCode = async (expr) => {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res.result?.value;
  };

  const captureScreenshot = async (filename) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const filePath = path.join(screenshotsDir, filename);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`📸 Screenshot saved: ${filename} (${(res.data.length / 1024).toFixed(1)} KB)`);
    return filePath;
  };

  await send('Runtime.enable');
  await send('Page.enable');

  // Set Desktop Viewport (1280x850)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await sleep(1500);

  console.log('\n--- Test 1: Desktop Bento Grid Components & SVG Dial Verification ---');
  const dialSvg = await evalCode('document.querySelector("svg circle[stroke-dasharray]") !== null');
  console.log(`SVG Circular Progress Dial present: ${dialSvg}`);
  if (!dialSvg) throw new Error('SVG Progress Dial not found!');

  const bentoTiles = await evalCode('document.querySelectorAll("section").length');
  console.log(`Bento Section Tiles found: ${bentoTiles}`);
  if (bentoTiles < 3) throw new Error(`Expected at least 3 bento tiles, found ${bentoTiles}`);

  // Test Tag Switching
  console.log('\n--- Test 2: Task Session Tag Switching ---');
  await evalCode(`
    (() => {
      const codeTagBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Coding'));
      codeTagBtn?.click();
    })()
  `);
  await sleep(400);

  const dialActiveTag = await evalCode(`
    document.querySelector('.truncate')?.textContent?.trim()
  `);
  console.log(`Dial active tag after click: "${dialActiveTag}"`);

  // Start the timer to verify circular SVG progress animation
  console.log('\n--- Test 3: Running Timer & SVG Stroke Animation ---');
  await evalCode(`
    (() => {
      const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Start'));
      startBtn?.click();
    })()
  `);
  await sleep(2500);

  const strokeOffset = await evalCode(`
    parseFloat(document.querySelectorAll('svg circle')[1]?.style.strokeDashoffset || 0)
  `);
  console.log(`SVG circle strokeDashoffset while running: ${strokeOffset.toFixed(2)}`);

  // Take Desktop Bento Grid Screenshot
  await captureScreenshot('screenshot_desktop_bento.png');

  // Test Zen Mode
  console.log('\n--- Test 4: Zen Mode Transition via "F" Hotkey ---');
  await evalCode(`
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }));
  `);
  await sleep(800);

  const zenVisible = await evalCode('document.querySelector(".fixed.inset-0") !== null');
  console.log(`Zen Mode overlay visible: ${zenVisible}`);
  if (!zenVisible) throw new Error('Zen Mode overlay did not open on "F" hotkey!');

  // Take Zen Mode Screenshot
  await captureScreenshot('screenshot_zen_mode.png');

  // Exit Zen Mode via Esc
  console.log('\n--- Test 5: Exit Zen Mode via Escape ---');
  await evalCode(`
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  `);
  await sleep(600);
  const zenClosed = await evalCode('document.querySelector(".fixed.inset-0") === null');
  console.log(`Zen Mode overlay closed: ${zenClosed}`);
  if (!zenClosed) throw new Error('Zen Mode overlay did not close on Escape!');

  // Test Mobile Viewport (390x844 - iPhone 14 / Mobile standard)
  console.log('\n--- Test 6: Mobile Responsive Layout Verification ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(1000);

  const horizontalOverflow = await evalCode(`
    document.documentElement.scrollWidth > window.innerWidth
  `);
  console.log(`Horizontal overflow on mobile (should be false): ${horizontalOverflow}`);
  if (horizontalOverflow) {
    throw new Error('Detected horizontal layout overflow on mobile viewport!');
  }

  // Take Mobile Layout Screenshot
  await captureScreenshot('screenshot_mobile_bento.png');

  console.log('\n🎉 ALL BENTO UI & ZEN MODE TESTS & SCREENSHOTS PASSED!');

  ws.close();
  try {
    process.kill(chrome.pid);
  } catch (e) {}
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});


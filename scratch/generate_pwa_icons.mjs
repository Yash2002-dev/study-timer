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

async function generateIcons() {
  console.log('🖼️ Generating High-Contrast PWA PNG Icons from SVG via Headless Chrome...');
  const publicDir = 'C:\\Users\\dewan\\Documents\\Antigravity Projects\\study-timer\\public';
  const profileDir = `C:\\Users\\dewan\\AppData\\Local\\Temp\\chrome-icons-${Date.now()}`;

  const iconSvgPath = path.join(publicDir, 'icon.svg');
  const maskableSvgPath = path.join(publicDir, 'maskable-icon.svg');

  const iconSvgUrl = 'file:///' + iconSvgPath.replace(/\\/g, '/');
  const maskableSvgUrl = 'file:///' + maskableSvgPath.replace(/\\/g, '/');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--disable-gpu',
    'about:blank'
  ], { detached: true });

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      targets = await getJson('http://127.0.0.1:9222/json/list');
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  if (!targets || targets.length === 0) {
    throw new Error('Chrome did not launch with port 9222');
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
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

  await send('Page.enable');
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 10, g: 10, b: 12, a: 1 } });

  // 1. Generate 512x512 standard icon
  console.log('Rendering 512x512 standard icon...');
  await send('Page.navigate', { url: iconSvgUrl });
  await sleep(600);
  await send('Emulation.setDeviceMetricsOverride', { width: 512, height: 512, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  const shot512 = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 512, height: 512, scale: 1 } });
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), Buffer.from(shot512.data, 'base64'));

  // 2. Generate 192x192 standard icon
  console.log('Rendering 192x192 standard icon...');
  await send('Emulation.setDeviceMetricsOverride', { width: 192, height: 192, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  const shot192 = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 192, height: 192, scale: 1 } });
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), Buffer.from(shot192.data, 'base64'));

  // 3. Generate 180x180 apple-touch-icon
  console.log('Rendering 180x180 apple-touch-icon...');
  await send('Emulation.setDeviceMetricsOverride', { width: 180, height: 180, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  const shot180 = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 180, height: 180, scale: 1 } });
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), Buffer.from(shot180.data, 'base64'));

  // 4. Generate 512x512 maskable icon
  console.log('Rendering 512x512 maskable adaptive icon...');
  await send('Page.navigate', { url: maskableSvgUrl });
  await sleep(600);
  await send('Emulation.setDeviceMetricsOverride', { width: 512, height: 512, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  const shotMask = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 512, height: 512, scale: 1 } });
  fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), Buffer.from(shotMask.data, 'base64'));

  console.log('✅ All PWA Icons generated successfully in public/ directory:');
  console.log('   - public/icon.svg');
  console.log('   - public/pwa-192x192.png');
  console.log('   - public/pwa-512x512.png');
  console.log('   - public/apple-touch-icon.png');
  console.log('   - public/maskable-icon-512x512.png');

  ws.close();
  try {
    process.kill(chrome.pid);
  } catch (e) {}
}

generateIcons().catch((err) => {
  console.error('❌ Failed to generate icons:', err);
  process.exit(1);
});


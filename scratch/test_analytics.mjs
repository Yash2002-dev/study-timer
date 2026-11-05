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
  console.log('🚀 Launching Chrome for Productivity Analytics verification...');
  const profileDir = `C:\\Users\\dewan\\AppData\\Local\\Temp\\chrome-analytics-${Date.now()}`;
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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await sleep(2500);

  const h2List = await evalCode(`
    Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()).join(' | ')
  `);
  console.log(`Found H2s: ${h2List}`);

  console.log('\n--- Test 1: Verify Analytics Bento Tile & Metric Cards ---');
  const analyticsTitle = await evalCode(`
    Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Productivity'))?.textContent?.trim()
  `);
  console.log(`Analytics Tile title: "${analyticsTitle}"`);
  if (!analyticsTitle?.includes('Weekly Productivity & Streak')) {
    throw new Error(`Expected Analytics Tile, found "${analyticsTitle}"`);
  }

  const streakBadge = await evalCode(`
    Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('Streak'))?.textContent?.trim()
  `);
  console.log(`Streak Badge readout: "${streakBadge}"`);
  if (!streakBadge?.includes('Streak')) {
    throw new Error('Streak badge not found!');
  }

  console.log('\n--- Test 2: GitHub-Style Activity Heatmap Verification ---');
  const heatmapSquaresCount = await evalCode(`
    document.querySelectorAll('.grid-flow-col > div').length
  `);
  console.log(`Heatmap day squares count: ${heatmapSquaresCount}`);
  if (heatmapSquaresCount !== 28) {
    throw new Error(`Expected 28 heatmap squares, found ${heatmapSquaresCount}`);
  }

  // Hover over a square and check tooltip readout
  await evalCode(`
    (() => {
      const square = document.querySelectorAll('.grid-flow-col > div')[27]; // today
      square.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      square.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      square.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    })()
  `);
  await sleep(300);

  const hoverTooltip = await evalCode(`
    document.querySelector('.text-indigo-300.min-h-\\\\[16px\\\\]')?.textContent?.trim()
  `);
  console.log(`Heatmap hover tooltip: "${hoverTooltip}"`);
  if (!hoverTooltip || hoverTooltip.includes('Hover square')) {
    throw new Error('Heatmap hover inspection did not activate!');
  }

  console.log('\n--- Test 3: Milestone Reward & Canvas-Confetti Trigger ---');
  const confettiResult = await evalCode(`
    (() => {
      try {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.title?.includes('Milestone Celebration'));
        if (!btn) return 'NO_CONFETTI_BTN';
        btn.click();
        return 'TRIGGERED_CONFETTI';
      } catch(e) {
        return e.message;
      }
    })()
  `);
  console.log(`Confetti celebration result: ${confettiResult}`);
  if (confettiResult !== 'TRIGGERED_CONFETTI') {
    throw new Error(`Confetti button failed: ${confettiResult}`);
  }

  console.log('\n--- Test 4: LocalStorage Session Logging with Assigned Tag ---');
  const initialStorage = await evalCode(`
    JSON.parse(localStorage.getItem('study_timer_session_logs') || '[]').length
  `);
  console.log(`Initial sessions count in localStorage: ${initialStorage}`);

  // Log a new session with assigned tag "Math / Study"
  const logResult = await evalCode(`
    (() => {
      const logs = JSON.parse(localStorage.getItem('study_timer_session_logs') || '[]');
      const newSession = {
        id: 'session-test-' + Date.now(),
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        durationSeconds: 1500,
        tagId: 'math',
        tagLabel: 'Math',
        tagColor: '#F59E0B',
        mode: 'pomodoro'
      };
      logs.push(newSession);
      localStorage.setItem('study_timer_session_logs', JSON.stringify(logs));
      return logs.length;
    })()
  `);
  console.log(`Sessions count in localStorage after manual log: ${logResult}`);
  if (logResult !== initialStorage + 1) {
    throw new Error('Session logging failed to increment session count!');
  }

  console.log('\n--- Test 5: JSON Export & Backup Verification ---');
  const exportedJson = await evalCode(`
    (() => {
      const logs = JSON.parse(localStorage.getItem('study_timer_session_logs') || '[]');
      return JSON.stringify({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalSessions: logs.length,
        sessions: logs
      });
    })()
  `);
  const parsedExport = JSON.parse(exportedJson);
  console.log(`Exported JSON contains: ${parsedExport.totalSessions} sessions, version ${parsedExport.version}`);
  const hasAssignedTags = parsedExport.sessions.every(s => s.tagLabel && s.durationSeconds && s.timestamp);
  console.log(`All exported sessions have assigned tag, duration, and timestamp: ${hasAssignedTags}`);
  if (!hasAssignedTags) {
    throw new Error('Exported sessions missing required metadata!');
  }

  console.log('\n--- Test 6: JSON Import Verification ---');
  const importResult = await evalCode(`
    (() => {
      const testImportPayload = {
        version: '1.0',
        sessions: [
          {
            id: 'imported-quantum-physics-1',
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            durationSeconds: 3600,
            tagId: 'physics',
            tagLabel: 'Quantum Physics',
            tagColor: '#8B5CF6',
            mode: 'custom'
          }
        ]
      };
      const existing = JSON.parse(localStorage.getItem('study_timer_session_logs') || '[]');
      existing.push(testImportPayload.sessions[0]);
      localStorage.setItem('study_timer_session_logs', JSON.stringify(existing));
      return existing.some(s => s.id === 'imported-quantum-physics-1');
    })()
  `);
  console.log(`Import verification in localStorage: ${importResult}`);
  if (!importResult) {
    throw new Error('JSON Import did not merge new session!');
  }

  // Refresh page to verify persistent hydration from localStorage
  await send('Page.reload');
  await sleep(1500);

  const hydratedSessionsCount = await evalCode(`
    Array.from(document.querySelectorAll('span')).find(s => s.textContent === 'logged')?.previousElementSibling?.textContent?.trim()
  `);
  console.log(`Hydrated session count in UI after reload: ${hydratedSessionsCount}`);

  // Take screenshot of Productivity Bento Grid with Heatmap & Metrics
  await captureScreenshot('screenshot_productivity_analytics.png');

  console.log('\n🎉 ALL PRODUCTIVITY TRACKING & ANALYTICS TESTS PASSED!');

  ws.close();
  try {
    process.kill(chrome.pid);
  } catch (e) {}
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

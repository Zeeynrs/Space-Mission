import { spawn } from 'child_process';
import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function runSmokeTest() {
  console.log('[SMOKE TEST] Launching Vite preview server on port 4173...');
  const isWindows = process.platform === 'win32';
  const previewProcess = spawn(isWindows ? 'npx.cmd' : 'npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    stdio: 'pipe',
    shell: true,
  });

  let serverReady = false;
  previewProcess.stdout.on('data', (d) => {
    const str = d.toString();
    if (str.includes('http://localhost:4173') || str.includes('Local:')) {
      serverReady = true;
    }
  });

  // Wait for server to start
  for (let i = 0; i < 20; i++) {
    if (serverReady) break;
    await new Promise((r) => setTimeout(r, 500));
  }

  try {
    console.log('[SMOKE TEST] Testing HTTP GET / ...');
    const indexRes = await get('http://localhost:4173/');
    if (indexRes.statusCode !== 200) {
      throw new Error(`Expected status 200 for index.html, got ${indexRes.statusCode}`);
    }
    if (!indexRes.body.includes('<div id="root">')) {
      throw new Error('index.html is missing root div container');
    }
    console.log('  ✓ index.html loaded successfully (HTTP 200, root container present)');

    // Extract JS and CSS asset URLs
    const jsMatch = indexRes.body.match(/src="(\/assets\/[^"]+\.js)"/);
    const cssMatch = indexRes.body.match(/href="(\/assets\/[^"]+\.css)"/);

    if (!jsMatch) throw new Error('Could not locate JS bundle in index.html');
    if (!cssMatch) throw new Error('Could not locate CSS bundle in index.html');

    console.log(`[SMOKE TEST] Verifying JS bundle: ${jsMatch[1]} ...`);
    const jsRes = await get(`http://localhost:4173${jsMatch[1]}`);
    if (jsRes.statusCode !== 200) {
      throw new Error(`JS bundle returned HTTP ${jsRes.statusCode}`);
    }
    if (jsRes.body.length < 500000) {
      throw new Error(`JS bundle appears too small (${jsRes.body.length} bytes)`);
    }
    console.log(`  ✓ JS bundle verified (HTTP 200, ${(jsRes.body.length / 1024).toFixed(1)} KB)`);

    console.log(`[SMOKE TEST] Verifying CSS bundle: ${cssMatch[1]} ...`);
    const cssRes = await get(`http://localhost:4173${cssMatch[1]}`);
    if (cssRes.statusCode !== 200) {
      throw new Error(`CSS bundle returned HTTP ${cssRes.statusCode}`);
    }
    if (cssRes.body.length < 5000) {
      throw new Error(`CSS bundle appears too small (${cssRes.body.length} bytes)`);
    }
    console.log(`  ✓ CSS bundle verified (HTTP 200, ${(cssRes.body.length / 1024).toFixed(1)} KB)`);

    console.log('\n========================================');
    console.log('🚀 BROWSER SMOKE TEST PASSED: ALL PRODUCTION ASSETS VALID');
    console.log('========================================');
  } finally {
    if (isWindows && previewProcess.pid) {
      try {
        spawn('taskkill', ['/pid', previewProcess.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
      } catch {
        previewProcess.kill();
      }
    } else {
      previewProcess.kill();
    }
  }
}

runSmokeTest()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Smoke test failed:', err);
    process.exit(1);
  });

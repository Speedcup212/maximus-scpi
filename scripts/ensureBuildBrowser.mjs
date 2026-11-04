// Reuse a working Puppeteer browser; download only when none is configured.
// Always launch the browser: an environment flag alone is never proof of readiness.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import puppeteer from 'puppeteer';
const options={headless:true,args:['--no-sandbox','--disable-dev-shm-usage']};
const explicit=process.env.PUPPETEER_EXECUTABLE_PATH;
if(explicit&&!fs.existsSync(explicit))throw Error('Configured Chromium executable does not exist');
if(!explicit&&!fs.existsSync(puppeteer.executablePath())) {
 execFileSync(process.execPath,['node_modules/puppeteer/lib/cjs/puppeteer/node/cli.js','browsers','install','chrome'],{stdio:'inherit'});
}
const browser=await puppeteer.launch(options);
try {console.log('[build browser] Ready:',await browser.version())}
finally {await browser.close()}

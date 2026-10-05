import { execSync } from 'node:child_process';

const branch = process.env.BRANCH || '';
const commitRef = process.env.COMMIT_REF || 'HEAD';
const releaseToken = /\[(deploy|release|hotfix)\]|DEPLOY_NOW/i;

let message = '';
try {
  message = execSync(`git log -1 --pretty=%B "${commitRef}"`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
} catch {
  // Fail open: if Git metadata is unexpectedly unavailable, do not block a legitimate build.
  console.log('[netlify-ignore] Unable to read commit message; build allowed.');
  process.exit(1);
}

if (branch !== 'main') {
  console.log(`[netlify-ignore] ${branch || 'non-main'}: preview/branch build allowed.`);
  process.exit(1);
}

if (releaseToken.test(message)) {
  console.log('[netlify-ignore] Explicit production release token found; build allowed.');
  process.exit(1);
}

console.log('[netlify-ignore] Production build skipped. Batch validated changes, then publish with [deploy], [release], [hotfix] or DEPLOY_NOW in the commit message.');
process.exit(0);

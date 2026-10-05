import { execSync } from 'node:child_process';

const branch = process.env.BRANCH || '';
const commitRef = process.env.COMMIT_REF || 'HEAD';
const productionToken = /\[(deploy|release|hotfix)\]|DEPLOY_NOW/i;
const previewToken = /\[(preview|deploy-preview)\]|PREVIEW_NOW/i;

let message = '';
try {
  message = execSync(`git log -1 --pretty=%B "${commitRef}"`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
} catch {
  // Fail closed during Recovery: Git metadata missing must not trigger a paid build by accident.
  console.log('[netlify-ignore] Unable to read commit message; build skipped for safety.');
  process.exit(0);
}

if (branch !== 'main') {
  if (previewToken.test(message)) {
    console.log('[netlify-ignore] Explicit preview token found; branch/preview build allowed.');
    process.exit(1);
  }
  console.log(`[netlify-ignore] ${branch || 'non-main'}: branch/preview build skipped. Use [preview], [deploy-preview] or PREVIEW_NOW explicitly.`);
  process.exit(0);
}

if (productionToken.test(message)) {
  console.log('[netlify-ignore] Explicit production release token found; build allowed.');
  process.exit(1);
}

console.log('[netlify-ignore] Production build skipped. Publish only with [deploy], [release], [hotfix] or DEPLOY_NOW in the commit message.');
process.exit(0);

# Netlify release triggers — MaximusSCPI

The site intentionally uses `netlify.toml` → `[build] ignore = "node ./scripts/netlify-ignore.mjs"`.
This ignore script skips otherwise valid commits without explicit commit-message tokens:

- **PR/branch preview**: `[preview]`, `[deploy-preview]` or `PREVIEW_NOW`
- **Production (`main`)**: `[deploy]`, `[release]`, `[hotfix]` or `DEPLOY_NOW`

A Netlify `Canceled` deploy with the ignore-script message is **not a failed source build**.
Check GitHub Actions separately for actual compilation and browser-test failures.

A trigger token grants **a build only**. It does not certify financial data,
authorize promotion of candidate funds, or change the public certified cohort.
For BNP candidates 67–68, no publication is permitted until source,
risk, independent QA, browser, final approval and production read-back checks pass.

This document accompanies a one-time explicit **preview** trigger; it does
not trigger a production deploy and does not relax the ignore-script policy.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import yaml from 'js-yaml';

// GitHub refuses duplicate mapping keys before any job can run. Keep this
// check in the separate mandatory build, not only in the workflow it checks.
test('reject duplicate artifact settings even when their values are identical', () => {
  assert.throws(() => yaml.load('with:\n  retention-days: 14\n  retention-days: 14\n'), /duplicated mapping key/);
  assert.throws(() => yaml.load('with:\n  if-no-files-found: warn\n  if-no-files-found: warn\n'), /duplicated mapping key/);
});

for (const file of fs.readdirSync(new URL('../../.github/workflows/', import.meta.url)).filter(f => /\.ya?ml$/.test(f))) {
  test(`workflow parses without duplicate keys: ${file}`, () => {
    const workflow = yaml.load(fs.readFileSync(new URL(`../../.github/workflows/${file}`, import.meta.url), 'utf8'));
    assert.ok(workflow.on && typeof workflow.on === 'object', 'Workflow needs triggers');
    assert.ok(workflow.jobs && Object.keys(workflow.jobs).length, 'Workflow needs jobs');
  });
}

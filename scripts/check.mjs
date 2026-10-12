import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../image-format-saver/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.version, pkg.version);
assert.ok(manifest.description.length <= 132);
assert.deepEqual(manifest.permissions, ['contextMenus', 'downloads', 'storage', 'offscreen']);
const references = new Set([
  manifest.background.service_worker, manifest.action.default_popup,
  ...Object.values(manifest.icons), ...Object.values(manifest.action.default_icon),
  'popup.js', 'popup.css', 'offscreen.js', 'offscreen.html'
]);
for (const file of references) {
  const path = new URL(file, root);
  assert.ok(existsSync(path), `Missing extension file: ${file}`);
  if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', fileURLToPath(path)]);
  if (file.endsWith('.png')) {
    const data = readFileSync(path);
    assert.equal(data.subarray(1, 4).toString(), 'PNG');
    const size = Number(file.match(/icon(\d+)/)[1]);
    assert.equal(data.readUInt32BE(16), size);
    assert.equal(data.readUInt32BE(20), size);
  }
}
console.log(`Manifest, version, JavaScript and ${references.size} referenced files checked.`);

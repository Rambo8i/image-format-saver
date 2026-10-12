import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = (file) => readFileSync(new URL(`../image-format-saver/${file}`, import.meta.url), 'utf8');
const event = () => ({ listeners: [], addListener(listener) { this.listeners.push(listener); } });

function storage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    async get(keys) {
      if (typeof keys === 'string') return { [keys]: data[keys] };
      return { ...keys, ...data };
    },
    async set(value) { Object.assign(data, value); },
    async remove(key) { delete data[key]; }
  };
}

function background({ downloadState = 'in_progress', conversion = { ok: true, dataUrl: 'data:image/png;base64,AA==' } } = {}) {
  const downloads = [];
  const badges = [];
  const chrome = {
    runtime: {
      onInstalled: event(), onStartup: event(), onMessage: event(),
      getURL: (path) => `chrome-extension://test/${path}`,
      async getContexts() { return [{ contextType: 'OFFSCREEN_DOCUMENT' }]; },
      async sendMessage() { return conversion; }
    },
    storage: { sync: storage(), local: storage(), session: storage(), onChanged: event() },
    contextMenus: { onClicked: event(), async removeAll() {}, create() {}, async update() {} },
    offscreen: { async createDocument() {} },
    downloads: {
      onChanged: event(),
      async download(options) { downloads.push(options); return 42; },
      async search() { return [{ id: 42, state: downloadState }]; }
    },
    action: { async setBadgeText(value) { badges.push(value.text); }, async setBadgeBackgroundColor() {} }
  };
  const context = vm.createContext({ chrome, console, URL });
  vm.runInContext(source('background.js'), context);
  return { context, chrome, downloads, badges };
}

test('filenames are safe for URLs, reserved Windows names and inline images', () => {
  const { context } = background();
  const filename = (url, format = 'png') => context.buildFilename(url, format);
  assert.equal(filename('https://images.example/photo.webp?width=200', 'jpg'), 'photo.jpg');
  assert.equal(filename('https://images.example/hello%20world.png'), 'hello world.png');
  assert.equal(filename('https://images.example/CON.jpg'), '_CON.png');
  assert.equal(filename('https://images.example/a%3Fb.png'), 'a_b.png');
  assert.equal(filename('data:image/png;base64,AAAA'), 'image.png');
  assert.equal(filename('blob:https://example.test/id'), 'image.png');
  assert.equal(filename('https://images.example/%invalid'), 'image.png');
});

test('download startup is distinct from actual completion', async () => {
  const { context, chrome, downloads } = background();
  await context.handleMenuClick({ menuItemId: 'ifs-png', srcUrl: 'https://example.test/photo.webp' });
  assert.equal(downloads[0].filename, 'photo.png');
  assert.equal(downloads[0].saveAs, true);
  assert.equal(chrome.storage.local.data.lastStatus.message, 'PNG-Download gestartet');
  assert.equal(chrome.storage.session.data['download-42'], 'png');
  await chrome.downloads.onChanged.listeners[0]({ id: 42, state: { current: 'complete' } });
  // The event callback deliberately does not return its Promise.
  await new Promise(setImmediate);
  assert.equal(chrome.storage.local.data.lastStatus.message, 'PNG gespeichert');
  assert.equal(chrome.storage.session.data['download-42'], undefined);
});

test('very fast downloads are reconciled after registration', async () => {
  const { context, chrome } = background({ downloadState: 'complete' });
  await context.handleMenuClick({ menuItemId: 'ifs-webp', srcUrl: 'https://example.test/photo.png' });
  assert.equal(chrome.storage.local.data.lastStatus.message, 'WebP gespeichert');
});

test('interrupted downloads report failure and ignore unrelated downloads', async () => {
  const { context, chrome, badges } = background();
  await context.handleMenuClick({ menuItemId: 'ifs-pdf', srcUrl: 'https://example.test/photo.png' });
  await context.updateDownloadStatus(999, 'interrupted', 'NETWORK_FAILED');
  assert.equal(chrome.storage.local.data.lastStatus.message, 'PDF-Download gestartet');
  await context.updateDownloadStatus(42, 'interrupted', 'NETWORK_FAILED');
  assert.equal(chrome.storage.local.data.lastStatus.ok, false);
  assert.match(chrome.storage.local.data.lastStatus.message, /fehlgeschlagen/);
  assert.ok(badges.includes('!'));
});

test('user cancellation is reported without a failure badge', async () => {
  const { context, chrome, badges } = background();
  await context.handleMenuClick({ menuItemId: 'ifs-jpg', srcUrl: 'https://example.test/photo.png' });
  await context.updateDownloadStatus(42, 'interrupted', 'USER_CANCELED');
  assert.equal(chrome.storage.local.data.lastStatus.message, 'Download abgebrochen.');
  assert.ok(!badges.includes('!'));
});

test('conversion errors cannot start a download', async () => {
  const { context, downloads } = background({ conversion: { ok: false, error: 'HTTP 403' } });
  await assert.rejects(context.handleMenuClick({ menuItemId: 'ifs-png', srcUrl: 'https://example.test/photo.png' }), /HTTP 403/);
  assert.equal(downloads.length, 0);
});

test('default format and save dialog setting are respected', async () => {
  const { context, chrome, downloads } = background();
  await chrome.storage.sync.set({ defaultFormat: 'webp', saveAs: false });
  await context.handleMenuClick({ menuItemId: 'ifs-default', srcUrl: 'https://example.test/photo.png' });
  assert.equal(downloads[0].filename, 'photo.webp');
  assert.equal(downloads[0].saveAs, false);
});

test('concurrent requests create just one offscreen document', async () => {
  const { context, chrome } = background();
  chrome.runtime.getContexts = async () => [];
  let created = 0;
  chrome.offscreen.createDocument = async () => { created++; await new Promise(setImmediate); };
  await Promise.all([context.ensureOffscreenDocument(), context.ensureOffscreenDocument()]);
  assert.equal(created, 1);
});

function offscreen() {
  const context = vm.createContext({ chrome: { runtime: { onMessage: event() } }, console, Uint8Array });
  vm.runInContext(source('offscreen.js'), context);
  return context;
}

test('PDF cross-reference offsets point to binary-safe image objects', () => {
  const context = offscreen();
  const jpeg = Uint8Array.from([0xff, 0xd8, 0, 0x80, 0xff, 0xd9]);
  const bytes = Buffer.from(context.buildSingleImagePdf(jpeg, 640, 480));
  const pdf = bytes.toString('latin1');
  assert.ok(pdf.startsWith('%PDF-1.4\n'));
  assert.match(pdf, /\/MediaBox \[0 0 480 360\]/);
  assert.ok(bytes.includes(Buffer.from(jpeg)));
  const xrefOffset = Number(pdf.match(/startxref\n(\d+)/)[1]);
  assert.equal(pdf.slice(xrefOffset, xrefOffset + 4), 'xref');
  const offsets = [...pdf.matchAll(/^(\d{10}) 00000 n /gm)].map((match) => Number(match[1]));
  assert.equal(offsets.length, 5);
  offsets.forEach((offset, index) => assert.ok(pdf.slice(offset).startsWith(`${index + 1} 0 obj\n`)));
});

test('PDF page dimensions remain compatible for very large source images', () => {
  const pdf = Buffer.from(offscreen().buildSingleImagePdf(new Uint8Array(), 100000, 50000)).toString('latin1');
  assert.match(pdf, /\/MediaBox \[0 0 14400 7200\]/);
});

test('quality settings are clamped and blocked images produce understandable errors', () => {
  const context = offscreen();
  assert.equal(context.clampQuality(92), 0.92);
  assert.equal(context.clampQuality(-1), 0.1);
  assert.equal(context.clampQuality(500), 1);
  assert.equal(context.clampQuality('invalid'), 0.9);
  assert.match(context.humanizeError(new Error('HTTP 403')), /verweigert/);
  assert.match(context.humanizeError(new Error('Failed to fetch')), /nicht abgerufen/);
});

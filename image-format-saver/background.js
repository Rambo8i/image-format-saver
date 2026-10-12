const OFFSCREEN_DOCUMENT = 'offscreen.html';
const DEFAULT_SETTINGS = {
  defaultFormat: 'png',
  jpgQuality: 92,
  webpQuality: 90,
  saveAs: true
};

const FORMAT_META = {
  png: { label: 'PNG', extension: 'png' },
  jpg: { label: 'JPG', extension: 'jpg' },
  webp: { label: 'WebP', extension: 'webp' },
  pdf: { label: 'PDF', extension: 'pdf' }
};

let creatingOffscreen = null;

chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state?.current === 'complete' || delta.state?.current === 'interrupted') {
    updateDownloadStatus(delta.id, delta.state.current, delta.error?.current).catch(console.error);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  await initializeSettings();
  await createContextMenus();
});

chrome.runtime.onStartup.addListener(async () => {
  await createContextMenus();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.defaultFormat) {
    updateDefaultMenuLabel(changes.defaultFormat.newValue).catch(console.error);
  }
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (!info.srcUrl) return;

  handleMenuClick(info).catch(async (error) => {
    console.error('Image Format Saver:', error);
    await setErrorBadge();
    await chrome.storage.local.set({
      lastStatus: {
        ok: false,
        message: error?.message || String(error),
        time: Date.now()
      }
    });
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'REFRESH_MENUS') {
    createContextMenus()
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function initializeSettings() {
  const current = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set({ ...DEFAULT_SETTINGS, ...current });
}

async function createContextMenus() {
  await chrome.contextMenus.removeAll();
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

  chrome.contextMenus.create({
    id: 'ifs-default',
    title: `Im Standardformat speichern (${FORMAT_META[settings.defaultFormat]?.label || 'PNG'})`,
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'ifs-parent',
    title: 'Bild speichern als …',
    contexts: ['image']
  });

  for (const [format, meta] of Object.entries(FORMAT_META)) {
    chrome.contextMenus.create({
      id: `ifs-${format}`,
      parentId: 'ifs-parent',
      title: meta.label,
      contexts: ['image']
    });
  }
}

async function updateDefaultMenuLabel(format) {
  const label = FORMAT_META[format]?.label || 'PNG';
  try {
    await chrome.contextMenus.update('ifs-default', {
      title: `Im Standardformat speichern (${label})`
    });
  } catch {
    await createContextMenus();
  }
}

async function handleMenuClick(info) {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const format = info.menuItemId === 'ifs-default'
    ? settings.defaultFormat
    : String(info.menuItemId).replace('ifs-', '');

  if (!FORMAT_META[format]) return;

  clearBadgeSoon();
  await ensureOffscreenDocument();

  const result = await chrome.runtime.sendMessage({
    target: 'offscreen',
    type: 'CONVERT_IMAGE',
    payload: {
      srcUrl: info.srcUrl,
      format,
      jpgQuality: settings.jpgQuality,
      webpQuality: settings.webpQuality
    }
  });

  if (!result?.ok) {
    throw new Error(result?.error || 'Das Bild konnte nicht konvertiert werden.');
  }

  const filename = buildFilename(info.srcUrl, format);
  const downloadId = await chrome.downloads.download({
    url: result.dataUrl,
    filename,
    saveAs: Boolean(settings.saveAs),
    conflictAction: 'uniquify'
  });

  await chrome.storage.local.set({
    lastStatus: {
      ok: true,
      message: `${FORMAT_META[format].label}-Download gestartet`,
      time: Date.now()
    }
  });

  // Session storage survives service-worker suspension without persisting image URLs.
  await chrome.storage.session.set({ [`download-${downloadId}`]: format });
  // A small download may have finished before its ID could be registered.
  const [download] = await chrome.downloads.search({ id: downloadId });
  if (download) await updateDownloadStatus(downloadId, download.state, download.error);
}

async function updateDownloadStatus(downloadId, state, error) {
  if (state !== 'complete' && state !== 'interrupted') return;
  const key = `download-${downloadId}`;
  const pending = await chrome.storage.session.get(key);
  const format = pending[key];
  if (!FORMAT_META[format]) return;

  await chrome.storage.session.remove(key);
  const ok = state === 'complete';
  await chrome.storage.local.set({
    lastStatus: {
      ok,
      message: ok
        ? `${FORMAT_META[format].label} gespeichert`
        : error === 'USER_CANCELED'
          ? 'Download abgebrochen.'
          : 'Download fehlgeschlagen. Bitte erneut versuchen.',
      time: Date.now()
    }
  });
  if (!ok && error !== 'USER_CANCELED') await setErrorBadge();
}

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (contexts.length > 0) return;

  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }

  creatingOffscreen = chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT,
    reasons: ['BLOBS'],
    justification: 'Bilder lokal mit Canvas in andere Dateiformate konvertieren.'
  });

  try {
    await creatingOffscreen;
  } finally {
    creatingOffscreen = null;
  }
}

function buildFilename(srcUrl, format) {
  const extension = FORMAT_META[format].extension;
  let base = 'image';

  try {
    const url = new URL(srcUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return `${base}.${extension}`;
    const lastSegment = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || 'image');
    base = lastSegment.replace(/\.[a-z0-9]{1,8}$/i, '') || 'image';
  } catch {
    // data:, blob: or unusual URLs keep the fallback name.
  }

  base = base
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/[. ]+$/g, '')
    .slice(0, 120) || 'image';

  // Windows reserves these names even when a file extension is present.
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(base)) base = `_${base}`;

  return `${base}.${extension}`;
}

async function setErrorBadge() {
  await chrome.action.setBadgeText({ text: '!' });
  await chrome.action.setBadgeBackgroundColor({ color: '#b91c1c' });
}

function clearBadgeSoon() {
  chrome.action.setBadgeText({ text: '' }).catch(() => {});
}

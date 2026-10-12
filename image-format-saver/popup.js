const DEFAULT_SETTINGS = {
  defaultFormat: 'png',
  jpgQuality: 92,
  webpQuality: 90,
  saveAs: true
};

const FORMATS = [
  { id: 'png', label: 'PNG', note: 'Verlustfrei · Transparenz bleibt erhalten.' },
  { id: 'jpg', label: 'JPG', note: 'Klein und universell · Transparenz wird weiß.' },
  { id: 'webp', label: 'WebP', note: 'Modern · kleine Dateien mit Transparenz.' },
  { id: 'pdf', label: 'PDF', note: 'Ein Bild, eine Seite · JPG-Einbettung auf Weiß.' }
];

const state = { ...DEFAULT_SETTINGS };
let statusTimer;

const elements = {
  popup: document.getElementById('popup'),
  formatGroup: document.getElementById('formatGroup'),
  formatButtons: [...document.querySelectorAll('[data-format]')],
  formatNote: document.getElementById('formatNote'),
  qualityPanel: document.getElementById('qualityPanel'),
  qualityLabel: document.getElementById('qualityLabel'),
  qualityRange: document.getElementById('qualityRange'),
  qualityValue: document.getElementById('qualityValue'),
  losslessPanel: document.getElementById('losslessPanel'),
  losslessTitle: document.getElementById('losslessTitle'),
  losslessNote: document.getElementById('losslessNote'),
  saveAs: document.getElementById('saveAs'),
  status: document.getElementById('status'),
  statusText: document.getElementById('statusText')
};

init().catch(showError);

async function init() {
  Object.assign(state, await chrome.storage.sync.get(DEFAULT_SETTINGS));
  render();

  elements.formatButtons.forEach((button) => {
    button.addEventListener('click', () => selectFormat(button.dataset.format).catch(showError));
  });

  elements.qualityRange.addEventListener('input', updateQualityFromRange);
  elements.qualityRange.addEventListener('change', () => saveQuality().catch(showError));
  elements.saveAs.addEventListener('click', () => toggleSaveAs().catch(showError));
  elements.popup.addEventListener('mousemove', updatePointerLight);
  elements.popup.addEventListener('mouseleave', resetPointerLight);

  const { lastStatus } = await chrome.storage.local.get('lastStatus');
  if (lastStatus && Date.now() - lastStatus.time < 120000) {
    showStatus(lastStatus.message, lastStatus.ok ? 'success' : 'error');
  }
}

async function selectFormat(format) {
  if (!FORMATS.some((item) => item.id === format) || state.defaultFormat === format) return;
  state.defaultFormat = format;
  render();
  await persist({ defaultFormat: format });
  showStatus(`Standardformat: ${format.toUpperCase()}`);
}

function updateQualityFromRange() {
  const key = state.defaultFormat === 'webp' ? 'webpQuality' : 'jpgQuality';
  state[key] = Number(elements.qualityRange.value);
  renderQuality();
}

async function saveQuality() {
  const key = state.defaultFormat === 'webp' ? 'webpQuality' : 'jpgQuality';
  await persist({ [key]: state[key] });
  showStatus(`Qualität gespeichert: ${state[key]} %`);
}

async function toggleSaveAs() {
  state.saveAs = !state.saveAs;
  renderSaveAs();
  await persist({ saveAs: state.saveAs });
  showStatus(state.saveAs
    ? 'Speicherort wird abgefragt.'
    : 'Speichert direkt in den Download-Ordner.');
}

async function persist(changes) {
  await chrome.storage.sync.set(changes);
}

function render() {
  renderFormat();
  renderQuality();
  renderSaveAs();
}

function renderFormat() {
  const formatIndex = Math.max(0, FORMATS.findIndex((item) => item.id === state.defaultFormat));
  const format = FORMATS[formatIndex];
  elements.formatGroup.style.setProperty('--format-index', String(formatIndex));
  elements.formatButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.format === format.id));
  });
  elements.formatNote.textContent = format.note;

  const hasQuality = format.id !== 'png';
  elements.qualityPanel.hidden = !hasQuality;
  elements.losslessPanel.hidden = hasQuality;

  if (!hasQuality) {
    elements.losslessTitle.textContent = 'Keine Einstellung nötig';
    elements.losslessNote.textContent = 'PNG wird verlustfrei ausgegeben — der Qualitätsregler entfällt.';
  }
}

function renderQuality() {
  const isWebp = state.defaultFormat === 'webp';
  const value = isWebp ? state.webpQuality : state.jpgQuality;
  elements.qualityLabel.textContent = isWebp ? 'WebP-Qualität'
    : state.defaultFormat === 'pdf' ? 'PDF-Bildqualität (JPG)' : 'JPG-Qualität';
  elements.qualityRange.value = String(value);
  elements.qualityValue.querySelector('strong').textContent = String(value);
  const percentage = ((value - 10) / 90) * 100;
  elements.qualityRange.style.setProperty('--value', `${percentage.toFixed(1)}%`);
}

function renderSaveAs() {
  elements.saveAs.setAttribute('aria-checked', String(Boolean(state.saveAs)));
}

function updatePointerLight(event) {
  const rect = elements.popup.getBoundingClientRect();
  elements.popup.style.setProperty('--mx', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
  elements.popup.style.setProperty('--my', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
}

function resetPointerLight() {
  elements.popup.style.setProperty('--mx', '50%');
  elements.popup.style.setProperty('--my', '-6%');
}

function showStatus(text, type = 'success') {
  clearTimeout(statusTimer);
  elements.statusText.textContent = text;
  elements.status.className = `status ${type} is-visible`;
  statusTimer = setTimeout(() => {
    elements.status.classList.remove('is-visible');
  }, 2400);
}

function showError(error) {
  console.error(error);
  showStatus(error?.message || String(error), 'error');
}

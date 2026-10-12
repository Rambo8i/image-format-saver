chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.target !== 'offscreen' || message?.type !== 'CONVERT_IMAGE') {
    return;
  }

  convertImage(message.payload)
    .then((dataUrl) => sendResponse({ ok: true, dataUrl }))
    .catch((error) => {
      console.error('Image conversion failed:', error);
      sendResponse({ ok: false, error: humanizeError(error) });
    });

  return true;
});

async function convertImage({ srcUrl, format, jpgQuality, webpQuality }) {
  const response = await fetch(srcUrl, {
    credentials: 'include',
    cache: 'no-cache'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const sourceBlob = await response.blob();
  if (!sourceBlob.size) {
    throw new Error('Leere Bilddatei');
  }

  const bitmap = await createImageBitmap(sourceBlob);

  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    if (!canvas.width || !canvas.height) {
      throw new Error('Ungültige Bildgröße');
    }

    const ctx = canvas.getContext('2d', { alpha: format !== 'jpg' && format !== 'pdf' });
    if (!ctx) throw new Error('Canvas konnte nicht initialisiert werden');

    if (format === 'jpg' || format === 'pdf') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(bitmap, 0, 0);

    if (format === 'pdf') {
      const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', clampQuality(jpgQuality));
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      const pdfBytes = buildSingleImagePdf(jpegBytes, canvas.width, canvas.height);
      return blobToDataUrl(new Blob([pdfBytes], { type: 'application/pdf' }));
    }

    const mime = format === 'png'
      ? 'image/png'
      : format === 'jpg'
        ? 'image/jpeg'
        : 'image/webp';

    const quality = format === 'jpg'
      ? clampQuality(jpgQuality)
      : format === 'webp'
        ? clampQuality(webpQuality)
        : undefined;

    const outputBlob = await canvasToBlob(canvas, mime, quality);
    return blobToDataUrl(outputBlob);
  } finally {
    bitmap.close();
  }
}

function clampQuality(percent) {
  const value = Number(percent);
  if (!Number.isFinite(value)) return 0.9;
  return Math.min(1, Math.max(0.1, value / 100));
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`Konvertierung nach ${mime} fehlgeschlagen`));
    }, mime, quality);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Datei konnte nicht gelesen werden'));
    reader.readAsDataURL(blob);
  });
}

function buildSingleImagePdf(jpegBytes, pixelWidth, pixelHeight) {
  const pointsPerPixel = 72 / 96;
  let pageWidth = Math.max(1, pixelWidth * pointsPerPixel);
  let pageHeight = Math.max(1, pixelHeight * pointsPerPixel);

  // Keep extremely large images within broadly compatible PDF page dimensions.
  const maxDimension = 14400;
  const scale = Math.min(1, maxDimension / Math.max(pageWidth, pageHeight));
  pageWidth *= scale;
  pageHeight *= scale;

  const w = formatPdfNumber(pageWidth);
  const h = formatPdfNumber(pageHeight);
  const content = `q\n${w} 0 0 ${h} 0 0 cm\n/Im0 Do\nQ\n`;
  const contentBytes = asciiBytes(content);

  const objects = [
    asciiBytes('<< /Type /Catalog /Pages 2 0 R >>'),
    asciiBytes('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    asciiBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
    concatBytes(
      asciiBytes(`<< /Type /XObject /Subtype /Image /Width ${pixelWidth} /Height ${pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
      jpegBytes,
      asciiBytes('\nendstream')
    ),
    concatBytes(
      asciiBytes(`<< /Length ${contentBytes.length} >>\nstream\n`),
      contentBytes,
      asciiBytes('endstream')
    )
  ];

  const chunks = [asciiBytes('%PDF-1.4\n')];
  const offsets = [0];
  let position = chunks[0].length;

  objects.forEach((objectBytes, index) => {
    offsets.push(position);
    const prefix = asciiBytes(`${index + 1} 0 obj\n`);
    const suffix = asciiBytes('\nendobj\n');
    chunks.push(prefix, objectBytes, suffix);
    position += prefix.length + objectBytes.length + suffix.length;
  });

  const xrefOffset = position;
  const xrefLines = [
    'xref',
    `0 ${objects.length + 1}`,
    '0000000000 65535 f '
  ];

  for (let i = 1; i < offsets.length; i++) {
    xrefLines.push(`${String(offsets[i]).padStart(10, '0')} 00000 n `);
  }

  const trailer = [
    ...xrefLines,
    'trailer',
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
    ''
  ].join('\n');

  chunks.push(asciiBytes(trailer));
  return concatBytes(...chunks);
}

function formatPdfNumber(value) {
  return Number(value.toFixed(3)).toString();
}

function asciiBytes(text) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function concatBytes(...arrays) {
  const total = arrays.reduce((sum, array) => sum + array.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const array of arrays) {
    output.set(array, offset);
    offset += array.length;
  }
  return output;
}

function humanizeError(error) {
  const message = error?.message || String(error);
  if (/Failed to fetch/i.test(message)) {
    return 'Das Bild konnte von dieser Website nicht abgerufen werden. Manche Seiten schützen Bilder vor direktem Zugriff.';
  }
  if (/HTTP 401|HTTP 403/i.test(message)) {
    return 'Die Website verweigert den direkten Zugriff auf dieses Bild.';
  }
  return message;
}

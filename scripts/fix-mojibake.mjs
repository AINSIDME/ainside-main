import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');

const CP1252_BYTE_FOR_UNICODE = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

const shouldAttemptMojibakeFix = (s) => /[ÃÂÐÑâ€ðŸØÙ]/.test(s);

const toCp1252Bytes = (s) => {
  const bytes = [];
  for (const ch of s) {
    const code = ch.codePointAt(0);
    if (code <= 0xff) {
      bytes.push(code);
      continue;
    }
    const mapped = CP1252_BYTE_FOR_UNICODE.get(code);
    if (mapped === undefined) return null;
    bytes.push(mapped);
  }
  return Uint8Array.from(bytes);
};

const decodeCp1252Utf8 = (s) => {
  const bytes = toCp1252Bytes(s);
  if (!bytes) return null;
  const decoded = Buffer.from(bytes).toString('utf8');
  if (decoded.includes('�')) return null;
  return decoded;
};

const fixEmojiMojibakeSegments = (s) => {
  // Replace sequences like: ðŸ”„ (F0 9F 94 84) => 🔄
  const chars = [...s];
  const out = [];
  for (let i = 0; i < chars.length; ) {
    if (i + 3 < chars.length && chars[i] === 'ð' && chars[i + 1] === 'Ÿ') {
      const seg = chars.slice(i, i + 4).join('');
      const decoded = decodeCp1252Utf8(seg);
      // Heuristic: emoji are typically outside BMP (surrogate pair -> length 2 in JS)
      if (decoded && decoded.length >= 2) {
        out.push(decoded);
        i += 4;
        continue;
      }
    }
    out.push(chars[i]);
    i += 1;
  }
  return out.join('');
};

const maybeFixMojibakeString = (s) => {
  if (!shouldAttemptMojibakeFix(s)) return s;
  // First: do safe targeted fixes (doesn't touch normal accented chars)
  const withEmojiFixed = fixEmojiMojibakeSegments(s);

  // Second: attempt full cp1252->utf8 decode only if it's fully valid
  const decoded = decodeCp1252Utf8(withEmojiFixed);
  if (decoded && decoded !== withEmojiFixed) return decoded;

  return withEmojiFixed;
};

const fixCommonPunctuation = (s) => {
  // These appear when special UTF-8 punctuation was partially broken.
  // Keep this list small and unambiguous.
  return s
    .replaceAll('€¢', '•')
    .replaceAll('†’', '→')
    .replaceAll('‰¥', '≥')
    .replaceAll('€”', '—');
};

const fixSpanishTwoCharCorruption = (s) => {
  // Spanish-specific common corruption sequences observed in es.json.
  // Examples: "confirmacié³n" -> "confirmación", "Atré¡s" -> "Atrás".
  return s
    .replaceAll('é¡', 'á')
    .replaceAll('é³', 'ó')
    .replaceAll('é±', 'ñ')
    .replaceAll('é­', 'í')
    .replaceAll('é©', 'é')
    // Common: a valid accented letter followed by a stray inverted exclamation
    .replaceAll('á¡', 'á')
    .replaceAll('í¡', 'í')
    .replaceAll('ó¡', 'ó')
    .replaceAll('ú¡', 'ú')
    // Common: "aQuí" / "AquÍ" style casing glitches
    .replaceAll('aQuí', 'aquí')
    .replaceAll('AQuí', 'Aquí')
    // Common control-char corruption: "é\u0081" sequences (shows as "é")
    .replaceAll('\u00e9\u0081', 'á')
    .replaceAll('\u00c3\u0081reas', 'Áreas')
    .replaceAll('\u00c3\u00a1rea', 'área')
    .replaceAll('\u00e9\u0081reas', 'Áreas')
    .replaceAll('\u00e9\u0081rea', 'área')
    .replaceAll('\u00e9\u0081', 'á')
    // Broken emoji prefix: "—\u008f" (shows as "—")
    .replaceAll('—\u008f', '✅')
    // Mis-decoded dashes from smart punctuation
    .replaceAll('€“', '–')
    // A few targeted word fixes seen in payment strings
    .replaceAll('No se encontré', 'No se encontró')
    .replaceAll('transaccién', 'transacción')
    .replaceAll('transaccién', 'transacción');
};

const walk = (value, opts) => {
  if (typeof value === 'string') {
    let out = value;
    out = fixCommonPunctuation(out);
    if (opts.locale === 'es') out = fixSpanishTwoCharCorruption(out);
    out = maybeFixMojibakeString(out);
    return out;
  }
  if (Array.isArray(value)) return value.map((v) => walk(v, opts));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = walk(v, opts);
    return out;
  }
  return value;
};

const filesArg = process.argv[2];
const files = filesArg
  ? filesArg.split(',').map((s) => s.trim()).filter(Boolean)
  : fs.readdirSync(localesDir).filter((f) => f.endsWith('.json'));

for (const file of files) {
  const fullPath = path.join(localesDir, file);
  if (!fs.existsSync(fullPath)) {
    console.warn(`Skipping missing file: ${file}`);
    continue;
  }
  const raw = fs.readFileSync(fullPath, 'utf-8').replace(/^\uFEFF/, '');
  const json = JSON.parse(raw);
  const locale = file.replace(/\.json$/i, '');
  const fixed = walk(json, { locale });
  fs.writeFileSync(fullPath, JSON.stringify(fixed, null, 2) + '\n', 'utf-8');
  console.log(`Fixed mojibake in ${file}`);
}

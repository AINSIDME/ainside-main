import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');
const baseLang = 'en.json';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const loadJson = (file) => {
  const fullPath = path.join(localesDir, file);
  const raw = fs.readFileSync(fullPath, 'utf-8').replace(/^\uFEFF/, '');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON in locale file: ${file}`);
    throw e;
  }
};

const flatten = (obj, prefix = '') => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
};

const base = flatten(loadJson(baseLang));
const report = [];

const mode = (process.argv[2] || 'coverage').trim();
const onlyLang = (process.argv[3] || '').trim();

const isSameAsEn = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aa = a.trim();
  const bb = b.trim();
  if (!aa || !bb) return false;
  return aa === bb;
};

for (const file of files) {
  if (file === baseLang) continue;
  const lang = file.replace('.json','');
  if (onlyLang && lang !== onlyLang) continue;
  const data = flatten(loadJson(file));
  const missing = Object.keys(base).filter(k => !(k in data));
  const extra = Object.keys(data).filter(k => !(k in base));

  if (mode === 'same-as-en') {
    const keys = Object.keys(base);
    const sameKeys = keys.filter((k) => isSameAsEn(base[k], data[k]));
    report.push({
      lang,
      totalBase: keys.length,
      sameCount: sameKeys.length,
      sameKeys: sameKeys.slice(0, 50),
      missing: missing.length,
      extra: extra.length,
    });
  } else {
    report.push({
      lang,
      totalBase: Object.keys(base).length,
      translated: Object.keys(base).length - missing.length,
      missing: missing.length,
      missingKeys: missing.slice(0, 50),
      extra: extra.length,
    });
  }
}

for (const r of report) {
  if (mode === 'same-as-en') {
    console.log(`${r.lang}: ${r.sameCount} / ${r.totalBase} same as en (missing ${r.missing}, extra ${r.extra})`);
    if (r.sameKeys?.length) {
      console.log('  sample same-as-en:', r.sameKeys.join(', '));
    }
    continue;
  }

  const pct = ((r.translated / r.totalBase) * 100).toFixed(1);
  console.log(`${r.lang}: ${pct}% translated (${r.translated}/${r.totalBase}), missing ${r.missing}, extra ${r.extra}`);
  if (r.missingKeys.length) {
    console.log('  sample missing:', r.missingKeys.join(', '));
  }
}

if (!report.length) {
  if (onlyLang) {
    console.log(`No locale files found to compare for '${onlyLang}'.`);
  } else {
    console.log('No locale files found to compare.');
  }
}

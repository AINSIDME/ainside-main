import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');
const baseLang = 'en.json';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf-8'));

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

for (const file of files) {
  if (file === baseLang) continue;
  const lang = file.replace('.json','');
  const data = flatten(loadJson(file));
  const missing = Object.keys(base).filter(k => !(k in data));
  const extra = Object.keys(data).filter(k => !(k in base));
  report.push({ lang, totalBase: Object.keys(base).length, translated: Object.keys(base).length - missing.length, missing: missing.length, missingKeys: missing.slice(0, 50), extra: extra.length });
}

for (const r of report) {
  const pct = ((r.translated / r.totalBase) * 100).toFixed(1);
  console.log(`${r.lang}: ${pct}% translated (${r.translated}/${r.totalBase}), missing ${r.missing}, extra ${r.extra}`);
  if (r.missingKeys.length) {
    console.log('  sample missing:', r.missingKeys.join(', '));
  }
}

if (!report.length) {
  console.log('No locale files found to compare.');
}

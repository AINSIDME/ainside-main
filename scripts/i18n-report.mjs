import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');
const baseLang = 'en.json';
const targetLang = 'he.json';

const loadJson = (file) => {
  const fullPath = path.join(localesDir, file);
  const raw = fs.readFileSync(fullPath, 'utf-8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
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

const en = flatten(loadJson(baseLang));
const he = flatten(loadJson(targetLang));

const missing = Object.keys(en).filter((k) => !(k in he));
const extra = Object.keys(he).filter((k) => !(k in en));

const byTop = new Map();
for (const k of missing) {
  const top = k.split('.')[0];
  byTop.set(top, (byTop.get(top) ?? 0) + 1);
}

const sorted = [...byTop.entries()].sort((a, b) => b[1] - a[1]);

console.log(`Base keys: ${Object.keys(en).length}`);
console.log(`he missing: ${missing.length}`);
console.log(`he extra: ${extra.length}`);
console.log('--- Missing by top section (top 30) ---');
for (const [k, v] of sorted.slice(0, 30)) {
  console.log(`${k}: ${v}`);
}

console.log('--- Sample missing keys (first 80) ---');
console.log(missing.slice(0, 80).join(', '));

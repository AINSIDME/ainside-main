import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');

const load = (file) => {
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

const en = flatten(load('en.json'));
const locale = (process.argv[2] ?? 'he').trim();
const other = flatten(load(`${locale}.json`));

const same = [];
for (const [k, v] of Object.entries(en)) {
  if (!(k in other)) continue;
  const hv = other[k];
  if (typeof v === 'string' && typeof hv === 'string' && v === hv) {
    same.push(k);
  }
}

const byTop = new Map();
for (const k of same) {
  const top = k.split('.')[0];
  byTop.set(top, (byTop.get(top) ?? 0) + 1);
}

const sorted = [...byTop.entries()].sort((a, b) => b[1] - a[1]);

console.log(`Keys with identical en==${locale} strings: ${same.length} / ${Object.keys(en).length}`);
console.log('--- Top sections still English (top 25) ---');
for (const [k, v] of sorted.slice(0, 25)) {
  console.log(`${k}: ${v}`);
}

console.log('--- Sample keys (first 120) ---');
console.log(same.slice(0, 120).join(', '));

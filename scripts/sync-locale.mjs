import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');
const baseFile = 'en.json';
const targetFile = 'he.json';

const readJson = (file) => {
  const fullPath = path.join(localesDir, file);
  const raw = fs.readFileSync(fullPath, 'utf-8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
};

const writeJson = (file, data) => {
  const fullPath = path.join(localesDir, file);
  const json = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(fullPath, json, 'utf-8');
};

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

const mergePreferTarget = (base, target) => {
  // Keep target values when present; otherwise fall back to base.
  if (Array.isArray(base)) {
    return Array.isArray(target) ? target : base;
  }
  if (isPlainObject(base)) {
    const out = {};
    const keys = new Set([...Object.keys(base), ...(isPlainObject(target) ? Object.keys(target) : [])]);
    for (const k of keys) {
      if (k in (target ?? {})) {
        const t = target[k];
        const b = base[k];
        if (isPlainObject(b) || Array.isArray(b)) out[k] = mergePreferTarget(b, t);
        else out[k] = t;
      } else {
        out[k] = base[k];
      }
    }
    return out;
  }
  return target ?? base;
};

const base = readJson(baseFile);
const target = readJson(targetFile);

const merged = mergePreferTarget(base, target);
writeJson(targetFile, merged);

console.log(`Synced ${targetFile} from ${baseFile} (kept existing target values, filled missing from base).`);

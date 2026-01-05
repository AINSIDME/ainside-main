import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/locales');
const baseFile = 'en.json';

const DEFAULT_LOCALES = ['ar', 'es', 'fr', 'he', 'ru'];

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

const shouldAttemptMojibakeFix = (s) => /[ÃÂÐÑâ€ðŸØÙ]/.test(s);

// Decode strings that were originally UTF-8, incorrectly decoded as Windows-1252,
// then saved as UTF-8 (classic "Ã©", "â€“", "Ð¤" patterns).
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

const maybeFixMojibakeString = (s) => {
  if (!shouldAttemptMojibakeFix(s)) return s;
  const bytes = toCp1252Bytes(s);
  if (!bytes) return s;
  const fixed = Buffer.from(bytes).toString('utf8');
  if (fixed !== s && !fixed.includes('�')) return fixed;
  return s;
};

const maybeFixMojibake = (value) => {
  if (typeof value === 'string') return maybeFixMojibakeString(value);
  if (Array.isArray(value)) return value.map((v) => maybeFixMojibake(v));
  return value;
};

const mergePreferTarget = (base, target, opts) => {
  // Keep target values when present; otherwise fall back to base.
  // By default, we prune keys not present in base (to keep locales aligned).
  if (Array.isArray(base)) {
    const out = Array.isArray(target) ? target : base;
    return opts.fixMojibake ? maybeFixMojibake(out) : out;
  }

  if (isPlainObject(base)) {
    const out = {};
    const baseKeys = Object.keys(base);
    for (const k of baseKeys) {
      const b = base[k];
      const hasTargetKey = isPlainObject(target) && Object.prototype.hasOwnProperty.call(target, k);
      if (hasTargetKey) {
        const t = target[k];
        if (isPlainObject(b)) {
          out[k] = isPlainObject(t) ? mergePreferTarget(b, t, opts) : mergePreferTarget(b, undefined, opts);
        } else if (Array.isArray(b)) {
          out[k] = Array.isArray(t) ? mergePreferTarget(b, t, opts) : mergePreferTarget(b, undefined, opts);
        } else {
          // base is primitive; if target is a complex type, prefer base to keep schema stable
          if (isPlainObject(t) || Array.isArray(t)) out[k] = opts.fixMojibake ? maybeFixMojibake(b) : b;
          else out[k] = opts.fixMojibake ? maybeFixMojibake(t) : t;
        }
      } else {
        out[k] = opts.fixMojibake ? maybeFixMojibake(b) : b;
      }
    }

    if (!opts.prune && isPlainObject(target)) {
      for (const [k, v] of Object.entries(target)) {
        if (Object.prototype.hasOwnProperty.call(base, k)) continue;
        out[k] = opts.fixMojibake ? maybeFixMojibake(v) : v;
      }
    }
    return out;
  }

  const out = target ?? base;
  return opts.fixMojibake ? maybeFixMojibake(out) : out;
};

const parseArgs = (argv) => {
  const out = {
    locales: null,
    prune: true,
    fixMojibake: true,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--locale' || arg === '--locales') {
      const next = argv[i + 1];
      if (!next) throw new Error('Missing value after --locale');
      out.locales = next.split(',').map((s) => s.trim()).filter(Boolean);
      i++;
    } else if (arg === '--no-prune') {
      out.prune = false;
    } else if (arg === '--no-fix-mojibake') {
      out.fixMojibake = false;
    }
  }
  return out;
};

const args = parseArgs(process.argv);
const locales = args.locales ?? DEFAULT_LOCALES;
const base = readJson(baseFile);

for (const locale of locales) {
  const targetFile = `${locale}.json`;
  const targetPath = path.join(localesDir, targetFile);
  if (!fs.existsSync(targetPath)) {
    console.warn(`Skipping missing locale file: ${targetFile}`);
    continue;
  }

  const target = readJson(targetFile);
  const merged = mergePreferTarget(base, target, { prune: args.prune, fixMojibake: args.fixMojibake });
  writeJson(targetFile, merged);
  console.log(`Synced ${targetFile} from ${baseFile} (kept existing values, filled missing; prune=${args.prune}, fixMojibake=${args.fixMojibake}).`);
}

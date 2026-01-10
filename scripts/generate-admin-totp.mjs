import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';

function base32Encode(buffer) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

const argv = process.argv.slice(2);

const email = (argv[0] || 'jonathangolubok@gmail.com').trim().toLowerCase();
const issuer = (argv[1] || 'AInside').trim();

const flags = new Set(argv.slice(2));
const getFlagValue = (name) => {
  const idx = argv.indexOf(name);
  if (idx === -1) return null;
  const val = argv[idx + 1];
  return typeof val === 'string' && !val.startsWith('--') ? val : null;
};

const outPath = getFlagValue('--out');
const jsonOutPath = getFlagValue('--jsonOut');
const quiet = flags.has('--quiet');

// 20 bytes -> 160-bit secret (common for TOTP)
const secret = base32Encode(crypto.randomBytes(20));
const label = `${issuer}:${email}`;
const otpauth = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

const secretsJson = JSON.stringify({ [email]: secret });

const writes = [];
let resolvedOutPath = null;
let resolvedJsonOutPath = null;

if (outPath) {
  resolvedOutPath = path.resolve(process.cwd(), outPath);
  writes.push(
    QRCode.toFile(resolvedOutPath, otpauth, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 260,
    })
  );
}

if (jsonOutPath) {
  resolvedJsonOutPath = path.resolve(process.cwd(), jsonOutPath);
  writes.push(fs.writeFile(resolvedJsonOutPath, secretsJson, { encoding: 'utf8' }));
}

await Promise.all(writes);

if (!quiet) {
  console.log('=== Admin TOTP Secret ===');
  console.log('Email:', email);
  console.log('Issuer:', issuer);
  console.log('BASE32 Secret:', secret);
  console.log('OTPAuth URI:', otpauth);
  console.log('');
  console.log('Supabase Secret (recommended):');
  console.log(`ADMIN_EMAILS=${email}`);
  console.log(`ADMIN_2FA_SECRETS_JSON={"${email}":"${secret}"}`);
} else {
  console.log('=== Admin TOTP generated (quiet mode) ===');
  console.log('Email:', email);
  console.log('Issuer:', issuer);
  if (resolvedOutPath) console.log('QR PNG:', resolvedOutPath);
  if (resolvedJsonOutPath) console.log('Secrets JSON:', resolvedJsonOutPath);
}

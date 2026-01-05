import crypto from 'node:crypto';

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

const email = (process.argv[2] || 'jonathangolubok@gmail.com').trim().toLowerCase();
const issuer = (process.argv[3] || 'AInside').trim();

// 20 bytes -> 160-bit secret (common for TOTP)
const secret = base32Encode(crypto.randomBytes(20));
const label = `${issuer}:${email}`;
const otpauth = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

const qrUrl = `https://chart.googleapis.com/chart?chs=220x220&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauth)}`;

console.log('=== Admin TOTP Secret ===');
console.log('Email:', email);
console.log('Issuer:', issuer);
console.log('BASE32 Secret:', secret);
console.log('OTPAuth URI:', otpauth);
console.log('QR URL:', qrUrl);
console.log('');
console.log('Supabase Secret (recommended):');
console.log(`ADMIN_EMAILS=${email}`);
console.log(`ADMIN_2FA_SECRETS_JSON={"${email}":"${secret}"}`);

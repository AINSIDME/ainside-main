// Debug helper: validate_coupon RPC via anon key.
// Prints status + response body, never prints secrets.

const fs = require('fs');

function loadEnv(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const map = {};
  for (const rawLine of txt.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    map[key] = value;
  }
  return map;
}

async function main() {
  const env = loadEnv('.env.local');
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  const res = await fetch(`${url}/rest/v1/rpc/validate_coupon`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coupon_code_input: 'TEST-TEST-TEST' }),
  });

  const bodyText = await res.text();
  console.log('RPC url:', res.url);
  console.log('RPC status:', res.status, res.statusText);
  console.log('RPC content-type:', res.headers.get('content-type'));
  console.log('RPC headers (selected):', {
    'x-error-code': res.headers.get('x-error-code'),
    'x-sb-error-code': res.headers.get('x-sb-error-code'),
    'x-sb-error-message': res.headers.get('x-sb-error-message'),
    'content-location': res.headers.get('content-location'),
    location: res.headers.get('location'),
  });
  console.log('RPC body (first 1200 chars):');
  console.log(bodyText.slice(0, 1200));
}

main().catch((e) => {
  console.error('Fetch error:', e?.message || String(e));
  process.exit(1);
});

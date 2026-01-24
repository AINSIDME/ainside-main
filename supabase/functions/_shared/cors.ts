// Configuración CORS centralizada para todas las Edge Functions
// Solo permite orígenes confiables (whitelist)

const ALLOWED_ORIGINS = [
  "https://ainside.lovable.app",
  "https://ainside-trading.vercel.app", 
  "https://ainside.me",
  "https://www.ainside.me",
  "https://ainside-main-1f0irplxy-ainsidmes-projects.vercel.app",
  "https://ainside-main.vercel.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-2fa-token",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}

export function handleCorsPreflightRequest(req: Request): Response {
  const origin = req.headers.get("origin");
  const headers = getCorsHeaders(origin);

  // Some browsers/Supabase clients include additional headers; echoing the requested
  // list avoids brittle preflight failures while still keeping a strict origin whitelist.
  const requestedHeaders = req.headers.get("access-control-request-headers");
  if (requestedHeaders) {
    headers["Access-Control-Allow-Headers"] = requestedHeaders;
  }

  return new Response(null, {
    headers,
    status: 200,
  });
}

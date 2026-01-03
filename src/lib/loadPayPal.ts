// src/lib/loadPayPal.ts
let loading: Promise<void> | null = null;

export async function loadPayPalSDK(locale = "en_US", currency = "USD") {
  if (typeof window === "undefined") return;

  if ((window as any).paypal) return; // ya cargado

  if (!loading) {
    loading = (async () => {
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
      const env = (import.meta.env.VITE_PAYPAL_ENV as string | undefined) || "sandbox";
      if (!clientId) throw new Error("No se pudo obtener el clientId (VITE_PAYPAL_CLIENT_ID)");
      if (!clientId) throw new Error("No se pudo obtener el clientId");

      const base = env === "live" ? "https://www.paypal.com" : "https://www.sandbox.paypal.com";
      const src =
        `${base}/sdk/js?client-id=${encodeURIComponent(clientId)}` +
        `&currency=${encodeURIComponent(currency)}` +
        `&intent=capture&components=buttons` +
        `&commit=true&locale=${encodeURIComponent(locale)}`;

      await injectScript(src);
    })().finally(() => (loading = null));
  }

  return loading;
}

function injectScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar PayPal SDK"));
    document.head.appendChild(s);
  });
}

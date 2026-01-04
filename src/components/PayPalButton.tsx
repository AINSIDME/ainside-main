import { useEffect, useRef } from "react";
import { loadPayPalSDK } from "@/lib/loadPayPal";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

type Props = {
  amount: string;                 // "99.00"
  currency?: string;              // default "USD"
  description?: string;           // referencia
  locale?: string;                 // ej "en_US"
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
  onCancel?: () => void;
};

declare global {
  interface Window { paypal?: any; }
}

export default function PayPalButton({
  amount,
  currency = "USD",
  description = "checkout",
  locale = "en_US",
  onSuccess,
  onError,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    let destroyed = false;

    (async () => {
      try {
        await loadPayPalSDK(locale, currency);
        if (destroyed || !ref.current) return;

        ref.current.innerHTML = "";
        const paypal = window.paypal;
        if (!paypal) throw new Error("PayPal SDK no disponible");

        paypal.Buttons({
          style: { layout: "vertical", color: "blue", shape: "rect", label: "paypal" },

          // 1) Crear orden (backend)
          createOrder: async () => {
            const { da
                plan: description || "Plan", 
                amount: Number(amount),
                language: i18n.language || 'en'
             te-payment", {
              body: { plan: description || "Plan", amount: Number(amount) },
            });
            if (error || !data?.orderId) throw new Error("Falló crear la orden");
            return data.orderId;
          },

          // 2) Aprobada por el comprador -> capturamos en back
          onApprove: async (data: any) => {
            try {
              const { data: cap, error } = await supabase.functions.invoke("capture-payment", {
                body: { orderId: data.orderID },
              });
              if (error) throw new Error(JSON.stringify(error));
              onSuccess?.();
            } catch (e) { onError?.(e); }
          },

          onCancel: () => onCancel?.(),
          onError: (err: any) => onError?.(err),
        }).render(ref.current);
      } catch (err) {
        onError?.(err);
      }
    })();

    return () => { destroyed = true; };
  }, [amount, currency, description, locale, onSuccess, onError, onCancel]);

  return <div ref={ref} />;
}

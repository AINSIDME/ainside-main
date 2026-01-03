import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, DollarSign, Shield, Globe, Clock, LineChart, BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

type Instrument = "sp500" | "gold";
type Billing = "monthly" | "annual";
type Plan = "Micro" | "Mini";

export default function Pricing() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  // ===== Selecciones globales =====
  const [instrument, setInstrument] = useState<Instrument>("sp500");
  const [billing, setBilling] = useState<Billing>("monthly"); // Mensual / Anual
  const [intro, setIntro] = useState<boolean>(false); // Primer mes 50% OFF

  // ===== Meta de instrumentos (reacciona al idioma) =====
  const instrumentMeta = useMemo(
    () => ({
      sp500: {
        name: t("instrument.sp500.name", { defaultValue: "S&P 500" }),
        pair: "ES/MES",
        symbolByPlan: { Micro: "MES", Mini: "ES" } as Record<Plan, string>,
        colorRing: "ring-blue-900/40",
        icon: <LineChart className="h-5 w-5" />,
      },
      gold: {
        name: t("instrument.gold.name", { defaultValue: "Oro" }),
        pair: "GC/MGC",
        symbolByPlan: { Micro: "MGC", Mini: "GC" } as Record<Plan, string>,
        colorRing: "ring-amber-900/40",
        icon: <BarChart3 className="h-5 w-5" />,
      },
    }),
    [t]
  );
  const currentInstrument = instrumentMeta[instrument];

  // ===== Precios =====
  const DISCOUNT = 0.30; // 30% OFF anual
  const MICRO_MONTHLY = 99;
  const MINI_MONTHLY = 999;
  const MICRO_MONTHLY_EFFECTIVE = intro && billing === "monthly" ? +(MICRO_MONTHLY * 0.5).toFixed(2) : MICRO_MONTHLY;
  const MINI_MONTHLY_EFFECTIVE  = intro && billing === "monthly" ? +(MINI_MONTHLY  * 0.5).toFixed(2) : MINI_MONTHLY;
  const MICRO_ANNUAL = useMemo(() => +(MICRO_MONTHLY * 12 * (1 - DISCOUNT)).toFixed(2), []);
  const MINI_ANNUAL  = useMemo(() => +(MINI_MONTHLY  * 12 * (1 - DISCOUNT)).toFixed(2), []);

  // ===== Utilidades dependientes del idioma =====
  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat(i18n.language || "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(n);

  // PayPal: mapear idioma -> locale PayPal (con underscore)
  const paypalLocaleFromLang = (lang: string) => {
    const base = (lang || "en").split("-")[0]; // "es-AR" -> "es"
    const map: Record<string, string> = {
      en: "en_US",
      es: "es_ES",
      fr: "fr_FR",
      he: "he_IL",
      ar: "ar_EG",
      ru: "ru_RU",
      pt: "pt_BR",
      de: "de_DE",
      it: "it_IT",
      tr: "tr_TR",
    };
    return map[base] || "en_US";
  };

  // ===== Checkout =====
  const [isProcessing, setIsProcessing] = useState(false);

  const makeDesc = (plan: Plan, cycle: "Mensual" | "Anual", symbol: string, amount: number) =>
    t("pricing.paypalDesc", {
      defaultValue:
        "AInside - Contrato {{plan}} - {{instrument}} ({{symbol}}) - Suscripción {{cycle}} - {{amount}}",
      plan,
      instrument: currentInstrument.name,
      symbol,
      cycle,
      amount: fmtCurrency(amount),
    });

  const handlePay = async (plan: Plan) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const isAnnual = billing === "annual";
      // Map client selection → server plan id (must match server PLANS keys)
      const planId = (plan === "Micro")
        ? (isAnnual ? "micro_annual" : "micro_monthly")
        : (isAnnual ? "mini_annual" : "mini_monthly");

      // Call Supabase Edge Function via HTTP POST with JSON body
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        "https://odlxhgatqyodxdessxts.supabase.co/functions/v1/create-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Always supply anon key (env or exported fallback)
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ plan: planId, intro: !!(intro && billing === "monthly") }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create payment");
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("create-payment error", data);
        toast({
          title: t("pricing.error", { defaultValue: "Error" }),
          description: `${t("pricing.errorDesc", { defaultValue: "No se pudo procesar el pago." })} ${(data as any)?.details ?? JSON.stringify(data)}`,
          variant: "destructive",
        });
        return;
      }

      if (data?.approvalUrl) {
        window.location.href = data.approvalUrl as string;
      } else {
        toast({
          title: t("pricing.error", { defaultValue: "Error" }),
          description: `${t("pricing.errorDesc", { defaultValue: "No se pudo obtener la URL de aprobación." })} ${(data as any)?.details ?? JSON.stringify(data)}`,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: t("pricing.error", { defaultValue: "Error" }),
        description: t("pricing.errorDesc", { defaultValue: "No se pudo procesar el pago." }),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== Features dinámicas por plan (solo instrumento elegido) =====
  const buildFeatures = (plan: Plan): string[] => {
    const symbol = currentInstrument.symbolByPlan[plan];
    return [
      t("pricing.feature.instrument", {
        defaultValue: "Instrumento: {{instrument}} ({{symbol}})",
        instrument: currentInstrument.name,
        symbol,
      }),
      t("pricing.feature.focusInstrument", {
        defaultValue: "Enfoque exclusivo en {{instrument}}",
        instrument: currentInstrument.name,
      }),
      t("pricing.feature.liveSupport",   { defaultValue: "Soporte internacional por chat 24/6" }),
      t("pricing.feature.secure",        { defaultValue: "Checkout seguro con PayPal" }),
      t("pricing.feature.updatesMonthly",{ defaultValue: "Actualizaciones mensuales incluidas" }),
      t("pricing.feature.noGuarantees",  { defaultValue: "Sin compromiso de resultados" }),
    ];
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-[color:#0b1220]">
      {/* Hero sobrio */}
      <section className="py-16 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <DollarSign className="h-6 w-6 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-100">
              {t("pricing.title", { defaultValue: "Planes y Precios" })}
            </h1>
          </div>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            {t("pricing.subtitle", {
              defaultValue:
                "Contratos Micro y Mini. Elegí Mensual o Anual (ahorro 30%).",
            })}
          </p>
        </div>
      </section>

      {/* Controles superiores simétricos */}
      <section className="px-4">
        <div className="max-w-5xl mx-auto py-6 grid gap-6 md:grid-cols-2">
          {/* Toggle Mensual/Anual (segmentado, formal) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-slate-200 font-medium mb-3">
              {t("pricing.billingCycle", { defaultValue: "Ciclo de Facturación" })}
            </h3>
            <div className="inline-flex rounded-lg border border-slate-700 overflow-hidden">
              <button
                onClick={() => setBilling("monthly")}
                aria-pressed={billing === "monthly"}
                className={`px-4 py-2 text-sm
                  ${billing === "monthly"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-900"}`}
              >
                {t("pricing.monthly", { defaultValue: "Mensual" })}
              </button>
              <button
                onClick={() => setBilling("annual")}
                aria-pressed={billing === "annual"}
                className={`px-4 py-2 text-sm border-l border-slate-700
                  ${billing === "annual"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-900"}`}
              >
                {t("pricing.annual", { defaultValue: "Anual" })}
                <span className="ml-2">
                  <Badge className="bg-emerald-700 text-white border-0">
                    {t("pricing.save", { defaultValue: "Ahorra 30%" })}
                  </Badge>
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {t("pricing.renews", {
                defaultValue: "Renovación automática. Podés cancelar cuando quieras.",
              })}
            </p>
            {billing === "monthly" && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-700 p-3">
                <div>
                  <div className="text-slate-200 font-medium">{t("pricing.intro.title", { defaultValue: "Primer mes 50% OFF" })}</div>
                  <div className="text-slate-400 text-xs">{t("pricing.intro.note", { defaultValue: "Aplica solo a planes mensuales" })}</div>
                </div>
                <button
                  aria-pressed={intro}
                  onClick={() => setIntro(v => !v)}
                  className={`px-3 py-1 text-sm rounded-md border ${intro ? "bg-emerald-700 text-white border-emerald-600" : "bg-slate-900 text-slate-300 border-slate-700"}`}
                >
                  {intro ? t("pricing.intro.on", { defaultValue: "Activado" }) : t("pricing.intro.off", { defaultValue: "Desactivado" })}
                </button>
              </div>
            )}
          </div>

          {/* Selector de Instrumento (radio formal) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-slate-200 font-medium mb-3">
              {t("pricing.chooseInstrument", { defaultValue: "Elegí Instrumento" })}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(["sp500", "gold"] as Instrument[]).map((key) => {
                const meta = instrumentMeta[key];
                const active = instrument === key;
                return (
                  <button
                    key={key}
                    onClick={() => setInstrument(key)}
                    className={`text-left rounded-lg border px-4 py-3 transition
                      ${active
                        ? `bg-slate-900 text-white border-slate-700 ring-1 ${meta.colorRing}`
                        : "bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-900"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-slate-800 text-slate-100 grid place-items-center">
                          {meta.icon}
                        </div>
                        <div>
                          <div className="font-medium">{meta.name}</div>
                          <div className="text-xs text-slate-400">{meta.pair}</div>
                        </div>
                      </div>
                      {active && (
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Planes — diseño simétrico y formal */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 auto-rows-fr">
          {/* MICRO */}
          <Card className="h-full flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 text-xl">
                {t("pricing.micro.name", { defaultValue: "Contrato Micro" })}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t("pricing.micro.description", { defaultValue: "Operación con contratos micro (MES/MGC)." })}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              {billing === "monthly" ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-slate-100">{fmtCurrency(MICRO_MONTHLY_EFFECTIVE)}</span>
                  <span className="text-slate-400 text-lg">{t("pricing.perMonth", { defaultValue: "/mes" })}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold text-slate-100">{fmtCurrency(MICRO_ANNUAL)}</span>
                    <span className="text-slate-400 text-lg">{t("pricing.perYear", { defaultValue: "/año" })}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    {t("pricing.compareMicro", {
                      defaultValue: "Equivale a {{perMonth}}/mes (antes: {{fullYear}}/año).",
                      perMonth: fmtCurrency(+(MICRO_ANNUAL / 12).toFixed(2)),
                      fullYear: fmtCurrency(MICRO_MONTHLY * 12),
                    })}
                  </div>
                </>
              )}

              <ul className="mt-5 space-y-2">
                {buildFeatures("Micro").map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span className="text-slate-300 text-sm leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                onClick={() => handlePay("Micro")}
                disabled={isProcessing}
                className="w-full h-11 font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                {isProcessing ? t("pricing.processing", { defaultValue: "Procesando..." }) : t("pricing.cta", { defaultValue: "Suscribirme" })}
              </Button>
            </CardFooter>
          </Card>

          {/* MINI */}
          <Card className="h-full flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100 text-xl">
                    {t("pricing.mini.name", { defaultValue: "Contrato Mini" })}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {t("pricing.mini.description", { defaultValue: "Operación con contratos mini (ES/GC)." })}
                  </CardDescription>
                </div>
                <Badge className="bg-slate-800 text-slate-200 border border-slate-700">
                  {t("pricing.popular", { defaultValue: "Recomendado" })}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {billing === "monthly" ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-slate-100">{fmtCurrency(MINI_MONTHLY_EFFECTIVE)}</span>
                  <span className="text-slate-400 text-lg">{t("pricing.perMonth", { defaultValue: "/mes" })}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold text-slate-100">{fmtCurrency(MINI_ANNUAL)}</span>
                    <span className="text-slate-400 text-lg">{t("pricing.perYear", { defaultValue: "/año" })}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    {t("pricing.compareMini", {
                      defaultValue: "Equivale a {{perMonth}}/mes (antes: {{fullYear}}/año).",
                      perMonth: fmtCurrency(+(MINI_ANNUAL / 12).toFixed(2)),
                      fullYear: fmtCurrency(MINI_MONTHLY * 12),
                    })}
                  </div>
                </>
              )}

              <ul className="mt-5 space-y-2">
                {buildFeatures("Mini").map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span className="text-slate-300 text-sm leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button
                onClick={() => handlePay("Mini")}
                disabled={isProcessing}
                className="w-full h-11 font-semibold bg-blue-800 hover:bg-blue-700 text-white"
              >
                {isProcessing ? t("pricing.processing", { defaultValue: "Procesando..." }) : t("pricing.cta", { defaultValue: "Suscribirme" })}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Franja de confianza sobria */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-800 pt-8">
          <div className="text-center">
            <Shield className="h-6 w-6 mx-auto text-slate-200" />
            <h3 className="mt-2 text-slate-200 font-medium">{t("trust.ssl", { defaultValue: "Seguridad SSL/TLS" })}</h3>
            <p className="text-slate-400 text-sm mt-1">
              {t("homepage.capabilities.security.description", {
                defaultValue: "Protección de extremo a extremo y mejores prácticas de seguridad.",
              })}
            </p>
          </div>
          <div className="text-center">
            <Globe className="h-6 w-6 mx-auto text-slate-200" />
            <h3 className="mt-2 text-slate-200 font-medium">
              {t("homepage.capabilities.analytics.title", { defaultValue: "Analítica Avanzada" })}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {t("homepage.capabilities.analytics.description", {
                defaultValue: "Métricas clave y seguimiento de rendimiento de forma continua.",
              })}
            </p>
          </div>
          <div className="text-center">
            <Clock className="h-6 w-6 mx-auto text-slate-200" />
            <h3 className="mt-2 text-slate-200 font-medium">
              {t("trust.compliant", { defaultValue: "Cumplimiento" })}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {t("pricing.billingInfo", {
                defaultValue: "Facturación mensual o anual (30% OFF en anual). Podés cancelar en cualquier momento.",
              })}
            </p>
          </div>
        </div>

        {/* CTA de soporte */}
        <div className="max-w-5xl mx-auto text-center mt-10">
          <p className="text-slate-300 mb-4">
            {t("pricing.support", { defaultValue: "¿Necesitás ayuda? Nuestro equipo está disponible 24/6." })}
          </p>
          <Link to="/contact">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-900">
              {t("contact.title", { defaultValue: "Contactar" })}
            </Button>
          </Link>
        </div>
      </section>

      {/* Redirect-based checkout; approval handled on PayPal, capture on return */}
    </div>
  );
}


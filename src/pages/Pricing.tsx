import { useState, useMemo, useRef } from "react";
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

  // ===== Sistema de Cupones =====
  const [couponCode, setCouponCode] = useState<string>("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const couponValidationInFlight = useRef(false);
  const [couponValid, setCouponValid] = useState<{
    valid: boolean;
    code?: string;
    discount_percent?: number;
    duration_months?: number;
    error?: string;
    message?: string;
  } | null>(null);

  const validateCoupon = async () => {
    // Hard lock to prevent double-submit before React state updates.
    if (couponValidationInFlight.current) return;

    if (!couponCode.trim()) {
      toast({
        title: t("pricing.coupon.error", { defaultValue: "Error" }),
        description: t("pricing.coupon.enterCode", { defaultValue: "Please enter a coupon code" }),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    couponValidationInFlight.current = true;
    setValidatingCoupon(true);
    try {
      console.log('Validating coupon:', couponCode.trim());
      const { data, error } = await supabase.rpc('validate_coupon', {
        coupon_code_input: couponCode.trim()
      });

      console.log('Validation response:', { data, error });

      // Si hay error de RPC, lanzar excepción
      if (error) {
        console.error('RPC error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      // Si no hay data, es un error
      if (!data) {
        throw new Error('No data received from validation');
      }

      // Guardar resultado de validación
      setCouponValid(data);

      // Mostrar resultado basado en validación
      if (data.valid) {
        toast({
          title: t("pricing.coupon.success", { defaultValue: "Coupon applied!" }),
          description: t("pricing.coupon.successDesc", {
            defaultValue: "{{percent}}% discount applied for {{months}} months",
            percent: data.discount_percent,
            months: data.duration_months
          }),
          duration: 5000,
        });
        // Desactivar intro discount si se aplica cupón
        setIntro(false);
      } else {
        // Cupón inválido (existe pero no es válido)
        toast({
          title: t("pricing.coupon.invalid", { defaultValue: "Invalid coupon" }),
          description: data.message || t("pricing.coupon.invalidDesc", { defaultValue: "The coupon is not valid" }),
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      // Solo mostrar error si no hay cupón válido guardado
      if (!couponValid?.valid) {
        const err = error as any;
        const details =
          (typeof err?.message === 'string' && err.message) ||
          (typeof err?.details === 'string' && err.details) ||
          (typeof err?.error_description === 'string' && err.error_description) ||
          '';
        toast({
          title: t("pricing.coupon.error", { defaultValue: "Error" }),
          description: `${t("pricing.coupon.errorDesc", { defaultValue: "Could not validate coupon" })}${details ? `: ${details}` : ''}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setValidatingCoupon(false);
      couponValidationInFlight.current = false;
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponValid(null);
  };

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
        name: t("instrument.gold.name", { defaultValue: "Gold" }),
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
  const DISCOUNT = 0.20; // 20% OFF anual (paga 10 meses, usa 12)
  const MICRO_MONTHLY = 99;
  const MINI_MONTHLY = 999;
  
  // Si hay cupón válido, aplicar su descuento
  const applyCouponDiscount = (basePrice: number) => {
    if (couponValid?.valid && couponValid.discount_percent) {
      return +(basePrice * (1 - couponValid.discount_percent / 100)).toFixed(2);
    }
    return basePrice;
  };

  const MICRO_MONTHLY_EFFECTIVE = couponValid?.valid 
    ? applyCouponDiscount(MICRO_MONTHLY)
    : MICRO_MONTHLY;
  
  const MINI_MONTHLY_EFFECTIVE = couponValid?.valid
    ? applyCouponDiscount(MINI_MONTHLY)
    : MINI_MONTHLY;
  
  const MICRO_ANNUAL = useMemo(() => 
    couponValid?.valid 
      ? applyCouponDiscount(MICRO_MONTHLY * 12)
      : +(MICRO_MONTHLY * 12 * (1 - DISCOUNT)).toFixed(2), 
    [couponValid]
  );
  
  const MINI_ANNUAL = useMemo(() => 
    couponValid?.valid
      ? applyCouponDiscount(MINI_MONTHLY * 12)
      : +(MINI_MONTHLY * 12 * (1 - DISCOUNT)).toFixed(2),
    [couponValid]
  );

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
      const isGold = instrument === "gold";
      
      // Map client selection → server plan id (must match server PLANS keys)
      let planId: string;
      if (plan === "Micro") {
        if (isGold) {
          planId = isAnnual ? "micro_gold_annual" : "micro_gold_monthly";
        } else {
          planId = isAnnual ? "micro_annual" : "micro_monthly";
        }
      } else { // Mini
        if (isGold) {
          planId = isAnnual ? "mini_gold_annual" : "mini_gold_monthly";
        } else {
          planId = isAnnual ? "mini_annual" : "mini_monthly";
        }
      }

      // Prepare payment data
      const paymentData: any = {
        plan: planId,
        intro: false, // No intro discount
      };

      // Si hay cupón válido, agregarlo al payload
      if (couponValid?.valid && couponValid.code) {
        paymentData.coupon_code = couponValid.code;
        paymentData.coupon_discount = couponValid.discount_percent;
        paymentData.coupon_duration = couponValid.duration_months;
      }

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
          body: JSON.stringify(paymentData),
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
          description: `${t("pricing.errorDesc", { defaultValue: "Could not process payment." })} ${(data as any)?.details ?? JSON.stringify(data)}`,
          variant: "destructive",
        });
        return;
      }

      if (data?.approvalUrl) {
        window.location.href = data.approvalUrl as string;
      } else {
        toast({
          title: t("pricing.error", { defaultValue: "Error" }),
          description: `${t("pricing.errorDesc", { defaultValue: "Could not get approval URL." })} ${(data as any)?.details ?? JSON.stringify(data)}`,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: t("pricing.error", { defaultValue: "Error" }),
        description: t("pricing.errorDesc", { defaultValue: "Could not process payment." }),
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
        defaultValue: "Instrument: {{instrument}} ({{symbol}})",
        instrument: currentInstrument.name,
        symbol,
      }),
      t("pricing.feature.focusInstrument", {
        defaultValue: "Exclusive focus on {{instrument}}",
        instrument: currentInstrument.name,
      }),
      t("pricing.feature.liveSupport",   { defaultValue: "Email support: support@ainside.me" }),
      t("pricing.feature.secure",        { defaultValue: "Secure checkout with PayPal" }),
      t("pricing.feature.updatesMonthly",{ defaultValue: "Monthly updates included" }),
      t("pricing.feature.noGuarantees",  { defaultValue: "No performance guarantees" }),
    ];
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-[color:#0b1220]">
      {/* Controles superiores simétricos */}
      <section className="px-4 pt-8">
        <div className="max-w-5xl mx-auto py-6 grid gap-6 md:grid-cols-2">
          {/* Toggle Mensual/Anual (segmentado, formal) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-slate-200 font-medium mb-3">
              {t("pricing.billingCycle", { defaultValue: "Billing Cycle" })}
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
                {t("pricing.monthly", { defaultValue: "Monthly" })}
              </button>
              <button
                onClick={() => setBilling("annual")}
                aria-pressed={billing === "annual"}
                className={`px-4 py-2 text-sm border-l border-slate-700
                  ${billing === "annual"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-900"}`}
              >
                {t("pricing.annual", { defaultValue: "Annual" })}
                <span className="ml-2">
                  <Badge className="bg-emerald-700 text-white border-0">
                    {t("pricing.save", { defaultValue: "Pay 10, Use 12" })}
                  </Badge>
                </span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {t("pricing.renews", {
                defaultValue: "Auto-renews. You can cancel anytime.",
              })}
            </p>
          </div>

          {/* Selector de Instrumento (radio formal) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-slate-200 font-medium mb-3">
              {t("pricing.chooseInstrument", { defaultValue: "Choose Instrument" })}
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

      {/* Cupón de Descuento */}
      <section className="px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <Card className="rounded-xl border border-slate-800 bg-slate-950">
            <CardHeader>
              <CardTitle className="text-slate-100 text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                {t("pricing.coupon.title", { defaultValue: "Have a discount coupon?" })}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t("pricing.coupon.description", { 
                  defaultValue: "Enter your code to apply the corresponding discount" 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!couponValid?.valid ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        validateCoupon();
                      }
                    }}
                    placeholder={t("pricing.coupon.placeholder", { defaultValue: "XXXX-XXXX-XXXX" })}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={14}
                    disabled={validatingCoupon}
                  />
                  <Button
                    onClick={validateCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {validatingCoupon 
                      ? t("pricing.coupon.validating", { defaultValue: "Validating..." })
                      : t("pricing.coupon.apply", { defaultValue: "Apply" })
                    }
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Check className="h-5 w-5 text-green-400" />
                      <span className="font-mono font-bold text-green-400">{couponValid.code}</span>
                    </div>
                    <p className="text-sm text-green-300">
                      {t("pricing.coupon.applied", {
                        defaultValue: "{{percent}}% discount applied for {{months}} months",
                        percent: couponValid.discount_percent,
                        months: couponValid.duration_months
                      })}
                    </p>
                  </div>
                  <Button
                    onClick={removeCoupon}
                    variant="outline"
                    size="sm"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    {t("pricing.coupon.remove", { defaultValue: "Remove" })}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Planes — diseño simétrico y formal */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2 auto-rows-fr">
          {/* MICRO */}
          <Card className="h-full flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 text-xl">
                {t("pricing.micro.name", { 
                  defaultValue: "Micro Contract {{instrument}}",
                  instrument: currentInstrument.name
                })}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t("pricing.micro.description", { 
                  defaultValue: "Trading with micro contracts ({{symbol}}).",
                  symbol: currentInstrument.symbolByPlan.Micro
                })}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              {billing === "monthly" ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-slate-100">{fmtCurrency(MICRO_MONTHLY_EFFECTIVE)}</span>
                  <span className="text-slate-400 text-lg">{t("pricing.perMonth", { defaultValue: "/month" })}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold text-slate-100">{fmtCurrency(MICRO_ANNUAL)}</span>
                    <span className="text-slate-400 text-lg">{t("pricing.perYear", { defaultValue: "/year" })}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    {t("pricing.compareMicro", {
                      defaultValue: "Equals {{perMonth}}/month (was: {{fullYear}}/year).",
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
                {isProcessing ? t("pricing.processing", { defaultValue: "Processing..." }) : t("pricing.cta", { defaultValue: "Subscribe" })}
              </Button>
            </CardFooter>
          </Card>

          {/* MINI */}
          <Card className="h-full flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100 text-xl">
                    {t("pricing.mini.name", { 
                      defaultValue: "Mini Contract {{instrument}}",
                      instrument: currentInstrument.name
                    })}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {t("pricing.mini.description", { 
                      defaultValue: "Trading with mini contracts ({{symbol}}).",
                      symbol: currentInstrument.symbolByPlan.Mini
                    })}
                  </CardDescription>
                </div>
                <Badge className="bg-slate-800 text-slate-200 border border-slate-700">
                  {t("pricing.popular", { defaultValue: "Recommended" })}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {billing === "monthly" ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-slate-100">{fmtCurrency(MINI_MONTHLY_EFFECTIVE)}</span>
                  <span className="text-slate-400 text-lg">{t("pricing.perMonth", { defaultValue: "/month" })}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold text-slate-100">{fmtCurrency(MINI_ANNUAL)}</span>
                    <span className="text-slate-400 text-lg">{t("pricing.perYear", { defaultValue: "/year" })}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    {t("pricing.compareMini", {
                      defaultValue: "Equals {{perMonth}}/month (was: {{fullYear}}/year).",
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
                {isProcessing ? t("pricing.processing", { defaultValue: "Processing..." }) : t("pricing.cta", { defaultValue: "Subscribe" })}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Franja de confianza sobria */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-800 pt-8">
          <div className="text-center">
            <Shield className="h-6 w-6 mx-auto text-slate-200" />
            <h3 className="mt-2 text-slate-200 font-medium">{t("trust.ssl", { defaultValue: "SSL Security" })}</h3>
            <p className="text-slate-400 text-sm mt-1">
              {t("homepage.capabilities.security.description", {
                defaultValue: "End-to-end protection and security best practices.",
              })}
            </p>
          </div>
          <div className="text-center">
            <Globe className="h-6 w-6 mx-auto text-slate-200" />
            <h3 className="mt-2 text-slate-200 font-medium">
              {t("homepage.capabilities.analytics.title", { defaultValue: "Advanced Analytics" })}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {t("homepage.capabilities.analytics.description", {
                defaultValue: "Key metrics and continuous performance tracking.",
              })}
            </p>
          </div>
          <div className="text-center">
            <Clock className="h-6 w-6 mx-auto text-slate-200" />
            <h3 className="mt-2 text-slate-200 font-medium">
              {t("trust.compliant", { defaultValue: "Compliance" })}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {t("pricing.billingInfo", {
                defaultValue: "Monthly or annual billing (20% OFF on annual). Cancel anytime.",
              })}
            </p>
          </div>
        </div>

        {/* CTA de soporte */}
        <div className="max-w-5xl mx-auto text-center mt-10">
          <p className="text-slate-300 mb-4">
            {t("pricing.support", { defaultValue: "Need help? Our team is available 24/6." })}
          </p>
          <Link to="/contact">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-900">
              {t("contact.title", { defaultValue: "Contact" })}
            </Button>
          </Link>
        </div>
      </section>

      {/* Redirect-based checkout; approval handled on PayPal, capture on return */}
    </div>
  );
}


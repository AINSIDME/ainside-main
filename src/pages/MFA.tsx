import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, ArrowRight, KeyRound, CheckCircle2, QrCode } from "lucide-react";

type LocationState = {
  redirectTo?: string;
};

const MFA = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const state = (location.state as LocationState | null) ?? null;
    return state?.redirectTo || "/dashboard";
  }, [location.state]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  const [hasVerifiedFactor, setHasVerifiedFactor] = useState(false);
  const [hasUnverifiedFactor, setHasUnverifiedFactor] = useState(false);
  const [unverifiedFactorIds, setUnverifiedFactorIds] = useState<string[]>([]);

  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const loadFactors = async () => {
    setIsLoading(true);
    setNeedsLogin(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNeedsLogin(true);
        return;
      }

      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const allFactors: any[] = (data as any)?.all ?? [];
      const verifiedFactors = allFactors.filter((f) => f?.status === "verified");
      const unverifiedFactors = allFactors.filter((f) => f?.status && f?.status !== "verified");

      const firstVerified = verifiedFactors[0] ?? null;
      const firstUnverified = unverifiedFactors[0] ?? null;

      setHasVerifiedFactor(verifiedFactors.length > 0);
      setHasUnverifiedFactor(unverifiedFactors.length > 0);
      setUnverifiedFactorIds(
        unverifiedFactors.map((f) => String(f?.id)).filter((id) => Boolean(id))
      );

      // Si ya está verificado, no mostramos QR/secret (no se puede “re-recuperar” el QR).
      // Si hay un factor pendiente, dejamos el factorId para permitir verificar con código.
      setFactorId((firstVerified?.id ?? firstUnverified?.id ?? null) as string | null);
      setQrCode(null);
      setSecret(null);
    } catch (error: any) {
      toast({
        title: t("mfa.error.title", { defaultValue: "Error" }),
        description: error.message || t("mfa.error.message", { defaultValue: "No se pudo cargar 2FA." }),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFactors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartEnroll = async () => {
    setIsEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;

      const enrolledFactorId = (data as any)?.id as string | undefined;
      const totp = (data as any)?.totp as { qr_code?: string; secret?: string } | undefined;

      if (!enrolledFactorId) {
        throw new Error(
          t("mfa.enroll.startError", { defaultValue: "No se pudo iniciar el registro de 2FA." })
        );
      }

      setFactorId(enrolledFactorId);
      setQrCode(totp?.qr_code ?? null);
      setQrDataUrl(null);
      setSecret(totp?.secret ?? null);
      setHasVerifiedFactor(false);
      setHasUnverifiedFactor(false);
      setUnverifiedFactorIds([]);

      toast({
        title: t("mfa.enroll.title", { defaultValue: "2FA iniciado" }),
        description: t("mfa.enroll.message", {
          defaultValue: "Escanea el QR en Google Authenticator / Authy y confirma con el código.",
        }),
      });
    } catch (error: any) {
      toast({
        title: t("mfa.error.title", { defaultValue: "Error" }),
        description: error.message || t("mfa.enroll.error", { defaultValue: "No se pudo activar 2FA." }),
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleResetEnroll = async () => {
    setIsEnrolling(true);
    try {
      // Si hay factores pendientes, los eliminamos para poder generar un QR nuevo.
      // Supabase no expone el QR de un factor ya creado por seguridad.
      const idsToRemove = unverifiedFactorIds.length > 0 ? unverifiedFactorIds : factorId ? [factorId] : [];
      for (const id of idsToRemove) {
        try {
          // @ts-expect-error: el tipado puede variar según versión, pero el método existe en supabase-js v2.
          const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
          if (error) throw error;
        } catch {
          // No bloqueamos si falla borrar uno; intentamos seguir.
        }
      }

      setFactorId(null);
      setQrCode(null);
      setQrDataUrl(null);
      setSecret(null);
      setHasVerifiedFactor(false);
      setHasUnverifiedFactor(false);
      setUnverifiedFactorIds([]);

      await handleStartEnroll();
    } catch (error: any) {
      toast({
        title: t("mfa.error.title", { defaultValue: "Error" }),
        description:
          error.message ||
          t("mfa.reset.error", { defaultValue: "No se pudo generar un nuevo QR de 2FA." }),
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) {
      toast({
        title: t("mfa.error.title", { defaultValue: "Error" }),
        description: t("mfa.verify.noFactor", { defaultValue: "Primero activa 2FA." }),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;

      const challengeId = (challengeData as any)?.id as string | undefined;
      if (!challengeId) {
        throw new Error(
          t("mfa.verify.challengeStartError", { defaultValue: "No se pudo iniciar el desafío 2FA." })
        );
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });
      if (verifyError) throw verifyError;

      toast({
        title: t("mfa.verify.success.title", { defaultValue: "Verificado" }),
        description: t("mfa.verify.success.message", { defaultValue: "2FA verificado correctamente." }),
      });

      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      toast({
        title: t("mfa.error.title", { defaultValue: "Error" }),
        description: error.message || t("mfa.verify.error", { defaultValue: "Código inválido." }),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQr = () => {
    if (!qrCode) return null;

    if (qrDataUrl) {
      return <img src={qrDataUrl} alt="TOTP QR" className="mx-auto bg-white p-2 rounded" />;
    }

    if (qrCode.trim().startsWith("data:image")) {
      return <img src={qrCode} alt="TOTP QR" className="mx-auto bg-white p-2 rounded" />;
    }

    if (qrCode.includes("<svg")) {
      return (
        <div
          className="mx-auto bg-white p-2 rounded"
          dangerouslySetInnerHTML={{ __html: qrCode }}
        />
      );
    }

    return (
      <p className="text-sm text-slate-300 break-all">
        {t("mfa.qr.fallback", { defaultValue: "QR:" })} {qrCode}
      </p>
    );
  };

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      if (!qrCode) {
        setQrDataUrl(null);
        return;
      }

      const value = qrCode.trim();

      // Ya viene como imagen o SVG embebido.
      if (value.startsWith("data:image") || value.includes("<svg")) {
        setQrDataUrl(null);
        return;
      }

      try {
        const qrcode = await import("qrcode");
        const dataUrl = await qrcode.toDataURL(value, { margin: 1, width: 220 });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch {
        if (!cancelled) setQrDataUrl(null);
      }
    };

    void generate();
    return () => {
      cancelled = true;
    };
  }, [qrCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
          <CardContent className="p-16 text-center">
            <Loader2 className="w-12 h-12 text-neutral-800 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-light text-black mb-3 tracking-tight">{t("mfa.loading", { defaultValue: "Cargando..." })}</h2>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.25em]">Verificación de Seguridad</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
          <CardHeader className="space-y-6 pb-10 pt-16 px-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-2">
              <Shield className="w-8 h-8 text-neutral-800" />
            </div>
            <CardTitle className="text-3xl font-light text-black tracking-tight">
              {t("mfa.loginRequired.title", { defaultValue: "Iniciar sesión requerido" })}
            </CardTitle>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.25em]">Institutional Access Control</p>
            <CardDescription className="text-neutral-600 text-base font-light pt-4">
              {t("mfa.loginRequired.message", {
                defaultValue:
                  "Para configurar o verificar tu 2FA, primero tenés que iniciar sesión con tu cuenta.",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-16 px-12 space-y-4">
            <Button
              className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
              onClick={() => navigate("/login", { state: { redirectTo: "/mfa" } })}
            >
              <Shield className="mr-3 h-5 w-5" />
              {t("mfa.loginRequired.cta", { defaultValue: "Ir a iniciar sesión" })}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-14 border-2 border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-black rounded-lg font-medium tracking-wide transition-all duration-300" 
              onClick={() => navigate("/")}
            >
              {t("mfa.back", { defaultValue: "Volver" })}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-6">
      {/* Fixed Logo */}
      <div className="fixed top-10 left-10">
        <img 
          src="https://odlxhgatqyodxdessxts.supabase.co/storage/v1/object/public/system-assets/ainside-logo-black.svg" 
          alt="AInside" 
          className="h-10 opacity-50 hover:opacity-70 transition-opacity duration-300"
        />
      </div>

      <div className="w-full max-w-lg">
        <Card className="bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
          <CardHeader className="space-y-6 pb-10 pt-16 px-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-2">
              <Shield className="w-8 h-8 text-neutral-800" />
            </div>
            <CardTitle className="text-3xl font-light text-black tracking-tight">
              {t("mfa.title", { defaultValue: "Seguridad 2FA" })}
            </CardTitle>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.25em]">Institutional Algorithmic Trading</p>
          </CardHeader>
          <CardContent className="pb-16 px-12 space-y-6">
            <CardDescription className="text-neutral-600 text-base font-light">
              {t("mfa.subtitle", {
                defaultValue:
                  "Activa verificación en dos pasos con una app (Google Authenticator / Authy).",
              })}
            </CardDescription>

            {!factorId && (
              <Button 
                className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group" 
                onClick={handleStartEnroll} 
                disabled={isEnrolling}
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    {t("mfa.enabling", { defaultValue: "ACTIVANDO" })}
                    <div className="w-5 h-5 ml-3"></div>
                  </>
                ) : (
                  <>
                    <Shield className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    {t("mfa.enable", { defaultValue: "ACTIVAR 2FA" })}
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            )}

            {factorId && hasUnverifiedFactor && !qrCode && !secret && (
              <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-200 flex-shrink-0">
                    <QrCode className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black uppercase tracking-wide mb-2">
                      {t("mfa.pending.title", { defaultValue: "2FA pendiente" })}
                    </p>
                    <p className="text-sm text-neutral-600 font-light">
                      {t("mfa.pending.message", {
                        defaultValue:
                          "Ya hay un registro de 2FA en tu cuenta, pero el QR no se puede recuperar. Si ya escaneaste el QR, ingresá el código abajo. Si no lo escaneaste o lo perdiste, generá un nuevo QR.",
                      })}
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full h-14 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider transition-all duration-300" 
                  onClick={handleResetEnroll} 
                  disabled={isEnrolling}
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("mfa.reset.loading", { defaultValue: "GENERANDO" })}
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-5 w-5" />
                      {t("mfa.reset.cta", { defaultValue: "GENERAR NUEVO QR" })}
                    </>
                  )}
                </Button>
              </div>
            )}

            {factorId && hasVerifiedFactor && !qrCode && !secret && (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-neutral-700" />
                  <p className="text-xs font-medium text-black uppercase tracking-widest">Configuración Completa</p>
                </div>
                <p className="text-sm text-neutral-600 font-light">
                  {t("mfa.verified.note", {
                    defaultValue:
                      "Tu 2FA ya está configurado. Abrí tu app (Authenticator/Authy) e ingresá el código para verificar.",
                  })}
                </p>
              </div>
            )}

            {(qrCode || secret) && (
              <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-neutral-700" />
                  <p className="text-xs font-medium text-black uppercase tracking-widest">Escanear Código QR</p>
                </div>
                {renderQr()}
                {secret && (
                  <div className="pt-4 border-t border-neutral-200">
                    <p className="text-xs text-neutral-600 font-light mb-2">
                      {t("mfa.secret", { defaultValue: "Clave manual:" })}
                    </p>
                    <p className="text-sm font-mono bg-white border border-neutral-200 rounded px-3 py-2 text-neutral-800 break-all">
                      {secret}
                    </p>
                  </div>
                )}
              </div>
            )}

            {factorId && (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="mfaCode" className="text-black font-medium uppercase tracking-wide text-xs flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    {t("mfa.code.label", { defaultValue: "Código 2FA" })}
                  </Label>
                  <Input
                    id="mfaCode"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={t("mfa.code.placeholder", { defaultValue: "123456" })}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="h-20 text-center text-4xl tracking-[0.5em] font-mono bg-white border-2 border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 text-black rounded-lg transition-all duration-300"
                  />
                  <p className="text-xs text-neutral-500 text-center uppercase tracking-widest">
                    Renovación cada 30 segundos
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      {t("mfa.verifying", { defaultValue: "VERIFICANDO" })}
                      <div className="w-5 h-5 ml-3"></div>
                    </>
                  ) : (
                    <>
                      <Shield className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      {t("mfa.verify.button", { defaultValue: "VERIFICAR" })}
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="pt-6 border-t border-neutral-200">
              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg font-light tracking-wide transition-all duration-300"
                onClick={() => navigate(redirectTo)}
              >
                {t("mfa.back", { defaultValue: "Volver" })}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MFA;

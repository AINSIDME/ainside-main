import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";

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

  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const loadFactors = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const allFactors: any[] = (data as any)?.all ?? [];
      const firstVerified = allFactors.find((f) => f?.status === "verified") ?? null;
      const firstAny = allFactors[0] ?? null;

      setFactorId((firstVerified?.id ?? firstAny?.id ?? null) as string | null);
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
      setSecret(totp?.secret ?? null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("mfa.loading", { defaultValue: "Cargando..." })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="container mx-auto max-w-md">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {t("mfa.title", { defaultValue: "Seguridad 2FA" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-slate-300 text-sm">
              {t("mfa.subtitle", {
                defaultValue:
                  "Activa verificación en dos pasos con una app (Google Authenticator / Authy).",
              })}
            </div>

            {!factorId && (
              <Button className="w-full" onClick={handleStartEnroll} disabled={isEnrolling}>
                {isEnrolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("mfa.enabling", { defaultValue: "Activando..." })}
                  </>
                ) : (
                  t("mfa.enable", { defaultValue: "Activar 2FA" })
                )}
              </Button>
            )}

            {(qrCode || secret) && (
              <div className="space-y-3">
                {renderQr()}
                {secret && (
                  <p className="text-xs text-slate-300 break-all">
                    {t("mfa.secret", { defaultValue: "Clave:" })} <span className="font-mono">{secret}</span>
                  </p>
                )}
              </div>
            )}

            {factorId && (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mfaCode" className="text-slate-200">
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
                    className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400 py-6 rounded-xl"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("mfa.verifying", { defaultValue: "Verificando..." })}
                    </>
                  ) : (
                    t("mfa.verify.button", { defaultValue: "Verificar" })
                  )}
                </Button>
              </form>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate(redirectTo)}
            >
              {t("mfa.back", { defaultValue: "Volver" })}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MFA;

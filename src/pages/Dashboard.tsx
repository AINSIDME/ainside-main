import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  LogOut, 
  Download,
  Key,
  Copy,
  CheckCircle,
  XCircle,
  Activity,
  Settings,
  Mail,
  Calendar,
  ShieldCheck
} from "lucide-react";

interface UserData {
  email: string;
  created_at: string;
  hwid?: string;
  plan_name?: string;
  status?: string;
  strategies_active?: string[];
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaVerifiedCount, setMfaVerifiedCount] = useState(0);
  const [mfaCurrentLevel, setMfaCurrentLevel] = useState<string | null>(null);
  const [mfaNextLevel, setMfaNextLevel] = useState<string | null>(null);
  const [downloadEmailOtpSent, setDownloadEmailOtpSent] = useState(false);
  const [downloadEmailOtpValue, setDownloadEmailOtpValue] = useState("");
  const [downloadEmailOtpLoading, setDownloadEmailOtpLoading] = useState(false);
  const [downloadVerifying, setDownloadVerifying] = useState(false);
  const [hwidCopied, setHwidCopied] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setNeedsMfa(false);

      // If user has MFA enabled, require AAL2 before showing protected data.
      try {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        const currentLevel = (data as any)?.currentLevel as string | undefined;
        const nextLevel = (data as any)?.nextLevel as string | undefined;

        setMfaCurrentLevel(currentLevel ?? null);
        setMfaNextLevel(nextLevel ?? null);

        if (currentLevel !== "aal2" && nextLevel === "aal2") {
          setNeedsMfa(true);
          return;
        }
      } catch {
        // MFA not enabled/available; continue.
      }

      // MFA status (for UX): show whether any factors exist and are verified.
      try {
        const { data } = await supabase.auth.mfa.listFactors();
        const allFactors = [...(data?.totp ?? []), ...(data as any)?.phone ?? []];
        const verified = (allFactors ?? []).filter((f: any) => f?.status === "verified");
        setMfaEnabled((allFactors?.length ?? 0) > 0);
        setMfaVerifiedCount(verified.length);
      } catch {
        setMfaEnabled(false);
        setMfaVerifiedCount(0);
      }

      setUser(user);

      // Get user registration data
      const { data: registration } = await (supabase as any)
        .from("hwid_registrations")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      // Get connection status
      if (registration?.hwid) {
        const { data: connection } = await (supabase as any)
          .from("client_connections")
          .select("*")
          .eq("hwid", registration.hwid)
          .maybeSingle();

        setUserData({
          email: user.email || "",
          created_at: user.created_at,
          hwid: registration.hwid,
          plan_name: connection?.plan_name || "Basic",
          status: connection ? (
            new Date().getTime() - new Date(connection.last_seen).getTime() < 120000 ? "online" : "offline"
          ) : "offline",
          strategies_active: connection?.strategies_active || []
        });
      } else {
        setUserData({
          email: user.email || "",
          created_at: user.created_at,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutOtherSessions = async () => {
    try {
      // Supabase JS supports scopes in v2; using any to avoid type mismatches in some setups.
      await (supabase.auth as any).signOut({ scope: "others" });
      toast({
        title: t("dashboard.security.sessions.successTitle", { defaultValue: "Sesiones cerradas" }),
        description: t("dashboard.security.sessions.successDesc", {
          defaultValue: "Se cerró la sesión en otros dispositivos.",
        }),
      });
    } catch (e: any) {
      console.error("Sign out others error:", e);
      toast({
        title: t("dashboard.error", { defaultValue: "Error" }),
        description: e?.message || t("dashboard.security.sessions.errorDesc", { defaultValue: "No se pudo cerrar sesiones." }),
        variant: "destructive",
      });
    }
  };

  const requestDownloadEmailOtp = async () => {
    setDownloadEmailOtpLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { error } = await supabase.functions.invoke("request-download-email-otp");
      if (error) throw error;

      setDownloadEmailOtpSent(true);
      toast({
        title: t("dashboard.software.otpSentTitle", { defaultValue: "Código enviado" }),
        description: t("dashboard.software.otpSentDesc", { defaultValue: "Revisá tu email e ingresá el código para descargar." }),
      });
    } catch (e: any) {
      console.error("OTP request error:", e);
      toast({
        title: t("dashboard.error", { defaultValue: "Error" }),
        description: e?.message || t("dashboard.software.otpErrorDesc", { defaultValue: "No se pudo enviar el código." }),
        variant: "destructive",
      });
    } finally {
      setDownloadEmailOtpLoading(false);
    }
  };

  const downloadWithEmailOtp = async () => {
    setDownloadVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase.functions.invoke("download-hwid-tool", {
        body: { emailOtp: downloadEmailOtpValue },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Missing download URL");

      window.open(data.url, "_blank");
      setDownloadEmailOtpValue("");
    } catch (e: any) {
      console.error("Download with email OTP error:", e);
      toast({
        title: t("dashboard.error", { defaultValue: "Error" }),
        description: e?.message || t("dashboard.software.downloadErrorDesc", { defaultValue: "No se pudo generar el enlace de descarga." }),
        variant: "destructive",
      });
    } finally {
      setDownloadVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Limpiar tokens de 2FA
      localStorage.removeItem('admin_2fa_verified');
      localStorage.removeItem('admin_2fa_timestamp');
      localStorage.removeItem('admin_2fa_token');
      
      await supabase.auth.signOut();
      toast({
        title: t("dashboard.logout.success", { defaultValue: "Sesión cerrada" }),
        description: t("dashboard.logout.message", { defaultValue: "Has cerrado sesión correctamente" }),
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: t("dashboard.error", { defaultValue: "Error" }),
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">{t("dashboard.loading", { defaultValue: "Cargando..." })}</div>
      </div>
    );
  }

  if (needsMfa) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="container mx-auto max-w-md">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                {t("dashboard.mfaRequired.title", { defaultValue: "Verificación 2FA requerida" })}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t("dashboard.mfaRequired.message", {
                  defaultValue:
                    "Para ver tu panel, primero tenés que verificar tu 2FA (nivel AAL2).",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => navigate("/mfa", { state: { redirectTo: "/dashboard" } })}
              >
                {t("dashboard.mfaRequired.cta", { defaultValue: "Ir a 2FA" })}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}
              >
                {t("dashboard.mfaRequired.back", { defaultValue: "Volver" })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t("dashboard.title", { defaultValue: "Mi Panel de Control" })}
            </h1>
            <p className="text-slate-400">
              {t("dashboard.subtitle", { defaultValue: "Gestiona tu cuenta y configuración" })}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("dashboard.logout.button", { defaultValue: "Cerrar Sesión" })}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("dashboard.profile.title", { defaultValue: "Información de Usuario" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                    <p className="text-sm text-slate-400">
                      {t("dashboard.profile.emailLabel", { defaultValue: "Email" })}
                    </p>
                  <p className="text-white font-medium">{userData?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                    <p className="text-sm text-slate-400">
                      {t("dashboard.profile.memberSince", { defaultValue: "Miembro desde" })}
                    </p>
                  <p className="text-white font-medium">
                    {new Date(userData?.created_at || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
              {userData?.plan_name && (
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-slate-400" />
                  <div>
                      <p className="text-sm text-slate-400">
                        {t("dashboard.plan.label", { defaultValue: "Plan" })}
                      </p>
                    <Badge className="bg-blue-600 mt-1">{userData.plan_name}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("dashboard.security.title", { defaultValue: "Seguridad" })}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t("dashboard.security.description", {
                  defaultValue:
                    "Protegé tu cuenta con 2FA, cerrá sesiones en otros dispositivos y asegurá descargas.",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-slate-400">
                    {t("dashboard.security.mfaStatusLabel", { defaultValue: "Estado 2FA" })}
                  </p>
                  <p className="text-white font-medium">
                    {mfaEnabled
                      ? t("dashboard.security.mfaEnabled", { defaultValue: "Activado" })
                      : t("dashboard.security.mfaDisabled", { defaultValue: "Desactivado" })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("dashboard.security.aal", {
                      defaultValue: "Nivel de sesión: {{current}} (siguiente: {{next}})",
                      current: mfaCurrentLevel ?? "-",
                      next: mfaNextLevel ?? "-",
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="text-slate-200 border-slate-600">
                  {mfaEnabled
                    ? t("dashboard.security.mfaFactors", {
                        defaultValue: "Verificados: {{count}}",
                        count: mfaVerifiedCount,
                      })
                    : t("dashboard.security.mfaNoFactors", { defaultValue: "Sin 2FA" })}
                </Badge>
              </div>

              <div className="grid gap-2">
                <Button onClick={() => navigate("/mfa", { state: { redirectTo: "/dashboard" } })} className="w-full">
                  {mfaEnabled
                    ? t("dashboard.security.mfaManage", { defaultValue: "Administrar 2FA" })
                    : t("dashboard.security.mfaEnable", { defaultValue: "Activar 2FA" })}
                </Button>
                <Button onClick={handleSignOutOtherSessions} variant="outline" className="w-full">
                  {t("dashboard.security.sessions.cta", { defaultValue: "Cerrar sesión en otros dispositivos" })}
                </Button>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-950/30 p-3">
                <p className="text-xs text-slate-400">
                  {t("dashboard.security.downloadsNote", {
                    defaultValue:
                      "Las descargas se generan con enlaces temporales y pueden requerir 2FA (recomendado). Además, podés recibir un email cuando se genere un enlace.",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* HWID Status Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t("dashboard.hwid.title", { defaultValue: "Estado de HWID" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData?.hwid ? (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">
                        {t("dashboard.hwid.registered.title", { defaultValue: "HWID Registrado" })}
                      </p>
                      <div className="mt-2 flex items-start gap-2">
                        <p className="text-sm text-slate-200 font-mono whitespace-normal break-all">
                          {userData.hwid}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0 border-slate-700 text-slate-200"
                          onClick={async () => {
                            try {
                              const value = userData.hwid || "";
                              await navigator.clipboard.writeText(value);
                              setHwidCopied(true);
                              window.setTimeout(() => setHwidCopied(false), 1200);
                            } catch {
                              toast({
                                title: t("dashboard.error", { defaultValue: "Error" }),
                                description: t("dashboard.hwid.copyError", { defaultValue: "No se pudo copiar el HWID." }),
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          {hwidCopied
                            ? t("dashboard.hwid.copied", { defaultValue: "Copiado" })
                            : t("dashboard.hwid.copy", { defaultValue: "Copiar" })}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">
                        {t("dashboard.hwid.connectionStatus.label", { defaultValue: "Estado de Conexión" })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {userData.status === "online" ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400 font-medium">
                              {t("dashboard.hwid.connectionStatus.online", { defaultValue: "En Línea" })}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                            <span className="text-gray-400 font-medium">
                              {t("dashboard.hwid.connectionStatus.offline", { defaultValue: "Fuera de Línea" })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {userData.strategies_active && userData.strategies_active.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">
                        {t("dashboard.hwid.activeStrategies.label", { defaultValue: "Estrategias Activas" })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {userData.strategies_active.map((strategy) => (
                          <Badge key={strategy} variant="outline" className="text-green-400 border-green-400">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">
                        {t("dashboard.hwid.notRegistered.title", { defaultValue: "HWID No Registrado" })}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {t("dashboard.hwid.notRegistered.desc", { defaultValue: "Registra tu HWID para activar tu licencia" })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/register")}
                    className="w-full gap-2"
                  >
                    <Key className="h-4 w-4" />
                    {t("dashboard.hwid.registerButton", { defaultValue: "Registrar HWID" })}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Download Software Card */}
          <Card className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border-blue-500/30 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-blue-100 flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t("dashboard.software.title", { defaultValue: "Software AInside HWID Tool" })}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {t("dashboard.software.description", { defaultValue: "Descarga el software oficial para gestionar tu HWID y conectarte en tiempo real" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={async () => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();

                    if (!session) {
                      navigate("/login");
                      return;
                    }

                    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
                    if (aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2") {
                      navigate("/mfa");
                      return;
                    }

                    if (aalData?.currentLevel !== "aal2") {
                      await requestDownloadEmailOtp();
                      return;
                    }

                    const { data, error } = await supabase.functions.invoke("download-hwid-tool");
                    if (error) throw error;
                    if (!data?.url) throw new Error("Missing download URL");

                    window.open(data.url, "_blank");
                  } catch (e: any) {
                    console.error("Download error:", e);
                    toast({
                      title: t("dashboard.software.downloadErrorTitle", { defaultValue: "Error" }),
                      description: e?.message || t("dashboard.software.downloadErrorDesc", { defaultValue: "No se pudo generar el enlace de descarga." }),
                      variant: "destructive",
                    });
                  }
                }}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                {t("dashboard.software.download", { defaultValue: "Descargar para Windows" })}
              </Button>

              {downloadEmailOtpSent && (
                <div className="mt-4 rounded-md border border-blue-500/20 bg-slate-950/20 p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="dashboard-download-email-otp" className="text-slate-200">
                      {t("dashboard.software.otpLabel", { defaultValue: "Código por email" })}
                    </Label>
                    <Input
                      id="dashboard-download-email-otp"
                      value={downloadEmailOtpValue}
                      onChange={(e) => setDownloadEmailOtpValue(e.target.value)}
                      placeholder={t("dashboard.software.otpPlaceholder", { defaultValue: "Ingresá el código de 6 dígitos" })}
                      className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      onClick={downloadWithEmailOtp}
                      disabled={downloadVerifying || !downloadEmailOtpValue}
                      className="flex-1"
                    >
                      {downloadVerifying
                        ? t("dashboard.software.otpVerifying", { defaultValue: "Verificando..." })
                        : t("dashboard.software.otpDownload", { defaultValue: "Verificar y descargar" })}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={requestDownloadEmailOtp}
                      disabled={downloadEmailOtpLoading}
                      className="flex-1 border-slate-600/40 text-slate-200"
                    >
                      {downloadEmailOtpLoading
                        ? t("dashboard.software.otpResendLoading", { defaultValue: "Enviando..." })
                        : t("dashboard.software.otpResend", { defaultValue: "Reenviar código" })}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

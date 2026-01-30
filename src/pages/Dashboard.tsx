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
        title: t("dashboard.security.sessions.successTitle"),
        description: t("dashboard.security.sessions.successDesc"),
      });
    } catch (e: any) {
      console.error("Sign out others error:", e);
      toast({
        title: t("dashboard.error"),
        description: e?.message || t("dashboard.security.sessions.error"),
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
        title: t("dashboard.software.otpSent"),
        description: t("dashboard.software.otpSentDesc"),
      });
    } catch (e: any) {
      console.error("OTP request error:", e);
      toast({
        title: t("dashboard.error"),
        description: e?.message || t("dashboard.software.otpError"),
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
        title: t("dashboard.error"),
        description: e?.message || t("dashboard.software.downloadErrorDesc"),
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
        title: t("dashboard.logout.success"),
        description: t("dashboard.logout.message"),
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: t("dashboard.error"),
        description: t("dashboard.logout.error"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">{t("dashboard.loading")}</div>
      </div>
    );
  }

  if (needsMfa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-6 flex items-center justify-center">
        <div className="container mx-auto max-w-lg">
          <Card className="bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
            <CardHeader className="space-y-6 pb-10 pt-16 px-12">
              {/* Badge ADMIN prominente */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-2">
                <ShieldCheck className="w-4 h-4" />
                2FA
              </div>
              
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 mb-2">
                <ShieldCheck className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-light text-black tracking-tight">
                {t("dashboard.mfaRequired.title")}
              </CardTitle>
              <CardDescription className="text-neutral-600 text-base font-light pt-2">
                {t("dashboard.mfaRequired.message")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-16 px-12 space-y-4">
              <Button
                className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
                onClick={() => navigate("/mfa", { state: { redirectTo: "/dashboard" } })}
              >
                {t("dashboard.mfaRequired.cta")}
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-14 border-2 border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-black rounded-lg font-medium tracking-wide transition-all duration-300"
                onClick={() => navigate("/")}
              >
                {t("dashboard.mfaRequired.back")}
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
              {t("dashboard.title")}
            </h1>
            <p className="text-slate-400">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("dashboard.logout.button")}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("dashboard.profile.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                    <p className="text-sm text-slate-400">
                      {t("dashboard.profile.emailLabel")}
                    </p>
                  <p className="text-white font-medium">{userData?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                    <p className="text-sm text-slate-400">
                      {t("dashboard.profile.memberSince")}
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
                        {t("dashboard.plan.label")}
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
                {t("dashboard.security.title")}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {t("dashboard.security.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-slate-400">
                    {t("dashboard.security.mfaStatusLabel")}
                  </p>
                  <p className="text-white font-medium">
                    {mfaEnabled
                      ? t("dashboard.security.mfaEnabled")
                      : t("dashboard.security.mfaDisabled")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("dashboard.security.aal", {
                      current: mfaCurrentLevel ?? "-",
                      next: mfaNextLevel ?? "-",
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="text-slate-200 border-slate-600">
                  {mfaEnabled
                    ? t("dashboard.security.mfaFactors", {
                        count: mfaVerifiedCount,
                      })
                    : t("dashboard.security.mfaNoFactors")}
                </Badge>
              </div>

              <div className="grid gap-2">
                <Button onClick={() => navigate("/mfa", { state: { redirectTo: "/dashboard" } })} className="w-full">
                  {mfaEnabled
                    ? t("dashboard.security.mfaManage")
                    : t("dashboard.security.mfaEnable")}
                </Button>
                <Button onClick={handleSignOutOtherSessions} variant="outline" className="w-full">
                  {t("dashboard.security.sessions.cta")}
                </Button>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-950/30 p-3">
                <p className="text-xs text-slate-400">
                  {t("dashboard.security.downloadsNote")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* HWID Status Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t("dashboard.hwid.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData?.hwid ? (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">
                        {t("dashboard.hwid.registered.title")}
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
                                title: t("dashboard.error"),
                                description: t("dashboard.hwid.copyError"),
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          {hwidCopied
                            ? t("dashboard.hwid.copied")
                            : t("dashboard.hwid.copy")}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">
                        {t("dashboard.hwid.connectionStatus.label")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {userData.status === "online" ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400 font-medium">
                              {t("dashboard.hwid.connectionStatus.online")}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                            <span className="text-gray-400 font-medium">
                              {t("dashboard.hwid.connectionStatus.offline")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {userData.strategies_active && userData.strategies_active.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">
                        {t("dashboard.hwid.activeStrategies.label")}
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
                        {t("dashboard.hwid.notRegistered.title")}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {t("dashboard.hwid.notRegistered.desc")}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/register")}
                    className="w-full gap-2"
                  >
                    <Key className="h-4 w-4" />
                    {t("dashboard.hwid.registerButton")}
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
                {t("dashboard.software.title")}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {t("dashboard.software.description")}
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
                      title: t("dashboard.software.downloadErrorTitle"),
                      description: e?.message || t("dashboard.software.downloadErrorDesc"),
                      variant: "destructive",
                    });
                  }
                }}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                {t("dashboard.software.download")}
              </Button>

              {downloadEmailOtpSent && (
                <div className="mt-4 rounded-md border border-blue-500/20 bg-slate-950/20 p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="dashboard-download-email-otp" className="text-slate-200">
                      {t("dashboard.software.otpLabel")}
                    </Label>
                    <Input
                      id="dashboard-download-email-otp"
                      value={downloadEmailOtpValue}
                      onChange={(e) => setDownloadEmailOtpValue(e.target.value)}
                      placeholder={t("dashboard.software.otpPlaceholder")}
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
                        ? t("dashboard.software.otpVerifying")
                        : t("dashboard.software.otpDownload")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={requestDownloadEmailOtp}
                      disabled={downloadEmailOtpLoading}
                      className="flex-1 border-slate-600/40 text-slate-200"
                    >
                      {downloadEmailOtpLoading
                        ? t("dashboard.software.otpResendLoading")
                        : t("dashboard.software.otpResend")}
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

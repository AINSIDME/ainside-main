import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Key, AlertCircle, CheckCircle, Mail, ArrowRight, Shield } from "lucide-react";

// URL y key desde variables de entorno
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const Register = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  
  // OTP states
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  
  const [downloadEmailOtpSent, setDownloadEmailOtpSent] = useState(false);
  const [downloadEmailOtpValue, setDownloadEmailOtpValue] = useState("");
  const [downloadEmailOtpLoading, setDownloadEmailOtpLoading] = useState(false);
  const [downloadVerifying, setDownloadVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    hwid: ""
  });

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email || "");
        setFormData(prev => ({ ...prev, email: user.email || "" }));
      }
    };
    checkAuth();
  }, []);

  // OTP Functions
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/request-otp-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          email: otpEmail,
          lang: i18n.language
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar código");
      }

      if (data?.success) {
        setOtpStep("code");
        setOtpExpiresIn(data.expiresIn || 600);
        toast({
          title: t('otpLogin.codeSent'),
          description: `${t('otpLogin.checkEmail')}: ${otpEmail}`,
        });
        
        const interval = setInterval(() => {
          setOtpExpiresIn((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('otpLogin.sendError'),
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email: otpEmail, code: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar código");
      }

      if (data?.success && data?.magic_link) {
        window.location.href = data.magic_link;
      } else {
        throw new Error(t('otpLogin.noAuthLink'));
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('otpLogin.invalidCode'),
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate fields
      if (!formData.orderId || !formData.hwid) {
        toast({
          title: t("registerPage.form.toast.errorTitle", { defaultValue: "Missing Information" }),
          description: t("registerPage.form.toast.errorMissing", { defaultValue: "Please fill in Order ID and HWID" }),
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.email && !formData.name) {
        toast({
          title: t("registerPage.form.toast.errorTitle", { defaultValue: "Missing Information" }),
          description: t("registerPage.form.toast.errorMissingNameOrEmail", { defaultValue: "Please provide your name or email." }),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // TODO: Call Supabase function to register HWID
      // This function needs to be created in supabase/functions/register-hwid
      const { data, error } = await supabase.functions.invoke('register-hwid', {
        body: {
          name: formData.name,
          email: formData.email,
          orderId: formData.orderId,
          hwid: formData.hwid
        }
      });

      if (error) throw error;

      toast({
        title: t("registerPage.form.toast.successTitle", { defaultValue: "Registration Successful" }),
        description: data?.alreadyRegistered
          ? t("registerPage.form.toast.successAlready", { defaultValue: "This order was already registered." })
          : t("registerPage.form.toast.successDesc", { defaultValue: "Your HWID has been registered successfully" }),
      });
      
      setIsRegistered(true);
    } catch (error: any) {
      console.error('Error registering HWID:', error);
      const backendMessage =
        error?.context?.body?.error ||
        error?.context?.body?.message ||
        error?.message;
      toast({
        title: t("registerPage.form.toast.errorTitle", { defaultValue: "Error" }),
        description: backendMessage || t("registerPage.form.toast.errorDesc", { defaultValue: "Failed to register HWID. Please contact support." }),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        title: t("registerPage.downloadSoftware.otpSentTitle", { defaultValue: "Código enviado" }),
        description: t("registerPage.downloadSoftware.otpSentDesc", { defaultValue: "Revisá tu email e ingresá el código para descargar." }),
      });
    } catch (e: any) {
      console.error("OTP request error:", e);
      const message = e?.message || "No se pudo enviar el código.";
      toast({
        title: t("registerPage.downloadSoftware.otpErrorTitle", { defaultValue: "Error" }),
        description: message,
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
        title: t("registerPage.downloadSoftware.downloadErrorTitle", { defaultValue: "Error" }),
        description: e?.message || t("registerPage.downloadSoftware.downloadErrorDesc", { defaultValue: "No se pudo generar el enlace de descarga." }),
        variant: "destructive",
      });
    } finally {
      setDownloadVerifying(false);
    }
  };

  return (
    <>
      <PageSEO
        title={t("registerPage.seo.title")}
        description={t("registerPage.seo.description")}
        keywords={t("registerPage.seo.keywords")}
      />

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
          {!isAuthenticated ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                  <Key className="w-8 h-8 text-neutral-800" />
                </div>
                <h1 className="text-3xl font-light text-black tracking-tight mb-2">
                  {t("registerPage.title")}
                </h1>
                <p className="text-xs text-neutral-500 uppercase tracking-[0.25em] font-normal">
                  {t("registerPage.subtitle")}
                </p>
              </div>
              
              {/* OTP Login Card */}
              <Card className="bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
                <CardContent className="pt-6 pb-8 px-6">
                  {otpStep === "email" ? (
                    <form onSubmit={handleRequestOTP} className="space-y-5">
                      <div className="space-y-3">
                        <Label htmlFor="otpEmail" className="text-xs font-medium text-neutral-700 uppercase tracking-[0.15em] flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          {t('common.email')}
                        </Label>
                        <Input
                          id="otpEmail"
                          type="email"
                          placeholder={t('otpLogin.emailPlaceholder')}
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          required
                          className="h-16 px-6 bg-white border-2 border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 text-black text-base rounded-lg transition-all duration-300"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={otpLoading}
                        className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wide text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 disabled:bg-neutral-300 disabled:shadow-none"
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            {t('otpLogin.sending')}
                          </>
                        ) : (
                          <>
                            {t('otpLogin.sendCode')}
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 border-2 border-neutral-200 p-6 rounded-xl mb-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                              {t('otpLogin.codeSentTo')}
                            </p>
                            <p className="text-sm font-medium text-black">{otpEmail}</p>
                          </div>
                        </div>
                        {otpExpiresIn > 0 && (
                          <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
                            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                            <span className="text-xs text-neutral-600">
                              {t('otpLogin.expiresIn')}: 
                              <span className="font-mono font-medium text-black ml-2">{formatTime(otpExpiresIn)}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="otpCode" className="text-xs font-medium text-neutral-700 uppercase tracking-[0.15em] flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5" />
                          {t('otpLogin.verificationCode')}
                        </Label>
                        <Input
                          id="otpCode"
                          type="text"
                          placeholder="• • • • • •"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          required
                          maxLength={6}
                          className="h-20 px-6 bg-white border-2 border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 text-black text-center text-4xl font-mono tracking-[0.5em] rounded-lg transition-all duration-300"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={otpLoading || otpCode.length !== 6}
                        className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 disabled:bg-neutral-300 disabled:shadow-none"
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            {t('otpLogin.verifying')}
                          </>
                        ) : (
                          <>
                            <Shield className="mr-3 h-5 w-5" />
                            {t('otpLogin.login')}
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setOtpStep("email");
                          setOtpCode("");
                        }}
                        className="w-full h-12 text-neutral-500 hover:text-black hover:bg-neutral-100 font-light rounded-lg transition-all duration-300"
                      >
                        ← {t('otpLogin.useAnotherEmail')}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
              
              <div className="mt-6 p-4 bg-neutral-100 border border-neutral-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-700 font-light">
                    {t("registerPage.auth.noteText")}
                  </p>
                </div>
              </div>
            </>
          ) : !isRegistered ? (
            <Card className="bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
              <CardContent className="pt-6 pb-8 px-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="orderId" className="text-xs font-medium text-neutral-700 uppercase tracking-[0.15em]">
                      {t("registerPage.form.orderId.label")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="orderId"
                        name="orderId"
                        type="text"
                        placeholder="ORDER-XXXXX"
                        value={formData.orderId}
                        onChange={handleInputChange}
                        required
                        className="h-16 px-6 bg-white border-2 border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 text-black text-base rounded-lg transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="hwid" className="text-xs font-medium text-neutral-700 uppercase tracking-[0.15em]">
                      {t("registerPage.form.hwid.label")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="hwid"
                        name="hwid"
                        type="text"
                        placeholder="XXXX-XXXX-XXXX"
                        value={formData.hwid}
                        onChange={handleInputChange}
                        required
                        className="h-16 px-6 bg-white border-2 border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 text-black text-base font-mono rounded-lg transition-all duration-300"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {t("registerPage.form.hwid.hint")}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wide text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 disabled:bg-neutral-300 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        {t("registerPage.form.submitting")}
                      </>
                    ) : (
                      <>
                        <Key className="mr-3 h-5 w-5" />
                        {t("registerPage.form.submit")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl shadow-2xl">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {t("registerPage.success.title")}
                </h3>
                <p className="text-slate-400 mb-6">
                  {t("registerPage.success.message")}
                </p>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                >
                  {t("registerPage.success.goDashboard", { defaultValue: "Go to Dashboard" })}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;

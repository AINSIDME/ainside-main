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
import { Loader2, Key, AlertCircle, CheckCircle } from "lucide-react";
import { LoginCard } from "./Login";

const Register = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {!isAuthenticated ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-block p-3 bg-blue-500/10 rounded-2xl mb-4">
                  <Key className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {t("registerPage.title")}
                </h1>
                <p className="text-slate-400">
                  {t("registerPage.subtitle")}
                </p>
              </div>
              
              <LoginCard redirectTo="/register" />
              
              <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg backdrop-blur-sm">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    {t("registerPage.auth.noteText")}
                  </p>
                </div>
              </div>
            </>
          ) : !isRegistered ? (
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl shadow-2xl">
              <CardHeader className="text-center">
                <div className="inline-block p-3 bg-blue-500/10 rounded-2xl mb-4 mx-auto">
                  <Key className="w-8 h-8 text-blue-400" />
                </div>
                <CardTitle className="text-2xl text-white">
                  {t("registerPage.form.title")}
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">
                  {t("registerPage.form.description")}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId" className="text-slate-200">
                      {t("registerPage.form.orderId.label")}
                    </Label>
                    <Input
                      id="orderId"
                      name="orderId"
                      type="text"
                      placeholder="ORDER-XXXXX"
                      value={formData.orderId}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hwid" className="text-slate-200">
                      {t("registerPage.form.hwid.label")}
                    </Label>
                    <Input
                      id="hwid"
                      name="hwid"
                      type="text"
                      placeholder="XXXX-XXXX-XXXX"
                      value={formData.hwid}
                      onChange={handleInputChange}
                      required
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 font-mono"
                    />
                    <p className="text-xs text-slate-500">
                      {t("registerPage.form.hwid.hint")}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("registerPage.form.submitting")}
                      </>
                    ) : (
                      t("registerPage.form.submit")
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

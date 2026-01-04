import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, Copy, Info, Shield, LogIn } from "lucide-react";

const Register = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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
      // Validate all fields
      if (!formData.name || !formData.email || !formData.orderId || !formData.hwid) {
        toast({
          title: t("registerPage.form.toast.errorTitle", { defaultValue: "Missing Information" }),
          description: t("registerPage.form.toast.errorMissing", { defaultValue: "Please fill in all fields" }),
          variant: "destructive"
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
        description: t("registerPage.form.toast.successDesc", { defaultValue: "Your HWID has been registered successfully" }),
      });
      
      setIsRegistered(true);
    } catch (error: any) {
      console.error('Error registering HWID:', error);
      toast({
        title: t("registerPage.form.toast.errorTitle", { defaultValue: "Error" }),
        description: error.message || t("registerPage.form.toast.errorDesc", { defaultValue: "Failed to register HWID. Please contact support." }),
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

  return (
    <>
      <PageSEO
        title={t("registerPage.seo.title", { defaultValue: "Register HWID - AInside" })}
        description={t("registerPage.seo.description", { defaultValue: "Register your Hardware ID (HWID) to activate your algorithm license" })}
        keywords={t("registerPage.seo.keywords", { defaultValue: "HWID, registration, algorithm, license, activation" })}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
        {/* Header */}
        <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
          <div className="container mx-auto text-center max-w-5xl">
            <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
              {t("registerPage.badge", { defaultValue: "License Activation System" })}
            </div>
            <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
              {t("registerPage.title", { defaultValue: "Register Your HWID" })}
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              {t("registerPage.subtitle", { defaultValue: "Register your Hardware ID to activate your trading algorithm license" })}
            </p>
          </div>
        </section>

        {/* Download Software Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Authentication Section - Show only if not authenticated */}
            {!isAuthenticated && (
              <Card className="border-blue-500/30 bg-slate-900/50 backdrop-blur-md shadow-2xl mb-8">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl text-slate-100">
                    <LogIn className="w-7 h-7 text-blue-400" />
                    {t("registerPage.auth.title", { defaultValue: "Create Your Account First" })}
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-base">
                    {t("registerPage.auth.description", { defaultValue: "Create an account or login to register your HWID and access your personal dashboard" })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => navigate('/login')}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-6 px-6 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-blue-500/25 text-base"
                    >
                      <LogIn className="w-5 h-5" />
                      {t("registerPage.auth.loginButton", { defaultValue: "Login to Existing Account" })}
                    </Button>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 p-5 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-slate-300">
                      <strong className="text-blue-200">{t("registerPage.auth.note", { defaultValue: "Note:" })}</strong> {t("registerPage.auth.noteText", { defaultValue: "You need to create an account or login before registering your HWID. After authentication, you can download the software and complete the HWID registration." })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Show Download Software only if authenticated */}
            {isAuthenticated && (
            <Card className="border-slate-600/40 bg-slate-900/50 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-100">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {t("registerPage.downloadSoftware.title", { defaultValue: "Download AInside HWID Tool" })}
                </CardTitle>
                <CardDescription className="text-slate-300 text-base">
                  {t("registerPage.downloadSoftware.description", { defaultValue: "Download our official tool to automatically extract your HWID. This software connects in real-time with our servers for live strategy monitoring and control." })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => window.open('/downloads/ainside_hwid_tool_premium_v5.exe', '_blank')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-6 px-8 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-blue-500/25 text-base"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t("registerPage.downloadSoftware.downloadButton", { defaultValue: "Download for Windows" })}
                  </Button>
                  <Button
                    onClick={() => window.open('https://github.com/ainside/hwid-tool', '_blank')}
                    variant="outline"
                    className="flex-1 border-slate-600/40 text-slate-200 hover:bg-slate-700/50 font-medium py-6 px-8 rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm hover:border-slate-500/50 transition-all text-base"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    {t("registerPage.downloadSoftware.viewSource", { defaultValue: "View Source" })}
                  </Button>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 p-5 rounded-xl backdrop-blur-sm">
                  <p className="text-sm font-medium mb-3 text-blue-200">
                    {t("registerPage.downloadSoftware.features.title", { defaultValue: "Features:" })}
                  </p>
                  <ul className="text-sm space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{t("registerPage.downloadSoftware.features.feature1", { defaultValue: "Automatic HWID extraction" })}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{t("registerPage.downloadSoftware.features.feature2", { defaultValue: "Real-time connection with server" })}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{t("registerPage.downloadSoftware.features.feature3", { defaultValue: "Remote control of strategies and configurations" })}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{t("registerPage.downloadSoftware.features.feature4", { defaultValue: "Live connection status monitoring" })}</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </section>

        {/* Registration Form Section - Show only if authenticated */}
        {isAuthenticated && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Registration Form */}
              <Card className="bg-slate-900/50 border-slate-600/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-100">
                    {t("registerPage.form.title", { defaultValue: "Register Your License" })}
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    {t("registerPage.form.description", { defaultValue: "Complete the form below to activate your algorithm" })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isRegistered ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-200">
                          {t("registerPage.form.name.label", { defaultValue: "Full Name" })}
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder={t("registerPage.form.name.placeholder", { defaultValue: "John Doe" })}
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">
                          {t("registerPage.form.email.label", { defaultValue: "Email Address" })}
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={t("registerPage.form.email.placeholder", { defaultValue: "john@example.com" })}
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                        />
                        <p className="text-xs text-slate-500">
                          {t("registerPage.form.email.hint", { defaultValue: "Use the email from your purchase" })}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderId" className="text-slate-200">
                          {t("registerPage.form.orderId.label", { defaultValue: "Order ID" })}
                        </Label>
                        <Input
                          id="orderId"
                          name="orderId"
                          type="text"
                          placeholder={t("registerPage.form.orderId.placeholder", { defaultValue: "ORDER-20260104-XXXXX" })}
                          value={formData.orderId}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                        />
                        <p className="text-xs text-slate-500">
                          {t("registerPage.form.orderId.hint", { defaultValue: "Find this in your confirmation email" })}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hwid" className="text-slate-200">
                          {t("registerPage.form.hwid.label", { defaultValue: "Hardware ID (HWID)" })}
                        </Label>
                        <Input
                          id="hwid"
                          name="hwid"
                          type="text"
                          placeholder={t("registerPage.form.hwid.placeholder", { defaultValue: "123456789012 o XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" })}
                          value={formData.hwid}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-800/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400 font-mono"
                        />
                        <p className="text-xs text-slate-500">
                          {t("registerPage.form.hwid.hint", { defaultValue: "See instructions on the right →" })}
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-6 rounded-xl text-base shadow-lg hover:shadow-blue-500/25 transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t("registerPage.form.submitting", { defaultValue: "Registering..." })}
                          </>
                        ) : (
                          t("registerPage.form.submit", { defaultValue: "Register HWID" })
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-100 mb-4">
                        {t("registerPage.success.title", { defaultValue: "Registration Complete!" })}
                      </h3>
                      <p className="text-slate-300 mb-6">
                        {t("registerPage.success.message", { defaultValue: "Your HWID has been successfully registered. You can now activate your algorithm." })}
                      </p>
                      <Button
                        onClick={() => window.location.href = '/documentation'}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
                      >
                        {t("registerPage.success.documentation", { defaultValue: "View Documentation" })}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Instructions Card */}
              <Card className="bg-slate-900/50 border-slate-600/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-slate-100 flex items-center gap-2">
                    <Info className="h-6 w-6 text-blue-400" />
                    {t("registerPage.instructions.title", { defaultValue: "Cómo Obtener tu HWID" })}
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    {t("registerPage.instructions.description", { defaultValue: "Usa nuestro software oficial para extraer tu HWID de forma automática y segura" })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-blue-300 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("registerPage.instructions.softwareTitle", { defaultValue: "Usando AInside HWID Tool" })}
                    </h3>
                    <ol className="space-y-4 text-slate-300">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">1</span>
                        <div>
                          <p className="font-medium text-slate-100 mb-1">{t("registerPage.instructions.software1", { defaultValue: "Descarga el software" })}</p>
                          <p className="text-sm text-slate-300">{t("registerPage.instructions.software1Detail", { defaultValue: "Haz clic en el botón de descarga arriba" })}</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">2</span>
                        <div>
                          <p className="font-medium text-slate-100 mb-1">{t("registerPage.instructions.software2", { defaultValue: "Ejecuta la aplicación" })}</p>
                          <p className="text-sm text-slate-300">{t("registerPage.instructions.software2Detail", { defaultValue: "Abre ainside_hwid_tool_premium_v5.exe" })}</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">3</span>
                        <div>
                          <p className="font-medium text-slate-100 mb-1">{t("registerPage.instructions.software3", { defaultValue: "Copia tu HWID" })}</p>
                          <p className="text-sm text-slate-300">{t("registerPage.instructions.software3Detail", { defaultValue: "Tu HWID aparecerá automáticamente en pantalla" })}</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">4</span>
                        <div>
                          <p className="font-medium text-slate-100 mb-1">{t("registerPage.instructions.software4", { defaultValue: "Registra tu licencia" })}</p>
                          <p className="text-sm text-slate-300">{t("registerPage.instructions.software4Detail", { defaultValue: "Pega el HWID en el formulario y completa el registro" })}</p>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-slate-300">
                        <p className="font-medium text-blue-200 mb-1">
                          {t("registerPage.instructions.noteTitle", { defaultValue: "Nota Importante" })}
                        </p>
                        <p>
                          {t("registerPage.instructions.note", { defaultValue: "Tu HWID es único para tu computadora. Necesitarás registrarlo para activar el algoritmo. Contacta soporte si necesitas cambiar de equipo." })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-light text-slate-100 mb-8 text-center">
              {t("registerPage.faq.title", { defaultValue: "Preguntas Frecuentes" })}
            </h2>
            <Card className="bg-slate-900/50 border-slate-600/40 backdrop-blur-sm">
              <CardContent className="divide-y divide-slate-700/50 p-0">
                <div className="p-6">
                  <h4 className="text-lg font-medium text-slate-100 mb-2">
                    {t("registerPage.faq.q1", { defaultValue: "Why do I need to register my HWID?" })}
                  </h4>
                  <p className="text-slate-300 text-sm">
                    {t("registerPage.faq.a1", { defaultValue: "HWID registration links your algorithm license to your specific computer, ensuring security and preventing unauthorized use." })}
                  </p>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-medium text-slate-100 mb-2">
                    {t("registerPage.faq.q2", { defaultValue: "Can I use the algorithm on multiple computers?" })}
                  </h4>
                  <p className="text-slate-300 text-sm">
                    {t("registerPage.faq.a2", { defaultValue: "Each license is for one computer. Contact support if you need to transfer your license or purchase additional licenses." })}
                  </p>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-medium text-slate-100 mb-2">
                    {t("registerPage.faq.q3", { defaultValue: "What if I change my computer?" })}
                  </h4>
                  <p className="text-slate-300 text-sm">
                    {t("registerPage.faq.a3", { defaultValue: "Contact our support team at support@ainside.me and we'll help you transfer your license to your new computer." })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default Register;

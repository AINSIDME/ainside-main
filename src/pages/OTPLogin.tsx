import { useState } from "react";
import { Mail, Shield, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function OTPLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usar el método NATIVO de Supabase (no Edge Functions)
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Email enviado",
        description: `Revisa tu bandeja de entrada: ${email}`,
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || "Error al enviar el código",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-6">
      {/* Logo elegante */}
      <div className="fixed top-10 left-10">
        <img 
          src="https://odlxhgatqyodxdessxts.supabase.co/storage/v1/object/public/system-assets/ainside-logo-black.svg" 
          alt="AInside" 
          className="h-10 opacity-50 hover:opacity-70 transition-opacity duration-300"
        />
      </div>

      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
        <CardHeader className="space-y-6 pb-10 pt-16 px-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-2">
              <Shield className="w-8 h-8 text-neutral-800" />
            </div>
            <CardTitle className="text-3xl font-light text-black tracking-tight">
              {t('otpLogin.title')}
            </CardTitle>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.25em] font-normal">
              {t('otpLogin.institutionalTagline')}
            </p>
          </div>
          <CardDescription className="text-center text-sm text-neutral-600 font-light leading-relaxed">
            {step === "email" 
              ? t('otpLogin.emailDescription')
              : t('otpLogin.codeDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-16 px-12">
          {step === "email" ? (
            <form onSubmit={handleRequestCode} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-medium text-neutral-700 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  {t('common.email')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 to-neutral-100 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Input
                    type="email"
                    placeholder={t('otpLogin.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="relative h-16 px-6 bg-white border-2 border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 text-black text-base rounded-lg transition-all duration-300"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wide text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 disabled:bg-neutral-300 disabled:shadow-none"
              >
                {loading ? (
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
            <form onSubmit={handleVerifyCode} className="space-y-8">
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 border-2 border-neutral-200 p-6 rounded-xl mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                      {t('otpLogin.codeSentTo')}
                    </p>
                    <p className="text-sm font-medium text-black">{email}</p>
                  </div>
                </div>
                {expiresIn > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
                    <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    <span className="text-xs text-neutral-600">
                      {t('otpLogin.expiresIn')}: 
                      <span className="font-mono font-medium text-black ml-2">{formatTime(expiresIn)}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-neutral-700 uppercase tracking-[0.15em] flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  {t('otpLogin.verificationCode')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 to-neutral-100 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Input
                    type="text"
                    placeholder="• • • • • •"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    className="relative h-20 px-6 bg-white border-2 border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 text-black text-center text-4xl font-mono tracking-[0.5em] rounded-lg transition-all duration-300"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 disabled:bg-neutral-300 disabled:shadow-none"
              >
                {loading ? (
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
                  setStep("email");
                  setCode("");
                }}
                className="w-full h-12 text-neutral-500 hover:text-black hover:bg-neutral-100 font-light rounded-lg transition-all duration-300"
              >
                ← {t('otpLogin.useAnotherEmail')}
              </Button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-neutral-200 text-center text-xs text-neutral-400 font-light leading-relaxed">
            {t('otpLogin.termsAcceptance')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

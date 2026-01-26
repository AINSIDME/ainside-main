import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

// URL y key para Edge Functions (bypass proxy de Vercel)
const SUPABASE_URL = "https://odlxhgatqyodxdessxts.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbHhoZ2F0cXlvZHhkZXNzeHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzY5MTMsImV4cCI6MjA3MjgxMjkxM30.btScPRHOEIdRShS7kYNFdzHKpQrwMZKRJ54KlGCl52s";

// Rebuild timestamp: 2026-01-24

export default function OTPLogin() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);
  const { toast } = useToast();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usar fetch directo para evitar proxy de Vercel
      const response = await fetch(`${SUPABASE_URL}/functions/v1/request-otp-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          email,
          lang: i18n.language // Enviar el idioma actual del usuario
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar código");
      }

      if (data?.success) {
        setStep("code");
        setExpiresIn(data.expiresIn || 600);
        toast({
          title: t('otpLogin.codeSent'),
          description: `${t('otpLogin.checkEmail')}: ${email}`,
        });
        
        // Countdown timer
        const interval = setInterval(() => {
          setExpiresIn((prev) => {
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
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar el código con nuestro backend
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar código");
      }

      if (data?.success && data?.magic_link) {
        // El magic_link es una URL completa con tokens en el hash
        console.log("Magic link recibido:", data.magic_link);
        
        // Redirigir directamente al magic link - Supabase Auth lo manejará
        window.location.href = data.magic_link;
      } else {
        throw new Error(t('otpLogin.noAuthLink'));
      }
    } catch (error: any) {
      console.error("Error en verificación:", error);
      toast({
        title: t('common.error'),
        description: error.message || t('otpLogin.invalidCode'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      {/* Logo en la esquina superior izquierda */}
      <div className="fixed top-8 left-8">
        <img 
          src="https://ainside.me/brand/logo-master.png" 
          alt="AInside" 
          className="h-8 opacity-60"
        />
      </div>

      <Card className="w-full max-w-md bg-white border-neutral-200 shadow-sm">
        <CardHeader className="space-y-4 pb-8 pt-12">
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-light text-black tracking-tight">
              {t('otpLogin.title')}
            </CardTitle>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] font-normal">
              Institutional Algorithmic Trading
            </p>
          </div>
          <CardDescription className="text-center text-sm text-neutral-600 font-light">
            {step === "email" 
              ? t('otpLogin.emailDescription')
              : t('otpLogin.codeDescription')}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-12">
          {step === "email" ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  {t('common.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-4 w-4 text-neutral-400" />
                  <Input
                    type="email"
                    placeholder={t('otpLogin.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 bg-white border-neutral-300 text-black focus:border-black focus:ring-1 focus:ring-black rounded-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-black hover:bg-neutral-800 text-white rounded-none font-normal tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('otpLogin.sending')}
                  </>
                ) : (
                  <>
                    {t('otpLogin.sendCode')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="bg-neutral-50 border border-neutral-200 p-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-700 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-black" />
                  <span className="text-xs">{t('otpLogin.codeSentTo')}:</span>
                  <span className="font-medium text-black">{email}</span>
                </div>
                {expiresIn > 0 && (
                  <div className="text-xs text-neutral-500 mt-2">
                    {t('otpLogin.expiresIn')}: <span className="font-mono text-black">{formatTime(expiresIn)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-700 uppercase tracking-wider">
                  {t('otpLogin.verificationCode')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-5 h-4 w-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    className="pl-12 h-16 bg-white border-2 border-neutral-300 focus:border-black focus:ring-0 text-black text-center text-3xl font-mono tracking-[0.5em] rounded-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full h-14 bg-black hover:bg-neutral-800 text-white rounded-none font-medium tracking-wider text-base disabled:bg-neutral-300 disabled:text-neutral-500 border-2 border-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('otpLogin.verifying')}
                  </>
                ) : (
                  <>
                    {t('otpLogin.login')}
                    <ArrowRight className="ml-2 h-5 w-5" />
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
                className="w-full text-neutral-500 hover:text-black hover:bg-transparent font-light"
              >
                ← {t('otpLogin.useAnotherEmail')}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-neutral-400 font-light">
            {t('otpLogin.termsAcceptance')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

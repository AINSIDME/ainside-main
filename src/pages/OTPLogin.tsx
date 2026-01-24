import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";

// Cliente específico para Edge Functions (requiere URL directa, no proxy)
const supabaseDirectUrl = "https://odlxhgatqyodxdessxts.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbHhoZ2F0cXlvZHhkZXNzeHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzY5MTMsImV4cCI6MjA3MjgxMjkxM30.btScPRHOEIdRShS7kYNFdzHKpQrwMZKRJ54KlGCl52s";
const supabaseFunctions = createClient(supabaseDirectUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

export default function OTPLogin() {
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
      console.log("🔍 Intentando invocar request-otp-code...");
      console.log("📧 Email:", email);
      console.log("🔑 Anon Key:", supabaseAnonKey ? "✅ Presente" : "❌ Falta");
      console.log("🌐 URL:", supabaseDirectUrl);
      
      const { data, error } = await supabaseFunctions.functions.invoke("request-otp-code", {
        body: { email },
      });

      console.log("📦 Respuesta data:", data);
      console.log("❌ Error:", error);

      if (error) {
        console.error("🔴 Error completo:", JSON.stringify(error, null, 2));
        throw error;
      }

      if (data?.success) {
        setStep("code");
        setExpiresIn(data.expiresIn || 600);
        toast({
          title: "✅ Código enviado",
          description: `Revisa tu email: ${email}`,
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
        title: "Error",
        description: error.message || "No se pudo enviar el código",
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
      // Usar URL directa de Supabase para Edge Functions (no funciona con proxy)
      const { data, error } = await supabase.functions.invoke("verify-otp-code", {
      const { data, error } = await supabaseFunctions.functions.invoke("verify-otp-code", {

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "🎉 ¡Bienvenido!",
          description: "Autenticación exitosa",
        });
        
        // Aquí puedes redirigir al dashboard o actualizar el estado de autenticación
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Código inválido",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            🔐 Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-slate-400">
            {step === "email" 
              ? "Te enviaremos un código a tu email"
              : "Ingresa el código que recibiste"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar código
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Código enviado a: <span className="font-medium text-white">{email}</span>
                </div>
                {expiresIn > 0 && (
                  <div className="text-xs text-slate-400">
                    ⏱️ Expira en: <span className="font-mono text-amber-400">{formatTime(expiresIn)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Código de Verificación
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white text-center text-2xl font-mono tracking-widest"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("email");
                  setCode("");
                }}
                className="w-full text-slate-400 hover:text-white"
              >
                ← Usar otro email
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Al continuar, aceptas nuestros términos y condiciones
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Eye, EyeOff, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

// Función para generar password aleatorio seguro
const generateSecurePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Asegurar al menos un carácter de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Completar el resto
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mezclar aleatoriamente
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Función para evaluar seguridad del password
const evaluatePasswordStrength = (password: string): { score: number; label: string; color: string; icon: any } => {
  if (!password) return { score: 0, label: '', color: '', icon: Shield };
  
  let score = 0;
  
  // Longitud
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Complejidad
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Patrones comunes (penalización)
  if (/(.)\1{2,}/.test(password)) score -= 1; // Caracteres repetidos
  if (/123|abc|qwerty|password/i.test(password)) score -= 2;
  
  if (score <= 2) return { score, label: 'Débil', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: ShieldAlert };
  if (score <= 4) return { score, label: 'Media', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', icon: Shield };
  if (score <= 6) return { score, label: 'Fuerte', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: ShieldCheck };
  return { score, label: 'Muy Fuerte', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: ShieldCheck };
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const passwordMismatch = useMemo(() => {
    if (!password || !confirmPassword) return false;
    return password !== confirmPassword;
  }, [password, confirmPassword]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (cancelled) return;
        setHasSession(Boolean(data.session));
      } catch {
        if (cancelled) return;
        setHasSession(false);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16);
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setShowPassword(true);
    toast({
      title: "🔐 Password Generado",
      description: "Password aleatorio seguro creado. ¡Copialo ahora!",
    });
  };

  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "✓ Copiado",
        description: "Password copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el password",
        variant: "destructive",
      });
    }
  };
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      toast({
        title: t('resetPassword.errors.tooShort.title'),
        description: t('resetPassword.errors.tooShort.description'),
        variant: "destructive",
      });
      return;
    }

    if (passwordMismatch) {
      toast({
        title: t('resetPassword.errors.mismatch.title'),
        description: t('resetPassword.errors.mismatch.description'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: t('resetPassword.success.title'),
        description: t('resetPassword.success.description'),
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: t('resetPassword.errors.update.title'),
        description: error?.message ?? t('resetPassword.errors.update.description'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">{t('resetPassword.title')}</CardTitle>
          <CardDescription className="text-slate-300">
            {t('resetPassword.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkingSession ? (
            <div className="text-sm text-slate-300">{t('resetPassword.checking')}</div>
          ) : !hasSession ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                {t('resetPassword.noSession.message')}
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                {t('resetPassword.noSession.button')}
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Botón para generar password aleatorio */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar Password Seguro
                </Button>
                {password && (
                  <Button
                    type="button"
                    onClick={handleCopyPassword}
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">{t('resetPassword.form.newPassword.label')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-950/60 border-slate-800 text-slate-50 placeholder:text-slate-500 pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Indicador de seguridad */}
                {password && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${passwordStrength.color}`}>
                    <passwordStrength.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">Seguridad: {passwordStrength.label}</span>
                    <div className="ml-auto flex gap-1">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-3 rounded-full ${
                            i < passwordStrength.score ? 'bg-current' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">{t('resetPassword.form.confirmPassword.label')}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-950/60 border-slate-800 text-slate-50 placeholder:text-slate-500 pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <div className="text-xs text-red-300">{t('resetPassword.form.mismatch')}</div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('resetPassword.form.updating') : t('resetPassword.form.updateButton')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

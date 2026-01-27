import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Smartphone, 
  Lock, 
  KeyRound,
  AlertTriangle,
  Loader2,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const AdminVerify2FA = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [needsAdminAccount, setNeedsAdminAccount] = useState(false);

  const adminEmails = useMemo(() => {
    const raw = (import.meta as any)?.env?.VITE_ADMIN_EMAILS;
    if (raw) {
      return String(raw)
        .split(',')
        .map((s: string) => s.trim().toLowerCase())
        .filter(Boolean);
    }
    return ['jonathangolubok@gmail.com'];
  }, []);

  const checkAuth = useCallback(async () => {
    setIsChecking(true);
    setNeedsLogin(false);
    setNeedsAdminAccount(false);

    const waitForUser = async (): Promise<any | null> => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) return sessionData.session.user;

      return await new Promise((resolve) => {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            data.subscription.unsubscribe();
            resolve(session.user);
          }
        });

        setTimeout(() => {
          data.subscription.unsubscribe();
          resolve(null);
        }, 1200);
      });
    };

    const user = await waitForUser();
    if (!user) {
      setNeedsLogin(true);
      return;
    }

    const email = (user.email || '').toLowerCase();
    setUserEmail(email);

    // Extra hardening: only allow admin emails into the 2FA flow
    if (!adminEmails.includes(email)) {
      await supabase.auth.signOut();
      setNeedsAdminAccount(true);
      return;
    }

    // Verificar si ya tiene sesión 2FA activa
    const session2FA = localStorage.getItem('admin_2fa_verified');
    const timestamp = localStorage.getItem('admin_2fa_timestamp');
    
    // Verificar si la sesión 2FA sigue siendo válida (12 horas)
    if (session2FA === 'true' && timestamp) {
      const elapsed = Date.now() - parseInt(timestamp);
      const twelveHours = 12 * 60 * 60 * 1000; // 12 horas en milisegundos
      
      if (elapsed < twelveHours) {
        navigate('/admin');
        return;
      } else {
        // Expiró, limpiar
        localStorage.removeItem('admin_2fa_verified');
        localStorage.removeItem('admin_2fa_timestamp');
        localStorage.removeItem('admin_2fa_token');
      }
    }

    setIsChecking(false);
  }, [adminEmails, navigate, toast]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
          <CardContent className="p-16 text-center">
            <Loader2 className="w-12 h-12 text-neutral-800 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-light text-black mb-3 tracking-tight">Validando Sesión</h2>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.25em]">Verificación de Acceso</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsLogin || needsAdminAccount) {
    const title = needsLogin
      ? t('admin.2fa.loginRequired.title', { defaultValue: 'Iniciar sesión requerido' })
      : t('admin.2fa.adminRequired.title', { defaultValue: 'Acceso restringido' });

    const message = needsLogin
      ? t('admin.2fa.loginRequired.message', {
          defaultValue: 'Debes iniciar sesión para continuar con la verificación 2FA de administrador.',
        })
      : t('admin.2fa.adminRequired.message', {
          defaultValue: 'Necesitas iniciar sesión con una cuenta de administrador autorizada.',
        });

    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
          <CardHeader className="space-y-6 pb-10 pt-16 px-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-2">
              <Shield className="w-8 h-8 text-neutral-800" />
            </div>
            <CardTitle className="text-3xl font-light text-black tracking-tight">{title}</CardTitle>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.25em]">Institutional Access Control</p>
            <CardDescription className="text-neutral-600 text-base font-light pt-4">{message}</CardDescription>
          </CardHeader>
          <CardContent className="pb-16 px-12 space-y-4">
            <Button
              className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
              onClick={() => navigate('/login', { state: { redirectTo: '/admin/verify-2fa' } as any })}
            >
              <Shield className="mr-3 h-5 w-5" />
              {t('admin.2fa.cta.login', { defaultValue: 'Ir a iniciar sesión' })}
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-14 border-2 border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-black rounded-lg font-medium tracking-wide transition-all duration-300" 
              onClick={() => navigate('/')}
            >
              {t('admin.2fa.cta.back', { defaultValue: 'Volver' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const verify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Cuenta Bloqueada",
        description: "Demasiados intentos fallidos. Espera 15 minutos.",
        variant: "destructive"
      });
      return;
    }

    if (code.length !== 6) {
      toast({
        title: "Código Inválido",
        description: "El código debe tener 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Llamar a la función de Supabase para verificar el código 2FA
      const { data, error } = await supabase.functions.invoke('verify-admin-2fa', {
        body: {
          code: code
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      if (error) throw error;

      if (data.verified && data.token) {
        // Guardar verificación en localStorage (válido por 12 horas)
        localStorage.setItem('admin_2fa_verified', 'true');
        localStorage.setItem('admin_2fa_timestamp', Date.now().toString());
        localStorage.setItem('admin_2fa_token', data.token);

        toast({
          title: "✓ Verificación Exitosa",
          description: "Acceso al panel de administración autorizado",
        });

        navigate('/admin');
      } else {
        const serverMsg = (data?.error || data?.message || '').toString().trim();
        if (serverMsg && serverMsg !== 'Código inválido') {
          toast({
            title: "Error de Verificación",
            description: serverMsg,
            variant: "destructive",
          });
          setCode("");
          return;
        }

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          setIsLocked(true);
          // Bloquear por 15 minutos
          setTimeout(() => {
            setIsLocked(false);
            setAttempts(0);
          }, 15 * 60 * 1000);

          toast({
            title: "Cuenta Bloqueada",
            description: "Demasiados intentos fallidos. Bloqueado por 15 minutos.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Código Incorrecto",
            description: `Intento ${newAttempts} de 3. Verifica tu aplicación Authenticator.`,
            variant: "destructive"
          });
        }

        setCode("");
      }
    } catch (error) {
      console.error('Error verificando 2FA:', error);

      const rawMessage =
        (error as any)?.message ||
        (error as any)?.error_description ||
        (error as any)?.details ||
        '';

      const msg = String(rawMessage || '').toLowerCase();
      const friendly =
        msg.includes('missing authorization') || msg.includes('unauthorized')
          ? 'Tu sesión no fue reconocida. Probá cerrar sesión y volver a iniciar.'
          : msg.includes('forbidden') || msg.includes('no autorizado')
            ? 'Tu cuenta no está autorizada como administrador.'
            : msg.includes('2fa secret not configured') || msg.includes('secret not configured')
              ? 'Falta configurar el secret de 2FA admin en Supabase (ADMIN_2FA_SECRETS_JSON / ADMIN_2FA_SHARED_SECRET).'
              : msg.includes('server misconfigured')
                ? 'El servidor no está configurado correctamente para verificar 2FA.'
                : 'No se pudo verificar el código. Intenta nuevamente.';

      toast({
        title: "Error de Verificación",
        description: friendly,
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center p-6">
      {/* Fixed Logo */}
      <div className="fixed top-10 left-10">
        <img 
          src="https://odlxhgatqyodxdessxts.supabase.co/storage/v1/object/public/system-assets/ainside-logo-black.svg" 
          alt="AInside" 
          className="h-10 opacity-50 hover:opacity-70 transition-opacity duration-300"
        />
      </div>

      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-neutral-200/50 shadow-2xl shadow-neutral-200/50">
        <CardHeader className="space-y-6 pb-10 pt-16 px-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-2">
            <Shield className="w-8 h-8 text-neutral-800" />
          </div>
          <CardTitle className="text-3xl font-light text-black tracking-tight">
            Verificación de Dos Factores
          </CardTitle>
          <p className="text-xs text-neutral-500 uppercase tracking-[0.25em]">
            Institutional Algorithmic Trading
          </p>
          <CardDescription className="text-neutral-600 text-base font-light pt-2">
            Ingresa el código de 6 dígitos de tu aplicación Google Authenticator
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-16 px-12 space-y-6">
          {/* Instrucciones */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 space-y-3">
            <div className="flex items-start gap-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-200 flex-shrink-0">
                <Smartphone className="w-5 h-5 text-neutral-700" />
              </div>
              <div className="text-sm text-neutral-700">
                <p className="font-medium mb-3 text-black uppercase tracking-wide text-xs">Instrucciones de Verificación</p>
                <ol className="space-y-2 text-neutral-600 font-light">
                  <li className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-xs font-medium">1</span>
                    Abre Google Authenticator
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-xs font-medium">2</span>
                    Busca "AInside Admin"
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-xs font-medium">3</span>
                    Ingresa el código de 6 dígitos
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={verify2FACode} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="code" className="text-black font-medium uppercase tracking-wide text-xs flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Código de Verificación
              </Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                disabled={isLocked || isVerifying}
                className="h-20 text-center text-4xl tracking-[0.5em] font-mono bg-white border-2 border-neutral-200 hover:border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/5 text-black rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-black/5"
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-neutral-500 text-center uppercase tracking-widest">
                Renovación cada 30 segundos
              </p>
            </div>

            {/* Advertencia de intentos */}
            {attempts > 0 && !isLocked && (
              <div className="flex items-center gap-3 text-neutral-700 text-sm bg-neutral-50 border border-neutral-300 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-neutral-600" />
                <span className="font-light">
                  {3 - attempts} intento{3 - attempts !== 1 ? 's' : ''} restante{3 - attempts !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Bloqueo */}
            {isLocked && (
              <div className="flex items-center gap-3 text-black text-sm bg-neutral-100 border-2 border-black rounded-lg p-4">
                <Lock className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">
                  Cuenta bloqueada por seguridad. Espera 15 minutos.
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-16 bg-black hover:bg-neutral-900 text-white rounded-lg font-medium tracking-wider text-base shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group"
              disabled={isLocked || isVerifying || code.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  VERIFICANDO
                  <div className="w-5 h-5 ml-3"></div>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  VERIFICAR CÓDIGO
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </form>

          {/* Información de seguridad */}
          <div className="text-xs text-neutral-500 text-center space-y-2 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <p className="uppercase tracking-widest">Conexión Segura Cifrada</p>
            </div>
            <p className="text-neutral-400 font-light">Esta verificación es válida solo para esta sesión</p>
          </div>

          {/* Botón de cancelar */}
          <Button
            type="button"
            variant="ghost"
            className="w-full h-12 text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg font-light tracking-wide transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVerify2FA;

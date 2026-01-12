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
  ShieldCheck, 
  Smartphone, 
  Lock, 
  KeyRound,
  AlertTriangle,
  Loader2
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="w-96 bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-white mb-2">Cargando sesión...</h2>
            <p className="text-slate-400">Validando acceso de administrador</p>
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
            <CardDescription className="text-slate-400">{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate('/login', { state: { redirectTo: '/admin/verify-2fa' } as any })}
            >
              {t('admin.2fa.cta.login', { defaultValue: 'Ir a iniciar sesión' })}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Verificación de Dos Factores
          </CardTitle>
          <CardDescription className="text-slate-400">
            Ingresa el código de 6 dígitos de tu aplicación Google Authenticator
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instrucciones */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <p className="font-semibold mb-1">Cómo obtener tu código:</p>
                <ol className="space-y-1 text-slate-400">
                  <li>1. Abre Google Authenticator</li>
                  <li>2. Busca "AInside Admin"</li>
                  <li>3. Ingresa el código de 6 dígitos</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={verify2FACode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-white flex items-center gap-2">
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
                className="text-center text-2xl tracking-widest font-mono bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-slate-400 text-center">
                El código cambia cada 30 segundos
              </p>
            </div>

            {/* Advertencia de intentos */}
            {attempts > 0 && !isLocked && (
              <div className="flex items-center gap-2 text-yellow-500 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {3 - attempts} intento{3 - attempts !== 1 ? 's' : ''} restante{3 - attempts !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Bloqueo */}
            {isLocked && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>
                  Cuenta bloqueada por seguridad. Espera 15 minutos.
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLocked || isVerifying || code.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verificar Código
                </>
              )}
            </Button>
          </form>

          {/* Información de seguridad */}
          <div className="text-xs text-slate-400 text-center space-y-1 pt-4 border-t border-slate-700">
            <p>🔒 Conexión segura cifrada</p>
            <p className="text-slate-500">Esta verificación es válida solo para esta sesión</p>
          </div>

          {/* Botón de cancelar */}
          <Button
            type="button"
            variant="ghost"
            className="w-full text-slate-400 hover:text-white"
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

import { useState, useEffect } from "react";
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setUserEmail(user.email || '');

    // Verificar si ya tiene sesión 2FA activa
    const session2FA = sessionStorage.getItem('admin_2fa_verified');
    if (session2FA === 'true') {
      navigate('/admin/control');
    }
  };

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
      // Llamar a la función de Supabase para verificar el código 2FA
      const { data, error } = await supabase.functions.invoke('verify-admin-2fa', {
        body: {
          email: userEmail,
          code: code
        }
      });

      if (error) throw error;

      if (data.verified) {
        // Guardar verificación en sessionStorage (válido solo para esta sesión)
        sessionStorage.setItem('admin_2fa_verified', 'true');
        sessionStorage.setItem('admin_2fa_timestamp', Date.now().toString());

        toast({
          title: "✓ Verificación Exitosa",
          description: "Acceso al panel de administración autorizado",
        });

        navigate('/admin/control');
      } else {
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
      toast({
        title: "Error de Verificación",
        description: "No se pudo verificar el código. Intenta nuevamente.",
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
            <p>Usuario: {userEmail}</p>
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

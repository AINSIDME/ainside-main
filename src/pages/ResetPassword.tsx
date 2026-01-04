import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 8) {
      toast({
        title: "Contraseña muy corta",
        description: "Usa al menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (passwordMismatch) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Verifica que ambas contraseñas sean iguales.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Ya puedes iniciar sesión con tu nueva contraseña.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "No se pudo actualizar",
        description: error?.message ?? "Intenta nuevamente o solicita un nuevo enlace.",
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
          <CardTitle className="text-white">Restablecer contraseña</CardTitle>
          <CardDescription className="text-slate-300">
            Establece una nueva contraseña para tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkingSession ? (
            <div className="text-sm text-slate-300">Verificando enlace…</div>
          ) : !hasSession ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                No se detectó una sesión de recuperación. Abre el enlace desde tu email o solicita uno nuevo.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Ir a iniciar sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-950/60 border-slate-800 text-slate-50 placeholder:text-slate-500"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-950/60 border-slate-800 text-slate-50 placeholder:text-slate-500"
                  autoComplete="new-password"
                  required
                />
                {passwordMismatch && (
                  <div className="text-xs text-red-300">Las contraseñas no coinciden.</div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Actualizando…" : "Actualizar contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

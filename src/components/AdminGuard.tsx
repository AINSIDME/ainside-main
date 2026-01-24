import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  require2FA?: boolean;
}

export const AdminGuard = ({ 
  children, 
  requireAdmin = true, 
  require2FA = true 
}: AdminGuardProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 1. Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setErrorMessage("Debes iniciar sesión para acceder");
          navigate("/login", { state: { redirectTo: window.location.pathname } });
          return;
        }

        // 2. Check if user is admin
        if (requireAdmin) {
          const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "jonathangolubok@gmail.com")
            .split(",")
            .map((email: string) => email.trim().toLowerCase());

          const userEmail = (user.email || "").toLowerCase();
          
          if (!adminEmails.includes(userEmail)) {
            setErrorMessage("No tienes permisos de administrador");
            await supabase.auth.signOut();
            navigate("/", { replace: true });
            return;
          }
        }

        // 3. Check 2FA if required
        if (require2FA) {
          const session2FA = localStorage.getItem("admin_2fa_verified");
          const timestamp = localStorage.getItem("admin_2fa_timestamp");
          const token = localStorage.getItem("admin_2fa_token");

          if (!session2FA || !timestamp || !token) {
            setErrorMessage("Verificación 2FA requerida");
            navigate("/admin/verify-2fa", { 
              state: { redirectTo: window.location.pathname } 
            });
            return;
          }

          // Check if 2FA session expired (12 hours)
          const twelveHoursInMs = 12 * 60 * 60 * 1000;
          const sessionAge = Date.now() - parseInt(timestamp);

          if (sessionAge > twelveHoursInMs) {
            localStorage.removeItem("admin_2fa_verified");
            localStorage.removeItem("admin_2fa_timestamp");
            localStorage.removeItem("admin_2fa_token");
            setErrorMessage("Sesión 2FA expirada");
            navigate("/admin/verify-2fa", { 
              state: { redirectTo: window.location.pathname } 
            });
            return;
          }
        }

        // All checks passed
        setIsAuthorized(true);
      } catch (error) {
        console.error("[AdminGuard] Error checking access:", error);
        setErrorMessage("Error verificando permisos");
        navigate("/", { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [navigate, requireAdmin, require2FA]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card className="w-96 bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-white mb-2">Verificando permisos...</h2>
            <p className="text-slate-400">Validando acceso de administrador</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card className="w-96 bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Acceso Denegado</h2>
            <p className="text-slate-400 mb-4">{errorMessage}</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

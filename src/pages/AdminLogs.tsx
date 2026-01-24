import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, RefreshCw, ShieldAlert } from "lucide-react";
import { AdminGuard } from "@/components/AdminGuard";

type AdminLogRow = {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
};

const AdminLogs = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AdminLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessGate, setAccessGate] = useState<
    | null
    | "login-required"
    | "admin-required"
    | "2fa-required"
    | "2fa-expired"
    | "error"
  >(null);

  const adminEmails = useMemo(() => {
    const raw = (import.meta as any)?.env?.VITE_ADMIN_EMAILS;
    if (raw) {
      return String(raw)
        .split(",")
        .map((s: string) => s.trim().toLowerCase())
        .filter(Boolean);
    }
    return ["jonathangolubok@gmail.com"];
  }, []);

  const get2FAToken = useCallback(() => localStorage.getItem("admin_2fa_token") || "", []);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsAdmin(false);
          setAccessGate("login-required");
          return;
        }

        const email = (user.email || "").toLowerCase();
        if (!adminEmails.includes(email)) {
          await supabase.auth.signOut();
          setIsAdmin(false);
          setAccessGate("admin-required");
          return;
        }

        const session2FA = localStorage.getItem("admin_2fa_verified");
        const timestamp = localStorage.getItem("admin_2fa_timestamp");
        const token = get2FAToken();

        if (!session2FA || !timestamp || !token) {
          setIsAdmin(false);
          setAccessGate("2fa-required");
          return;
        }

        const twelveHoursInMs = 12 * 60 * 60 * 1000;
        const sessionAge = Date.now() - parseInt(timestamp);

        if (sessionAge > twelveHoursInMs) {
          localStorage.removeItem("admin_2fa_verified");
          localStorage.removeItem("admin_2fa_timestamp");
          localStorage.removeItem("admin_2fa_token");
          setIsAdmin(false);
          setAccessGate("2fa-expired");
          return;
        }

        setIsAdmin(true);
        setAccessGate(null);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setIsAdmin(false);
        setAccessGate("error");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, [adminEmails, get2FAToken]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const { data, error } = await supabase.functions.invoke("admin-logs", {
        headers: {
          "x-admin-2fa-token": get2FAToken(),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: { limit: 200 },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error(String((data as any).error));

      setLogs(((data as any)?.logs ?? []) as AdminLogRow[]);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast({
        title: "Error",
        description: (error as any)?.message || "No se pudieron cargar los logs",
        variant: "destructive",
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [get2FAToken, toast]);

  useEffect(() => {
    if (!isCheckingAuth && isAdmin) {
      loadLogs();
    }
  }, [isAdmin, isCheckingAuth, loadLogs]);

  if (isCheckingAuth) {
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

  if (!isAdmin) {
    const title =
      accessGate === "login-required"
        ? t("admin.access.loginRequired.title", { defaultValue: "Iniciar sesión requerido" })
        : accessGate === "admin-required"
          ? t("admin.access.adminRequired.title", { defaultValue: "Acceso restringido" })
          : accessGate === "2fa-required"
            ? t("admin.access.2faRequired.title", { defaultValue: "Verificación 2FA requerida" })
            : accessGate === "2fa-expired"
              ? t("admin.access.2faExpired.title", { defaultValue: "Sesión 2FA expirada" })
              : t("admin.access.error.title", { defaultValue: "No se pudo validar el acceso" });

    const message =
      accessGate === "2fa-required" || accessGate === "2fa-expired"
        ? t("admin.access.2faRequired.message", { defaultValue: "Para continuar, completa la verificación 2FA de administrador." })
        : t("admin.access.loginRequired.message", { defaultValue: "Debes iniciar sesión para acceder al panel de administración." });

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="container mx-auto max-w-md">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 text-sm">{message}</p>
              <Button className="w-full" onClick={() => navigate("/admin/verify-2fa", { replace: true })}>
                {t("admin.access.cta.verify2fa", { defaultValue: "Verificar 2FA" })}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/admin")}>
                Volver al dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard requireAdmin={true} require2FA={true}>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-500" />
              Logs
            </h1>
            <p className="text-slate-400">Auditoría de acciones administrativas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={loadLogs} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white">Últimos eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-slate-400">Cargando...</div>
            ) : logs.length === 0 ? (
              <div className="text-slate-400">No hay logs todavía</div>
            ) : (
              logs.map((l) => (
                <div key={l.id} className="p-3 rounded border border-slate-700 bg-slate-900/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white font-medium">{l.action}</div>
                    <Badge variant="outline" className="text-xs text-slate-300 border-slate-700">
                      {new Date(l.created_at).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-400 break-all">user_id: {l.user_id}</div>
                  {l.details ? (
                    <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap break-words bg-black/20 p-2 rounded border border-slate-800">
                      {JSON.stringify(l.details, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminGuard>
  );
};

export default AdminLogs;

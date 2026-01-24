import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminGuard } from "@/components/AdminGuard";
import {
  Settings,
  ShieldAlert,
  Ticket,
  Users,
  FileText,
  Mail,
  Download,
  BarChart3,
  KeyRound,
} from "lucide-react";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

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
  const [stats, setStats] = useState({ clients: 0, registeredUsers: 0 });

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

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        // Get clients count
        const clientsRes = await supabase
          .from('hwid_registrations')
          .select('id', { count: 'exact', head: true });

        // Get users count from Edge Function
        const { data: usersData } = await supabase.functions.invoke('get-registered-users', {
          headers: {
            'x-admin-2fa-token': get2FAToken(),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          }
        });
        
        setStats({
          clients: clientsRes.count || 0,
          registeredUsers: (usersData as any)?.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, get2FAToken]);

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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card className="w-96 bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-white mb-2">{t("admin.access.checking", { defaultValue: "Verificando permisos..." })}</h2>
            <p className="text-slate-400">{t("admin.access.checkingDesc", { defaultValue: "Validando acceso de administrador" })}</p>
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
      accessGate === "login-required"
        ? t("admin.access.loginRequired.message", {
            defaultValue: "Debes iniciar sesión para acceder al panel de administración.",
          })
        : accessGate === "admin-required"
          ? t("admin.access.adminRequired.message", {
              defaultValue: "Necesitas iniciar sesión con una cuenta de administrador autorizada.",
            })
          : accessGate === "2fa-required"
            ? t("admin.access.2faRequired.message", {
                defaultValue: "Para continuar, completa la verificación 2FA de administrador.",
              })
            : accessGate === "2fa-expired"
              ? t("admin.access.2faExpired.message", {
                  defaultValue: "Tu sesión de verificación 2FA expiró. Verifica nuevamente.",
                })
              : t("admin.access.error.message", {
                  defaultValue: "Ocurrió un error al validar tu sesión. Intenta nuevamente.",
                });

    const primaryCtaLabel =
      accessGate === "2fa-required" || accessGate === "2fa-expired"
        ? t("admin.access.cta.verify2fa", { defaultValue: "Verificar 2FA" })
        : t("admin.access.cta.login", { defaultValue: "Ir a iniciar sesión" });

    const primaryCtaAction = async () => {
      try {
        if (accessGate === "2fa-required" || accessGate === "2fa-expired") {
          navigate("/admin/verify-2fa", { replace: true });
          return;
        }
        navigate("/login", { state: { redirectTo: "/admin" } as any });
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "No se pudo navegar al flujo de acceso",
          variant: "destructive",
        });
      }
    };

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
              <Button className="w-full" onClick={primaryCtaAction}>
                {primaryCtaLabel}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                {t("admin.access.cta.back", { defaultValue: "Volver" })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const modules = [
    {
      key: "clients",
      title: "Clientes",
      description: "Registro HWID, conexiones, compras, plan, cupón.",
      icon: Users,
      route: "/admin/control",
      enabled: true,
    },
    {
      key: "users",
      title: "Usuarios Registrados",
      description: "Usuarios con login OTP (auth.users).",
      icon: Users,
      route: "/admin/users",
      enabled: true,
    },
    {
      key: "coupons",
      title: "Cupones",
      description: "Crear/activar/desactivar cupones y enviar email.",
      icon: Ticket,
      route: "/admin/coupons",
      enabled: true,
    },
    {
      key: "twofa",
      title: "2FA Admin",
      description: "Verificar/renovar sesión 2FA.",
      icon: KeyRound,
      route: "/admin/verify-2fa",
      enabled: true,
    },
    {
      key: "logs",
      title: "Logs",
      description: "Auditoría de acciones admin (seguridad).",
      icon: FileText,
      route: "/admin/logs",
      enabled: true,
    },
    {
      key: "contact",
      title: "Mensajes",
      description: "Mensajes del formulario de contacto.",
      icon: Mail,
      route: "/admin/messages",
      enabled: true,
    },
    {
      key: "downloads",
      title: "Descargas",
      description: "Estado de descargas, links y accesos.",
      icon: Download,
      enabled: false,
    },
    {
      key: "analytics",
      title: "Métricas",
      description: "KPIs (compras, activaciones, retención).",
      icon: BarChart3,
      enabled: false,
    },
    {
      key: "settings",
      title: "Configuración",
      description: "Parámetros internos (próximamente).",
      icon: Settings,
      enabled: false,
    },
  ] as const;

  return (
    <AdminGuard requireAdmin={true} require2FA={true}>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-blue-500" />
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Acceso centralizado (cuenta admin + 2FA)</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Settings className="h-4 w-4" />
            Volver al sitio
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Clientes (con compra)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.clients}</div>
              <p className="text-xs text-slate-400 mt-1">Registros en hwid_registrations</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios Registrados (OTP)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.registeredUsers}</div>
              <p className="text-xs text-slate-400 mt-1">Usuarios en auth.users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Card
                key={m.key}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {m.title}
                    </span>
                    {m.enabled ? (
                      <Badge variant="outline" className="text-xs text-slate-200 border-slate-600">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-slate-400 border-slate-700">
                        Próximamente
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-slate-300 text-sm">{m.description}</p>
                  <Button
                    className="w-full"
                    variant={m.enabled ? "default" : "outline"}
                    onClick={() => {
                      if (m.enabled && (m as any).route) {
                        navigate((m as any).route);
                        return;
                      }
                      toast({
                        title: "Próximamente",
                        description: "Este módulo está planificado para una próxima versión.",
                      });
                    }}
                  >
                    {m.enabled ? "Abrir" : "Ver"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
    </AdminGuard>
  );
};

export default AdminDashboard;

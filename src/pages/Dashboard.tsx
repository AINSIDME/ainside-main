import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  LogOut, 
  Download,
  Key,
  CheckCircle,
  XCircle,
  Activity,
  Settings,
  Mail,
  Calendar
} from "lucide-react";

interface UserData {
  email: string;
  created_at: string;
  hwid?: string;
  plan_name?: string;
  status?: string;
  strategies_active?: string[];
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      // Get user registration data
      const { data: registration } = await supabase
        .from("hwid_registrations")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      // Get connection status
      if (registration?.hwid) {
        const { data: connection } = await supabase
          .from("client_connections")
          .select("*")
          .eq("hwid", registration.hwid)
          .maybeSingle();

        setUserData({
          email: user.email || "",
          created_at: user.created_at,
          hwid: registration.hwid,
          plan_name: connection?.plan_name || "Basic",
          status: connection ? (
            new Date().getTime() - new Date(connection.last_seen).getTime() < 120000 ? "online" : "offline"
          ) : "offline",
          strategies_active: connection?.strategies_active || []
        });
      } else {
        setUserData({
          email: user.email || "",
          created_at: user.created_at,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: t("dashboard.logout.success", { defaultValue: "Sesión cerrada" }),
        description: t("dashboard.logout.message", { defaultValue: "Has cerrado sesión correctamente" }),
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: t("dashboard.error", { defaultValue: "Error" }),
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t("dashboard.title", { defaultValue: "Mi Panel de Control" })}
            </h1>
            <p className="text-slate-400">
              {t("dashboard.subtitle", { defaultValue: "Gestiona tu cuenta y configuración" })}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("dashboard.logout", { defaultValue: "Cerrar Sesión" })}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("dashboard.profile.title", { defaultValue: "Información de Usuario" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-medium">{userData?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-400">Miembro desde</p>
                  <p className="text-white font-medium">
                    {new Date(userData?.created_at || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
              {userData?.plan_name && (
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Plan</p>
                    <Badge className="bg-blue-600 mt-1">{userData.plan_name}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HWID Status Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t("dashboard.hwid.title", { defaultValue: "Estado de HWID" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData?.hwid ? (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">HWID Registrado</p>
                      <p className="text-sm text-slate-400 font-mono mt-1">
                        {userData.hwid.substring(0, 20)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Estado de Conexión</p>
                      <div className="flex items-center gap-2 mt-1">
                        {userData.status === "online" ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400 font-medium">En Línea</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                            <span className="text-gray-400 font-medium">Fuera de Línea</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {userData.strategies_active && userData.strategies_active.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Estrategias Activas</p>
                      <div className="flex flex-wrap gap-2">
                        {userData.strategies_active.map((strategy) => (
                          <Badge key={strategy} variant="outline" className="text-green-400 border-green-400">
                            {strategy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">HWID No Registrado</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Registra tu HWID para activar tu licencia
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/register")}
                    className="w-full gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Registrar HWID
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Download Software Card */}
          <Card className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border-blue-500/30 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-blue-100 flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t("dashboard.software.title", { defaultValue: "Software AInside HWID Tool" })}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {t("dashboard.software.description", { defaultValue: "Descarga el software oficial para gestionar tu HWID y conectarte en tiempo real" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('/downloads/ainside_hwid_tool_premium_v5.exe', '_blank')}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                {t("dashboard.software.download", { defaultValue: "Descargar para Windows" })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

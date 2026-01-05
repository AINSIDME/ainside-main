import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Activity, 
  Power, 
  PowerOff, 
  Settings, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert
} from "lucide-react";

interface ClientConnection {
  id: string;
  email: string;
  name: string;
  hwid: string;
  plan_name: string;
  status: 'online' | 'offline';
  last_seen: string;
  strategies_active: string[];
  strategies_available: string[];
}

const AdminControl = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Lista de emails autorizados como administradores
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

  const get2FAToken = useCallback(() => sessionStorage.getItem('admin_2fa_token') || '', []);

  // Verificar autenticación y rol de administrador
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Acceso Denegado",
            description: "Debes iniciar sesión para acceder al panel de administración",
            variant: "destructive"
          });
          navigate('/login', { replace: true, state: { redirectTo: '/admin/control' } as any });
          return;
        }

        // Verificar si el email está en la lista de administradores
        const email = (user.email || '').toLowerCase();
        if (!adminEmails.includes(email)) {
          await supabase.auth.signOut();
          toast({
            title: "Acceso Denegado",
            description: "Inicia sesión con la cuenta de administrador",
            variant: "destructive"
          });
          navigate('/login', { replace: true, state: { redirectTo: '/admin/control' } as any });
          return;
        }

        // VERIFICACIÓN 2FA OBLIGATORIA
        const session2FA = sessionStorage.getItem('admin_2fa_verified');
        const timestamp = sessionStorage.getItem('admin_2fa_timestamp');
        const token = get2FAToken();
        
        // Verificar si la sesión 2FA sigue válida (1 hora máximo)
        if (!session2FA || !timestamp || !token) {
          navigate('/admin/verify-2fa', { replace: true });
          return;
        }

        const oneHourInMs = 60 * 60 * 1000;
        const sessionAge = Date.now() - parseInt(timestamp);
        
        if (sessionAge > oneHourInMs) {
          // Sesión 2FA expirada
          sessionStorage.removeItem('admin_2fa_verified');
          sessionStorage.removeItem('admin_2fa_timestamp');
          sessionStorage.removeItem('admin_2fa_token');
          toast({
            title: "Sesión Expirada",
            description: "Tu sesión de verificación 2FA ha expirado. Verifica nuevamente.",
            variant: "destructive"
          });
          navigate('/admin/verify-2fa', { replace: true });
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, [adminEmails, get2FAToken, navigate, toast]);

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-clients-status', {
        headers: { 'x-admin-2fa-token': get2FAToken() }
      });
      
      if (error) throw error;
      
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de clientes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [get2FAToken, toast]);

  // Toggle strategy for a client
  const toggleStrategy = useCallback(async (clientId: string, strategy: string, enable: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('toggle-strategy', {
        body: {
          clientId,
          strategy,
          enable
        },
        headers: { 'x-admin-2fa-token': get2FAToken() }
      });

      if (error) throw error;

      toast({
        title: enable ? "Estrategia Activada" : "Estrategia Desactivada",
        description: `${strategy} ha sido ${enable ? 'activada' : 'desactivada'} para el cliente`,
      });

      fetchClients(); // Refresh data
    } catch (error) {
      console.error('Error toggling strategy:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la estrategia",
        variant: "destructive"
      });
    }
  }, [fetchClients, get2FAToken, toast]);

  // Change client plan
  const changePlan = useCallback(async (clientId: string, newPlan: string) => {
    try {
      const { error } = await supabase.functions.invoke('change-client-plan', {
        body: {
          clientId,
          planName: newPlan
        },
        headers: { 'x-admin-2fa-token': get2FAToken() }
      });

      if (error) throw error;

      toast({
        title: "Plan Actualizado",
        description: `El plan del cliente ha sido cambiado a ${newPlan}`,
      });

      fetchClients();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el plan",
        variant: "destructive"
      });
    }
  }, [fetchClients, get2FAToken, toast]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchClients();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchClients();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchClients]);

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-gray-500';
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Mostrar pantalla de carga mientras verifica permisos
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
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

  // Si no es admin, no mostrar nada (ya se redirigió)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="container mx-auto max-w-7xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <ShieldAlert className="inline-block w-8 h-8 mr-2 text-blue-500" />
              Panel de Control Administrador
            </h1>
            <p className="text-slate-400">Monitoreo y control de clientes en tiempo real</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button onClick={fetchClients} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{clients.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                En Línea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {clients.filter(c => c.status === 'online').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <PowerOff className="h-4 w-4 text-gray-400" />
                Fuera de Línea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-400">
                {clients.filter(c => c.status === 'offline').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Estrategias Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {clients.reduce((acc, c) => acc + c.strategies_active.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3" />
                Cargando clientes...
              </CardContent>
            </Card>
          ) : clients.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8 text-center text-slate-400">
                <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
                No hay clientes registrados
              </CardContent>
            </Card>
          ) : (
            clients.map((client) => (
              <Card key={client.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Status Indicator */}
                      <div className="relative pt-1">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(client.status)}`}>
                          {client.status === 'online' && (
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                          )}
                        </div>
                      </div>

                      {/* Client Info */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
                        <p className="text-sm text-slate-400 mb-2">{client.email}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            HWID: {client.hwid.substring(0, 16)}...
                          </Badge>
                          <Badge className="text-xs bg-blue-600">
                            {client.plan_name}
                          </Badge>
                          {client.status === 'online' ? (
                            <Badge className="text-xs bg-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              En Línea
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeSince(client.last_seen)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Plan Controls */}
                    <div className="flex gap-2">
                      <select
                        value={client.plan_name}
                        onChange={(e) => changePlan(client.id, e.target.value)}
                        className="bg-slate-700 text-white text-sm rounded px-3 py-1 border border-slate-600"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Pro">Pro</option>
                        <option value="Premium">Premium</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  {/* Strategies */}
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Estrategias Disponibles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {client.strategies_available.map((strategy) => {
                        const isActive = client.strategies_active.includes(strategy);
                        return (
                          <Button
                            key={strategy}
                            onClick={() => toggleStrategy(client.id, strategy, !isActive)}
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            className={`gap-2 ${isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          >
                            {isActive ? (
                              <Power className="h-3 w-3" />
                            ) : (
                              <PowerOff className="h-3 w-3" />
                            )}
                            {strategy}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminControl;

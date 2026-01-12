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
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert
} from "lucide-react";

interface ClientConnection {
  id: string;
  order_id?: string;
  email: string;
  name: string;
  hwid: string;
  registration_status?: 'active' | 'inactive' | 'transferred' | string;
  registered_at?: string;
  updated_at?: string;
  notes?: string | null;
  plan_name: string;
  status: 'online' | 'offline';
  last_seen: string;
  strategies_active: string[];
  strategies_available: string[];

  purchase_count?: number;
  last_purchase_at?: string | null;
  last_purchase_status?: string | null;
  last_purchase_plan_name?: string | null;
  last_purchase_plan_type?: string | null;
  last_purchase_amount?: string | null;
  last_purchase_currency?: string | null;
  last_coupon_code?: string | null;
}

const AdminControl = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientConnection[]>([]);
  const [meta, setMeta] = useState<null | {
    registrationsCount: number;
    connectionsCount: number;
    purchasesCount: number;
  }>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessGate, setAccessGate] = useState<
    | null
    | 'login-required'
    | 'admin-required'
    | '2fa-required'
    | '2fa-expired'
    | 'error'
  >(null);

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

  const get2FAToken = useCallback(() => localStorage.getItem('admin_2fa_token') || '', []);

  // Verificar autenticación y rol de administrador
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setAccessGate('login-required');
          return;
        }

        // Verificar si el email está en la lista de administradores
        const email = (user.email || '').toLowerCase();
        if (!adminEmails.includes(email)) {
          await supabase.auth.signOut();
          setIsAdmin(false);
          setAccessGate('admin-required');
          return;
        }

        // VERIFICACIÓN 2FA OBLIGATORIA
        const session2FA = localStorage.getItem('admin_2fa_verified');
        const timestamp = localStorage.getItem('admin_2fa_timestamp');
        const token = get2FAToken();
        
        // Verificar si la sesión 2FA sigue válida (12 horas)
        if (!session2FA || !timestamp || !token) {
          setIsAdmin(false);
          setAccessGate('2fa-required');
          return;
        }

        const twelveHoursInMs = 12 * 60 * 60 * 1000; // 12 horas
        const sessionAge = Date.now() - parseInt(timestamp);
        
        if (sessionAge > twelveHoursInMs) {
          // Sesión 2FA expirada
          localStorage.removeItem('admin_2fa_verified');
          localStorage.removeItem('admin_2fa_timestamp');
          localStorage.removeItem('admin_2fa_token');
          setIsAdmin(false);
          setAccessGate('2fa-expired');
          return;
        }

        setIsAdmin(true);
        setAccessGate(null);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
        setAccessGate('error');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, [adminEmails, get2FAToken, navigate, toast]);

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const { data, error } = await supabase.functions.invoke('get-clients-status', {
        headers: {
          'x-admin-2fa-token': get2FAToken(),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
      });
      
      if (error) throw error;

      if ((data as any)?.error) {
        setClients([]);
        setMeta((data as any)?.meta ?? null);
        toast({
          title: "Error",
          description: String((data as any).error),
          variant: "destructive",
        });
        return;
      }
      
      setClients(data.clients || []);
      setMeta((data as any)?.meta ?? null);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: (error as any)?.message || "No se pudo cargar la lista de clientes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [get2FAToken, toast]);

  const createDemoClient = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const { data, error } = await supabase.functions.invoke('admin-create-test-client', {
        headers: {
          'x-admin-2fa-token': get2FAToken(),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: {},
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error(String((data as any).error));

      toast({
        title: 'Cliente demo creado',
        description: `Order: ${(data as any)?.client?.order_id ?? ''}`,
      });

      fetchClients();
    } catch (error) {
      console.error('Error creating demo client:', error);
      toast({
        title: 'Error',
        description: (error as any)?.message || 'No se pudo crear el cliente demo',
        variant: 'destructive',
      });
    }
  }, [fetchClients, get2FAToken, toast]);

  const resetDeviceHwid = useCallback(async (orderId: string, newHwid: string, reason?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const { data, error } = await supabase.functions.invoke('admin-device-reset', {
        headers: {
          'x-admin-2fa-token': get2FAToken(),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: {
          orderId,
          newHwid,
          reason: reason || 'support_reset',
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error(String((data as any).error));

      toast({
        title: 'HWID transferido',
        description: `Order ${orderId} actualizado`,
      });

      fetchClients();
    } catch (error) {
      console.error('Error resetting device HWID:', error);
      toast({
        title: 'Error',
        description: (error as any)?.message || 'No se pudo transferir el HWID',
        variant: 'destructive',
      });
    }
  }, [fetchClients, get2FAToken, toast]);

  // Toggle strategy for a client
  const toggleStrategy = useCallback(async (clientId: string, strategy: string, enable: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const { error } = await supabase.functions.invoke('toggle-strategy', {
        body: {
          clientId,
          strategy,
          enable
        },
        headers: {
          'x-admin-2fa-token': get2FAToken(),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
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
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const { error } = await supabase.functions.invoke('change-client-plan', {
        body: {
          clientId,
          planName: newPlan
        },
        headers: {
          'x-admin-2fa-token': get2FAToken(),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
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
    if (!isAdmin) return;

    fetchClients();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchClients();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchClients, isAdmin]);

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

  if (!isAdmin) {
    const title =
      accessGate === 'login-required'
        ? t('admin.access.loginRequired.title', { defaultValue: 'Iniciar sesión requerido' })
        : accessGate === 'admin-required'
          ? t('admin.access.adminRequired.title', { defaultValue: 'Acceso restringido' })
          : accessGate === '2fa-required'
            ? t('admin.access.2faRequired.title', { defaultValue: 'Verificación 2FA requerida' })
            : accessGate === '2fa-expired'
              ? t('admin.access.2faExpired.title', { defaultValue: 'Sesión 2FA expirada' })
              : t('admin.access.error.title', { defaultValue: 'No se pudo validar el acceso' });

    const message =
      accessGate === 'login-required'
        ? t('admin.access.loginRequired.message', {
            defaultValue: 'Debes iniciar sesión para acceder al panel de administración.',
          })
        : accessGate === 'admin-required'
          ? t('admin.access.adminRequired.message', {
              defaultValue: 'Necesitas iniciar sesión con una cuenta de administrador autorizada.',
            })
          : accessGate === '2fa-required'
            ? t('admin.access.2faRequired.message', {
                defaultValue: 'Para continuar, completa la verificación 2FA de administrador.',
              })
            : accessGate === '2fa-expired'
              ? t('admin.access.2faExpired.message', {
                  defaultValue: 'Tu sesión de verificación 2FA expiró. Verifica nuevamente.',
                })
              : t('admin.access.error.message', {
                  defaultValue: 'Ocurrió un error al validar tu sesión. Intenta nuevamente.',
                });

    const primaryCtaLabel =
      accessGate === '2fa-required' || accessGate === '2fa-expired'
        ? t('admin.access.cta.verify2fa', { defaultValue: 'Verificar 2FA' })
        : t('admin.access.cta.login', { defaultValue: 'Ir a iniciar sesión' });

    const primaryCtaAction = () => {
      if (accessGate === '2fa-required' || accessGate === '2fa-expired') {
        navigate('/admin/verify-2fa', { replace: true });
        return;
      }
      navigate('/login', { state: { redirectTo: '/admin/control' } as any });
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
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}
              >
                {t('admin.access.cta.back', { defaultValue: 'Volver' })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
              onClick={() => navigate('/admin')}
              variant="outline"
              className="gap-2 border-slate-600 text-slate-200 hover:bg-slate-800/40"
            >
              <Settings className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              onClick={createDemoClient}
              variant="outline"
              className="gap-2 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
            >
              <Plus className="h-4 w-4" />
              Crear cliente demo
            </Button>
            <Button
              onClick={() => navigate('/admin/coupons')}
              variant="outline"
              className="gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <Settings className="h-4 w-4" />
              Cupones
            </Button>
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
                <div>No hay clientes registrados</div>
                {meta ? (
                  <div className="mt-3 text-xs text-slate-500 space-y-1">
                    <div>Registros HWID: {meta.registrationsCount}</div>
                    <div>Conexiones: {meta.connectionsCount}</div>
                    <div>Compras: {meta.purchasesCount}</div>
                  </div>
                ) : null}
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
                          {client.order_id ? (
                            <Badge
                              variant="outline"
                              className="text-xs text-slate-200 border-slate-600 whitespace-normal break-all max-w-full"
                            >
                              Order ID: {client.order_id}
                            </Badge>
                          ) : null}

                          {typeof client.purchase_count === 'number' ? (
                            <Badge
                              variant="outline"
                              className="text-xs text-slate-200 border-slate-600 whitespace-normal break-all max-w-full"
                            >
                              Compras: {client.purchase_count}
                            </Badge>
                          ) : null}

                          {client.last_purchase_plan_name ? (
                            <Badge
                              variant="outline"
                              className="text-xs text-slate-200 border-slate-600 whitespace-normal break-all max-w-full"
                            >
                              Plan: {client.last_purchase_plan_name}
                            </Badge>
                          ) : null}

                          {client.last_purchase_status ? (
                            <Badge
                              variant="outline"
                              className="text-xs text-slate-200 border-slate-600 whitespace-normal break-all max-w-full"
                            >
                              Pago: {client.last_purchase_status}
                            </Badge>
                          ) : null}

                          {client.last_coupon_code ? (
                            <Badge
                              variant="outline"
                              className="text-xs text-slate-200 border-slate-600 whitespace-normal break-all max-w-full"
                            >
                              Cupón: {client.last_coupon_code}
                            </Badge>
                          ) : null}

                          <Badge
                            variant="outline"
                            className="text-xs text-slate-200 border-slate-600 whitespace-normal break-all max-w-full"
                          >
                            HWID: {client.hwid}
                          </Badge>
                          {client.registration_status ? (
                            <Badge
                              className={`text-xs ${
                                client.registration_status === 'active'
                                  ? 'bg-green-600'
                                  : client.registration_status === 'inactive'
                                    ? 'bg-gray-600'
                                    : 'bg-yellow-600'
                              }`}
                            >
                              Registro: {client.registration_status}
                            </Badge>
                          ) : null}
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

                        {(client.registered_at || client.notes) ? (
                          <div className="mt-3 text-xs text-slate-400 space-y-1">
                            {client.registered_at ? (
                              <div>
                                Registrado: {new Date(client.registered_at).toLocaleString()}
                              </div>
                            ) : null}
                            {client.notes ? (
                              <div>
                                Notas: {client.notes}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Plan Controls */}
                    <div className="flex gap-2 items-center">
                      <select
                        value={client.plan_name}
                        onChange={(e) => changePlan(client.id, e.target.value)}
                        className="bg-slate-700 text-white text-sm rounded px-3 py-1 border border-slate-600"
                      >
                        <option value="Contrato Micro S&P 500 - Monthly">Contrato Micro S&P 500 - Monthly</option>
                        <option value="Contrato Micro S&P 500 - Annual">Contrato Micro S&P 500 - Annual</option>
                        <option value="Contrato Mini S&P 500 - Monthly">Contrato Mini S&P 500 - Monthly</option>
                        <option value="Contrato Mini S&P 500 - Annual">Contrato Mini S&P 500 - Annual</option>
                        <option value="Contrato Micro Oro - Monthly">Contrato Micro Oro - Monthly</option>
                        <option value="Contrato Micro Oro - Annual">Contrato Micro Oro - Annual</option>
                        <option value="Contrato Mini Oro - Monthly">Contrato Mini Oro - Monthly</option>
                        <option value="Contrato Mini Oro - Annual">Contrato Mini Oro - Annual</option>
                      </select>

                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-600 text-slate-200 hover:bg-slate-800/40"
                        disabled={!client.order_id}
                        onClick={async () => {
                          const orderId = (client.order_id || '').trim();
                          if (!orderId) return;

                          const newHwid = window.prompt('Nuevo HWID (PC nueva):');
                          if (!newHwid || !newHwid.trim()) return;

                          const reason = window.prompt('Motivo (opcional):', 'support_reset') || 'support_reset';
                          await resetDeviceHwid(orderId, newHwid.trim(), reason.trim());
                        }}
                      >
                        Transferir HWID
                      </Button>
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

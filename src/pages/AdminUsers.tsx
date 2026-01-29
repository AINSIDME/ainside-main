import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminGuard } from "@/components/AdminGuard";
import { Users, RefreshCw, ArrowLeft, Mail, Calendar, Shield } from "lucide-react";

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  user_metadata?: Record<string, any>;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      console.log('[AdminUsers] Fetching users...');

      const { data, error } = await supabase.functions.invoke('get-registered-users', {
        headers: {
          'x-admin-2fa-token': localStorage.getItem("admin_2fa_token") || "",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
      });

      console.log('[AdminUsers] Response:', data);

      if (error) throw error;

      if ((data as any)?.error) {
        console.error('[AdminUsers] Server error:', (data as any).error);
        toast({
          title: "Error del servidor",
          description: String((data as any).error),
          variant: "destructive"
        });
        return;
      }

      setUsers((data as any)?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de usuarios",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminGuard requireAdmin={true} require2FA={true}>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-500" />
                Usuarios Registrados (OTP)
              </h1>
              <p className="text-slate-400">Gestión de usuarios en auth.users</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchUsers} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Email Verificado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {users.filter(u => u.email_confirmed_at).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Último Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {users.filter(u => u.last_sign_in_at).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">
                Cargando usuarios...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No hay usuarios registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Estado</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Registrado</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Último Login</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-white">
                            <Mail className="h-4 w-4 text-slate-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {user.email_confirmed_at ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              Verificado
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              Pendiente
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {formatDate(user.last_sign_in_at)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs font-mono break-all max-w-xs">
                          {user.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminGuard>
  );
};

export default AdminUsers;

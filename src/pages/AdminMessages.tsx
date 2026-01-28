import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminGuard } from "@/components/AdminGuard";
import { Mail, RefreshCw, ArrowLeft, Eye, Archive, Calendar, User, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

const AdminMessages = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const updateMessageStatus = async (id: string, status: 'read' | 'archived') => {
    try {
      const updatePayload: { status: 'read' | 'archived'; updated_at: string } = {
        status,
        updated_at: new Date().toISOString(),
      };

      // `contact_messages` is typed as non-updatable (Update = never) in the generated Supabase types,
      // so we cast only this update query to `any` to avoid the TS error.
      const { error } = await (supabase.from('contact_messages') as any)
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Mensaje marcado como ${status === 'read' ? 'leído' : 'archivado'}`,
      });

      fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      await updateMessageStatus(message.id, 'read');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Nuevo</Badge>;
      case 'read':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Leído</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">Archivado</Badge>;
      default:
        return null;
    }
  };

  const filteredCounts = {
    all: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    read: messages.filter(m => m.status === 'read').length,
    archived: messages.filter(m => m.status === 'archived').length,
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
                  <Mail className="h-8 w-8 text-blue-500" />
                  Mensajes de Contacto
                </h1>
                <p className="text-slate-400">Gestión de consultas desde el formulario</p>
              </div>
            </div>
            <Button onClick={fetchMessages} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {(['all', 'unread', 'read', 'archived'] as const).map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "outline"}
                onClick={() => setFilter(filterOption)}
                className="gap-2"
              >
                {filterOption === 'all' && 'Todos'}
                {filterOption === 'unread' && 'Nuevos'}
                {filterOption === 'read' && 'Leídos'}
                {filterOption === 'archived' && 'Archivados'}
                <span className="text-xs opacity-75">({filteredCounts[filterOption]})</span>
              </Button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Total Mensajes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{filteredCounts.all}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Nuevos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">{filteredCounts.unread}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Leídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">{filteredCounts.read}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">Archivados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-400">{filteredCounts.archived}</div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Table */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Lista de Mensajes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-400">
                  Cargando mensajes...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No hay mensajes
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        message.status === 'unread'
                          ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                          : 'bg-slate-700/20 border-slate-600/30 hover:bg-slate-700/30'
                      }`}
                      onClick={() => openMessage(message)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold truncate">{message.subject}</h3>
                            {getStatusBadge(message.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {message.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {message.email}
                            </span>
                            {message.organization && (
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {message.organization}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm line-clamp-2">{message.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(message.created_at)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMessage(message);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedMessage?.subject}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Mensaje recibido el {selectedMessage && formatDate(selectedMessage.created_at)}
              </DialogDescription>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase">De</label>
                    <p className="text-white">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase">Email</label>
                    <p className="text-white">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.organization && (
                    <div className="col-span-2">
                      <label className="text-xs text-slate-400 uppercase">Organización</label>
                      <p className="text-white">{selectedMessage.organization}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase">Mensaje</label>
                  <div className="mt-2 p-4 bg-slate-900 rounded-lg text-slate-300 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`;
                    }}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Responder por Email
                  </Button>
                  {selectedMessage.status !== 'archived' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateMessageStatus(selectedMessage.id, 'archived');
                        setSelectedMessage(null);
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archivar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
};

export default AdminMessages;

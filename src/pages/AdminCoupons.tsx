import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Copy, Check, Trash2, AlertCircle, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { AdminGuard } from '@/components/AdminGuard';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  duration_months: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  notes: string | null;
}

const AdminCoupons = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form state
  const [notes, setNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Email dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [emailLanguage, setEmailLanguage] = useState('en');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Lista de emails autorizados como administradores
  const adminEmails = ['jonathangolubok@gmail.com'];

  const get2FAToken = () => localStorage.getItem('admin_2fa_token') || '';

  useEffect(() => {
    checkAdminAndLoadCoupons();
  }, []);

  const checkAdminAndLoadCoupons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Verificar si el email está en la lista de administradores
      const email = (user.email || '').toLowerCase();
      if (!adminEmails.includes(email)) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // 2FA obligatorio (12 horas)
      const session2FA = localStorage.getItem('admin_2fa_verified');
      const timestamp = localStorage.getItem('admin_2fa_timestamp');
      const token = get2FAToken();
      if (!session2FA || !timestamp || !token) {
        navigate('/admin/verify-2fa', { replace: true });
        return;
      }
      const twelveHoursInMs = 12 * 60 * 60 * 1000;
      const sessionAge = Date.now() - parseInt(timestamp);
      if (sessionAge > twelveHoursInMs) {
        localStorage.removeItem('admin_2fa_verified');
        localStorage.removeItem('admin_2fa_timestamp');
        localStorage.removeItem('admin_2fa_token');
        navigate('/admin/verify-2fa', { replace: true });
        return;
      }

      await loadCoupons();
    } catch (error) {
      console.error('Error checking admin:', error);
      toast({
        title: "Error",
        description: "Error al verificar permisos",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      console.log('[AdminCoupons] Loading coupons with token:', get2FAToken()?.substring(0, 10) + '...');

      const { data, error } = await supabase.functions.invoke('admin-coupons', {
        headers: {
          'x-admin-2fa-token': get2FAToken(),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: { action: 'list' },
      });

      if (error) {
        console.error('[AdminCoupons] Error loading coupons:', error);
        toast({
          title: "Error al cargar cupones",
          description: error.message || 'Error desconocido',
          variant: "destructive",
        });
        return;
      }

      console.log('[AdminCoupons] Response:', data);
      const couponsData = (data as any)?.data || [];
      console.log('[AdminCoupons] Loaded', couponsData.length, 'coupons');
      setCoupons(couponsData);
    } catch (err) {
      console.error('[AdminCoupons] Exception:', err);
      toast({
        title: "Error",
        description: "Error al cargar cupones",
        variant: "destructive",
      });
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const createCoupon = async () => {
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) return;

      const newCode = generateCouponCode();

      const { error } = await supabase.functions.invoke('admin-coupons', {
        headers: {
          'x-admin-2fa-token': get2FAToken(),
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          action: 'create',
          code: newCode,
          discount_percent: 50,
          duration_months: 12,
          max_uses: 1,
          expires_at: expiresAt || null,
          notes: notes || null,
        },
      });

      if (error) {
        console.error('Error creating coupon:', error);
        alert('Error al crear cupón: ' + (error as any).message);
        return;
      }

      setNotes('');
      setExpiresAt('');
      await loadCoupons();
      
      // Copy new code to clipboard
      navigator.clipboard.writeText(newCode);
      setCopiedCode(newCode);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCreating(false);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleCouponActive = async (id: string, currentActive: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) return;

    const { error } = await supabase.functions.invoke('admin-coupons', {
      headers: {
        'x-admin-2fa-token': get2FAToken(),
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        action: 'toggleActive',
        id,
        is_active: !currentActive,
      },
    });

    if (error) {
      console.error('Error updating coupon:', error);
      return;
    }

    await loadCoupons();
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`¿Eliminar cupón ${code}?`)) return;

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) return;

    const { error } = await supabase.functions.invoke('admin-coupons', {
      headers: {
        'x-admin-2fa-token': get2FAToken(),
        Authorization: `Bearer ${accessToken}`,
      },
      body: { action: 'delete', id },
    });

    if (error) {
      console.error('Error deleting coupon:', error);
      return;
    }

    await loadCoupons();
  };

  const openEmailDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setRecipientEmail('');
    setRecipientName('');
    setEmailLanguage('en');
    setEmailDialogOpen(true);
  };

  const sendCouponByEmail = async () => {
    if (!selectedCoupon || !recipientEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      console.log('Sending coupon email to:', recipientEmail);
      console.log('Coupon code:', selectedCoupon.code);

      const { data: { session } } = await supabase.auth.getSession();
      const twoFaToken = get2FAToken();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-coupon-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'x-admin-2fa-token': twoFaToken,
        },
        body: JSON.stringify({
          recipientEmail,
          recipientName: (recipientName || '').trim() || (
            emailLanguage === 'es' ? 'Cliente' :
            emailLanguage === 'fr' ? 'Client' :
            emailLanguage === 'he' ? 'לקוח' :
            emailLanguage === 'ar' ? 'عميل' :
            emailLanguage === 'ru' ? 'Клиент' :
            'Customer'
          ),
          couponCode: selectedCoupon.code,
          discountPercent: selectedCoupon.discount_percent,
          durationMonths: selectedCoupon.duration_months,
          expiresAt: selectedCoupon.expires_at,
          language: emailLanguage,
        }),
      });

      const result = await response.json();
      console.log('Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar email');
      }

      toast({
        title: "✅ Email enviado",
        description: `Cupón enviado exitosamente a ${recipientEmail}`,
      });

      setEmailDialogOpen(false);
      setRecipientEmail('');
      setRecipientName('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el email. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard requireAdmin={true} require2FA={true}>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white font-mono">Cargando...</div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard requireAdmin={true} require2FA={true}>
      <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
              onClick={() => navigate('/admin')}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl sm:text-3xl font-light">Sistema de Cupones</h1>
        </div>

        {/* Info Alert */}
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-start gap-2 sm:gap-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-300">
            <p className="font-semibold mb-1">50% de descuento por 12 meses - Uso único</p>
            <p className="hidden sm:block">Cada cupón es de <strong>uso único</strong> y ofrece un <strong>50% de descuento</strong> durante todo el año.</p>
          </div>
        </div>

        {/* Create Coupon Form */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-medium mb-4">Crear Nuevo Cupón</h2>
          
          <div className="grid gap-3 sm:gap-4 mb-4">
            <div>
              <label className="block text-xs sm:text-sm text-slate-400 mb-2">
                Notas (Opcional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Cupón para Juan Pérez"
                className="bg-slate-800 border-slate-700 text-white text-sm"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-slate-400 mb-2">
                Expiración (Opcional)
              </label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          <Button
            onClick={createCoupon}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {creating ? 'Creando...' : 'Generar Cupón'}
          </Button>
        </div>

        {/* Coupons List */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-medium">
            Cupones Creados ({coupons.length})
          </h2>

          {coupons.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No hay cupones creados
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`bg-slate-900/50 border rounded-lg p-3 sm:p-4 ${
                    coupon.is_active && coupon.current_uses < coupon.max_uses
                      ? 'border-blue-500/50'
                      : 'border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Coupon Code */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <code className="text-lg sm:text-2xl font-mono font-bold text-blue-400 bg-slate-800 px-2 sm:px-3 py-1 rounded break-all">
                        {coupon.code}
                      </code>
                      <Button
                        onClick={() => copyCouponCode(coupon.code)}
                        variant="outline"
                        size="sm"
                        className="border-slate-700 w-full sm:w-auto"
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-500 text-xs">Descuento</span>
                        <div className="font-semibold text-green-400">
                          {coupon.discount_percent}%
                        </div>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-500 text-xs">Duración</span>
                        <div className="font-semibold">
                          {coupon.duration_months} meses
                        </div>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-500 text-xs">Usos</span>
                        <div className="font-semibold">
                          {coupon.current_uses} / {coupon.max_uses}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded">
                        <span className="text-slate-500 text-xs">Estado</span>
                        <div
                          className={`font-semibold ${
                            coupon.is_active && coupon.current_uses < coupon.max_uses
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {coupon.is_active && coupon.current_uses < coupon.max_uses
                            ? 'Disponible'
                            : coupon.current_uses >= coupon.max_uses
                            ? 'Usado'
                            : 'Inactivo'}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {coupon.notes && (
                      <div className="text-xs sm:text-sm text-slate-400 bg-slate-800/30 p-2 rounded">
                        <span className="text-slate-500 font-medium">Notas:</span> {coupon.notes}
                      </div>
                    )}

                    {/* Dates */}
                    <div className="text-xs text-slate-500">
                      <div>Creado: {new Date(coupon.created_at).toLocaleString('es-ES')}</div>
                      {coupon.expires_at && (
                        <div>Expira: {new Date(coupon.expires_at).toLocaleString('es-ES')}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openEmailDialog(coupon)}
                        variant="outline"
                        size="sm"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 flex-1 sm:flex-none"
                        disabled={!coupon.is_active || coupon.current_uses >= coupon.max_uses}
                      >
                        <Mail className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Enviar</span>
                      </Button>
                      <Button
                        onClick={() => toggleCouponActive(coupon.id, coupon.is_active)}
                        variant="outline"
                        size="sm"
                        className="border-slate-700 flex-1 sm:flex-none"
                        disabled={coupon.current_uses >= coupon.max_uses}
                      >
                        {coupon.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        onClick={() => deleteCoupon(coupon.id, coupon.code)}
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Enviar Cupón por Email</DialogTitle>
            <DialogDescription className="text-slate-400">
              Envía el cupón <code className="text-blue-400 bg-slate-800 px-2 py-0.5 rounded">{selectedCoupon?.code}</code> directamente al cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Email del destinatario *
              </label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Nombre del destinatario (Opcional)
              </label>
              <Input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Juan Pérez"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                🌍 Idioma del email *
              </label>
              <select
                value={emailLanguage}
                onChange={(e) => setEmailLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="he">🇮🇱 עברית (Hebrew)</option>
                <option value="ar">🇸🇦 العربية (Arabic)</option>
                <option value="ru">🇷🇺 Русский (Russian)</option>
              </select>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-sm">
              <p className="text-blue-300">
                <strong>Descuento:</strong> {selectedCoupon?.discount_percent}% por {selectedCoupon?.duration_months} meses
              </p>
              {selectedCoupon?.expires_at && (
                <p className="text-blue-300 mt-1">
                  <strong>Expira:</strong> {new Date(selectedCoupon.expires_at).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setEmailDialogOpen(false)}
                variant="outline"
                className="flex-1 border-slate-700"
                disabled={sendingEmail}
              >
                Cancelar
              </Button>
              <Button
                onClick={sendCouponByEmail}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={sendingEmail || !recipientEmail}
              >
                <Mail className="w-4 h-4 mr-2" />
                {sendingEmail ? 'Enviando...' : 'Enviar Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AdminGuard>
  );
};

export default AdminCoupons;

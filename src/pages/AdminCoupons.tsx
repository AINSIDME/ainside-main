import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Copy, Check, Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form state
  const [notes, setNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    checkAdminAndLoadCoupons();
  }, []);

  const checkAdminAndLoadCoupons = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        navigate('/');
        return;
      }

      await loadCoupons();
    } catch (error) {
      console.error('Error checking admin:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadCoupons = async () => {
    const { data, error } = await supabase
      .from('discount_coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading coupons:', error);
      return;
    }

    setCoupons(data || []);
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
      if (!session) return;

      const { data: userData } = await supabase.auth.getUser();
      const newCode = generateCouponCode();

      const { error } = await supabase
        .from('discount_coupons')
        .insert({
          code: newCode,
          discount_percent: 30,
          duration_months: 12,
          max_uses: 1,
          current_uses: 0,
          is_active: true,
          created_by: userData.user?.id,
          expires_at: expiresAt || null,
          notes: notes || null
        });

      if (error) {
        console.error('Error creating coupon:', error);
        alert('Error al crear cupón: ' + error.message);
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
    const { error } = await supabase
      .from('discount_coupons')
      .update({ is_active: !currentActive })
      .eq('id', id);

    if (error) {
      console.error('Error updating coupon:', error);
      return;
    }

    await loadCoupons();
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`¿Eliminar cupón ${code}?`)) return;

    const { error } = await supabase
      .from('discount_coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting coupon:', error);
      return;
    }

    await loadCoupons();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin/control')}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-light">Sistema de Cupones</h1>
          </div>
        </div>

        {/* Info Alert */}
        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-semibold mb-1">Sistema de Cupones con Descuento del 30% por 12 meses</p>
            <p>Cada cupón es de <strong>uso único</strong> y reemplaza el descuento del 59% del primer mes con un 30% durante todo el año.</p>
          </div>
        </div>

        {/* Create Coupon Form */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Crear Nuevo Cupón</h2>
          
          <div className="grid gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Notas (Opcional) - Para quién es este cupón
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Cupón para cliente Juan Pérez - Referido por..."
                className="bg-slate-800 border-slate-700 text-white"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Fecha de Expiración (Opcional)
              </label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <Button
            onClick={createCoupon}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {creating ? 'Creando...' : 'Generar Cupón'}
          </Button>
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium">
            Cupones Creados ({coupons.length})
          </h2>

          {coupons.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No hay cupones creados
            </div>
          ) : (
            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`bg-slate-900/50 border rounded-lg p-4 ${
                    coupon.is_active && coupon.current_uses < coupon.max_uses
                      ? 'border-blue-500/50'
                      : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Coupon Code */}
                      <div className="flex items-center gap-3 mb-3">
                        <code className="text-2xl font-mono font-bold text-blue-400 bg-slate-800 px-3 py-1 rounded">
                          {coupon.code}
                        </code>
                        <Button
                          onClick={() => copyCouponCode(coupon.code)}
                          variant="outline"
                          size="sm"
                          className="border-slate-700"
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-slate-500">Descuento:</span>
                          <div className="font-semibold text-green-400">
                            {coupon.discount_percent}%
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Duración:</span>
                          <div className="font-semibold">
                            {coupon.duration_months} meses
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Usos:</span>
                          <div className="font-semibold">
                            {coupon.current_uses} / {coupon.max_uses}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Estado:</span>
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
                        <div className="text-sm text-slate-400 mb-2">
                          <span className="text-slate-500">Notas:</span> {coupon.notes}
                        </div>
                      )}

                      {/* Dates */}
                      <div className="text-xs text-slate-500">
                        Creado: {new Date(coupon.created_at).toLocaleString('es-ES')}
                        {coupon.expires_at && (
                          <> • Expira: {new Date(coupon.expires_at).toLocaleString('es-ES')}</>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleCouponActive(coupon.id, coupon.is_active)}
                        variant="outline"
                        size="sm"
                        className="border-slate-700"
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
    </div>
  );
};

export default AdminCoupons;

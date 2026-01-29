// Script para verificar cupones en la base de datos
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odlxhgatqyodxdessxts.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY no está configurado');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCoupons() {
  console.log('Consultando cupones...\n');
  
  const { data, error, count } = await supabase
    .from('discount_coupons')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total de cupones: ${count || data?.length || 0}\n`);
  
  if (data && data.length > 0) {
    data.forEach((coupon, i) => {
      console.log(`Cupón ${i + 1}:`);
      console.log(`  Código: ${coupon.code}`);
      console.log(`  Descuento: ${coupon.discount_percent}%`);
      console.log(`  Usos: ${coupon.current_uses}/${coupon.max_uses}`);
      console.log(`  Activo: ${coupon.is_active ? 'Sí' : 'No'}`);
      console.log(`  Creado: ${coupon.created_at}`);
      console.log('');
    });
  } else {
    console.log('No hay cupones creados en la base de datos.');
  }
}

checkCoupons();

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://odlxhgatqyodxdessxts.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbHhoZ2F0cXlvZHhkZXNzeHRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ1OTYwNiwiZXhwIjoyMDUwMDM1NjA2fQ.Br2CnXd8DlTJxXpqBtFtRfGmDW9oVeCGjZRlPwwlzPs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = `
DROP POLICY IF EXISTS "Admins can view coupons" ON public.discount_coupons;

CREATE POLICY "Admins can view coupons"
ON public.discount_coupons
FOR SELECT
TO authenticated
USING (
  auth.email() IN (
    'jonathangolubok@gmail.com'
  )
);
`;

async function applyPolicy() {
  console.log('⚠️  EJECUTA ESTE SQL MANUALMENTE EN EL DASHBOARD DE SUPABASE:\n');
  console.log('URL: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/sql/new\n');
  console.log('--- COPIA Y PEGA ESTE SQL ---\n');
  console.log(sql);
  console.log('\n--- FIN DEL SQL ---\n');
  console.log('Esto permitirá que veas los cupones sin problemas de 2FA.');
}

applyPolicy();

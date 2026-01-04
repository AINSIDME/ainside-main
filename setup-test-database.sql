-- Script SQL para crear registros de prueba y subir archivos
-- Ejecutar en: https://supabase.com/dashboard/project/odlxhgatqyodxdessxts/sql/new

-- 1. Insertar registros de prueba para todos los planes
INSERT INTO purchases (order_id, email, plan_name, plan_type, amount, currency, status)
VALUES 
  ('TEST-001', 'jonathangolubok@gmail.com', 'Contrato Micro - S&P 500 (MES) - Suscripcion Mensual', 'micro-sp500', '99.00', 'USD', 'completed'),
  ('TEST-002', 'jonathangolubok@gmail.com', 'Contrato Micro - Oro (MGC) - Suscripcion Mensual', 'micro-gold', '99.00', 'USD', 'completed'),
  ('TEST-003', 'jonathangolubok@gmail.com', 'Contrato Mini - S&P 500 (ES) - Suscripcion Mensual', 'mini-sp500', '999.00', 'USD', 'completed'),
  ('TEST-004', 'jonathangolubok@gmail.com', 'Contrato Mini - Oro (GC) - Suscripcion Mensual', 'mini-gold', '999.00', 'USD', 'completed')
ON CONFLICT (order_id) DO UPDATE
SET 
  email = EXCLUDED.email,
  plan_name = EXCLUDED.plan_name,
  plan_type = EXCLUDED.plan_type,
  amount = EXCLUDED.amount;

-- 2. Verificar que se crearon correctamente
SELECT order_id, plan_type, amount, status, created_at 
FROM purchases 
WHERE order_id LIKE 'TEST-%'
ORDER BY order_id;

-- Test directo para verificar si el trigger y pg_net están funcionando
-- Ejecuta este query en el SQL Editor de Supabase

-- 1. Verificar que el trigger existe
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_contact_message_created';

-- 2. Verificar que la función existe
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname = 'notify_admin_new_message';

-- 3. Verificar extensión pg_net
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- 4. Ver los últimos requests HTTP de pg_net (si hay)
SELECT 
  id,
  created,
  url,
  status_code,
  error_msg,
  response::text as response
FROM net._http_response 
ORDER BY created DESC 
LIMIT 10;

-- 5. INSERTAR MENSAJE DE PRUEBA (esto debería enviar email automáticamente)
-- Descomenta las siguientes líneas para probar:
/*
INSERT INTO contact_messages (name, email, subject, message, organization)
VALUES (
  'Test Trigger - ' || NOW()::text,
  'test@test.com',
  'Prueba de Notificación Automática',
  'Este mensaje debería enviar un email a jonathangolubok@gmail.com automáticamente.',
  'Test'
);
*/

-- 6. Después de insertar, espera 5 segundos y vuelve a ejecutar el query #4 para ver los logs

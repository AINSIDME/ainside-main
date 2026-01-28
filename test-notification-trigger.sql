-- Test: Insertar un mensaje de prueba para verificar el trigger
-- Esto debería enviar un email automáticamente a jonathangolubok@gmail.com

-- Insertar mensaje de prueba
INSERT INTO contact_messages (name, email, subject, message, organization)
VALUES (
  'Test User (Trigger Test)',
  'test@ainside.me',
  'Prueba de Notificación Automática',
  'Este es un mensaje de prueba para verificar que el trigger funciona correctamente y envía notificaciones por email.',
  'AInside Testing'
);

-- Esperar 2 segundos y verificar logs
-- Luego ejecuta este query para ver los logs de pg_net:
-- SELECT * FROM net._http_response ORDER BY created DESC LIMIT 5;

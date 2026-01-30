import { supabase } from "@/integrations/supabase/client";

export default function DebugKey() {
  // @ts-ignore - accediendo a propiedades internas para debug
  const supabaseKey = supabase.supabaseKey;
  const supabaseUrl = supabase.supabaseUrl;
  
  const lastTenChars = supabaseKey ? supabaseKey.slice(-10) : 'NO KEY';
  const isCorrectKey = lastTenChars === 'KujdcB-xLA';

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px', 
      background: '#1e1e1e', 
      color: '#00ff00',
      minHeight: '100vh'
    }}>
      <h1>Debug: Key en Producción</h1>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ color: '#ffff00' }}>URL Supabase:</div>
        <div>{supabaseUrl}</div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ color: '#ffff00' }}>Anon Key (últimos 10 caracteres):</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>...{lastTenChars}</div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ color: '#ffff00' }}>Estado:</div>
        {isCorrectKey ? (
          <div style={{ color: '#00ff00', fontSize: '20px' }}>
            ✅ KEY CORRECTA - Termina en ...KujdcB-xLA (key nueva)
            <div style={{ marginTop: '20px', fontSize: '16px' }}>
              🎉 ¡El login debería funcionar ahora!
            </div>
          </div>
        ) : (
          <div style={{ color: '#ff0000', fontSize: '20px' }}>
            ❌ KEY INCORRECTA - No es la key nueva
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              Debería terminar en: ...KujdcB-xLA
            </div>
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              Termina en: ...{lastTenChars}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ffff00', background: '#000' }}>
        <div style={{ color: '#ffff00', fontWeight: 'bold' }}>Información:</div>
        <div style={{ marginTop: '10px' }}>
          Esta página lee la key que está COMPILADA en el bundle de producción.
        </div>
        <div style={{ marginTop: '10px' }}>
          Si muestra la key incorrecta, el redeploy no funcionó correctamente.
        </div>
      </div>
    </div>
  );
}

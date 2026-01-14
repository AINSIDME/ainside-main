import { useEffect } from 'react';
import { Languages } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    // Esperar un poco para asegurar que el DOM esté listo
    const timer = setTimeout(() => {
      // Función de inicialización
      window.googleTranslateElementInit = () => {
        const element = document.getElementById('google_translate_element');
        if (element && window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'es',
              includedLanguages: 'en,fr,de,it,pt,ru,ar,zh-CN,ja,ko,hi,tr,nl,pl,sv,no,da,fi,cs,el',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      };

      // Cargar el script de Google Translate
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      } else {
        // Si el script ya existe, llamar directamente a la función
        if (window.googleTranslateElementInit) {
          window.googleTranslateElementInit();
        }
      }

      // Agregar estilos CSS para mejorar apariencia
      const styleId = 'google-translate-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .goog-te-banner-frame { display: none !important; }
          body { top: 0 !important; }
          .goog-te-gadget { color: transparent !important; }
          .goog-te-gadget > span:first-child { display: none !important; }
          .goog-te-combo { 
            margin: 0 !important;
            padding: 10px 14px !important;
            border: 2px solid #3b82f6 !important;
            border-radius: 0.5rem !important;
            background: white !important;
            color: #1e293b !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            cursor: pointer !important;
            width: 100% !important;
          }
          .goog-te-combo:hover {
            border-color: #2563eb !important;
            background: #eff6ff !important;
          }
          #google_translate_element .skiptranslate {
            display: block !important;
          }
        `;
        document.head.appendChild(style);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border-2 border-blue-200 p-4 min-w-[250px]">
        <div className="flex items-center gap-2 mb-3">
          <Languages className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-sm text-gray-900">Traducir página:</span>
        </div>
        <div id="google_translate_element" />
      </div>
    </div>
  );
}

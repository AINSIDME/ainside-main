import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Función de inicialización
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
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
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Agregar estilos CSS para ocultar elementos no deseados
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; }
      .goog-te-gadget { color: transparent !important; }
      .goog-te-gadget > span { display: none !important; }
      .goog-te-combo { 
        margin: 0 !important;
        padding: 8px 12px !important;
        border: 2px solid #60a5fa !important;
        border-radius: 0.5rem !important;
        background: white !important;
        color: #1e293b !important;
        font-weight: 600 !important;
        font-size: 14px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Limpiar el script al desmontar
      const scripts = document.querySelectorAll('script[src*="translate.google.com"]');
      scripts.forEach(s => s.remove());
      
      // Limpiar elementos de Google Translate
      const translateElements = document.querySelectorAll('.goog-te-banner-frame, .skiptranslate');
      translateElements.forEach(el => el.remove());
      
      // Limpiar estilos
      const styles = document.querySelectorAll('style');
      styles.forEach(s => {
        if (s.textContent?.includes('goog-te-banner-frame')) {
          s.remove();
        }
      });
      
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* Botón con icono */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Languages className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-900">Traducir</span>
        </button>

        {/* Panel del traductor */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-blue-200 p-4 min-w-[200px]">
            <div className="flex items-center gap-2 mb-3">
              <Languages className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-sm text-gray-900">Selecciona idioma:</span>
            </div>
            <div id="google_translate_element" />
          </div>
        )}
      </div>
    </div>
  );
}

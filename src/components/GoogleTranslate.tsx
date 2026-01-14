import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    // Función de inicialización
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'es',
            includedLanguages: 'en,fr,de,it,pt,ru,ar,zh-CN,ja,ko,hi,tr',
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

    return () => {
      // Limpiar el script al desmontar
      const scripts = document.querySelectorAll('script[src*="translate.google.com"]');
      scripts.forEach(s => s.remove());
      
      // Limpiar elementos de Google Translate
      const translateElements = document.querySelectorAll('.goog-te-banner-frame, .skiptranslate');
      translateElements.forEach(el => el.remove());
      
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        id="google_translate_element"
        className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-2"
      />
    </div>
  );
}

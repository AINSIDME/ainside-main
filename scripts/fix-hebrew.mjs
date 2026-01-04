import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/locales');

// Leer archivo inglés
const enContent = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

// Traducciones manuales clave (verificadas)
const hebrewTranslations = {
  "nav": {
    "home": "בית",
    "about": "אודות",
    "services": "שירותים",
    "demo": "אסטרטגיה",
    "crypto": "קריפטו",
    "liveDemoMini": "לייב",
    "pricing": "מחירים",
    "blog": "בלוג",
    "faq": "FAQ",
    "contact": "צור קשר",
    "accessibility": "נגישות"
  },
  "instrument": {
    "sp500": {
      "name": "S&P 500"
    },
    "gold": {
      "name": "זהב"
    }
  }
};

// Función para traducir recursivamente
function translateObject(obj, translations = {}) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (translations[key]) {
      // Si hay traducción manual disponible
      if (typeof translations[key] === 'object' && !Array.isArray(translations[key])) {
        result[key] = translateObject(value, translations[key]);
      } else {
        result[key] = translations[key];
      }
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Traducir recursivamente objetos
      result[key] = translateObject(value, translations[key] || {});
    } else if (typeof value === 'string') {
      // Mantener strings en inglés temporalmente (se pueden traducir después)
      // O usar un servicio de traducción aquí
      result[key] = value; // Por ahora mantener en inglés
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// Traducir todo el objeto
const heContent = translateObject(enContent, hebrewTranslations);

// Agregar traducciones adicionales importantes
heContent.header = {
  brand: "AInside.me",
  toggleMenu: "החלף תפריט"
};

heContent.footer = heContent.footer || {};
heContent.footer.copyright = `© {{year}} AInside.me. כל הזכויות שמורות.`;

// Guardar con codificación UTF-8 correcta
fs.writeFileSync(
  path.join(localesDir, 'he.json'),
  JSON.stringify(heContent, null, 4),
  { encoding: 'utf8' }
);

console.log('✅ Archivo hebreo regenerado correctamente');
console.log('📝 Nota: Algunas traducciones están en inglés temporalmente');
console.log('💡 Se pueden traducir manualmente o con un servicio de traducción');

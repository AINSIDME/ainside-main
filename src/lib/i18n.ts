import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import he from '../locales/he.json';
import ar from '../locales/ar.json';
import ru from '../locales/ru.json';

// Clear old i18next cache on version change
const I18N_VERSION = '1.0.12';
const storedVersion = localStorage.getItem('i18n_version');
if (storedVersion !== I18N_VERSION) {
  // Clear all i18next related localStorage keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('i18next') || key.includes('lng')) {
      localStorage.removeItem(key);
    }
  });
  localStorage.setItem('i18n_version', I18N_VERSION);
}

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  he: { translation: he },
  ar: { translation: ar },
  ru: { translation: ru },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Force English as default
    fallbackLng: 'en',
    debug: false,
    // Expose all available languages; missing keys fall back to ES
    supportedLngs: ['en', 'es', 'fr', 'he', 'ar', 'ru'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    lowerCaseLng: true,

    detection: {
      // Only use localStorage, ignore browser language
      order: ['localStorage'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

// RTL languages
export const RTL_LANGUAGES = ['he', 'ar'];

// Language configurations
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

// Helper to set document direction
export const setDocumentDirection = (language: string) => {
  const isRTL = RTL_LANGUAGES.includes(language);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};
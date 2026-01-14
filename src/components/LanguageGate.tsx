import { useTranslation } from "react-i18next";

interface LanguageGateProps {
  allowedLanguages: string[];
  children: React.ReactNode;
}

export function LanguageGate({ allowedLanguages, children }: LanguageGateProps) {
  const { i18n } = useTranslation();
  
  if (!allowedLanguages.includes(i18n.language)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
            EDUCATION / ÉDUCATION / تعليم / ОБРАЗОВАНИЕ / חינוך
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
            Content Available in
            <br />
            <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Spanish Only
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light mb-8">
            {i18n.language === 'en' && "Educational content is currently available in Spanish only. Please change language to Spanish to view this content."}
            {i18n.language === 'fr' && "Le contenu éducatif est actuellement disponible uniquement en espagnol. Veuillez changer la langue en espagnol pour voir ce contenu."}
            {i18n.language === 'ar' && "المحتوى التعليمي متاح حاليًا باللغة الإسبانية فقط. يرجى تغيير اللغة إلى الإسبانية لعرض هذا المحتوى."}
            {i18n.language === 'ru' && "Образовательный контент в настоящее время доступен только на испанском языке. Пожалуйста, измените язык на испанский, чтобы просмотреть этот контент."}
            {i18n.language === 'he' && "תוכן חינוכי זמין כרגע רק בספרדית. אנא שנה את השפה לספרדית כדי לצפות בתוכן זה."}
            {!['en', 'fr', 'ar', 'ru', 'he', 'es'].includes(i18n.language) && "Educational content is currently available in Spanish only. Please change language to Spanish to view this content."}
          </p>
          <button 
            onClick={() => i18n.changeLanguage('es')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
          >
            {i18n.language === 'en' && "Switch to Spanish"}
            {i18n.language === 'fr' && "Changer en espagnol"}
            {i18n.language === 'ar' && "التبديل إلى الإسبانية"}
            {i18n.language === 'ru' && "Переключить на испанский"}
            {i18n.language === 'he' && "עבור לספרדית"}
            {!['en', 'fr', 'ar', 'ru', 'he', 'es'].includes(i18n.language) && "Cambiar a español / Switch to Spanish"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

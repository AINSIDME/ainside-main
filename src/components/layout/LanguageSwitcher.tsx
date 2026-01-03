import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LANGUAGES, setDocumentDirection } from '@/lib/i18n';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

// Map languages to blog URL slugs
const BLOG_SLUGS: { [key: string]: string } = {
  'es': 'guia-completa-trading-algoritmico',
  'en': 'complete-algorithmic-trading-guide',
  'fr': 'guide-complet-trading-algorithmique',
  'ar': 'dalil-kamil-altadawul-alalgorithmiat',
  'ru': 'polnoe-rukovodstvo-algoritmicheskoj-torgovli',
  'he': 'madrich-male-lamischar-algorithmi'
};

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (languageCode: string) => {
    // Check if we're on the blog page
    const isBlogPage = location.pathname.includes('/blog/');
    
    if (isBlogPage) {
      // Redirect to the blog page in the selected language
      const newSlug = BLOG_SLUGS[languageCode];
      if (newSlug) {
        navigate(`/blog/${newSlug}`);
      }
    }
    
    i18n.changeLanguage(languageCode);
    setDocumentDirection(languageCode);
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 focus-visible"
          aria-label={`Current language: ${currentLanguage.name}`}
        >
          <GlobeAltIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="text-xs">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              i18n.language === language.code ? 'bg-muted' : ''
            }`}
          >
            <span>{language.flag}</span>
            <span className="flex-1">{language.name}</span>
            {i18n.language === language.code && (
              <span className="text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
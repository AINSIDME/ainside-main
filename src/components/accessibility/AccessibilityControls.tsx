import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle } from 'lucide-react';

export const AccessibilityControls = () => {
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [readableFont, setReadableFont] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('a11y-font-size');
    const savedHighContrast = localStorage.getItem('a11y-high-contrast') === 'true';
    const savedUnderlineLinks = localStorage.getItem('a11y-underline-links') === 'true';
    const savedReadableFont = localStorage.getItem('a11y-readable-font') === 'true';
    const savedReducedMotion = localStorage.getItem('a11y-reduced-motion') === 'true';
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    setHighContrast(savedHighContrast);
    setUnderlineLinks(savedUnderlineLinks);
    setReadableFont(savedReadableFont);
    setReducedMotion(savedReducedMotion);
  }, []);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('a11y-font-size', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('a11y-high-contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    // Apply underline links
    if (underlineLinks) {
      document.documentElement.classList.add('underline-links');
    } else {
      document.documentElement.classList.remove('underline-links');
    }
    localStorage.setItem('a11y-underline-links', underlineLinks.toString());
  }, [underlineLinks]);

  useEffect(() => {
    // Apply readable font
    if (readableFont) {
      document.documentElement.classList.add('readable-font');
    } else {
      document.documentElement.classList.remove('readable-font');
    }
    localStorage.setItem('a11y-readable-font', readableFont.toString());
  }, [readableFont]);

  useEffect(() => {
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    localStorage.setItem('a11y-reduced-motion', reducedMotion.toString());
  }, [reducedMotion]);

  const increaseFontSize = () => {
    if (fontSize < 150) {
      setFontSize(fontSize + 10);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 80) {
      setFontSize(fontSize - 10);
    }
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const toggleUnderlineLinks = () => {
    setUnderlineLinks(!underlineLinks);
  };

  const toggleReadableFont = () => {
    setReadableFont(!readableFont);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
  };

  const resetAll = () => {
    setFontSize(100);
    setHighContrast(false);
    setUnderlineLinks(false);
    setReadableFont(false);
    setReducedMotion(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="focus-visible flex items-center gap-2 hover:bg-blue-500/10"
          aria-label={t('accessibility.options')}
        >
          <div className="relative">
            <UserCircle className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
          </div>
          <span className="hidden md:inline text-xs font-semibold">{t('accessibility.short')}</span>
          <span className="sr-only">{t('accessibility.options')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-sm font-semibold text-slate-900">
          {t('accessibility.textSize')}
        </div>
        <DropdownMenuItem onClick={increaseFontSize} disabled={fontSize >= 150}>
          <span>➕ {t('accessibility.increaseFontSize')} ({fontSize}%)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={decreaseFontSize} disabled={fontSize <= 80}>
          <span>➖ {t('accessibility.decreaseFontSize')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-semibold text-slate-900">
          {t('accessibility.contrastColors')}
        </div>
        <DropdownMenuItem onClick={toggleHighContrast}>
          <span>
            {highContrast ? '✓' : '○'} {t('accessibility.toggleHighContrast')}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-semibold text-slate-900">
          {t('accessibility.readability')}
        </div>
        <DropdownMenuItem onClick={toggleUnderlineLinks}>
          <span>
            {underlineLinks ? '✓' : '○'} {t('accessibility.underlineLinks')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleReadableFont}>
          <span>
            {readableFont ? '✓' : '○'} {t('accessibility.readableFont')}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-semibold text-slate-900">
          {t('accessibility.motion')}
        </div>
        <DropdownMenuItem onClick={toggleReducedMotion}>
          <span>
            {reducedMotion ? '✓' : '○'} {t('accessibility.reducedMotion')}
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={resetAll} className="text-blue-600 font-medium">
          <span>🔄 {t('accessibility.resetAll')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
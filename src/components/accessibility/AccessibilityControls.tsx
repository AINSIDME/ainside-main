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
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export const AccessibilityControls = () => {
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('a11y-font-size');
    const savedHighContrast = localStorage.getItem('a11y-high-contrast') === 'true';
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    setHighContrast(savedHighContrast);
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="focus-visible"
          aria-label="Accessibility options"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Accessibility Controls</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={increaseFontSize} disabled={fontSize >= 150}>
          <span>+ {t('accessibility.increaseFontSize')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={decreaseFontSize} disabled={fontSize <= 80}>
          <span>− {t('accessibility.decreaseFontSize')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleHighContrast}>
          <span>
            {highContrast ? '◉' : '○'} {t('accessibility.toggleHighContrast')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { AccessibilityControls } from '@/components/accessibility/AccessibilityControls';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, Menu, UserRound, X } from "lucide-react";

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const getDisplayName = (user: any): string => {
      const meta = (user?.user_metadata ?? {}) as Record<string, any>;
      const first = (meta.first_name ?? meta.given_name ?? '').toString().trim();
      const last = (meta.last_name ?? meta.family_name ?? '').toString().trim();
      const full = (meta.full_name ?? meta.name ?? '').toString().trim();

      const combined = `${first} ${last}`.trim();
      if (combined) return combined;
      if (full) return full;

      const email = (user?.email ?? '').toString().trim();
      if (email) return email;
      return t('header.account', { defaultValue: 'Cuenta' });
    };

    let alive = true;

    const refresh = async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;

      const user = data?.user ?? null;
      setIsAuthenticated(Boolean(user));
      setUserDisplayName(user ? getDisplayName(user) : null);
    };

    void refresh();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setIsAuthenticated(Boolean(user));
      setUserDisplayName(user ? getDisplayName(user) : null);
    });

    return () => {
      alive = false;
      authListener.subscription.unsubscribe();
    };
  }, [t]);

  const navItems = [
    { key: 'home', path: '/' },
    { key: 'about', path: '/about' },
    { key: 'services', path: '/services' },
    { key: 'demo', path: '/demo' },
    { key: 'crypto', path: '/crypto' },
    { key: 'liveChat', path: '/live-chat' },
    { key: 'pricing', path: '/pricing' },
    { key: 'faq', path: '/faq' },
    { key: 'contact', path: '/contact' },
    { key: 'accessibility', path: '/accessibility' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        {t('accessibility.skipToContent')}
      </a>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 focus-visible">
            <img 
              src="/brand/logo-master.png" 
              alt="AInside.me Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-foreground">
              {t('header.brand')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary focus-visible ${
                  isActive(item.path)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <AccessibilityControls />
            <LanguageSwitcher />

            {/* Login / Account */}
            {isAuthenticated ? (
              <Button asChild variant="ghost" size="sm" className="focus-visible">
                <Link
                  to="/dashboard"
                  aria-label={t('header.account', { defaultValue: 'Cuenta' })}
                  className="flex items-center gap-2"
                >
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[180px] truncate">
                    {userDisplayName ?? t('header.account', { defaultValue: 'Cuenta' })}
                  </span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm" className="focus-visible p-2">
                <Link
                  to="/login"
                  aria-label={t('header.login', { defaultValue: 'Iniciar sesión' })}
                  className="flex items-center gap-2"
                >
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <linearGradient id="loginGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#0EA5E9', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      {/* Letter A with keyhole */}
                      <path 
                        d="M 20 90 L 35 30 L 50 10 L 65 30 L 80 90 L 65 90 L 60 70 L 40 70 L 35 90 Z M 45 55 L 55 55 L 50 35 Z" 
                        fill="url(#loginGradient)"
                        opacity="0.9"
                      />
                      {/* Keyhole */}
                      <circle cx="50" cy="45" r="4" fill="white" />
                      <path d="M 48 49 L 48 58 L 52 58 L 52 49 Z" fill="white" />
                      {/* Sparkles */}
                      <circle cx="75" cy="20" r="1.5" fill="#38BDF8" opacity="0.8" />
                      <circle cx="82" cy="15" r="2" fill="#38BDF8" opacity="0.8" />
                      <circle cx="78" cy="28" r="1" fill="#60A5FA" opacity="0.6" />
                    </svg>
                  </div>
                  <span className="sr-only">{t('header.login', { defaultValue: 'Iniciar sesión' })}</span>
                </Link>
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden focus-visible"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">{t('header.toggleMenu')}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav
            id="mobile-menu"
            className="md:hidden pb-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted'
                  }`}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}

            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
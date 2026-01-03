import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building2, Shield, Lock, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

const LANGUAGE_TO_BLOG_SLUG: { [key: string]: string } = {
  es: 'guia-completa-trading-algoritmico',
  en: 'complete-algorithmic-trading-guide',
  fr: 'guide-complet-trading-algorithmique',
  ar: 'دليل-التداول-الخوارزمي-الكامل',
  ru: 'полное-руководство-алгоритмическому-трейдингу',
  he: 'מדריך-מסחר-אלגוריתמי-מלא'
};

export const Footer = () => {
  const { t, i18n } = useTranslation();

  const getBlogPath = () => {
    const slug = LANGUAGE_TO_BLOG_SLUG[i18n.language] || LANGUAGE_TO_BLOG_SLUG['en'];
    return `/blog/${slug}`;
  };

  const footerLinks = [
    {
      title: t('footer.company.title'),
      links: [
        { key: t('footer.company.about'), href: '/about' },
        { key: t('footer.company.services'), href: '/services' },
        { key: t('footer.company.contact'), href: '/contact' },
        { key: t('nav.blog'), href: getBlogPath(), icon: BookOpen },
      ]
    },
    {
      title: t('footer.legal.title'),
      links: [
        { key: t('footer.legal.terms'), href: '/legal/terms' },
        { key: t('footer.legal.privacy'), href: '/legal/privacy' },
        { key: t('footer.legal.disclaimer'), href: '/legal/disclaimer' },
        { key: t('footer.legal.accessibility'), href: '/accessibility' },
      ]
    },
    {
      title: t('footer.support.title'),
      links: [
        { key: t('footer.support.contact'), href: '/contact' },
        { key: t('footer.support.documentation'), href: '/documentation' },
        { key: t('footer.support.status'), href: '/status' },
      ]
    }
  ];

  const trustIndicators = [
    { icon: Shield, text: t('footer.trust.security') },
    { icon: Lock, text: t('footer.trust.protection') },
    { icon: CheckCircle, text: t('footer.trust.compliance') },
  ];

  return (
    <footer className="bg-gradient-to-t from-slate-950 to-slate-900/95 backdrop-blur-sm border-t border-slate-700/30">
      <div className="container mx-auto px-4 py-12">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-light text-slate-100">AInside.me</span>
            </Link>
            <p className="text-slate-300 mb-4 text-sm leading-relaxed font-light">
              {t('footer.description')}
            </p>
            <div className="space-y-2">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-400 font-light">
                  <indicator.icon className="h-4 w-4 text-blue-400" />
                  <span>{indicator.text}</span>
                </div>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-light text-slate-200 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors font-light flex items-center gap-2"
                    >
                      {link.icon && <link.icon className="h-4 w-4" />}
                      {link.key}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-700/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400 font-light">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
};
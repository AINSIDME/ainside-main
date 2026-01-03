import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Building2, Zap, Lock, CheckCircle, Award, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";

const Index = () => {
  const { t } = useTranslation();

  const capabilities = [
    {
      icon: Zap,
      title: t('homepage.capabilities.analytics.title'),
      description: t('homepage.capabilities.analytics.description')
    },
    {
      icon: Shield,
      title: t('homepage.capabilities.security.title'),
      description: t('homepage.capabilities.security.description')
    },
    {
      icon: Building2,
      title: t('homepage.capabilities.infrastructure.title'),
      description: t('homepage.capabilities.infrastructure.description')
    },
    {
      icon: Lock,
      title: t('homepage.capabilities.protection.title'),
      description: t('homepage.capabilities.protection.description')
    }
  ];

  const trustIndicators = [
    { icon: Shield, text: t('homepage.trust.security') },
    { icon: CheckCircle, text: t('homepage.trust.compliance') },
    { icon: Award, text: t('homepage.trust.institutional') },
    { icon: Globe, text: t('homepage.trust.global') }
  ];

  const values = [
    {
      title: t('homepage.values.innovation.title'),
      description: t('homepage.values.innovation.description')
    },
    {
      title: t('homepage.values.reliability.title'), 
      description: t('homepage.values.reliability.description')
    },
    {
      title: t('homepage.values.security.title'),
      description: t('homepage.values.security.description')
    },
    {
      title: t('homepage.values.excellence.title'),
      description: t('homepage.values.excellence.description')
    }
  ];

  return (
    <>
      <PageSEO
        title={t('nav.home')}
        description={t('homepage.description')}
        keywords="trading algorithms, S&P 500, financial technology, analytical tools, algorithm development, professional trading"
        canonical={`${window.location.origin}/`}
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="mb-16">
            <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
              {t('homepage.subtitle')}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
              {t('homepage.title.main')}
              <br />
              <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t('homepage.title.subtitle')}
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              {t('homepage.description')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button asChild size="lg" className="text-base px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
              <Link to="/demo">
                {t('homepage.cta.demo')}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 py-4 border-slate-600/40 text-slate-200 hover:bg-slate-700/50 rounded-xl font-medium backdrop-blur-sm hover:border-slate-500/50 transition-all duration-200">
              <Link to="/contact">{t('homepage.cta.contact')}</Link>
            </Button>
          </div>

          {/* Trust Line */}
          <div className="flex justify-center items-center gap-8 text-xs text-slate-400 font-medium tracking-wide uppercase">
            <span>{t('homepage.trust.security')}</span>
            <div className="w-1 h-1 bg-slate-600 rounded-full" />
            <span>{t('homepage.trust.compliance')}</span>
            <div className="w-1 h-1 bg-slate-600 rounded-full" />
            <span>{t('homepage.trust.global')}</span>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">
              {t('homepage.services.title')}
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto font-light">
              {t('homepage.services.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Development */}
            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-8 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-slate-100 mb-4">{t('homepage.capabilities.analytics.title')}</h3>
              <p className="text-slate-300 leading-relaxed mb-8 font-light">
                {t('homepage.capabilities.analytics.description')}
              </p>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {t('homepage.services.development.feature1')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {t('homepage.services.development.feature2')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {t('homepage.services.development.feature3')}
                </div>
              </div>
            </div>

            {/* Rental */}
            <div className="p-8 bg-gradient-to-br from-slate-700/60 via-slate-800/70 to-slate-900/80 border border-slate-600/40 rounded-2xl backdrop-blur-sm hover:from-slate-700/80 hover:via-slate-800/90 hover:to-slate-900 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/30">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mb-8 shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-slate-100 mb-4">{t('homepage.capabilities.infrastructure.title')}</h3>
              <p className="text-slate-200 leading-relaxed mb-8 font-light">
                {t('homepage.capabilities.infrastructure.description')}
              </p>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  {t('homepage.services.rental.feature1')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  {t('homepage.services.rental.feature2')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  {t('homepage.services.rental.feature3')}
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mb-8 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-slate-100 mb-4">{t('homepage.capabilities.security.title')}</h3>
              <p className="text-slate-300 leading-relaxed mb-8 font-light">
                {t('homepage.capabilities.security.description')}
              </p>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  {t('homepage.services.security.feature1')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  {t('homepage.services.security.feature2')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  {t('homepage.services.security.feature3')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">
              {t('homepage.values.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {values.map((value, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <span className="text-lg font-semibold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-blue-200 transition-colors duration-300">{value.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm font-light group-hover:text-slate-200 transition-colors duration-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm border-t border-slate-700/30">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight leading-tight text-slate-100">
            {t('homepage.cta.title')}
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('homepage.cta.subtitle')}
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {t('homepage.cta.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-base px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
              <Link to="/services">{t('homepage.cta.services')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 py-4 border-slate-600/40 text-slate-200 hover:bg-slate-700/50 rounded-xl font-medium backdrop-blur-sm hover:border-slate-500/50 transition-all duration-200">
              <Link to="/contact">{t('homepage.cta.consultation')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Internal Links Section */}
      <section className="py-16 bg-slate-900/50 backdrop-blur-md border-y border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-light text-slate-100 mb-4">
              {t('homepage.seoLinks.title')}
            </h2>
            <p className="text-slate-400 text-sm">
              {t('homepage.seoLinks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Link to={`/blog/${t('blog.algoTradingGuide.slug')}`} className="group">
              <Card className="bg-slate-900/40 border border-slate-800/50 backdrop-blur-lg hover:border-blue-500/50 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:border-blue-500/40 transition-all">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
                    {t('blog.algoTradingGuide.hero.badge')} 2025
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {t('blog.algoTradingGuide.hero.description').substring(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/algotrading" className="group">
              <Card className="bg-slate-900/40 border border-slate-800/50 backdrop-blur-lg hover:border-cyan-500/50 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:border-cyan-500/40 transition-all">
                    <Building2 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
                    {t('homepage.seoLinks.strategies.title')}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {t('homepage.seoLinks.strategies.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/demo" className="group">
              <Card className="bg-slate-900/40 border border-slate-800/50 backdrop-blur-lg hover:border-blue-500/50 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:border-blue-500/40 transition-all">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
                    {t('homepage.seoLinks.demo.title')}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {t('homepage.seoLinks.demo.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 bg-gradient-to-t from-slate-950 to-slate-900/95 backdrop-blur-sm border-t border-slate-700/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-8 text-xs text-slate-400 font-medium tracking-wide uppercase">
            <span className="hover:text-blue-400 transition-colors duration-200 cursor-default">{t('homepage.trust.security')}</span>
            <div className="w-1 h-1 bg-slate-600 rounded-full" />
            <span className="hover:text-cyan-400 transition-colors duration-200 cursor-default">{t('homepage.footer.dataProtection')}</span>
            <div className="w-1 h-1 bg-slate-600 rounded-full" />
            <span className="hover:text-emerald-400 transition-colors duration-200 cursor-default">{t('homepage.footer.compliance')}</span>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default Index;
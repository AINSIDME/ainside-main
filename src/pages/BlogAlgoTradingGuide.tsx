import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { useEffect } from "react";
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Shield, 
  Zap,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  LineChart,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  Award
} from "lucide-react";

// Map URL slugs to language codes
const SLUG_TO_LANGUAGE: { [key: string]: string } = {
  'guia-completa-trading-algoritmico': 'es',
  'complete-algorithmic-trading-guide': 'en',
  'guide-complet-trading-algorithmique': 'fr',
  'dalil-kamil-altadawul-alalgorithmiat': 'ar',
  'دليل-التداول-الخوارزمي-الكامل': 'ar',
  'polnoe-rukovodstvo-algoritmicheskoj-torgovli': 'ru',
  'полное-руководство-алгоритмическому-трейдингу': 'ru',
  'madrich-male-lamischar-algorithmi': 'he',
  'מדריך-מסחר-אלגוריתמי-מלא': 'he'
};

const BlogAlgoTradingGuide = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const slug = t('blog.algoTradingGuide.slug');

  // Detect language from URL and set it
  useEffect(() => {
    const currentSlugEncoded = location.pathname.split('/').pop() || '';
    let currentSlug = currentSlugEncoded;
    try {
      currentSlug = decodeURIComponent(currentSlugEncoded);
    } catch {
      // keep encoded slug if decoding fails
    }

    const detectedLanguage = SLUG_TO_LANGUAGE[currentSlug];
    
    if (detectedLanguage && detectedLanguage !== i18n.language) {
      i18n.changeLanguage(detectedLanguage);
    }
  }, [location.pathname, i18n]);

  return (
    <>
      <PageSEO
        title={t('blog.algoTradingGuide.seo.title')}
        description={t('blog.algoTradingGuide.seo.description')}
        keywords={t('blog.algoTradingGuide.seo.keywords')}
        canonical={`${window.location.origin}/blog/${slug}`}
      />
      
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Hero Article Header */}
        <section className="relative py-24 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-block px-4 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded mb-8 tracking-wide uppercase border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-3.5 h-3.5 inline mr-2" />
              {t('blog.algoTradingGuide.hero.badge')} • {t('blog.algoTradingGuide.hero.readTime')}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extralight text-slate-900 dark:text-slate-100 mb-8 leading-tight tracking-tight">
              {t('blog.algoTradingGuide.hero.title')}
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-light">
              {t('blog.algoTradingGuide.hero.description')}
            </p>

            <div className="flex items-center gap-8 text-sm text-slate-500 dark:text-slate-500 font-light">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('blog.algoTradingGuide.hero.updated')}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('blog.algoTradingGuide.hero.readers')}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-20 max-w-4xl">
          <article className="prose prose-slate dark:prose-invert prose-lg max-w-none">
            
            {/* Table of Contents */}
            <Card className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 mb-20">
              <CardContent className="p-10">
                <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                  {t('blog.algoTradingGuide.toc.title')}
                </h2>
                <ul className="space-y-4 text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-3">
                    <span className="text-slate-300 dark:text-slate-700">—</span>
                    <a href="#que-es" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-light">{t('blog.algoTradingGuide.toc.items.whatIs')}</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-slate-300 dark:text-slate-700">—</span>
                    <a href="#como-funciona" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-light">{t('blog.algoTradingGuide.toc.items.howWorks')}</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-slate-300 dark:text-slate-700">—</span>
                    <a href="#ventajas" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-light">{t('blog.algoTradingGuide.toc.items.advantages')}</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-slate-300 dark:text-slate-700">—</span>
                    <a href="#estrategias" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-light">{t('blog.algoTradingGuide.toc.items.strategies')}</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-slate-300 dark:text-slate-700">—</span>
                    <a href="#tecnologia" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-light">{t('blog.algoTradingGuide.toc.items.technology')}</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-slate-300 dark:text-slate-700">—</span>
                    <a href="#riesgos" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-light">{t('blog.algoTradingGuide.toc.items.risks')}</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-slate-300 dark:text-slate-700">—</span>
                    <a href="#empezar" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-light">{t('blog.algoTradingGuide.toc.items.getStarted')}</a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 1: What is Algo Trading */}
            <section id="que-es" className="mb-20 scroll-mt-20">
              <h2 className="text-3xl md:text-5xl font-extralight text-slate-900 dark:text-slate-100 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                {t('blog.algoTradingGuide.content.whatIs.title')}
              </h2>
              
              <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                <p className="text-xl">
                  {t('blog.algoTradingGuide.content.whatIs.intro1')}
                </p>

                <p className="text-lg">
                  {t('blog.algoTradingGuide.content.whatIs.intro2')}
                </p>

                <Card className="bg-slate-50 dark:bg-slate-900/30 border-l-4 border-slate-300 dark:border-slate-700 my-10">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <Award className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">{t('blog.algoTradingGuide.content.whatIs.keyFact.title')}</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-base font-light">
                          {t('blog.algoTradingGuide.content.whatIs.keyFact.text')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h3 className="text-2xl font-light text-slate-900 dark:text-slate-100 mt-12 mb-6">{t('blog.algoTradingGuide.content.whatIs.comparison.title')}</h3>
                
                <div className="grid md:grid-cols-2 gap-8 my-10">
                  <Card className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                    <CardContent className="p-8">
                      <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-6">{t('blog.algoTradingGuide.content.whatIs.comparison.manual.title')}</h4>
                      <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-light">
                        {(t('blog.algoTradingGuide.content.whatIs.comparison.manual.items', { returnObjects: true }) as string[]).map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-slate-300 dark:text-slate-700 mt-1">×</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700">
                    <CardContent className="p-8">
                      <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-6">{t('blog.algoTradingGuide.content.whatIs.comparison.algo.title')}</h4>
                      <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 font-light">
                        {(t('blog.algoTradingGuide.content.whatIs.comparison.algo.items', { returnObjects: true }) as string[]).map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Section 2: How It Works */}
            <section id="como-funciona" className="mb-20 scroll-mt-20">
              <h2 className="text-3xl md:text-5xl font-extralight text-slate-900 dark:text-slate-100 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                {t('blog.algoTradingGuide.content.howWorks.title')}
              </h2>

              <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                <p className="text-xl">
                  {t('blog.algoTradingGuide.content.howWorks.intro')}
                </p>

                <div className="grid md:grid-cols-2 gap-8 my-12">
                  {(t('blog.algoTradingGuide.content.howWorks.phases', { returnObjects: true }) as any[]).map((phase) => (
                    <Card key={phase.number} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className="text-5xl font-extralight text-slate-200 dark:text-slate-800">
                            {phase.number}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">{phase.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">{phase.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <h3 className="text-2xl font-light text-slate-900 dark:text-slate-100 mt-16 mb-6">{t('blog.algoTradingGuide.content.howWorks.exampleTitle')}</h3>
                
                <Card className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                  <CardContent className="p-8">
                    <pre className="text-xs md:text-sm text-slate-700 dark:text-slate-300 overflow-x-auto font-mono">
{t('blog.algoTradingGuide.content.howWorks.exampleCode')}
                    </pre>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-6 font-light">
                      {t('blog.algoTradingGuide.content.howWorks.exampleNote')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 3: Advantages */}
            <section id="ventajas" className="mb-20 scroll-mt-20">
              <h2 className="text-3xl md:text-5xl font-extralight text-slate-900 dark:text-slate-100 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                {t('blog.algoTradingGuide.content.advantages.title')}
              </h2>

              <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                <p className="text-xl">
                  {t('blog.algoTradingGuide.content.advantages.intro')}
                </p>

                <div className="grid gap-6 my-12">
                  {(t('blog.algoTradingGuide.content.advantages.items', { returnObjects: true }) as any[]).map((advantage, index) => (
                    <Card key={index} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4 gap-4">
                              <h4 className="text-xl font-light text-slate-900 dark:text-slate-100">{advantage.title}</h4>
                              <span className="text-xs text-slate-500 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded whitespace-nowrap">
                                {advantage.stat}
                              </span>
                            </div>
                            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-light">{advantage.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 4: Strategies */}
            <section id="estrategias" className="mb-20 scroll-mt-20">
              <h2 className="text-3xl md:text-5xl font-extralight text-slate-900 dark:text-slate-100 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                {t('blog.algoTradingGuide.content.strategies.title')}
              </h2>

              <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                <p className="text-xl">
                  {t('blog.algoTradingGuide.content.strategies.intro')}
                </p>

                <div className="space-y-8 mt-12">
                  {(t('blog.algoTradingGuide.content.strategies.list', { returnObjects: true }) as any[]).map((strategy, index) => (
                    <Card key={index} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                      <CardContent className="p-10">
                        <h3 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-6">{strategy.number}. {strategy.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 font-light">
                          {strategy.description}
                        </p>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 ml-6 font-light">
                          {strategy.details.map((detail: string, detailIndex: number) => (
                            <li key={detailIndex} className="flex items-start gap-3">
                              <span className="text-slate-300 dark:text-slate-700 mt-0.5">—</span>
                              <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-slate-100 font-medium">$1</strong>') }} />
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 5: Technology */}
            <section id="tecnologia" className="mb-20 scroll-mt-20">
              <h2 className="text-3xl md:text-5xl font-extralight text-slate-900 dark:text-slate-100 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                {t('blog.algoTradingGuide.content.technology.title')}
              </h2>

              <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                <p className="text-xl">
                  {t('blog.algoTradingGuide.content.technology.intro')}
                </p>

                <Card className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 my-10">
                  <CardContent className="p-10">
                    <h3 className="text-xl font-light text-slate-900 dark:text-slate-100 mb-8">{t('blog.algoTradingGuide.content.technology.stackTitle')}</h3>
                    <div className="grid md:grid-cols-2 gap-8 text-sm">
                      <div>
                        <h4 className="text-slate-900 dark:text-slate-100 font-medium mb-4">{t('blog.algoTradingGuide.content.technology.categories.languages.title')}</h4>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-light">
                          {(t('blog.algoTradingGuide.content.technology.categories.languages.items', { returnObjects: true }) as string[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-slate-900 dark:text-slate-100 font-medium mb-4">{t('blog.algoTradingGuide.content.technology.categories.libraries.title')}</h4>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-light">
                          {(t('blog.algoTradingGuide.content.technology.categories.libraries.items', { returnObjects: true }) as string[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-slate-900 dark:text-slate-100 font-medium mb-4">{t('blog.algoTradingGuide.content.technology.categories.brokers.title')}</h4>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-light">
                          {(t('blog.algoTradingGuide.content.technology.categories.brokers.items', { returnObjects: true }) as string[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-slate-900 dark:text-slate-100 font-medium mb-4">{t('blog.algoTradingGuide.content.technology.categories.infrastructure.title')}</h4>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-light">
                          {(t('blog.algoTradingGuide.content.technology.categories.infrastructure.items', { returnObjects: true }) as string[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <p className="text-slate-700 dark:text-slate-300">
                  {t('blog.algoTradingGuide.content.technology.investment')}
                </p>

                <Card className="bg-slate-50 dark:bg-slate-900/30 border-l-4 border-slate-300 dark:border-slate-700 mt-10">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <DollarSign className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-3">{t('blog.algoTradingGuide.content.technology.alternative.title')}</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-base font-light leading-relaxed">
                          {t('blog.algoTradingGuide.content.technology.alternative.text')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 6: Risks */}
            <section id="riesgos" className="mb-20 scroll-mt-20">
              <h2 className="text-3xl md:text-5xl font-extralight text-slate-900 dark:text-slate-100 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                {t('blog.algoTradingGuide.content.risks.title')}
              </h2>

              <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                <p className="text-xl text-slate-700 dark:text-slate-300">
                  {t('blog.algoTradingGuide.content.risks.intro')}
                </p>

                <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-l-4 border-amber-200 dark:border-amber-900 my-10">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lg font-medium text-amber-900 dark:text-amber-200 mb-3">{t('blog.algoTradingGuide.content.risks.warning.title')}</h4>
                        <p className="text-slate-700 dark:text-slate-400 text-base font-light">
                          {t('blog.algoTradingGuide.content.risks.warning.text')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-8 mt-12">
                  {(t('blog.algoTradingGuide.content.risks.list', { returnObjects: true }) as any[]).map((risk, index) => (
                    <div key={index} className="border-l-2 border-slate-200 dark:border-slate-800 pl-8 py-2">
                      <h4 className="text-xl font-light text-slate-900 dark:text-slate-100 mb-3">{risk.number}. {risk.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 font-light">
                        {risk.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 7: Getting Started */}
            <section id="empezar" className="mb-20 scroll-mt-20">
              <h2 className="text-3xl md:text-5xl font-extralight text-slate-900 dark:text-slate-100 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                {t('blog.algoTradingGuide.content.getStarted.title')}
              </h2>

              <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                <p className="text-xl">
                  {t('blog.algoTradingGuide.content.getStarted.intro')}
                </p>

                <div className="space-y-6 mt-12">
                  {(t('blog.algoTradingGuide.content.getStarted.steps', { returnObjects: true }) as any[]).map((item, index) => (
                    <Card key={index} className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-8">
                          <div className="text-6xl font-extralight text-slate-200 dark:text-slate-800 flex-shrink-0">
                            {item.step.split(' ')[1]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4 gap-4">
                              <h4 className="text-xl font-light text-slate-900 dark:text-slate-100">{item.title}</h4>
                              <span className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded whitespace-nowrap">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">{item.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 mt-16">
                  <CardContent className="p-12 text-center">
                    <h3 className="text-3xl font-light text-slate-900 dark:text-slate-100 mb-6">
                      {t('blog.algoTradingGuide.content.getStarted.cta.title')}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-light text-lg leading-relaxed">
                      {t('blog.algoTradingGuide.content.getStarted.cta.description')}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <Link to="/algotrading">
                        <Button size="lg" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-10 py-6 text-base font-light">
                          {t('blog.algoTradingGuide.content.getStarted.cta.button1')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <Link to="/demo">
                        <Button size="lg" variant="outline" className="border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 px-10 py-6 text-base font-light">
                          {t('blog.algoTradingGuide.content.getStarted.cta.button2')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Conclusion */}
            <section className="mb-20">
              <Card className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
                <CardContent className="p-12">
                  <h2 className="text-3xl font-light text-slate-900 dark:text-slate-100 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">{t('blog.algoTradingGuide.content.conclusion.title')}</h2>
                  <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed font-light text-lg">
                    {(t('blog.algoTradingGuide.content.conclusion.paragraphs', { returnObjects: true }) as string[]).map((paragraph, index) => (
                      <p key={index} className={index === 3 ? "text-slate-900 dark:text-slate-100 font-normal pt-6 text-xl" : ""}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

          </article>
        </div>
      </div>
    </>
  );
};

export default BlogAlgoTradingGuide;

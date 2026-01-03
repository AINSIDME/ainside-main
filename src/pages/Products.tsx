import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, TrendingUp, BarChart3, Download, Shield, FileText, Book, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";

const Products = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: "Basic Rental",
      price: "$99",
      period: "month",
      description: "Rent our basic algorithm package",
      features: [
        "Essential trading algorithms",
        "Technical indicators",
        "TradeStation compatibility",
        "Email support",
        "Documentation access",
        "Basic training materials"
      ],
      popular: false
    },
    {
      name: "Professional Rental",
      price: "$199",
      period: "month",
      description: "Complete algorithm suite for professional traders",
      features: [
        "All available algorithms",
        "Advanced technical indicators",
        "Multi-platform support",
        "Priority technical support",
        "Custom algorithm requests",
        "Weekly strategy updates",
        "Training sessions"
      ],
      popular: true
    },
    {
      name: "Institutional Rental",
      price: "$499",
      period: "month",
      description: "Enterprise algorithm package for institutions",
      features: [
        "Complete algorithm library",
        "Custom development included",
        "Priority email support",
        "Multiple user licenses",
        "Email support: support@ainside.me",
        "Custom integrations",
        "Ongoing algorithm updates"
      ],
      popular: false
    }
  ];

  const keyFeatures = [
    {
      icon: TrendingUp,
      title: "Proprietary Algorithms",
      description: "Our own developed trading algorithms for market analysis"
    },
    {
      icon: BarChart3,
      title: "Technical Indicators",
      description: "Advanced indicators created by our development team"
    },
    {
      icon: Shield,
      title: "Platform Compatible",
      description: "Works with TradeStation, MultiCharts and other platforms"
    },
    {
      icon: Download,
      title: "Monthly Rental",
      description: "Flexible monthly subscription model for algorithm access"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
      <PageSEO
        title={t('docsPage.seo.title', { defaultValue: 'Documentation' })}
        description={t('docsPage.seo.desc', { defaultValue: 'Professional product documentation: rental plans, legal policies, system status, and getting started guides.' })}
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        ogType="website"
      />
      {/* Header */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">{t('docsPage.badge', { defaultValue: 'Product Documentation' })}</div>
          <h1 className="text-5xl md:text-6xl font-light text-slate-100 mb-6 leading-[1.15] tracking-tight">{t('docsPage.title', { defaultValue: 'Documentation & Policies' })}</h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">{t('docsPage.subtitleFull', { defaultValue: 'Professional documentation for AInside.me software: rental plans overview, legal policies, system status, and getting started guides. Educational tools only — no financial advice.' })}</p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-32 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">{t('docsPage.quick.title', { defaultValue: 'Quick Access' })}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/pricing" className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-2">{t('docsPage.quick.plans.title', { defaultValue: 'Rental Plans' })}</h3>
              <p className="text-slate-300 text-sm font-light">{t('docsPage.quick.plans.desc', { defaultValue: 'Overview of Micro/Mini contracts and billing options.' })}</p>
            </Link>
            <Link to="/contact" className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-2">{t('docsPage.quick.support.title', { defaultValue: 'Contact Support' })}</h3>
              <p className="text-slate-300 text-sm font-light">{t('docsPage.quick.support.desc', { defaultValue: 'Get assistance from our support team.' })}</p>
            </Link>
            <Link to="/legal/terms" className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Book className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-2">{t('docsPage.quick.terms.title', { defaultValue: 'Terms & Conditions' })}</h3>
              <p className="text-slate-300 text-sm font-light">{t('docsPage.quick.terms.desc', { defaultValue: 'Educational use only — software provided “AS IS”.' })}</p>
            </Link>
            <Link to="/legal/privacy" className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-2">{t('docsPage.quick.privacy.title', { defaultValue: 'Privacy Policy' })}</h3>
              <p className="text-slate-300 text-sm font-light">{t('docsPage.quick.privacy.desc', { defaultValue: 'Minimal technical data only. No financial data stored.' })}</p>
            </Link>
            <Link to="/status" className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Info className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-2">{t('docsPage.quick.status.title', { defaultValue: 'System Status' })}</h3>
              <p className="text-slate-300 text-sm font-light">{t('docsPage.quick.status.desc', { defaultValue: 'Current operational status for platform components.' })}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing details are available at /pricing; no duplicate overview here */}

      {/* Demo CTA */}
      <section className="py-32 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm border-t border-slate-700/30">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight leading-tight text-slate-100">{t('docsPage.cta.title.top', { defaultValue: 'See Our Algorithms' })}<br /><span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t('docsPage.cta.title.bottom', { defaultValue: 'in Action' })}</span></h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">{t('docsPage.cta.desc', { defaultValue: 'Watch our proprietary algorithms analyze live market data in real-time with advanced technical indicators' })}</p>
          
          <Button asChild size="lg" className="text-base px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
            <Link to="/demo">{t('docsPage.cta.button', { defaultValue: 'View Live Algorithm Demo' })}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Products;
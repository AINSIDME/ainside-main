import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Shield, 
  Zap, 
  Building2, 
  BarChart3, 
  Lock, 
  Globe, 
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: BarChart3,
      title: t('servicesPage.services.dev.title', { defaultValue: 'Trading Algorithm Development' }),
      description: t('servicesPage.services.dev.desc', { defaultValue: 'We create proprietary trading algorithms and technical analysis tools for market research' }),
      features: t('servicesPage.services.dev.features', { returnObjects: true, defaultValue: [
        'Custom algorithm development',
        'Technical indicator creation',
        'Backtesting and optimization',
        'Real-time market analysis tools'
      ] }) as string[]
    },
    {
      icon: Server,
      title: t('servicesPage.services.rental.title', { defaultValue: 'Tool Rental Service' }),
      description: t('servicesPage.services.rental.desc', { defaultValue: 'Monthly rental of our proprietary algorithms and analytical tools for traders and institutions' }),
      features: t('servicesPage.services.rental.features', { returnObjects: true, defaultValue: [
        'Monthly subscription model',
        'Access to all algorithm tools',
        'Compatible with TradeStation/MultiCharts',
        'Email technical support'
      ] }) as string[]
    },
    {
      icon: Shield,
      title: t('servicesPage.services.security.title', { defaultValue: 'Security & Compliance' }),
      description: t('servicesPage.services.security.desc', { defaultValue: 'Bank-level security protocols ensuring the highest standards of data protection and regulatory compliance' }),
      features: t('servicesPage.services.security.features', { returnObjects: true, defaultValue: [
        'Advanced encryption protocols',
        'Multi-factor authentication systems',
        'Compliance framework integration',
        'Regular security audits and assessments'
      ] }) as string[]
    },
    {
      icon: Zap,
      title: t('servicesPage.services.integration.title', { defaultValue: 'Platform Integration' }),
      description: t('servicesPage.services.integration.desc', { defaultValue: 'Our tools integrate with major trading platforms like TradeStation, MultiCharts and others' }),
      features: t('servicesPage.services.integration.features', { returnObjects: true, defaultValue: [
        'EasyLanguage compatibility',
        'TradeStation Global support',
        'MultiCharts PowerLanguage',
        'Installation and setup assistance'
      ] }) as string[]
    }
  ];

  const benefits = [
    {
      icon: Building2,
      title: t('servicesPage.benefits.institutional.title', { defaultValue: 'Institutional Grade' }),
      description: t('servicesPage.benefits.institutional.desc', { defaultValue: 'Solutions designed to meet the exacting standards of financial institutions' })
    },
    {
      icon: Lock,
      title: t('servicesPage.benefits.security.title', { defaultValue: 'Security First' }),
      description: t('servicesPage.benefits.security.desc', { defaultValue: 'Bank-level security protocols protecting your most sensitive data' })
    },
    {
      icon: Globe,
      title: t('servicesPage.benefits.global.title', { defaultValue: 'Global Scale' }),
      description: t('servicesPage.benefits.global.desc', { defaultValue: 'Infrastructure capable of supporting operations across multiple markets' })
    },
    {
      icon: Clock,
      title: t('servicesPage.benefits.reliable.title', { defaultValue: 'Reliable Performance' }),
      description: t('servicesPage.benefits.reliable.desc', { defaultValue: 'Consistent, dependable performance when you need it most' })
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
      {/* Header */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
            {t('services.badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
            {t('services.title')}
            <br />
            <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('services.subtitle')}
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {t('services.description')}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-8 shadow-lg">
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-light text-slate-100 mb-4">{service.title}</h3>
                <p className="text-slate-300 leading-relaxed mb-8 font-light">
                  {service.description}
                </p>
                <div className="space-y-3 text-sm text-slate-400">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">
              Why Choose Our Technology
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto font-light">
              Built for institutions that demand excellence, security, and unwavering reliability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <benefit.icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-blue-200 transition-colors duration-300">{benefit.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm font-light group-hover:text-slate-200 transition-colors duration-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Excellence */}
      <section className="py-32 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">{t('servicesPage.tech.title', { defaultValue: 'Technology Excellence' })}</h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed font-light">
                {t('servicesPage.tech.desc', { defaultValue: "Our technology platform represents years of development and refinement, designed specifically to meet the unique challenges and requirements of financial institutions operating in today's complex market environment." })}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span className="text-slate-300 font-light">{t('servicesPage.tech.points.p1', { defaultValue: 'Proven institutional reliability' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  <span className="text-slate-300 font-light">{t('servicesPage.tech.points.p2', { defaultValue: 'Advanced security architecture' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="text-slate-300 font-light">{t('servicesPage.tech.points.p3', { defaultValue: 'Scalable performance optimization' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span className="text-slate-300 font-light">{t('servicesPage.tech.points.p4', { defaultValue: 'Comprehensive compliance support' })}</span>
                </div>
              </div>

              <Button asChild size="lg" className="text-base px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
                <Link to="/contact">
                  {t('servicesPage.tech.cta.primary', { defaultValue: 'Discuss Your Requirements' })}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-light text-slate-100 mb-6">{t('servicesPage.impl.title', { defaultValue: 'Implementation Approach' })}</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">{t('servicesPage.impl.s1.title', { defaultValue: '1. Assessment & Planning' })}</h4>
                  <p className="text-slate-400 text-sm font-light">{t('servicesPage.impl.s1.desc', { defaultValue: 'Comprehensive evaluation of your current infrastructure and requirements' })}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">{t('servicesPage.impl.s2.title', { defaultValue: '2. Custom Configuration' })}</h4>
                  <p className="text-slate-400 text-sm font-light">{t('servicesPage.impl.s2.desc', { defaultValue: 'Tailored solution design to meet your specific institutional needs' })}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">{t('servicesPage.impl.s3.title', { defaultValue: '3. Secure Deployment' })}</h4>
                  <p className="text-slate-400 text-sm font-light">{t('servicesPage.impl.s3.desc', { defaultValue: 'Careful implementation with minimal disruption to existing operations' })}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-200 mb-2">{t('servicesPage.impl.s4.title', { defaultValue: '4. Ongoing Support' })}</h4>
                  <p className="text-slate-400 text-sm font-light">{t('servicesPage.impl.s4.desc', { defaultValue: 'Continuous monitoring, maintenance, and optimization services' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm border-t border-slate-700/30">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight leading-tight text-slate-100">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your Technology?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Discover how our advanced technology solutions can enhance your institution's 
            capabilities and provide the competitive advantage you need
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-base px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
              <Link to="/contact">Schedule Consultation</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 py-4 border-slate-600/40 text-slate-200 hover:bg-slate-700/50 rounded-xl font-medium backdrop-blur-sm hover:border-slate-500/50 transition-all duration-200">
              <Link to="/about">Learn More About Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
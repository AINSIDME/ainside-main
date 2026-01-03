import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Target, Award, Shield, Globe, Zap, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const { t } = useTranslation();

  const leadership = [
    {
      name: t('about.org.exec.name', { defaultValue: 'Executive Leadership' }),
      role: t('about.org.exec.role', { defaultValue: 'Strategic Direction' }),
      description: t('about.org.exec.desc', { defaultValue: 'Decades of combined experience in financial technology and institutional services' })
    },
    {
      name: t('about.org.tech.name', { defaultValue: 'Technology Team' }), 
      role: t('about.org.tech.role', { defaultValue: 'Innovation & Development' }),
      description: t('about.org.tech.desc', { defaultValue: 'Expert engineers and analysts dedicated to advancing financial technology solutions' })
    },
    {
      name: t('about.org.ops.name', { defaultValue: 'Operations Team' }),
      role: t('about.org.ops.role', { defaultValue: 'Service Excellence' }), 
      description: t('about.org.ops.desc', { defaultValue: 'Committed professionals ensuring reliable delivery and client satisfaction' })
    }
  ];

  const milestones = [
    {
      icon: Building2,
      title: t('about.milestones.founded.title', { defaultValue: 'Founded' }),
      description: t('about.milestones.founded.desc', { defaultValue: 'Established to provide institutional-grade technology solutions' })
    },
    {
      icon: Zap,
      title: t('about.milestones.innovation.title', { defaultValue: 'Innovation' }),
      description: t('about.milestones.innovation.desc', { defaultValue: 'Continuous advancement in analytical technology and infrastructure' })
    },
    {
      icon: Globe,
      title: t('about.milestones.global.title', { defaultValue: 'Global Reach' }),
      description: t('about.milestones.global.desc', { defaultValue: 'Serving financial institutions across multiple markets' })
    },
    {
      icon: Award,
      title: t('about.milestones.recognition.title', { defaultValue: 'Recognition' }),
      description: t('about.milestones.recognition.desc', { defaultValue: 'Trusted by leading institutions for technology excellence' })
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
      {/* Header */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
            {t('about.badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
            {t('about.title')}
            <br />
            <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('about.subtitle')}
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {t('about.description')}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">
              {t('about.missionVision.title')}
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-8 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-slate-100 mb-4">{t('about.mission.title')}</h3>
              <p className="text-slate-300 leading-relaxed font-light">
                {t('about.mission.description')}
              </p>
            </div>

            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mb-8 shadow-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-light text-slate-100 mb-4">{t('about.vision.title')}</h3>
              <p className="text-slate-300 leading-relaxed font-light">
                {t('about.vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">
              {t('about.values.title')}
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto font-light">
              {t('about.values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Shield className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-blue-200 transition-colors duration-300">{t('about.values.integrity.title', { defaultValue: 'Integrity' })}</h3>
              <p className="text-slate-300 leading-relaxed text-sm font-light group-hover:text-slate-200 transition-colors duration-300">{t('about.values.integrity.description', { defaultValue: 'Conducting business with the highest ethical standards and transparency' })}</p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm group-hover:from-cyan-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                <Zap className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-cyan-200 transition-colors duration-300">{t('about.values.innovation.title', { defaultValue: 'Innovation' })}</h3>
              <p className="text-slate-300 leading-relaxed text-sm font-light group-hover:text-slate-200 transition-colors duration-300">{t('about.values.innovation.description', { defaultValue: 'Continuously advancing technology to meet evolving industry needs' })}</p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-all duration-300">
                <Award className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-emerald-200 transition-colors duration-300">{t('about.values.excellence.title', { defaultValue: 'Excellence' })}</h3>
              <p className="text-slate-300 leading-relaxed text-sm font-light group-hover:text-slate-200 transition-colors duration-300">{t('about.values.excellence.description', { defaultValue: 'Delivering superior quality in every aspect of our services and solutions' })}</p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                <Users className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-purple-200 transition-colors duration-300">{t('about.values.partnership.title', { defaultValue: 'Partnership' })}</h3>
              <p className="text-slate-300 leading-relaxed text-sm font-light group-hover:text-slate-200 transition-colors duration-300">{t('about.values.partnership.description', { defaultValue: 'Building lasting relationships through trust, collaboration, and shared success' })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Organization Overview */}
      <section className="py-32 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">{t('about.org.title', { defaultValue: 'Our Organization' })}</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {leadership.map((team, index) => (
              <div key={index} className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20">
                <h3 className="text-2xl font-light text-slate-100 mb-2">{team.name}</h3>
                <p className="text-blue-400 font-medium mb-4">{team.role}</p>
                <p className="text-slate-300 leading-relaxed font-light">{team.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light text-slate-100 mb-6 tracking-tight">{t('about.milestones.title', { defaultValue: 'Our Journey' })}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {milestones.map((milestone, index) => (
              <div key={index} className="group hover:scale-105 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <milestone.icon className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-light text-slate-100 mb-3 group-hover:text-blue-200 transition-colors duration-300">{milestone.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm font-light group-hover:text-slate-200 transition-colors duration-300">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-32 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm border-t border-slate-700/30">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight leading-tight text-slate-100">
            Our Commitment
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              to You
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            We are dedicated to developing advanced trading algorithms and renting professional 
            analytical tools that help our clients analyze markets more effectively
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-base px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
              <Link to="/services">Our Services</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 py-4 border-slate-600/40 text-slate-200 hover:bg-slate-700/50 rounded-xl font-medium backdrop-blur-sm hover:border-slate-500/50 transition-all duration-200">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
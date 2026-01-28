import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: t("contactPage.form.toast.title", { defaultValue: "Message Sent" }),
        description: t("contactPage.form.toast.desc", { defaultValue: "Thank you for your inquiry. Our team will respond as soon as possible." }),
      });
      
      setFormData({ name: "", email: "", organization: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t("contactPage.form.toast.errorTitle", { defaultValue: "Error" }),
        description: t("contactPage.form.toast.errorDesc", { defaultValue: "Failed to send message. Please try again or email us directly at inquiries@ainside.me" }),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t("contactPage.info.email.title", { defaultValue: "Email" }),
      content: "inquiries@ainside.me",
      description: t("contactPage.info.email.desc", { defaultValue: "Primary contact for business inquiries" })
    },
    {
      icon: Phone,
      title: t("contactPage.info.phone.title", { defaultValue: "Support" }),
      content: "support@ainside.me",
      description: t("contactPage.info.phone.desc", { defaultValue: "Email support for technical assistance" })
    },
    {
      icon: MapPin,
      title: t("contactPage.info.address.title", { defaultValue: "Platform" }),
      content: "TradeStation / MultiCharts",
      description: t("contactPage.info.address.desc", { defaultValue: "Compatible platforms for strategies" })
    },
    {
      icon: Clock,
      title: t("contactPage.info.response.title", { defaultValue: "Response Time" }),
      content: t("contactPage.info.response.content", { defaultValue: "Generally 24-48 hours" }),
      description: t("contactPage.info.response.desc", { defaultValue: "We respond as soon as possible" })
    }
  ];

  const serviceAreas = t("contactPage.areas.list", { returnObjects: true, defaultValue: [
    "Algorithm Development",
    "Tool Rental Services",
    "Platform Integration",
    "Technical Support",
    "Custom Algorithm Creation",
    "Training and Documentation"
  ] }) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
      {/* Header */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
        <div className="container mx-auto text-center max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
            {t('contact.title')}
            <br />
            <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('contact.subtitle')}
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {t('contact.description')}
          </p>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-light text-slate-100 mb-4">{t("contactPage.form.header", { defaultValue: "Send us a Message" })}</h2>
                <p className="text-slate-300 font-light">{t("contactPage.form.subheader", { defaultValue: "Our algorithm development team is ready to help with your tool rental inquiry" })}</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200 font-light">{t("contactPage.form.labels.name", { defaultValue: "Full Name *" })}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-12 bg-slate-900/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200 font-light">{t("contactPage.form.labels.email", { defaultValue: "Email Address *" })}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 bg-slate-900/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-slate-200 font-light">{t("contactPage.form.labels.organization", { defaultValue: "Organization" })}</Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="h-12 bg-slate-900/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-slate-200 font-light">{t("contactPage.form.labels.subject", { defaultValue: "Subject *" })}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="h-12 bg-slate-900/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-slate-200 font-light">{t("contactPage.form.labels.message", { defaultValue: "Message *" })}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="resize-none bg-slate-900/50 border-slate-600/40 text-slate-100 placeholder:text-slate-400"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="w-full text-base py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("contactPage.form.sending", { defaultValue: "Sending..." })}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t("contactPage.form.submit", { defaultValue: "Send Message" })}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="p-6 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1 text-slate-100">{info.title}</h3>
                        <p className="text-slate-200 font-medium mb-1">{info.content}</p>
                        <p className="text-slate-400 text-sm font-light">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Areas */}
              <div className="p-6 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
                <h3 className="text-xl font-light text-slate-100 mb-2">{t("contactPage.areas.title", { defaultValue: "Service Areas" })}</h3>
                <p className="text-slate-400 mb-4 font-light">{t("contactPage.areas.subtitle", { defaultValue: "Areas where our team can provide expert assistance" })}</p>
                <div className="grid gap-3">
                  {serviceAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                      <span className="text-slate-300 font-light">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Notice */}
              <div className="p-6 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
                <h3 className="font-medium text-slate-100 mb-3">{t("contactPage.notice.title", { defaultValue: "Algorithm & Tool Consultation" })}</h3>
                <p className="text-slate-300 leading-relaxed mb-4 text-sm font-light">
                  {t("contactPage.notice.p1", { defaultValue: "Our development team is available to discuss algorithm rental services and provide information about our trading tools and technical indicators." })}
                </p>
                <p className="text-xs text-slate-400 font-light">
                  <span className="font-medium text-slate-300">{t("contactPage.notice.rememberLabel", { defaultValue: "Remember:" })}</span> {t("contactPage.notice.remember", { defaultValue: "We develop technology tools only - we do not provide financial advice." })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
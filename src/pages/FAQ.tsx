import { PageSEO } from "@/components/seo/PageSEO";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const { t } = useTranslation();

  const faqCategories = [
    {
      id: "general",
      title: t("faq.categories.general"),
      icon: HelpCircle,
      questions: [
        {
          q: t("faq.general.q1"),
          a: t("faq.general.a1"),
        },
        {
          q: t("faq.general.q2"),
          a: t("faq.general.a2"),
        },
        {
          q: t("faq.general.q3"),
          a: t("faq.general.a3"),
        },
        {
          q: t("faq.general.q4"),
          a: t("faq.general.a4"),
        },
      ],
    },
    {
      id: "refunds",
      title: t("faq.categories.refunds"),
      icon: BookOpen,
      questions: [
        {
          q: t("faq.refunds.q1"),
          a: t("faq.refunds.a1"),
        },
        {
          q: t("faq.refunds.q2"),
          a: t("faq.refunds.a2"),
        },
        {
          q: t("faq.refunds.q3"),
          a: t("faq.refunds.a3"),
        },
      ],
    },
    {
      id: "strategies",
      title: t("faq.categories.strategies"),
      icon: MessageCircle,
      questions: [
        {
          q: t("faq.strategies.q1"),
          a: t("faq.strategies.a1"),
        },
        {
          q: t("faq.strategies.q2"),
          a: t("faq.strategies.a2"),
        },
        {
          q: t("faq.strategies.q3"),
          a: t("faq.strategies.a3"),
        },
        {
          q: t("faq.strategies.q4"),
          a: t("faq.strategies.a4"),
        },
      ],
    },
    {
      id: "technical",
      title: t("faq.categories.technical"),
      icon: BookOpen,
      questions: [
        {
          q: t("faq.technical.q1"),
          a: t("faq.technical.a1"),
        },
        {
          q: t("faq.technical.q2"),
          a: t("faq.technical.a2"),
        },
        {
          q: t("faq.technical.q3"),
          a: t("faq.technical.a3"),
        },
        {
          q: t("faq.technical.q4"),
          a: t("faq.technical.a4"),
        },
      ],
    },
    {
      id: "investment",
      title: t("faq.categories.investment"),
      icon: HelpCircle,
      questions: [
        {
          q: t("faq.investment.q1"),
          a: t("faq.investment.a1"),
        },
        {
          q: t("faq.investment.q2"),
          a: t("faq.investment.a2"),
        },
        {
          q: t("faq.investment.q3"),
          a: t("faq.investment.a3"),
        },
      ],
    },
  ];

  return (
    <>
      <PageSEO
        title={t("faq.seo.title")}
        description={t("faq.seo.description")}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container max-w-6xl mx-auto text-center">
            <Badge
              variant="outline"
              className="mb-6 border-primary/50 text-primary"
            >
              {t("faq.badge")}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
              {t("faq.title")}
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              {t("faq.subtitle")}
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="pb-20 px-4">
          <div className="container max-w-5xl mx-auto">
            {faqCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="mb-12 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {category.title}
                    </h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={`${category.id}-${index}`}
                        value={`${category.id}-${index}`}
                        className="border border-slate-800/50 rounded-lg bg-slate-950/50 px-6 hover:border-primary/30 transition-colors"
                      >
                        <AccordionTrigger className="text-left text-slate-200 hover:text-white py-5 font-medium">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-400 pb-5 leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-20 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t("faq.cta.title")}
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                {t("faq.cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white"
                  asChild
                >
                  <Link to="/contact">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t("faq.cta.contact")}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800"
                  asChild
                >
                  <Link to="/documentation">
                    <BookOpen className="mr-2 h-5 w-5" />
                    {t("faq.cta.docs")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FAQ;

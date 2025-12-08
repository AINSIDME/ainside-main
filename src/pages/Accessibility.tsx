import { PageSEO } from "@/components/seo/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Accessibility() {
  const { t } = useTranslation();
  return (
    <>
      <PageSEO
        title={t("a11yPage.title", { defaultValue: "Accessibility Statement" })}
        description={t("a11yPage.description", { defaultValue: "Commitment to WCAG 2.1 AA, usability and inclusion." })}
      />

      <div className="min-h-screen bg-background text-foreground px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("a11yPage.commitment.title", { defaultValue: "Commitment" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>{t("a11yPage.commitment.text", { defaultValue: "AInside is committed to an inclusive experience aligned with WCAG 2.1 AA. If you encounter any accessibility barriers, contact us and we will assist and correct issues." })}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("a11yPage.commitment.items.langDir", { defaultValue: "Document language and direction set per locale." })}</li>
                <li>{t("a11yPage.commitment.items.keyboard", { defaultValue: "Keyboard shortcuts and navigation, 'Skip to content' link." })}</li>
                <li>{t("a11yPage.commitment.items.controls", { defaultValue: "High contrast and font size controls." })}</li>
                <li>{t("a11yPage.commitment.items.aria", { defaultValue: "Accessible labels, ARIA roles and semantic landmarks." })}</li>
                <li>{t("a11yPage.commitment.items.readers", { defaultValue: "Screen reader compatibility and motion reduction." })}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("a11yPage.features.title", { defaultValue: "Accessibility features" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("a11yPage.features.skip", { defaultValue: "Skip to content: visible on focus before main navigation." })}</li>
                <li>{t("a11yPage.features.controls", { defaultValue: "High contrast and font size controls in the header accessibility menu." })}</li>
                <li>{t("a11yPage.features.keyboard", { defaultValue: "Keyboard compatibility: all controls navigable with Tab/Shift+Tab; visible focus states." })}</li>
                <li>{t("a11yPage.features.i18n", { defaultValue: "Internationalization: lang and dir attributes update by locale." })}</li>
                <li>{t("a11yPage.features.motion", { defaultValue: "Reduced motion: respect system prefers-reduced-motion." })}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("a11yPage.contact.title", { defaultValue: "Contact and assistance" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>{t("a11yPage.contact.text", { defaultValue: "If you need a reasonable accommodation or found an accessibility issue, contact us. We will respond as soon as possible." })}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("a11yPage.contact.form", { defaultValue: "Via form: " })}<Link to="/contact" className="text-primary underline">/contact</Link></li>
                <li>{t("a11yPage.contact.email", { defaultValue: "Support email: support@ainside.me" })}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSEO } from "@/components/seo/PageSEO";
import { useTranslation } from "react-i18next";

export default function LegalPrivacy() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-950">
      <PageSEO
        title={t('legalPrivacy.seo.title', { defaultValue: 'Privacy Policy' })}
        description={t('legalPrivacy.seo.desc', { defaultValue: 'We collect only minimal technical data required for software functionality. No financial or trading data is stored.' })}
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        ogType="article"
      />
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>{t('legalPrivacy.title', { defaultValue: 'Privacy Policy' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300 text-sm">
            <p>{t('legalPrivacy.p1', { defaultValue: 'We collect only minimal technical data needed for software functionality. We do not store financial, trading, or broker account data.' })}</p>
            <p>{t('legalPrivacy.p2', { defaultValue: 'Third-party integrations are used for educational display only. We are not responsible for any third-party data, services, or outages.' })}</p>
            <p>{t('legalPrivacy.p3', { defaultValue: 'Users are responsible for safeguarding their own devices, credentials, and data.' })}</p>
            <p className="text-slate-400">{t('legalPrivacy.p4', { defaultValue: 'AInside.me does not access broker accounts, execute trades, or handle funds.' })}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSEO } from "@/components/seo/PageSEO";
import { useTranslation } from "react-i18next";

export default function Status() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-950">
      <PageSEO
        title={t('statusPage.seo.title', { defaultValue: 'System Status' })}
        description={t('statusPage.seo.desc', { defaultValue: 'Current operational status for educational data display services and platform components.' })}
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        ogType="website"
      />
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>{t('statusPage.title', { defaultValue: 'System Status' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300 text-sm">
            <p>{t('statusPage.operational', { defaultValue: 'All systems operational.' })}</p>
            <ul className="list-disc ml-5">
              <li>{t('statusPage.items.data', { defaultValue: 'Market Data Feed: Operational' })}</li>
              <li>{t('statusPage.items.charts', { defaultValue: 'Chart Services: Operational' })}</li>
              <li>{t('statusPage.items.api', { defaultValue: 'API Services: Operational' })}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

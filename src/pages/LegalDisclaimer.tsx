import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSEO } from "@/components/seo/PageSEO";

export default function LegalDisclaimer() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PageSEO
        title="Legal Disclaimer"
        description="AInside.me provides educational software tools only. No financial advice. User assumes all risk and AInside.me disclaims all liability."
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        ogType="article"
      />
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Legal Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300 text-sm">
            <p>
              AInside.me is a software development company. We provide educational and research tools only. We do not
              provide financial advice, investment recommendations, or brokerage services.
            </p>
            <p>
              Trading involves substantial risk of loss. You agree not to hold AInside.me liable for any financial
              losses, damages, or consequences related to the use of our software.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

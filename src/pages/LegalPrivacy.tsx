import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSEO } from "@/components/seo/PageSEO";

export default function LegalPrivacy() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PageSEO
        title="Privacy Policy"
        description="We collect only minimal technical data required for software functionality. No financial or trading data is stored."
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        ogType="article"
      />
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300 text-sm">
            <p>
              We collect only minimal technical data needed for software functionality. We do not store financial,
              trading, or broker account data.
            </p>
            <p>
              Third-party integrations are used for educational display only. We are not responsible for any third-party
              data, services, or outages.
            </p>
            <p>
              Users are responsible for safeguarding their own devices, credentials, and data.
            </p>
            <p className="text-slate-400">
              AInside.me does not access broker accounts, execute trades, or handle funds.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

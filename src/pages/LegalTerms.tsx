import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSEO } from "@/components/seo/PageSEO";

export default function LegalTerms() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PageSEO
        title="Terms & Conditions"
        description="Institutional-grade terms governing the educational, research-only use of AInside.me software tools. No warranties; user assumes all risk."
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        ogType="article"
      />
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300 text-sm">
            <p>
              Our software and materials are provided exclusively for educational and research purposes. We do not
              provide trading signals, investment advice, or financial services.
            </p>
            <p>
              You must not use our tools for live trading decisions or any regulated financial activity. Software is
              provided "AS IS" without warranties of any kind.
            </p>
            <p>
              By using our services, you acknowledge that you are solely responsible for your decisions and outcomes.
            </p>
            <p className="text-slate-400">
              AInside.me is a software development company only. Nothing herein constitutes investment advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

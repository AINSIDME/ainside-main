import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSEO } from "@/components/seo/PageSEO";

export default function Status() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PageSEO
        title="System Status"
        description="Current operational status for educational data display services and platform components."
        canonical={typeof window !== 'undefined' ? window.location.href : undefined}
        ogType="website"
      />
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300 text-sm">
            <p>All systems operational.</p>
            <ul className="list-disc ml-5">
              <li>Market Data Feed: Operational</li>
              <li>Chart Services: Operational</li>
              <li>API Services: Operational</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

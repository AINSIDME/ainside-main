import { Link, useLocation } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, Home } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function PaymentCancel() {
  const { t } = useTranslation();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const planFromQuery = params.get('plan') || '';

  useEffect(() => {
    // If this is a popup window, close after a moment
    if (window.opener) {
      setTimeout(() => {
        window.close();
      }, 3000);
    }
    // Persist last plan so checkout can preselect on retry
    if (planFromQuery) {
      try { localStorage.setItem('lastPlan', planFromQuery); } catch {}
    }
  }, []);

  return (
    <>
      <PageSEO 
        title={t("paymentCancel.seo.title", { defaultValue: "Payment cancelled - AInside" })}
        description={t("paymentCancel.seo.desc", { defaultValue: "The payment has been cancelled" })}
      />
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-orange-600">{t("paymentCancel.title", { defaultValue: "Payment Cancelled" })}</CardTitle>
            <p className="text-muted-foreground">
              {t("paymentCancel.subtitle", { defaultValue: "You cancelled the payment process. No charge was made." })}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/pricing" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("paymentCancel.cta.plans", { defaultValue: "View plans" })}
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to={planFromQuery ? `/checkout?plan=${encodeURIComponent(planFromQuery)}` : "/checkout"}>
                  {t("paymentCancel.cta.retry", { defaultValue: "Retry payment" })}
                </Link>
              </Button>
            </div>

            <Button variant="ghost" asChild className="w-full">
              <Link to="/" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                {t("paymentCancel.cta.home", { defaultValue: "Back to home" })}
              </Link>
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t("paymentCancel.help", { defaultValue: "Need help?" })} <Link to="/contact" className="text-primary hover:underline">{t("paymentCancel.contact", { defaultValue: "Contact us" })}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
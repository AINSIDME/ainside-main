import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, ArrowRight, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button as UIButton } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface PaymentDetails {
  success: boolean;
  orderId: string;
  status: string;
  amount: string;
  currency?: string;
  payerEmail: string;
  captureTime: string;
  plan: string;
}

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const capturePayment = async () => {
      // PayPal returns token (orderId). Sometimes also PayerID.
      const token = searchParams.get("token") || searchParams.get("orderId");
      const payerId = searchParams.get("PayerID") || searchParams.get("payerId");

      if (!token) {
        setError(t("paymentSuccess.errors.noToken", { defaultValue: "Payment token not found" }));
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("capture-payment", {
          body: { orderId: token, payerId },
        });

        if (error) {
          console.error("Capture error:", error);
          setError((error as any)?.message || t("paymentSuccess.errors.capture", { defaultValue: "Error confirming payment" }));
          return;
        }

        if (data?.success) {
          setPaymentDetails(data);
          toast.success(t("paymentSuccess.toast.success", { defaultValue: "Payment confirmed successfully!" }));

          if (window.opener) {
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        } else {
          const details = (data as any)?.details || t("paymentSuccess.errors.processing", { defaultValue: "Error processing payment" });
          setError(details);
        }
      } catch (error) {
        console.error("Payment capture error:", error);
        setError(t("paymentSuccess.errors.capture", { defaultValue: "Error confirming payment" }));
      } finally {
        setLoading(false);
      }
    };

    capturePayment();
  }, [searchParams]);

  if (loading) {
    return (
      <>
        <PageSEO 
          title={t("paymentSuccess.loading.title", { defaultValue: "Confirming payment - AInside" })}
          description={t("paymentSuccess.loading.desc", { defaultValue: "Confirming your payment..." })}
        />
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">{t("paymentSuccess.loading.heading", { defaultValue: "Confirming your payment..." })}</h2>
                <p className="text-muted-foreground text-center">{t("paymentSuccess.loading.note", { defaultValue: "Please wait while we process your transaction" })}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageSEO 
          title={t("paymentSuccess.error.title", { defaultValue: "Payment error - AInside" })}
          description={t("paymentSuccess.error.desc", { defaultValue: "Error processing the payment" })}
        />
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✕</span>
                </div>
                <h2 className="text-xl font-semibold text-red-600">{t("paymentSuccess.error.heading", { defaultValue: "Payment error" })}</h2>
                <p className="text-muted-foreground text-center">{error}</p>
                <Link to="/checkout">
                  <Button>{t("paymentSuccess.error.retry", { defaultValue: "Retry payment" })}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO 
        title={t("paymentSuccess.success.title", { defaultValue: "Payment confirmed - AInside" })}
        description={t("paymentSuccess.success.desc", { defaultValue: "Your payment has been confirmed successfully" })}
      />
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-green-600">{t("paymentSuccess.success.heading", { defaultValue: "Payment Confirmed!" })}</CardTitle>
            <p className="text-muted-foreground">{t("paymentSuccess.success.note", { defaultValue: "Your payment has been processed successfully" })}</p>
          </CardHeader>
          
          {paymentDetails && (
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">{t("paymentSuccess.details.title", { defaultValue: "Transaction details" })}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("paymentSuccess.details.plan", { defaultValue: "Plan:" })}</span>
                    <div className="font-medium">{paymentDetails.plan}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("paymentSuccess.details.amount", { defaultValue: "Amount:" })}</span>
                    <div className="font-medium">{paymentDetails.amount} {paymentDetails.currency || "USD"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("paymentSuccess.details.orderId", { defaultValue: "Order ID:" })}</span>
                    <div className="font-medium font-mono text-xs">{paymentDetails.orderId}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("paymentSuccess.details.email", { defaultValue: "Email:" })}</span>
                    <div className="font-medium">{paymentDetails.payerEmail}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("paymentSuccess.details.status", { defaultValue: "Status:" })}</span>
                    <div className="font-medium text-green-600">{paymentDetails.status}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("paymentSuccess.details.date", { defaultValue: "Date:" })}</span>
                    <div className="font-medium">
                      {new Date(paymentDetails.captureTime).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                  <Link to="/live-demo" className="flex items-center justify-center gap-2">
                    {t("paymentSuccess.cta.demo", { defaultValue: "Open Demo" })}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <UIButton asChild variant="secondary" className="flex-1">
                  <Link to="/getting-started" className="flex items-center justify-center gap-2">
                    {t("paymentSuccess.cta.guide", { defaultValue: "Getting Started" })}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </UIButton>
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/" className="flex items-center justify-center gap-2">
                    <Home className="h-4 w-4" />
                    {t("paymentSuccess.cta.home", { defaultValue: "Go to Home" })}
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                {t("paymentSuccess.footer.email", { defaultValue: "You will receive a confirmation email in the next few minutes." })}
                {window.opener && (
                  <span className="block mt-2 text-green-600">
                    {t("paymentSuccess.footer.autoclose", { defaultValue: "This window will close automatically in a few seconds." })}
                  </span>
                )}
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
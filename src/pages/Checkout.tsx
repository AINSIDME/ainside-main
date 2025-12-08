import { useState } from "react";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Shield, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";

// Align client plan identifiers and amounts with server function mapping
const plans = [
  { id: "micro_monthly", nameKey: "checkoutPage.plans.micro_monthly.name", descKey: "checkoutPage.plans.micro_monthly.desc", price: 99.0, currency: 'USD' },
  { id: "micro_annual", nameKey: "checkoutPage.plans.micro_annual.name", descKey: "checkoutPage.plans.micro_annual.desc", price: 831.6, currency: 'USD' },
  { id: "mini_monthly", nameKey: "checkoutPage.plans.mini_monthly.name", descKey: "checkoutPage.plans.mini_monthly.desc", price: 999.0, currency: 'USD' },
  { id: "mini_annual", nameKey: "checkoutPage.plans.mini_annual.name", descKey: "checkoutPage.plans.mini_annual.desc", price: 8391.6, currency: 'USD' },
];

export default function Checkout() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState("mini");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) {
        toast.error(t("checkoutPage.errors.selectPlan", { defaultValue: "Please select a plan" }));
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          plan: plan.id,
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error(t("checkoutPage.errors.create", { defaultValue: "Error creating payment" }));
        return;
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        toast.error(t("checkoutPage.errors.noApproval", { defaultValue: "Could not obtain payment URL" }));
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(t("checkoutPage.errors.process", { defaultValue: "Error processing payment" }));
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <>
      <PageSEO 
        title={t("checkoutPage.seo.title", { defaultValue: "Checkout - AInside" })}
        description={t("checkoutPage.seo.desc", { defaultValue: "Complete your purchase securely with PayPal" })}
      />
      <div className="min-h-screen bg-background text-foreground py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">{t("checkoutPage.title", { defaultValue: "Secure Checkout" })}</h1>
            <p className="text-muted-foreground">{t("checkoutPage.subtitle", { defaultValue: "Complete your purchase quickly and safely" })}</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t("checkoutPage.selectPlan", { defaultValue: "Select your plan" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{t(plan.nameKey)}</div>
                          <div className="text-sm text-muted-foreground">{t(plan.descKey)}</div>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(plan.price, undefined, plan.currency)}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {selectedPlanData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t("checkoutPage.summary", { defaultValue: "Order Summary" })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span>{t(selectedPlanData.nameKey)}</span>
                  <span className="font-semibold">{formatCurrency(selectedPlanData.price, undefined, selectedPlanData.currency)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t("checkoutPage.total", { defaultValue: "Total" })}</span>
                    <span className="text-primary">{formatCurrency(selectedPlanData.price, undefined, selectedPlanData.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  {t("checkoutPage.badges.secure", { defaultValue: "100% secure payment" })}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("checkoutPage.badges.guarantee", { defaultValue: "Money-back guarantee" })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full h-12 text-lg"
          >
            {loading
              ? t("checkoutPage.processing", { defaultValue: "Processing..." })
              : t("checkoutPage.payWithPaypal", { defaultValue: "Pay ${{price}} with PayPal", price: formatCurrency(selectedPlanData?.price ?? 0) })}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            {t("checkoutPage.notice", { defaultValue: "By continuing you accept our terms and conditions" })}
          </p>
        </div>
      </div>
    </>
  );
}
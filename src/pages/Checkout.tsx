import { useEffect, useState } from "react";
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

// Map plan ids to i18n keys; prices come from backend get-plans
const PLAN_I18N: Record<string, { nameKey: string; descKey: string }> = {
  micro_monthly: {
    nameKey: "checkoutPage.plans.micro_monthly.name",
    descKey: "checkoutPage.plans.micro_monthly.desc",
  },
  micro_annual: {
    nameKey: "checkoutPage.plans.micro_annual.name",
    descKey: "checkoutPage.plans.micro_annual.desc",
  },
  mini_monthly: {
    nameKey: "checkoutPage.plans.mini_monthly.name",
    descKey: "checkoutPage.plans.mini_monthly.desc",
  },
  mini_annual: {
    nameKey: "checkoutPage.plans.mini_annual.name",
    descKey: "checkoutPage.plans.mini_annual.desc",
  },
};

type PlanInfo = { id: string; amount: number; currency: string };

export default function Checkout() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string>("micro_monthly");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<PlanInfo[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-plans", {});
        if (error) throw error;
        if (data?.plans && Array.isArray(data.plans)) {
          setPlans(data.plans as PlanInfo[]);
          setSelectedPlan((prev) => (prev && data.plans.find((p: PlanInfo) => p.id === prev) ? prev : data.plans[0]?.id ?? "micro_monthly"));
        }
      } catch (e) {
        console.error("Failed to load plans:", e);
        // Fallback to a minimal hardcoded list if needed
        setPlans([
          { id: "micro_monthly", amount: 99.0, currency: "USD" },
          { id: "micro_annual", amount: 831.6, currency: "USD" },
          { id: "mini_monthly", amount: 999.0, currency: "USD" },
          { id: "mini_annual", amount: 8391.6, currency: "USD" },
        ]);
      }
    };
    loadPlans();
  }, []);

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
                          <div className="font-semibold">{t(PLAN_I18N[plan.id]?.nameKey || plan.id)}</div>
                          <div className="text-sm text-muted-foreground">{t(PLAN_I18N[plan.id]?.descKey || '')}</div>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(plan.amount, undefined, plan.currency)}
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
                  <span>{t(PLAN_I18N[selectedPlanData.id]?.nameKey || selectedPlanData.id)}</span>
                  <span className="font-semibold">{formatCurrency(selectedPlanData.amount, undefined, selectedPlanData.currency)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t("checkoutPage.total", { defaultValue: "Total" })}</span>
                    <span className="text-primary">{formatCurrency(selectedPlanData.amount, undefined, selectedPlanData.currency)}</span>
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
              : t("checkoutPage.payWithPaypal", { defaultValue: "Pay ${{price}} with PayPal", price: formatCurrency(selectedPlanData?.amount ?? 0) })}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            {t("checkoutPage.notice", { defaultValue: "By continuing you accept our terms and conditions" })}
          </p>
        </div>
      </div>
    </>
  );
}
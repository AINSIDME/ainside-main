import { useState } from "react";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Shield, CheckCircle } from "lucide-react";

const plans = [
  { id: "mini", name: "Plan Mini", price: 9.99, description: "Perfecto para empezar" },
  { id: "macro", name: "Plan Macro", price: 29.99, description: "Para uso profesional" },
];

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState("mini");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) {
        toast.error("Por favor selecciona un plan");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          plan: plan.name,
          amount: plan.price,
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error("Error al crear el pago");
        return;
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        toast.error("No se pudo obtener la URL de pago");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <>
      <PageSEO 
        title="Checkout - AInside"
        description="Completa tu compra de forma segura con PayPal"
      />
      <div className="min-h-screen bg-background text-foreground py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Checkout Seguro</h1>
            <p className="text-muted-foreground">
              Completa tu compra de forma rápida y segura
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Selecciona tu plan
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
                          <div className="font-semibold">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">{plan.description}</div>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          ${plan.price}
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
                <CardTitle>Resumen de compra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span>{selectedPlanData.name}</span>
                  <span className="font-semibold">${selectedPlanData.price}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${selectedPlanData.price}</span>
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
                  Pago 100% seguro
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Garantía de devolución
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full h-12 text-lg"
          >
            {loading ? "Procesando..." : `Pagar $${selectedPlanData?.price} con PayPal`}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Al continuar aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    </>
  );
}
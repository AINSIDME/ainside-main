import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, ArrowRight, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentDetails {
  success: boolean;
  orderId: string;
  status: string;
  amount: string;
  payerEmail: string;
  captureTime: string;
  plan: string;
}

export default function PaymentSuccess() {
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
        setError("No se encontró el token de pago");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("capture-payment", {
          body: { orderId: token, payerId },
        });

        if (error) {
          console.error("Capture error:", error);
          setError((error as any)?.message || "Error al confirmar el pago");
          return;
        }

        if (data?.success) {
          setPaymentDetails(data);
          toast.success("¡Pago confirmado exitosamente!");

          if (window.opener) {
            setTimeout(() => {
              window.close();
            }, 3000);
          }
        } else {
          const details = (data as any)?.details || "Error al procesar el pago";
          setError(details);
        }
      } catch (error) {
        console.error("Payment capture error:", error);
        setError("Error al confirmar el pago");
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
          title="Confirmando pago - AInside"
          description="Confirmando tu pago..."
        />
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Confirmando tu pago...</h2>
                <p className="text-muted-foreground text-center">
                  Por favor espera mientras procesamos tu transacción
                </p>
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
          title="Error en el pago - AInside"
          description="Error al procesar el pago"
        />
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✕</span>
                </div>
                <h2 className="text-xl font-semibold text-red-600">Error en el pago</h2>
                <p className="text-muted-foreground text-center">{error}</p>
                <Link to="/checkout">
                  <Button>Reintentar pago</Button>
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
        title="Pago confirmado - AInside"
        description="Tu pago ha sido confirmado exitosamente"
      />
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-green-600">¡Pago Confirmado!</CardTitle>
            <p className="text-muted-foreground">
              Tu pago ha sido procesado exitosamente
            </p>
          </CardHeader>
          
          {paymentDetails && (
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Detalles de la transacción</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Plan:</span>
                    <div className="font-medium">{paymentDetails.plan}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Monto:</span>
                    <div className="font-medium">${paymentDetails.amount} USD</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID de orden:</span>
                    <div className="font-medium font-mono text-xs">{paymentDetails.orderId}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <div className="font-medium">{paymentDetails.payerEmail}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <div className="font-medium text-green-600">{paymentDetails.status}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha:</span>
                    <div className="font-medium">
                      {new Date(paymentDetails.captureTime).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                  <Link to="/live-demo" className="flex items-center justify-center gap-2">
                    Acceder al Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/" className="flex items-center justify-center gap-2">
                    <Home className="h-4 w-4" />
                    Ir al inicio
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Recibirás un email de confirmación en los próximos minutos.
                {window.opener && (
                  <span className="block mt-2 text-green-600">
                    Esta ventana se cerrará automáticamente en unos segundos.
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
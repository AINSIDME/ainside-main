import { Link } from "react-router-dom";
import { PageSEO } from "@/components/seo/PageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, Home } from "lucide-react";

import { useEffect } from "react";

export default function PaymentCancel() {
  useEffect(() => {
    // Si estamos en una ventana popup, cerrarla después de un momento
    if (window.opener) {
      setTimeout(() => {
        window.close();
      }, 3000);
    }
  }, []);

  return (
    <>
      <PageSEO 
        title="Pago cancelado - AInside"
        description="El pago ha sido cancelado"
      />
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-orange-600">Pago Cancelado</CardTitle>
            <p className="text-muted-foreground">
              Has cancelado el proceso de pago. No se ha realizado ningún cargo.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/pricing" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Ver planes
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/checkout">
                  Reintentar pago
                </Link>
              </Button>
            </div>

            <Button variant="ghost" asChild className="w-full">
              <Link to="/" className="flex items-center justify-center gap-2">
                <Home className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              ¿Necesitas ayuda? <Link to="/contact" className="text-primary hover:underline">Contáctanos</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
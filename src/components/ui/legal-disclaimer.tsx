import { AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

export const LegalDisclaimer = ({ variant = "default" }: { variant?: "default" | "prominent" }) => {
  const { t } = useTranslation();

  if (variant === "prominent") {
    return (
      <div className="relative overflow-hidden rounded-xl p-6 mb-6 backdrop-blur-sm bg-gradient-to-r from-background/80 via-background/60 to-background/80 border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-foreground">SOFTWARE COMPANY DISCLAIMER</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">AInside.me is a software development company</span> providing educational tools only. 
              We are NOT a financial services provider and provide NO investment advice. Users assume all responsibility for trading decisions and outcomes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg p-4 backdrop-blur-sm bg-gradient-to-r from-card/80 via-card/60 to-card/80 border border-border/50">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground">Legal Notice</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">AInside.me is a software development company</span> that provides educational and research tools only. 
          We are NOT a financial services provider, broker, or investment advisor. All trading decisions and their outcomes 
          are the sole responsibility of the user.
        </p>
      </div>
    </div>
  );
};
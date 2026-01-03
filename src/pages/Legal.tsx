import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, FileText, Scale } from "lucide-react";

const Legal = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            {t('legal.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('legal.subtitle')}
          </p>
        </div>

        {/* Main Legal Notice */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl text-amber-800 dark:text-amber-200">
                {t('legal.disclaimer.title')}
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300 text-lg">
                {t('legal.disclaimer.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-amber-800 dark:text-amber-200 space-y-4">
              <div className="text-lg font-semibold text-center mb-6">
                {t('legal.disclaimer.company')}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-2">WE ARE:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Software developers</li>
                    <li>• Educational tool providers</li>
                    <li>• Research platform creators</li>
                    <li>• Technology service providers</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold mb-2">WE ARE NOT:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Financial advisors</li>
                    <li>• Investment brokers</li>
                    <li>• Trading signal providers</li>
                    <li>• Financial services company</li>
                    <li>• Investment consultants</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Liability Disclaimer */}
          <Card className="corporate-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Complete Liability Disclaimer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">No Financial Responsibility:</h4>
                <p>AInside.me explicitly disclaims ALL liability for any financial losses, trading losses, investment losses, damages, or consequences of any kind arising from:</p>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Use of our software tools</li>
                  <li>• Educational materials provided</li>
                  <li>• Any data or information displayed</li>
                  <li>• Technical issues or errors</li>
                  <li>• User decisions or actions</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">User Assumes All Risk:</h4>
                <p>By using our services, you acknowledge that you:</p>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Understand all trading risks</li>
                  <li>• Make independent decisions</li>
                  <li>• Accept full responsibility for outcomes</li>
                  <li>• Will not hold AInside.me liable</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card className="corporate-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Terms of Service</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Educational Use Only:</h4>
                <p>Our software tools and materials are provided exclusively for:</p>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Educational purposes</li>
                  <li>• Research and analysis</li>
                  <li>• Software testing</li>
                  <li>• Learning programming concepts</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Prohibited Uses:</h4>
                <p>You may NOT use our services for:</p>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Live trading decisions</li>
                  <li>• Investment advice</li>
                  <li>• Commercial trading signals</li>
                  <li>• Financial consulting</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">No Warranties:</h4>
                <p>Software is provided "AS IS" without warranties of any kind, including accuracy, reliability, or fitness for any particular purpose.</p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="corporate-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-primary" />
                <CardTitle>Privacy & Data Protection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Data Collection:</h4>
                <p>We collect only necessary technical data for software functionality. No financial or trading data is stored.</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Third Party Services:</h4>
                <p>Our software may integrate with third-party services for educational data display. We are not responsible for their data or services.</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Security:</h4>
                <p>While we implement security measures, users are responsible for protecting their own data and systems.</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact for Legal */}
          <Card className="corporate-card">
            <CardHeader>
              <CardTitle>Legal Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>For legal inquiries regarding our software development services, contact:</p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> legal@ainside.me</p>
                <p><strong>Subject:</strong> Legal Inquiry - Software Services</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  Remember: We only provide software development services and educational tools. 
                  We cannot and will not provide financial or investment advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final Warning */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
                FINAL LEGAL WARNING
              </h3>
              <p className="text-red-700 dark:text-red-300">
                By continuing to use AInside.me services, you acknowledge that you have read, understood, 
                and agree to all terms and disclaimers stated above. You confirm that you will not hold 
                AInside.me liable for any financial consequences and that you understand we are a software 
                development company only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Legal;
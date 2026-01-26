import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { setDocumentDirection } from "@/lib/i18n";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import ChatWidget from "@/components/ChatWidget";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Demo from "./pages/Demo";
import LiveDemo from "./pages/LiveDemo";
import LiveDemoMini from "./pages/LiveDemoMini";
import Pricing from "./pages/Pricing";
import Products from "./pages/Products";
import Documentation from "./pages/Documentation";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import GettingStarted from "./pages/GettingStarted";
import AlgoTrading from "./pages/AlgoTrading";
import BlogAlgoTradingGuide from "./pages/BlogAlgoTradingGuide";
import Legal from "./pages/Legal";
import LegalTerms from "./pages/LegalTerms";
import LegalPrivacy from "./pages/LegalPrivacy";
import LegalDisclaimer from "./pages/LegalDisclaimer";
import Accessibility from "./pages/Accessibility";
import Status from "./pages/Status";
import FAQ from "./pages/FAQ";
import Crypto from "./pages/Crypto";
import Register from "./pages/Register";
import Login from "./pages/Login";
import OTPLogin from "./pages/OTPLogin";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MFA from "./pages/MFA";
import AdminControl from "./pages/AdminControl";
import AdminVerify2FA from "./pages/AdminVerify2FA";
import AdminCoupons from "./pages/AdminCoupons";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminMessages from "./pages/AdminMessages";
import AdminLogs from "./pages/AdminLogs";
import NotFound from "./pages/NotFound";
import Trading from "./pages/Trading";
import EducacionIndicadores from "./pages/EducacionIndicadores";
import EducacionInstrumentos from "./pages/EducacionInstrumentos";
import EducacionTiposTrading from "./pages/EducacionTiposTrading";
import EducacionLenguaje from "./pages/EducacionLenguaje";
import EducacionAnalisis from "./pages/EducacionAnalisis";
import "./lib/i18n";

const queryClient = new QueryClient();

// Component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    setDocumentDirection(i18n.language);
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <StructuredData />
          <Routes>
            {/* Rutas sin Header - pantalla completa */}
            <Route path="/login" element={<OTPLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Rutas con Header y layout normal */}
            <Route path="/*" element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main id="main-content" className="flex-1" role="main" aria-label="Main content">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/live-demo" element={<LiveDemo />} />
                    <Route path="/live-chat" element={<LiveDemoMini />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-cancel" element={<PaymentCancel />} />
                    <Route path="/getting-started" element={<GettingStarted />} />
                    <Route path="/algotrading" element={<AlgoTrading />} />
                    {/* Blog routes - multilingual */}
                    <Route path="/blog/guia-completa-trading-algoritmico" element={<BlogAlgoTradingGuide />} />
                    <Route path="/blog/complete-algorithmic-trading-guide" element={<BlogAlgoTradingGuide />} />
                    <Route path="/blog/guide-complet-trading-algorithmique" element={<BlogAlgoTradingGuide />} />
                    <Route path="/blog/dalil-kamil-altadawul-alalgorithmiat" element={<BlogAlgoTradingGuide />} />
                    <Route path="/blog/دليل-التداول-الخوارزمي-الكامل" element={<BlogAlgoTradingGuide />} />
                    <Route path="/blog/polnoe-rukovodstvo-algoritmicheskoj-torgovli" element={<BlogAlgoTradingGuide />} />
                    <Route path="/blog/полное-руководство-алгоритмическому-трейдингу" element={<BlogAlgoTradingGuide />} />
                    <Route path="/blog/madrich-male-lamischar-algorithmi" element={<BlogAlgoTradingGuide />} />
                    <Route path="/blog/מדריך-מסחר-אלגוריתמי-מלא" element={<BlogAlgoTradingGuide />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/legal/terms" element={<LegalTerms />} />
                    <Route path="/legal/privacy" element={<LegalPrivacy />} />
                    <Route path="/legal/disclaimer" element={<LegalDisclaimer />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/accessibility" element={<Accessibility />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/crypto" element={<Crypto />} />
                    <Route path="/login-oauth" element={<Login />} />
                    <Route path="/mfa" element={<MFA />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/trading" element={<Trading />} />
                    <Route path="/educacion/indicadores" element={<EducacionIndicadores />} />
                    <Route path="/educacion/instrumentos" element={<EducacionInstrumentos />} />
                    <Route path="/educacion/tipos-trading" element={<EducacionTiposTrading />} />
                    <Route path="/educacion/lenguaje" element={<EducacionLenguaje />} />
                    <Route path="/educacion/analisis" element={<EducacionAnalisis />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/logs" element={<AdminLogs />} />
                    <Route path="/admin/verify-2fa" element={<AdminVerify2FA />} />
                    <Route path="/admin/control" element={<AdminControl />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/messages" element={<AdminMessages />} />
                    <Route path="/admin/coupons" element={<AdminCoupons />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
                <ChatWidget />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

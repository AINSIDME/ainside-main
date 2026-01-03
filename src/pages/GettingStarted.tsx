import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageSEO } from "@/components/seo/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";

export default function GettingStarted() {
  const { t } = useTranslation();
  const [slides, setSlides] = useState<{ src: string; caption: string }[]>([]);

  useEffect(() => {
    const candidates = [
      { src: "/guide/ts-1.png", caption: t("gettingStarted.slides.ts1", { defaultValue: "Entries/Exits, trade line and ATRStopL/S" }) },
      { src: "/guide/ts-2.png", caption: t("gettingStarted.slides.ts2", { defaultValue: "Short signal with ATRStopS and intrabar update" }) },
      { src: "/guide/ts-3.png", caption: t("gettingStarted.slides.ts3", { defaultValue: "EndOfDay event and position close" }) },
    ];

    // Preload and keep only those that exist
    Promise.all(
      candidates.map(
        (c) =>
          new Promise<{ ok: boolean; item: { src: string; caption: string } }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ ok: true, item: c });
            img.onerror = () => resolve({ ok: false, item: c });
            img.src = c.src;
          })
      )
    ).then((results) => {
      setSlides(
        results
          .filter((r) => r.ok)
          .map((r) => r.item)
      );
    });
  }, []);
  return (
    <>
      <PageSEO
        title={t("gettingStarted.title", { defaultValue: "Getting Started • EasyLanguage" })}
        description={t("gettingStarted.description", { defaultValue: "EasyLanguage compatibility (TradeStation/MultiCharts), installation, data, logic and optimization." })}
      />

      <div className="min-h-screen bg-background text-foreground px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.deliverables.title", { defaultValue: "Compatibility and deliverables" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{t("gettingStarted.deliverables.compat", { defaultValue: "Compatibility: The strategy is designed for EasyLanguage, usable on TradeStation and MultiCharts (PowerLanguage). Other platforms are not compatible." })}</p>
              <p className="mt-2">{t("gettingStarted.deliverables.afterPay", { defaultValue: "After confirming payment, you receive:" })}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("gettingStarted.deliverables.eldpla", { defaultValue: "EasyLanguage package: .ELD (TradeStation) and/or .PLA (MultiCharts)." })}</li>
                <li>{t("gettingStarted.deliverables.workspaces", { defaultValue: "Example workspaces: .wsp/.mcw per instrument (ES/MES, GC/MGC)." })}</li>
                <li>{t("gettingStarted.deliverables.params", { defaultValue: "Recommended parameters: /params/*.json (monthly/annual, micro/mini)." })}</li>
                <li>{t("gettingStarted.deliverables.data", { defaultValue: "Sample data: /data/*.csv for backtest/validation." })}</li>
                <li>{t("gettingStarted.deliverables.manual", { defaultValue: "PDF manual with installation, rules and risk management." })}</li>
                <li>{t("gettingStarted.deliverables.panel", { defaultValue: "Access to the Live Panel and 24/6 support." })}</li>
              </ul>
              <p className="text-muted-foreground">{t("gettingStarted.deliverables.note", { defaultValue: "Download links are sent to the PayPal email and enabled in the panel." })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.requirements.title", { defaultValue: "Minimum requirements" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("gettingStarted.requirements.conn", { defaultValue: "Stable connection (≥ 20 Mbps) and machine with 8 GB RAM or more." })}</li>
                <li>{t("gettingStarted.requirements.platform", { defaultValue: "Compatible platform to execute: TradeStation or MultiCharts (EasyLanguage)." })}</li>
                <li>{t("gettingStarted.requirements.provider", { defaultValue: "Data provider/broker enabled for chosen instruments (ES/MES or GC/MGC)." })}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.install.title", { defaultValue: "EasyLanguage installation" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="step-1">
                  <AccordionTrigger>{t("gettingStarted.install.s1.title", { defaultValue: "1) Download and organize the package" })}</AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>{t("gettingStarted.install.s1.l1", { defaultValue: "Download the ZIP from the provided link." })}</li>
                      <li>{t("gettingStarted.install.s1.l2", { defaultValue: "Extract to C:/AInside (short path recommended)." })}</li>
                      <li>{t("gettingStarted.install.s1.l3", { defaultValue: "Typical structure: /easy-language/*.ELD|*.PLA, /workspaces, /params, /data, manual.pdf." })}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-2">
                  <AccordionTrigger>{t("gettingStarted.install.s2.title", { defaultValue: "2) TradeStation (.ELD)" })}</AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>{t("gettingStarted.install.s2.l1", { defaultValue: "File → Import/Export EasyLanguage → Import → select the .ELD." })}</li>
                      <li>{t("gettingStarted.install.s2.l2", { defaultValue: "Open a chart of the symbol (ES/MES or GC/MGC), 1m/5m timeframe." })}</li>
                      <li>{t("gettingStarted.install.s2.l3", { defaultValue: "Insert the Strategy via Insert → Strategy and select the AInside strategy." })}</li>
                      <li>{t("gettingStarted.install.s2.l4", { defaultValue: "Set Inputs according to /params/*.json (plan and cycle)." })}</li>
                      <li>{t("gettingStarted.install.s2.l5", { defaultValue: "Sessions: use recommended session template (CME RTH) per instrument." })}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-3">
                  <AccordionTrigger>{t("gettingStarted.install.s3.title", { defaultValue: "3) MultiCharts (.PLA) + QuoteManager" })}</AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>{t("gettingStarted.install.s3.l1", { defaultValue: "File → Import PLA → select the .PLA." })}</li>
                      <li>{t("gettingStarted.install.s3.l2", { defaultValue: "Open QuoteManager → File → Import Data → ASCII to load /data/*.csv." })}</li>
                      <li>{t("gettingStarted.install.s3.l3", { defaultValue: "CSV mapping: timestamp,open,high,low,close,volume (UTC). 1m/5m interval." })}</li>
                      <li>{t("gettingStarted.install.s3.l4", { defaultValue: "On chart, insert the Signal/Study and set Inputs like /params." })}</li>
                      <li>{t("gettingStarted.install.s3.l5", { defaultValue: "Sessions: select proper CME session template for the symbol." })}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-4">
                  <AccordionTrigger>{t("gettingStarted.install.s4.title", { defaultValue: "4) Parameters, backtest and optimization" })}</AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>{t("gettingStarted.install.s4.l1", { defaultValue: "Load Inputs from /params (micro/mini, monthly/annual)." })}</li>
                      <li>{t("gettingStarted.install.s4.l2", { defaultValue: "Backtest ≥ 2 years; metrics: Profit Factor, Max Drawdown, Win%, Sharpe." })}</li>
                      <li>{t("gettingStarted.install.s4.l3", { defaultValue: "Optimize within sensible ranges; use out-of-sample to avoid overfitting." })}</li>
                      <li>{t("gettingStarted.install.s4.l4", { defaultValue: "Risk: position sizing, stop (ATR/fixed), daily loss limits." })}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-5">
                  <AccordionTrigger>{t("gettingStarted.install.s5.title", { defaultValue: "5) Trading and best practices" })}</AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>{t("gettingStarted.install.s5.l1", { defaultValue: "Sync system clock; minimize feed latency." })}</li>
                      <li>{t("gettingStarted.install.s5.l2", { defaultValue: "Start in demo for 2–4 weeks before going live." })}</li>
                      <li>{t("gettingStarted.install.s5.l3", { defaultValue: "Keep a disciplined journal and update when new versions release." })}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.logic.title", { defaultValue: "Strategy logic (summary)" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>{t("gettingStarted.logic.desc", { defaultValue: "High-level description (no proprietary code):" })}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("gettingStarted.logic.l1", { defaultValue: "Regimes: context detection (trend/range) via lookbacks and filters." })}</li>
                <li>{t("gettingStarted.logic.l2", { defaultValue: "Volatility: thresholds via ATR/averages to enable/disable signals." })}</li>
                <li>{t("gettingStarted.logic.l3", { defaultValue: "Entries: continuation/pullback patterns by regime and instrument." })}</li>
                <li>{t("gettingStarted.logic.l4", { defaultValue: "Management: dynamic stops/targets, trailing, daily limits." })}</li>
              </ul>
              <p className="text-muted-foreground">{t("gettingStarted.logic.note", { defaultValue: "Input names and suggested ranges are included in /params." })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.support.title", { defaultValue: "Support and resources" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("gettingStarted.support.status", { defaultValue: "Service status:" })} <Link to="/status" className="text-primary underline">/status</Link></li>
                <li>{t("gettingStarted.support.contact", { defaultValue: "Contact:" })} <Link to="/contact" className="text-primary underline">/contact</Link></li>
                <li>{t("gettingStarted.support.docs", { defaultValue: "General documentation:" })} <Link to="/documentation" className="text-primary underline">/documentation</Link></li>
              </ul>
              <div className="flex gap-3">
                <Button asChild variant="secondary"><Link to="/pricing">{t("gettingStarted.support.viewPlans", { defaultValue: "View plans" })}</Link></Button>
                <Button asChild><Link to="/live-demo">{t("gettingStarted.support.openDemo", { defaultValue: "Open live demo" })}</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-background text-foreground px-4 pb-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.gallery.title", { defaultValue: "Screenshot gallery (EasyLanguage)" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {slides.length > 0 ? (
                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {slides.map((s, idx) => (
                        <CarouselItem key={idx} className="basis-full">
                          <div className="rounded-lg overflow-hidden border bg-muted/30">
                            <img src={s.src} alt={s.caption} className="w-full h-auto" />
                          </div>
                          <p className="mt-2 text-center text-muted-foreground">{s.caption}</p>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              ) : (
                <div className="text-muted-foreground">{t("gettingStarted.gallery.empty", { defaultValue: "Place your images in /public/guide named ts-1.png, ts-2.png, ts-3.png to display them here." })}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.tsViz.title", { defaultValue: "Visualization in TradeStation" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>{t("gettingStarted.tsViz.desc", { defaultValue: "In TradeStation, the strategy shows entry/exit arrows, trade lines, ATRStopL/S labels, Long/Short markers, and events like EndOfDay. If you don't see them:" })}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("gettingStarted.tsViz.l1", { defaultValue: "Right-click chart → Format Strategies → Properties tab:" })}</li>
                <li className="ml-6">{t("gettingStarted.tsViz.l2", { defaultValue: "Enable 'Show strategy orders on chart' and 'Show entries/exits'." })}</li>
                <li className="ml-6">{t("gettingStarted.tsViz.l3", { defaultValue: "In Settings: turn on 'Use Look-Inside-Bar Back-testing (LIBB)' at 1 tick for realistic stops." })}</li>
                <li>{t("gettingStarted.tsViz.l4", { defaultValue: "Verify Session template (CME RTH) and correct symbol/contract (e.g., MGCZ25, SILZ25)." })}</li>
                <li>{t("gettingStarted.tsViz.l5", { defaultValue: "Recommended timeframe: 1–5 minutes; standard bars, not Heikin Ashi." })}</li>
              </ul>
              <p className="text-muted-foreground">{t("gettingStarted.tsViz.tip", { defaultValue: "Tip: open Strategy Performance Report to validate metrics and equity curve." })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.validation.title", { defaultValue: "Quick validation checklist" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="list-disc pl-6 space-y-1">
                <li>{t("gettingStarted.validation.l1", { defaultValue: "Correct symbol and expiration (ES/MES or GC/MGC; e.g., MGCZ25)." })}</li>
                <li>{t("gettingStarted.validation.l2", { defaultValue: "Proper session template (CME RTH) and expected time zone." })}</li>
                <li>{t("gettingStarted.validation.l3", { defaultValue: "Strategy inserted and Inputs loaded from /params." })}</li>
                <li>{t("gettingStarted.validation.l4", { defaultValue: "LIBB/IOG configured for realistic backtest; arrows/trades visible." })}</li>
                <li>{t("gettingStarted.validation.l5", { defaultValue: "Data without gaps: range ≥ 2 years for backtest/optimization." })}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t("gettingStarted.faq.title", { defaultValue: "Frequently asked questions (EasyLanguage)" })}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>{t("gettingStarted.faq.q1", { defaultValue: "I don't see entries/exits on the chart" })}</AccordionTrigger>
                  <AccordionContent>{t("gettingStarted.faq.a1", { defaultValue: "Check Format Strategies → Properties: enable showing orders/entries and apply the correct session. Ensure you are not using synthetic bars (Heikin Ashi)." })}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>{t("gettingStarted.faq.q2", { defaultValue: "Backtest results look unrealistic" })}</AccordionTrigger>
                  <AccordionContent>{t("gettingStarted.faq.a2", { defaultValue: "Enable Look-Inside-Bar Back-testing (1 tick) and use high-resolution data. Adjust slippage/commissions in Properties." })}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger>{t("gettingStarted.faq.q3", { defaultValue: "CSV data won't import in MultiCharts" })}</AccordionTrigger>
                  <AccordionContent>{t("gettingStarted.faq.a3", { defaultValue: "Import via QuoteManager → File → Import Data → ASCII with columns timestamp,open,high,low,close,volume (UTC) and comma separator." })}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-4">
                  <AccordionTrigger>{t("gettingStarted.faq.q4", { defaultValue: "What do ATRStopL/ATRStopS mean?" })}</AccordionTrigger>
                  <AccordionContent>{t("gettingStarted.faq.a4", { defaultValue: "Dynamic ATR-based stop levels for Long/Short positions. They update intrabar if LIBB/IOG is enabled." })}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

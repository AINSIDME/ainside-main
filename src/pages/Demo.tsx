import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Settings, Download, Monitor, TrendingUp, BarChart3, Shield, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Demo = () => {
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedView, setSelectedView] = useState('analysis');

  const demoData = [
    { period: "10/8/2025 - Today", netProfit: 161.25, gainPercent: 1.72, profitFactor: 1.58, trades: 9, profitable: 88.67, shortPeriod: "Today" },
    { period: "3/8/2025 - 10/8/2025", netProfit: 313.75, gainPercent: 3.38, profitFactor: 1.40, trades: 22, profitable: 63.64, shortPeriod: "1 Week" },
    { period: "27/7/2025 - 10/8/2025", netProfit: 672.50, gainPercent: 7.57, profitFactor: 1.78, trades: 31, profitable: 67.74, shortPeriod: "2 Weeks" },
    { period: "20/7/2025 - 10/8/2025", netProfit: 840.00, gainPercent: 9.63, profitFactor: 1.79, trades: 41, profitable: 63.41, shortPeriod: "3 Weeks" },
    { period: "13/7/2025 - 10/8/2025", netProfit: 1027.50, gainPercent: 12.04, profitFactor: 1.78, trades: 50, profitable: 64.00, shortPeriod: "1 Month" },
    { period: "6/7/2025 - 10/8/2025", netProfit: 783.75, gainPercent: 8.93, profitFactor: 1.40, trades: 68, profitable: 57.35, shortPeriod: "5 Weeks" },
    { period: "29/6/2025 - 10/8/2025", netProfit: 1202.50, gainPercent: 14.39, profitFactor: 1.55, trades: 82, profitable: 60.98, shortPeriod: "6 Weeks" },
    { period: "22/6/2025 - 10/8/2025", netProfit: 987.50, gainPercent: 11.52, profitFactor: 1.36, trades: 92, profitable: 58.70, shortPeriod: "7 Weeks" },
    { period: "15/6/2025 - 10/8/2025", netProfit: 1375.00, gainPercent: 16.80, profitFactor: 1.48, trades: 98, profitable: 60.20, shortPeriod: "8 Weeks" },
    { period: "8/6/2025 - 10/8/2025", netProfit: 1860.00, gainPercent: 24.48, profitFactor: 1.61, trades: 108, profitable: 61.11, shortPeriod: "2 Months" },
    { period: "1/6/2025 - 10/8/2025", netProfit: 2066.25, gainPercent: 27.57, profitFactor: 1.58, trades: 121, profitable: 61.16, shortPeriod: "10 Weeks" },
    { period: "25/5/2025 - 10/8/2025", netProfit: 2282.50, gainPercent: 31.36, profitFactor: 1.57, trades: 129, profitable: 61.24, shortPeriod: "11 Weeks" },
    { period: "18/5/2025 - 10/8/2025", netProfit: 2867.50, gainPercent: 42.84, profitFactor: 1.69, trades: 137, profitable: 62.77, shortPeriod: "3 Months" },
    { period: "11/5/2025 - 10/8/2025", netProfit: 3700.00, gainPercent: 65.67, profitFactor: 1.90, trades: 147, profitable: 63.95, shortPeriod: "13 Weeks" },
    { period: "4/5/2025 - 10/8/2025", netProfit: 3507.50, gainPercent: 57.94, profitFactor: 1.71, trades: 157, profitable: 62.42, shortPeriod: "14 Weeks" },
    { period: "27/4/2025 - 10/8/2025", netProfit: 4263.75, gainPercent: 80.49, profitFactor: 1.85, trades: 169, profitable: 62.72, shortPeriod: "15 Weeks" },
    { period: "20/4/2025 - 10/8/2025", netProfit: 4940.00, gainPercent: 106.90, profitFactor: 1.96, trades: 180, profitable: 63.89, shortPeriod: "4 Months" },
    { period: "13/4/2025 - 10/8/2025", netProfit: 5123.75, gainPercent: 115.46, profitFactor: 1.96, trades: 184, profitable: 64.13, shortPeriod: "17 Weeks" },
    { period: "6/4/2025 - 10/8/2025", netProfit: 5847.50, gainPercent: 157.46, profitFactor: 2.09, trades: 189, profitable: 65.08, shortPeriod: "18 Weeks" },
    { period: "30/3/2025 - 10/8/2025", netProfit: 6111.25, gainPercent: 177.14, profitFactor: 2.06, trades: 199, profitable: 65.33, shortPeriod: "19 Weeks" },
    { period: "23/3/2025 - 10/8/2025", netProfit: 6316.25, gainPercent: 194.65, profitFactor: 2.03, trades: 213, profitable: 64.79, shortPeriod: "5 Months" },
    { period: "16/3/2025 - 10/8/2025", netProfit: 6393.75, gainPercent: 201.85, profitFactor: 1.93, trades: 234, profitable: 63.68, shortPeriod: "21 Weeks" },
    { period: "9/3/2025 - 10/8/2025", netProfit: 6948.75, gainPercent: 265.98, profitFactor: 2.01, trades: 240, profitable: 64.58, shortPeriod: "22 Weeks" },
    { period: "2/3/2025 - 10/8/2025", netProfit: 7061.25, gainPercent: 282.45, profitFactor: 2.98, trades: 246, profitable: 64.63, shortPeriod: "6 Months" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm">
      {/* Header */}
      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/98 backdrop-blur-sm">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-block px-6 py-3 text-xs font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 rounded-full mb-8 tracking-wide uppercase border border-blue-500/30 backdrop-blur-sm shadow-lg">
            {t('demo.badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-100 mb-8 leading-[1.1] tracking-tight">
            {t('demo.title', { defaultValue: 'Demonstration' })}
            <br />
            <span className="font-normal bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('demo.subtitle')}
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            {t('demo.description')}
          </p>
        </div>
      </section>

      {/* Demo Interface */}
      <section className="py-16 bg-gradient-to-br from-slate-800/60 via-slate-900/80 to-slate-950/90 backdrop-blur-sm border-y border-slate-700/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
            {/* Main Demo Area */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="p-8 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm mb-6 md:mb-8">
                <div className="border-b border-slate-700/50 pb-6 mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-light text-slate-100 mb-2">{t('demoPage.platform.title', { defaultValue: 'Advanced Analytics Platform' })}</h2>
                      <p className="text-slate-300 font-light">{t('demoPage.platform.subtitle', { defaultValue: 'Professional trading analytics and performance tracking' })}</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <Badge 
                        variant={isRunning ? "default" : "secondary"} 
                        className={`text-xs md:text-sm px-3 py-1 ${isRunning ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-slate-600/20 text-slate-300 border-slate-600/30'}`}
                      >
                        {isRunning ? t('demoPage.status.active', { defaultValue: 'ACTIVE' }) : t('demoPage.status.standby', { defaultValue: 'STANDBY' })}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRunning(!isRunning)}
                        className="flex items-center gap-2 border-slate-600/40 text-slate-200 hover:bg-slate-700/50"
                      >
                        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isRunning ? t('demoPage.controls.pause', { defaultValue: 'Pause' }) : t('demoPage.controls.start', { defaultValue: 'Start' })}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Chart View */}
                {selectedView === 'analysis' && (
                  <div className="space-y-8">
                    {/* Performance Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Net Profit Chart */}
                      <div className="p-6 bg-slate-900/50 border border-slate-600/30 rounded-xl">
                        <h4 className="font-light text-slate-200 mb-6 flex items-center gap-2 text-lg">
                          <LineChart className="w-5 h-5" />
                          {t('demoPage.charts.netProfit', { defaultValue: 'Net Profit Evolution' })}
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <RechartsLineChart data={demoData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis 
                              dataKey="shortPeriod" 
                              stroke="#94a3b8"
                              fontSize={12}
                              fontWeight={300}
                            />
                            <YAxis 
                              stroke="#94a3b8"
                              fontSize={12}
                              fontWeight={300}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                              }}
                              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, t('demoPage.tooltip.netProfit', { defaultValue: 'Net Profit' })]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="netProfit" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Gain Percentage Chart */}
                      <div className="p-6 bg-slate-900/50 border border-slate-600/30 rounded-xl">
                        <h4 className="font-light text-slate-200 mb-6 flex items-center gap-2 text-lg">
                          <BarChart3 className="w-5 h-5" />
                          {t('demoPage.charts.gainPct', { defaultValue: 'Percentage Gains' })}
                        </h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={demoData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis 
                              dataKey="shortPeriod" 
                              stroke="#94a3b8"
                              fontSize={12}
                              fontWeight={300}
                            />
                            <YAxis 
                              stroke="#94a3b8"
                              fontSize={12}
                              fontWeight={300}
                              tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#f1f5f9'
                              }}
                              formatter={(value: any) => [`${Number(value)}%`, t('demoPage.tooltip.gainPct', { defaultValue: '% Gain' })]}
                            />
                            <Bar 
                              dataKey="gainPercent" 
                              fill="#06b6d4"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Table View */}
                {selectedView === 'monitoring' && (
                  <div className="bg-slate-900/50 border border-slate-600/30 rounded-xl overflow-hidden">
                    <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-600/30">
                      <h3 className="font-light text-slate-100 text-lg">
                        Mark-To-Market Rolling Period Analysis
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-800/30">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-light text-slate-400 uppercase tracking-wide">
                              Period
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-light text-slate-400 uppercase tracking-wide">
                              Net Profit
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-light text-slate-400 uppercase tracking-wide">
                              % Gain
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-light text-slate-400 uppercase tracking-wide">
                              Profit Factor
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-light text-slate-400 uppercase tracking-wide">
                              # Trades
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-light text-slate-400 uppercase tracking-wide">
                              % Profitable
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {demoData.slice(0, 15).map((row, index) => (
                            <tr 
                              key={index} 
                              className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors"
                            >
                              <td className="px-4 py-3 text-xs text-slate-300 font-light">
                                {row.period}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-200 font-medium text-right">
                                ${row.netProfit.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-300 text-right">
                                {row.gainPercent}%
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-400 text-right">
                                {row.profitFactor}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-400 text-right">
                                {row.trades}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-300 text-right">
                                {row.profitable}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Demo Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 pt-6 border-t border-slate-700/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Button
                      variant={selectedView === 'analysis' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedView('analysis')}
                      className="flex items-center gap-2 w-full sm:w-auto border-slate-600/40"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm font-light">{t('demoPage.view.charts', { defaultValue: 'Charts' })}</span>
                    </Button>
                    <Button
                      variant={selectedView === 'monitoring' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedView('monitoring')}
                      className="flex items-center gap-2 w-full sm:w-auto border-slate-600/40"
                    >
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm font-light">{t('demoPage.view.table', { defaultValue: 'Table' })}</span>
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto border-slate-600/40 text-slate-200 hover:bg-slate-700/50">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-light">{t('demoPage.controls.export', { defaultValue: 'Export' })}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 order-1 lg:order-2">
              {/* Technology Overview */}
              <div className="p-6 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
                <h3 className="text-lg font-light text-slate-100 mb-6">{t('demoPage.features.title', { defaultValue: 'Platform Features' })}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                    <span className="text-slate-300 font-light">{t('demoPage.features.f1', { defaultValue: 'Real-time Analytics' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                    <span className="text-slate-300 font-light">{t('demoPage.features.f2', { defaultValue: 'Advanced Charting' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"></div>
                    <span className="text-slate-300 font-light">{t('demoPage.features.f3', { defaultValue: 'Risk Management' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span className="text-slate-300 font-light">{t('demoPage.features.f4', { defaultValue: 'Performance Tracking' })}</span>
                  </div>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="p-6 bg-slate-800/60 border border-slate-700/40 rounded-2xl backdrop-blur-sm">
                <h3 className="text-lg font-light text-slate-100 mb-4">{t('demoPage.cta.title', { defaultValue: 'Ready to Get Started?' })}</h3>
                <p className="text-slate-300 text-sm mb-6 font-light">{t('demoPage.cta.desc', { defaultValue: 'Contact our team to learn more about our algorithm rental services.' })}</p>
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-200 border-0">
                  <Link to="/contact">{t('demoPage.cta.button', { defaultValue: 'Contact Us' })}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;
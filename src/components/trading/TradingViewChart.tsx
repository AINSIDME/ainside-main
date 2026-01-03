import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol?: string;
  theme?: "light" | "dark";
  width?: string | number;
  height?: string | number;
  interval?: string;
  timezone?: string;
  style?: string;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewChart = ({
  symbol = "SPY",
  theme = "dark",
  width = "100%",
  height = 500,
  interval = "1",
  timezone = "Etc/UTC",
  style = "1",
  locale = "en",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  container_id = "tradingview_chart"
}: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: false,
      symbol: symbol,
      interval: interval,
      timezone: timezone,
      theme: theme,
      style: style,
      locale: locale,
      toolbar_bg: toolbar_bg,
      enable_publishing: enable_publishing,
      allow_symbol_change: allow_symbol_change,
      calendar: false,
      support_host: "https://www.tradingview.com",
      width: width,
      height: height,
      container_id: container_id
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme, width, height, interval, timezone, style, locale, toolbar_bg, enable_publishing, allow_symbol_change, container_id]);

  return (
    <div className="tradingview-widget-container w-full">
      <div
        ref={containerRef}
        id={container_id}
        style={{ width: typeof width === 'string' ? width : `${width}px`, height: `${height}px` }}
      />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};
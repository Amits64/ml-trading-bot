import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

const TradingViewWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "NASDAQ:AAPL",
      interval: "D",
      timezone: "exchange",
      theme: "light",
      style: "0",
      locale: "en",
      allow_symbol_change: true,
      withdateranges: true,
      save_image: false,
      details: true,
      hotlist: true,
      support_host: "https://www.tradingview.com"
    });
    containerRef.current.appendChild(script);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      captureAndSend();
    }, 60000); // Capture every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const captureAndSend = async () => {
    if (containerRef.current) {
      const canvas = await html2canvas(containerRef.current);
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "chart.png");

        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/detect`, {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          console.log("Detections:", result.detections);
          // TODO: Overlay Buy/Sell signals based on detections
        } catch (error) {
          console.error("Error sending screenshot:", error);
        }
      });
    }
  };

  return (
    <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default TradingViewWidget;

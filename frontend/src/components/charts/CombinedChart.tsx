import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartProps {
  data: CandleData[];
  predictions?: CandleData[];
}

export const CombinedChart = ({ data, predictions }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear previous elements if any
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth || 600,
      height: 380,
      timeScale: {
        timeVisible: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }
    });

    // Historical candles series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const candleData = (data && data.length > 0) ? data : [
      { time: '2026-09-01', open: 150, high: 155, low: 149, close: 154 },
      { time: '2026-09-02', open: 154, high: 158, low: 153, close: 156 },
      { time: '2026-09-03', open: 156, high: 157, low: 151, close: 152 },
      { time: '2026-09-04', open: 152, high: 160, low: 151, close: 159 },
    ];
    candlestickSeries.setData(candleData as any);

    // Prediction series (rendered with distinctive futuristic cyan color)
    const predSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#38bdf8',
      downColor: '#0284c7',
      borderVisible: true,
      borderColor: '#38bdf8',
      wickUpColor: '#38bdf8',
      wickDownColor: '#0284c7',
    });

    const predData = (predictions && predictions.length > 0) ? predictions : [
      { time: '2026-09-05', open: 159, high: 162, low: 158, close: 161 },
      { time: '2026-09-06', open: 161, high: 165, low: 160, close: 164 },
    ];
    predSeries.setData(predData as any);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, predictions]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '380px' }} />;
};

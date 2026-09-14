import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts';

interface ChartProps {
  data: any[];
  predictions?: any[];
}

export const CombinedChart = ({ data, predictions }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    if (data && data.length > 0) {
      candlestickSeries.setData(data);
    } else {
      // Mock data if none provided
      candlestickSeries.setData([
        { time: '2026-09-01', open: 150, high: 155, low: 149, close: 154 },
        { time: '2026-09-02', open: 154, high: 158, low: 153, close: 156 },
        { time: '2026-09-03', open: 156, high: 157, low: 151, close: 152 },
        { time: '2026-09-04', open: 152, high: 160, low: 151, close: 159 },
      ]);
    }

    // Add prediction series if available
    if (predictions && predictions.length > 0) {
      const predSeries = chart.addSeries(CandlestickSeries, {
        upColor: 'rgba(56, 189, 248, 0.5)',
        downColor: 'rgba(56, 189, 248, 0.5)',
        borderVisible: false,
        wickUpColor: 'rgba(56, 189, 248, 0.5)',
        wickDownColor: 'rgba(56, 189, 248, 0.5)',
      });
      predSeries.setData(predictions);
    } else {
        // Mock prediction
        const predSeries = chart.addSeries(CandlestickSeries, {
            upColor: 'rgba(56, 189, 248, 0.5)',
            downColor: 'rgba(56, 189, 248, 0.5)',
            borderVisible: false,
            wickUpColor: 'rgba(56, 189, 248, 0.5)',
            wickDownColor: 'rgba(56, 189, 248, 0.5)',
          });
          predSeries.setData([
            { time: '2026-09-05', open: 159, high: 162, low: 158, close: 161 },
            { time: '2026-09-06', open: 161, high: 165, low: 160, close: 164 },
          ]);
    }

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, predictions]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />;
};

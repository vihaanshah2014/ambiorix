'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ChartRendererProps {
  config: any;
}

export default function ChartRenderer({ config }: ChartRendererProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !config) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, config);
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [config]);

  return (
    <div className="w-full h-full min-h-[400px]">
      <canvas ref={chartRef} />
    </div>
  );
} 
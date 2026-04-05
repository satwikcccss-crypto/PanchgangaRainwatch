import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  BarController, LineController,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { getIMDConfigByKey } from '../../config/imdThresholds';

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  BarController, LineController,
  Title, Tooltip, Legend, Filler,
);

const RainfallChart = ({ stationData, stationName }) => {
  const series  = stationData?.timeSeries || [];
  const imdKey  = stationData?.imdLevel   || 'no_rain';
  const cfg     = getIMDConfigByKey(imdKey);

  const labels    = series.map(p => p.timeLabel);
  const intensity = series.map(p => p.intensity);
  const cumul     = series.map(p => p.cumulative);

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Intensity (mm/hr)',
        data: intensity,
        backgroundColor: series.map(p => {
          if (p.intensity > 15.5) return 'rgba(239,68,68,0.75)';
          if (p.intensity > 7.5)  return 'rgba(249,115,22,0.75)';
          if (p.intensity > 2.4)  return 'rgba(234,179,8,0.75)';
          if (p.intensity > 0)    return 'rgba(34,197,94,0.75)';
          return 'rgba(148,163,184,0.4)';
        }),
        borderColor: 'transparent',
        borderRadius: 3,
        yAxisID: 'y',
        order: 2,
      },
      {
        type: 'line',
        label: 'Cumulative (mm)',
        data: cumul,
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30,58,138,0.06)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Plus Jakarta Sans', size: 10, weight: '700' },
          color: '#475569',
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: '700' },
        bodyFont:  { family: 'Plus Jakarta Sans', size: 11 },
        padding: 10,
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (item) => {
            if (item.datasetIndex === 0)
              return ` Intensity: ${item.raw?.toFixed(2) ?? 0} mm/hr`;
            return ` Cumulative: ${item.raw?.toFixed(2) ?? 0} mm`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 9, weight: '600' },
          color: '#94a3b8',
          maxTicksLimit: 10,
          maxRotation: 0,
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 9 },
          color: '#94a3b8',
          callback: v => `${v} mm/hr`,
        },
        title: {
          display: true,
          text: 'Intensity (mm/hr)',
          font: { size: 9, weight: '700' },
          color: '#64748b',
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 9 },
          color: '#1e3a8a',
          callback: v => `${v} mm`,
        },
        title: {
          display: true,
          text: 'Cumulative (mm)',
          font: { size: 9, weight: '700' },
          color: '#1e3a8a',
        },
      },
    },
  };

  if (series.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        No data available
      </div>
    );
  }

  return <Chart type="bar" data={data} options={options} />;
};

export default RainfallChart;

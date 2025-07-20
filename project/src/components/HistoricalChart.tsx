import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { ApiService, HistoricalData } from '../services/ApiService';

export const HistoricalChart: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getHistoricalData();
      setHistoricalData(data);
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const dates = historicalData.map(d => d.date);
  const revenues = historicalData.map(d => d.revenue);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Historical Revenue Trend
      </h3>
      
      <Plot
        data={[
          {
            x: dates,
            y: revenues,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Historical Revenue',
            line: { color: '#1e40af', width: 2 },
            marker: { size: 4 },
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 20, r: 20, b: 40, l: 60 },
          xaxis: {
            title: 'Date',
            showgrid: true,
            gridcolor: '#f3f4f6',
          },
          yaxis: {
            title: 'Revenue ($)',
            showgrid: true,
            gridcolor: '#f3f4f6',
            tickformat: '$,.0f',
          },
          plot_bgcolor: 'white',
          paper_bgcolor: 'white',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
      />
    </div>
  );
};
import React from 'react';
import Plot from 'react-plotly.js';
import { ForecastData } from '../types/ForecastTypes';

interface ForecastChartProps {
  forecastData: ForecastData | null;
  selectedModel: 'sarima' | 'lstm';
  isLoading: boolean;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecastData,
  selectedModel,
  isLoading,
}) => {
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

  if (!forecastData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">No forecast data available</p>
      </div>
    );
  }

  const { forecasts } = forecastData;
  const dates = forecasts.map(f => f.date);
  const forecastedRevenue = forecasts.map(f => f.forecasted_revenue);
  const growth5 = forecasts.map(f => f.growth_5);
  const growth10 = forecasts.map(f => f.growth_10);
  const decline5 = forecasts.map(f => f.decline_5);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          12-Month Revenue Forecast ({selectedModel.toUpperCase()})
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Forecast</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Growth</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Decline</span>
          </div>
        </div>
      </div>
      
      <Plot
        data={[
          {
            x: dates,
            y: forecastedRevenue,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Forecasted Revenue',
            line: { color: '#3b82f6', width: 3 },
            marker: { size: 6 },
          },
          {
            x: dates,
            y: growth5,
            type: 'scatter',
            mode: 'lines',
            name: 'Growth +5%',
            line: { color: '#10b981', width: 2, dash: 'dash' },
          },
          {
            x: dates,
            y: growth10,
            type: 'scatter',
            mode: 'lines',
            name: 'Growth +10%',
            line: { color: '#059669', width: 2, dash: 'dot' },
          },
          {
            x: dates,
            y: decline5,
            type: 'scatter',
            mode: 'lines',
            name: 'Decline -5%',
            line: { color: '#ef4444', width: 2, dash: 'dash' },
          },
        ]}
        layout={{
          height: 400,
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
          legend: {
            orientation: 'h',
            y: -0.2,
            x: 0.5,
            xanchor: 'center',
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
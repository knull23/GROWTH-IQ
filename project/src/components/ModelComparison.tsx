import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { ApiService, ModelMetrics } from '../services/ApiService';

export const ModelComparison: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const modelNames = metrics.map(m => m.model_type.toUpperCase());
  const rmseValues = metrics.map(m => m.rmse);
  const accuracyValues = metrics.map(m => m.accuracy * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Model Performance Comparison
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RMSE Comparison */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">RMSE (Lower is Better)</h4>
          <Plot
            data={[
              {
                x: modelNames,
                y: rmseValues,
                type: 'bar',
                marker: { color: ['#3b82f6', '#10b981'] },
              },
            ]}
            layout={{
              height: 200,
              margin: { t: 10, r: 10, b: 40, l: 40 },
              xaxis: { title: 'Model' },
              yaxis: { title: 'RMSE' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              font: { family: 'Inter, sans-serif', size: 10 },
            }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>

        {/* Accuracy Comparison */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Accuracy % (Higher is Better)</h4>
          <Plot
            data={[
              {
                x: modelNames,
                y: accuracyValues,
                type: 'bar',
                marker: { color: ['#8b5cf6', '#f59e0b'] },
              },
            ]}
            layout={{
              height: 200,
              margin: { t: 10, r: 10, b: 40, l: 40 },
              xaxis: { title: 'Model' },
              yaxis: { title: 'Accuracy %', range: [80, 90] },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              font: { family: 'Inter, sans-serif', size: 10 },
            }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>
      </div>

      {/* Metrics Table */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Detailed Metrics</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">RMSE</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">MAE</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">MSE</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{metric.model_type.toUpperCase()}</td>
                  <td className="px-3 py-2 text-right text-gray-900">{metric.rmse.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right text-gray-900">{metric.mae.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right text-gray-900">{metric.mse.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-900">{(metric.accuracy * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
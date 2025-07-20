import React from 'react';
import { Download, FileText, Database } from 'lucide-react';
import { ForecastData } from '../types/ForecastTypes';
import { ApiService } from '../services/ApiService';

interface ExportControlsProps {
  forecastData: ForecastData | null;
  selectedModel: 'sarima' | 'lstm';
}

export const ExportControls: React.FC<ExportControlsProps> = ({ forecastData, selectedModel }) => {
  const handleExportAPI = async () => {
    try {
      await ApiService.exportForecast(selectedModel);
    } catch (error) {
      console.error('Error exporting via API:', error);
      // Fallback to local export
      handleExportCSV();
    }
  };

  const handleExportCSV = () => {
    if (!forecastData) return;

    const headers = ['Date', 'Forecasted Revenue', 'Growth 5%', 'Growth 10%', 'Decline 5%'];
    const rows = forecastData.forecasts.map(forecast => [
      forecast.date,
      forecast.forecasted_revenue,
      forecast.growth_5,
      forecast.growth_10,
      forecast.decline_5,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-forecast-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!forecastData) return;

    const jsonContent = JSON.stringify(forecastData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-forecast-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportAPI}
        disabled={!forecastData}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Database className="w-4 h-4" />
        Export from API
      </button>
      <button
        onClick={handleExportCSV}
        disabled={!forecastData}
        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  );
};
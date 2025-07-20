import React from 'react';
import { format } from 'date-fns';
import { ForecastData } from '../types/ForecastTypes';

interface ForecastTableProps {
  forecastData: ForecastData | null;
  isLoading: boolean;
}

export const ForecastTable: React.FC<ForecastTableProps> = ({
  forecastData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Details</h3>
      
      <div className="overflow-y-auto max-h-96">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Forecast
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Growth +5%
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {forecastData.forecasts.map((forecast, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(forecast.date), 'MMM yyyy')}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(forecast.forecasted_revenue)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                  {formatCurrency(forecast.growth_5)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { ForecastData } from '../types/ForecastTypes';

interface MetricsCardsProps {
  forecastData: ForecastData | null;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ forecastData }) => {
  if (!forecastData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { forecasts, metrics } = forecastData;
  const totalRevenue = forecasts.reduce((sum, f) => sum + f.forecasted_revenue, 0);
  const avgMonthly = totalRevenue / forecasts.length;
  const maxRevenue = Math.max(...forecasts.map(f => f.forecasted_revenue));
  const minRevenue = Math.min(...forecasts.map(f => f.forecasted_revenue));

  const cards = [
    {
      title: 'Total Forecast (12M)',
      value: totalRevenue,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      format: 'currency',
    },
    {
      title: 'Average Monthly',
      value: avgMonthly,
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-50',
      format: 'currency',
    },
    {
      title: 'Peak Revenue',
      value: maxRevenue,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      format: 'currency',
    },
    {
      title: 'Model Accuracy',
      value: metrics.accuracy || 0.85,
      icon: TrendingDown,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      format: 'percentage',
    },
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (format === 'percentage') {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatValue(card.value, card.format)}
              </p>
            </div>
            <div className={`${card.bg} ${card.color} p-3 rounded-full`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
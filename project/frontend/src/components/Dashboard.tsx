import React from 'react';
import { ForecastChart } from '.src/ForecastChart';
import { ForecastTable } from './ForecastTable';
import { HistoricalChart } from './HistoricalChart';
import { ModelComparison } from './ModelComparison';
import { ScenarioPlanner } from './ScenarioPlanner';
import { ModelSelector } from './ModelSelector';
import { MetricsCards } from './MetricsCards';
import { ExportControls } from './ExportControls';
import { PeriodSelector } from './src/PeriodSelector';
import { ForecastData } from '../types/ForecastTypes';

interface DashboardProps {
  forecastData: ForecastData | null;
  selectedModel: 'sarima' | 'lstm';
  forecastPeriods: number;
  onModelChange: (model: 'sarima' | 'lstm') => void;
  onPeriodsChange: (periods: number) => void;
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  forecastData,
  selectedModel,
  forecastPeriods,
  onModelChange,
  onPeriodsChange,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Forecasting Dashboard</h1>
          <p className="text-gray-600 mt-1">AI-powered revenue projections with scenario planning</p>
        </div>
        <div className="flex items-center gap-4">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            isLoading={isLoading}
          />
          <PeriodSelector
            selectedPeriods={forecastPeriods}
            onPeriodsChange={onPeriodsChange}
            isLoading={isLoading}
          />
          <ExportControls 
            forecastData={forecastData} 
            selectedModel={selectedModel} 
          />
        </div>
      </div>

      <MetricsCards forecastData={forecastData} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <HistoricalChart />
        <ModelComparison />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ForecastChart
            forecastData={forecastData}
            selectedModel={selectedModel}
            isLoading={isLoading}
          />
        </div>
        <div className="xl:col-span-1">
          <div className="space-y-6">
            <ForecastTable
              forecastData={forecastData}
              isLoading={isLoading}
            />
            <ScenarioPlanner forecastData={forecastData} />
          </div>
        </div>
      </div>
    </div>
  );
};
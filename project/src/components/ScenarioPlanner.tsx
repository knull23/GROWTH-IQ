import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ApiService, ScenarioData } from '../services/ApiService';
import { ForecastData } from '../types/ForecastTypes';

interface ScenarioPlannerProps {
  forecastData: ForecastData | null;
}

export const ScenarioPlanner: React.FC<ScenarioPlannerProps> = ({ forecastData }) => {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getScenarioData();
      setScenarios(data);
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const calculateScenarioRevenue = (scenario: ScenarioData) => {
    if (!forecastData) return 0;
    
    const totalRevenue = forecastData.forecasts.reduce((sum, f) => sum + f.forecasted_revenue, 0);
    return totalRevenue * (1 + scenario.growth_rate);
  };

  const getScenarioIcon = (growthRate: number) => {
    if (growthRate > 0) return TrendingUp;
    if (growthRate < 0) return TrendingDown;
    return Minus;
  };

  const getScenarioColor = (growthRate: number) => {
    if (growthRate > 0.05) return 'text-green-600 bg-green-50';
    if (growthRate > 0) return 'text-blue-600 bg-blue-50';
    if (growthRate < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Scenario Planning
      </h3>
      
      <div className="space-y-3">
        {scenarios.map((scenario, index) => {
          const Icon = getScenarioIcon(scenario.growth_rate);
          const colorClass = getScenarioColor(scenario.growth_rate);
          const revenue = calculateScenarioRevenue(scenario);
          
          return (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {scenario.scenario.replace('_', ' ')} Scenario
                    </h4>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(revenue)}
                  </div>
                  <div className={`text-sm font-medium ${
                    scenario.growth_rate > 0 ? 'text-green-600' : 
                    scenario.growth_rate < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {scenario.growth_rate > 0 ? '+' : ''}{(scenario.growth_rate * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {forecastData && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Base Forecast:</strong> {' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(forecastData.forecasts.reduce((sum, f) => sum + f.forecasted_revenue, 0))}
            {' '}over 12 months using {forecastData.model.toUpperCase()} model
          </p>
        </div>
      )}
    </div>
  );
};
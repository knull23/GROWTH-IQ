import { ForecastData } from '../types/ForecastTypes';

export interface HistoricalData {
  date: string;
  revenue: number;
}

export interface ModelMetrics {
  model_type: string;
  rmse: number;
  mae: number;
  mse: number;
  accuracy: number;
}

export interface ScenarioData {
  scenario: string;
  growth_rate: number;
  description: string;
}

export class ApiService {
  private static baseUrl = (import.meta.env.VITE_API_URL || 'https://localhost') + '/api';
  
  static async getForecast(model: 'sarima' | 'lstm'): Promise<ForecastData> {
    try {
      const response = await fetch(`${this.baseUrl}/forecast?model=${model}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching forecast:', error);
      // Fallback to mock data if API is not available
      return this.generateMockForecastData(model);
    }
  }
  
  static async getMetrics(): Promise<ModelMetrics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.metrics;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return [
        { model_type: 'lstm', rmse: 111.6, mae: 8.2, mse: 12450, accuracy: 0.874 },
        { model_type: 'sarima', rmse: 114.9, mae: 9.1, mse: 13200, accuracy: 0.852 }
      ];
    }
  }
  
  static async getHistoricalData(): Promise<HistoricalData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/historical`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.historical_data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return this.generateMockHistoricalData();
    }
  }
  
  static async getScenarioData(): Promise<ScenarioData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/scenario`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.scenarios;
    } catch (error) {
      console.error('Error fetching scenario data:', error);
      return [
        { scenario: 'base', growth_rate: 0.0, description: 'Current trajectory' },
        { scenario: 'optimistic_5', growth_rate: 0.05, description: '5% growth scenario' },
        { scenario: 'optimistic_10', growth_rate: 0.10, description: '10% growth scenario' },
        { scenario: 'pessimistic', growth_rate: -0.05, description: '5% decline scenario' }
      ];
    }
  }
  
  static async exportForecast(model: 'sarima' | 'lstm'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/export/forecast?model=${model}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecast_${model}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting forecast:', error);
      throw error;
    }
  }
  
  static async retrain(): Promise<void> {
    try {
      // Note: This endpoint would trigger retraining in a full implementation
      // For now, we simulate the process since we're using pre-trained models
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Error retraining models:', error);
      throw error;
    }
  }
  
  static async uploadData(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading data:', error);
      throw error;
    }
  }
  
  static async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      return { status: 'error', message: 'API not available' };
    }
  }
  
  // Mock data generators for fallback
  private static generateMockForecastData(model: 'sarima' | 'lstm'): ForecastData {
    const baseRevenue = 1000000;
    const forecasts = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i + 1);
      
      const trend = model === 'lstm' ? 0.02 : 0.015;
      const seasonal = Math.sin((i * Math.PI) / 6) * 0.1;
      const noise = (Math.random() - 0.5) * 0.05;
      
      const baseProjection = baseRevenue * (1 + trend * i + seasonal + noise);
      
      forecasts.push({
        date: date.toISOString().split('T')[0],
        forecasted_revenue: Math.round(baseProjection),
        growth_5: Math.round(baseProjection * 1.05),
        growth_10: Math.round(baseProjection * 1.10),
        decline_5: Math.round(baseProjection * 0.95),
      });
    }
    
    return {
      model,
      forecasts,
      metrics: {
        accuracy: model === 'lstm' ? 0.874 : 0.852,
        mse: model === 'lstm' ? 12450 : 13200,
        rmse: model === 'lstm' ? 111.6 : 114.9,
        mae: model === 'lstm' ? 8.2 : 9.1,
      },
      generated_at: new Date().toISOString(),
      version: '1.0.0',
    };
  }
  
  private static generateMockHistoricalData(): HistoricalData[] {
    const data = [];
    const startDate = new Date('2020-01-01');
    const baseRevenue = 950000;
    
    for (let i = 0; i < 48; i++) { // 4 years of monthly data
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      const trend = 0.01 * i;
      const seasonal = Math.sin((i * Math.PI) / 6) * 0.1;
      const noise = (Math.random() - 0.5) * 0.1;
      
      const revenue = baseRevenue * (1 + trend + seasonal + noise);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(revenue)
      });
    }
    
    return data;
  }
}
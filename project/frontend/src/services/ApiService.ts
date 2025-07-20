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
  private static baseUrl = 'http://localhost:5000/api';
  
  static async getForecast(model: 'sarima' | 'lstm', periods: number = 12): Promise<ForecastData> {
    try {
      const response = await fetch(`${this.baseUrl}/forecast?model=${model}&periods=${periods}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
}
export interface ForecastPoint {
  date: string;
  forecasted_revenue: number;
  growth_5: number;
  growth_10: number;
  decline_5: number;
}

export interface ForecastMetrics {
  accuracy: number;
  mse: number;
  rmse: number;
  mae: number;
}

export interface ForecastData {
  model: 'sarima' | 'lstm';
  forecasts: ForecastPoint[];
  metrics: ForecastMetrics;
  generated_at: string;
  version: string;
}
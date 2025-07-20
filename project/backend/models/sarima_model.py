import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.stats.diagnostic import acorr_ljungbox
from sklearn.metrics import mean_squared_error, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

class SARIMAForecaster:
    def __init__(self, order=(1, 1, 1), seasonal_order=(1, 1, 1, 12)):
        """
        Initialize SARIMA model
        
        Args:
            order: (p, d, q) parameters for ARIMA
            seasonal_order: (P, D, Q, s) parameters for seasonal component
        """
        self.order = order
        self.seasonal_order = seasonal_order
        self.model = None
        self.fitted_model = None
        self.is_fitted = False
    
    def prepare_data(self, data):
        """Prepare time series data for modeling"""
        if isinstance(data, pd.DataFrame):
            # Assume first column is date, second is revenue
            data = data.copy()
            data.columns = ['date', 'revenue']
            data['date'] = pd.to_datetime(data['date'])
            data = data.set_index('date')
            data = data.asfreq('MS')  # Monthly start frequency
        
        return data['revenue']
    
    def fit(self, data):
        """Fit SARIMA model to training data"""
        try:
            ts_data = self.prepare_data(data)
            
            # Initialize and fit SARIMA model
            self.model = SARIMAX(
                ts_data,
                order=self.order,
                seasonal_order=self.seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False
            )
            
            self.fitted_model = self.model.fit(disp=False)
            self.is_fitted = True
            
            return self.fitted_model
            
        except Exception as e:
            print(f"Error fitting SARIMA model: {e}")
            raise
    
    def forecast(self, steps=12):
        """Generate forecasts for specified number of steps"""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before forecasting")
        
        try:
            # Generate forecast
            forecast_result = self.fitted_model.forecast(steps=steps)
            confidence_int = self.fitted_model.get_forecast(steps=steps).conf_int()
            
            # Create forecast dates
            last_date = self.fitted_model.data.dates[-1]
            forecast_dates = pd.date_range(
                start=last_date + pd.DateOffset(months=1),
                periods=steps,
                freq='MS'
            )
            
            # Create forecast DataFrame
            forecasts = pd.DataFrame({
                'date': forecast_dates,
                'forecasted_revenue': forecast_result.values,
                'lower_bound': confidence_int.iloc[:, 0].values,
                'upper_bound': confidence_int.iloc[:, 1].values
            })
            
            # Add scenario projections
            forecasts['growth_5'] = forecasts['forecasted_revenue'] * 1.05
            forecasts['growth_10'] = forecasts['forecasted_revenue'] * 1.10
            forecasts['decline_5'] = forecasts['forecasted_revenue'] * 0.95
            
            return forecasts
            
        except Exception as e:
            print(f"Error generating forecasts: {e}")
            raise
    
    def evaluate(self, test_data):
        """Evaluate model performance on test data"""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before evaluation")
        
        try:
            ts_test = self.prepare_data(test_data)
            
            # Generate predictions for test period
            start_date = ts_test.index[0]
            end_date = ts_test.index[-1]
            
            predictions = self.fitted_model.predict(start=start_date, end=end_date)
            
            # Calculate metrics
            mse = mean_squared_error(ts_test, predictions)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(ts_test, predictions)
            
            # Calculate accuracy as 1 - MAPE
            mape = np.mean(np.abs((ts_test - predictions) / ts_test)) * 100
            accuracy = max(0, 1 - (mape / 100))
            
            return {
                'mse': mse,
                'rmse': rmse,
                'mae': mae,
                'mape': mape,
                'accuracy': accuracy
            }
            
        except Exception as e:
            print(f"Error evaluating model: {e}")
            raise
    
    def diagnostics(self):
        """Perform model diagnostics"""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before running diagnostics")
        
        try:
            # Residual analysis
            residuals = self.fitted_model.resid
            
            # Ljung-Box test for residual autocorrelation
            lb_stat, lb_pvalue = acorr_ljungbox(residuals, lags=10, return_df=False)
            
            # AIC and BIC
            aic = self.fitted_model.aic
            bic = self.fitted_model.bic
            
            return {
                'aic': aic,
                'bic': bic,
                'ljung_box_stat': lb_stat,
                'ljung_box_pvalue': lb_pvalue,
                'residual_mean': np.mean(residuals),
                'residual_std': np.std(residuals)
            }
            
        except Exception as e:
            print(f"Error running diagnostics: {e}")
            raise
    
    def save_model(self, filepath):
        """Save trained model to file"""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before saving")
        
        try:
            self.fitted_model.save(filepath)
            print(f"Model saved to {filepath}")
            
        except Exception as e:
            print(f"Error saving model: {e}")
            raise
    
    def load_model(self, filepath):
        """Load trained model from file"""
        try:
            from statsmodels.tsa.statespace.sarimax import SARIMAXResults
            self.fitted_model = SARIMAXResults.load(filepath)
            self.is_fitted = True
            print(f"Model loaded from {filepath}")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
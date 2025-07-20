import pandas as pd
import numpy as np
from fredapi import Fred
from datetime import datetime, timedelta
import os
from typing import Dict, List, Optional

class FREDDataService:
    """Service for fetching and processing economic data from FRED API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize FRED API service
        
        Args:
            api_key: FRED API key. If None, will look for FRED_API_KEY environment variable
        """
        self.api_key = api_key or os.environ.get('FRED_API_KEY')
        if not self.api_key:
            raise ValueError("FRED API key is required. Set FRED_API_KEY environment variable.")
        
        self.fred = Fred(api_key=self.api_key)
        
        # Economic indicators relevant for revenue forecasting
        self.indicators = {
            'gdp': 'GDP',  # Gross Domestic Product
            'unemployment': 'UNRATE',  # Unemployment Rate
            'inflation': 'CPIAUCSL',  # Consumer Price Index
            'consumer_confidence': 'UMCSENT',  # Consumer Sentiment
            'industrial_production': 'INDPRO',  # Industrial Production Index
            'retail_sales': 'RSXFS',  # Retail Sales
            'housing_starts': 'HOUST',  # Housing Starts
            'federal_funds_rate': 'FEDFUNDS',  # Federal Funds Rate
            'stock_market': 'SP500',  # S&P 500
            'dollar_index': 'DTWEXBGS',  # Trade Weighted Dollar Index
        }
    
    def fetch_indicator(self, indicator_code: str, start_date: str = None, end_date: str = None) -> pd.DataFrame:
        """
        Fetch a single economic indicator from FRED
        
        Args:
            indicator_code: FRED series ID
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            
        Returns:
            DataFrame with date index and indicator values
        """
        try:
            # Set default date range if not provided
            if not start_date:
                start_date = (datetime.now() - timedelta(days=365*10)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            
            # Fetch data
            data = self.fred.get_series(
                indicator_code,
                start=start_date,
                end=end_date
            )
            
            # Convert to DataFrame
            df = pd.DataFrame({
                'date': data.index,
                'value': data.values
            })
            
            # Clean data
            df = df.dropna()
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            return df
            
        except Exception as e:
            print(f"Error fetching indicator {indicator_code}: {e}")
            return pd.DataFrame()
    
    def fetch_multiple_indicators(self, indicators: List[str], start_date: str = None, end_date: str = None) -> pd.DataFrame:
        """
        Fetch multiple economic indicators and combine them
        
        Args:
            indicators: List of FRED series IDs
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            
        Returns:
            DataFrame with date index and multiple indicator columns
        """
        try:
            combined_data = pd.DataFrame()
            
            for indicator in indicators:
                df = self.fetch_indicator(indicator, start_date, end_date)
                if not df.empty:
                    if combined_data.empty:
                        combined_data = df.copy()
                        combined_data = combined_data.rename(columns={'value': indicator})
                    else:
                        df = df.rename(columns={'value': indicator})
                        combined_data = pd.merge(combined_data, df, on='date', how='outer')
            
            # Sort by date
            combined_data = combined_data.sort_values('date')
            
            return combined_data
            
        except Exception as e:
            print(f"Error fetching multiple indicators: {e}")
            return pd.DataFrame()
    
    def get_economic_dashboard_data(self) -> Dict:
        """
        Get key economic indicators for dashboard display
        
        Returns:
            Dictionary with current economic indicators
        """
        try:
            # Fetch recent data for key indicators
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
            
            dashboard_data = {}
            
            for name, code in self.indicators.items():
                df = self.fetch_indicator(code, start_date, end_date)
                if not df.empty:
                    latest_value = df.iloc[-1]['value']
                    previous_value = df.iloc[-2]['value'] if len(df) > 1 else latest_value
                    
                    dashboard_data[name] = {
                        'current': latest_value,
                        'previous': previous_value,
                        'change': latest_value - previous_value,
                        'change_percent': ((latest_value - previous_value) / previous_value * 100) if previous_value != 0 else 0,
                        'last_updated': df.iloc[-1]['date'].strftime('%Y-%m-%d')
                    }
            
            return dashboard_data
            
        except Exception as e:
            print(f"Error getting dashboard data: {e}")
            return {}
    
    def create_economic_features(self, start_date: str = None, end_date: str = None) -> pd.DataFrame:
        """
        Create feature matrix from economic indicators for ML models
        
        Args:
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            
        Returns:
            DataFrame with economic features
        """
        try:
            # Fetch all indicators
            indicators_to_fetch = list(self.indicators.values())
            data = self.fetch_multiple_indicators(indicators_to_fetch, start_date, end_date)
            
            if data.empty:
                return pd.DataFrame()
            
            # Create additional features
            data['month'] = pd.to_datetime(data['date']).dt.month
            data['quarter'] = pd.to_datetime(data['date']).dt.quarter
            data['year'] = pd.to_datetime(data['date']).dt.year
            
            # Calculate moving averages
            for col in data.columns:
                if col not in ['date', 'month', 'quarter', 'year']:
                    data[f'{col}_ma3'] = data[col].rolling(window=3).mean()
                    data[f'{col}_ma6'] = data[col].rolling(window=6).mean()
                    data[f'{col}_ma12'] = data[col].rolling(window=12).mean()
            
            # Calculate year-over-year changes
            for col in data.columns:
                if col not in ['date', 'month', 'quarter', 'year'] and not col.endswith('_ma3') and not col.endswith('_ma6') and not col.endswith('_ma12'):
                    data[f'{col}_yoy'] = data[col].pct_change(periods=12) * 100
            
            # Drop rows with NaN values
            data = data.dropna()
            
            return data
            
        except Exception as e:
            print(f"Error creating economic features: {e}")
            return pd.DataFrame()
    
    def get_recession_indicators(self) -> pd.DataFrame:
        """
        Get recession probability indicators
        
        Returns:
            DataFrame with recession indicators
        """
        try:
            # Fetch recession probability indicators
            recession_indicators = {
                'recession_prob': 'RECPROUSM156N',  # US Recession Probabilities
                'yield_curve': 'T10Y2Y',  # 10-Year Treasury Constant Maturity Minus 2-Year Treasury Constant Maturity
                'unemployment_rate': 'UNRATE',  # Unemployment Rate
                'initial_claims': 'ICSA',  # Initial Claims
            }
            
            data = self.fetch_multiple_indicators(
                list(recession_indicators.values()),
                start_date=(datetime.now() - timedelta(days=365*5)).strftime('%Y-%m-%d')
            )
            
            if not data.empty:
                # Rename columns to meaningful names
                column_mapping = {v: k for k, v in recession_indicators.items()}
                data = data.rename(columns=column_mapping)
                
                # Calculate recession risk score
                data['recession_risk_score'] = 0
                
                # Add points for various risk factors
                if 'recession_prob' in data.columns:
                    data['recession_risk_score'] += data['recession_prob'] * 0.4
                
                if 'yield_curve' in data.columns:
                    data['recession_risk_score'] += np.where(data['yield_curve'] < 0, 30, 0)
                
                if 'unemployment_rate' in data.columns:
                    data['recession_risk_score'] += np.where(data['unemployment_rate'] > 5, 20, 0)
                
                if 'initial_claims' in data.columns:
                    data['recession_risk_score'] += np.where(data['initial_claims'] > 400000, 10, 0)
                
                # Cap the score at 100
                data['recession_risk_score'] = np.minimum(data['recession_risk_score'], 100)
            
            return data
            
        except Exception as e:
            print(f"Error getting recession indicators: {e}")
            return pd.DataFrame()
    
    def test_api_connection(self) -> bool:
        """
        Test FRED API connection
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            # Try to fetch a simple indicator
            test_data = self.fred.get_series('GDP', limit=1)
            return len(test_data) > 0
            
        except Exception as e:
            print(f"FRED API connection test failed: {e}")
            return False
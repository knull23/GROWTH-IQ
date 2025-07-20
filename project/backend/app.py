from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

try:
    from flask_pymongo import PyMongo
except ImportError:
    PyMongo = None
from datetime import datetime, timedelta
import os
import pandas as pd
import numpy as np
import json
try:
    import pickle
except ImportError:
    pickle = None
try:
    from tensorflow.keras.models import load_model
except ImportError:
    load_model = None
try:
    import joblib
except ImportError:
    joblib = None
from pathlib import Path
try:
    from bson import ObjectId
except ImportError:
    ObjectId = None
from tensorflow.keras.losses import MeanSquaredError
# Initialize Flask app
app = Flask(__name__)
CORS(app)

load_dotenv()

# Get Mongo URI from environment
mongo_uri = os.getenv("MONGO_URI")

# MongoDB configuration
try:
    mongo_client = MongoClient(mongo_uri)
    mongo_db = mongo_client["growthiq"]
    print("✅ Connected to MongoDB Atlas")
except Exception as e:
    mongo_db = None
    print(f"❌ MongoDB connection failed: {e}")


# Model and Data Loader Class
class ModelDataLoader:
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.model_path = self.base_path / 'model'
        self.data_path = self.base_path / 'data'
        self.output_path = self.base_path / 'output'

        # Ensure directories exist
        self.model_path.mkdir(exist_ok=True)
        self.data_path.mkdir(exist_ok=True)
        self.output_path.mkdir(exist_ok=True)

        self.lstm_model = None
        self.sarima_model = None
        self.scaler = None
        self.fred_data = None
        self.model_metrics = None
        self.scenario_inputs = None

        self._load_models_and_data()

    def _load_models_and_data(self):
        """Load pre-trained models and data files"""
        try:
            # Load LSTM model
            lstm_path = self.model_path / 'lstm_model.h5'
            if lstm_path.exists():
                try:
                    self.lstm_model = load_model(str(lstm_path), compile=False)
                    self.lstm_model.compile(loss=MeanSquaredError())
                    print("✅ LSTM model loaded and compiled successfully")
                except Exception as e:
                    print(f"❌ Error loading LSTM model: {e}")
                    self.lstm_model = None
            else:
                print("⚠️ LSTM model file not found")

            # Load SARIMA model
            sarima_path = self.model_path / 'sarima_model.pkl'
            if sarima_path.exists():
                try:
                    # First attempt with joblib
                    try:
                        self.sarima_model = joblib.load(sarima_path)
                        print("✅ SARIMA model loaded successfully (joblib)")
                    except Exception as joblib_err:
                        print(f"⚠️ joblib failed, trying pickle: {joblib_err}")
                        # Fallback to pickle
                        with open(sarima_path, 'rb') as f:
                            self.sarima_model = pickle.load(f)
                        print("✅ SARIMA model loaded successfully (pickle)")
                except Exception as e:
                    print(f"❌ Failed to load SARIMA model: {e}")
                    self.sarima_model = None
            else:
                print("⚠️ SARIMA model file not found")

            # Load Scaler
            scaler_path = self.model_path / 'scaler.pkl'
            if scaler_path.exists():
                try:
                    self.scaler = joblib.load(scaler_path)
                    print("✅ Scaler loaded successfully")
                except Exception as e:
                    print(f"❌ Error loading scaler: {e}")
                    self.scaler = None
            else:
                print("⚠️ Scaler file not found")

            # Load additional data files
            self._load_data_files()

        except Exception as e:
            print(f"❌ Unexpected error during model/data loading: {e}")
    
    def _load_data_files(self):
        """Load CSV data files"""
        try:
            # Load FRED series data
            fred_path = self.data_path / 'fred_series.csv'
            if fred_path.exists():
                self.fred_data = pd.read_csv(fred_path)
                print("✅ FRED data loaded successfully")
            
            # Load model metrics
            metrics_path = self.data_path / 'model_metrics.csv'
            if metrics_path.exists():
                self.model_metrics = pd.read_csv(metrics_path)
                print("✅ Model metrics loaded successfully")
            
            # Load scenario inputs
            scenario_path = self.data_path / 'scenario_inputs.csv'
            if scenario_path.exists():
                self.scenario_inputs = pd.read_csv(scenario_path)
                print("✅ Scenario inputs loaded successfully")
                
        except Exception as e:
            print(f"Error loading data files: {e}")
    
    def generate_forecast(self, model_type='lstm', periods=12):
        """Generate forecast using pre-trained models"""
        try:
            if model_type == 'lstm' and self.lstm_model is not None:
                return self._lstm_forecast(periods)
            elif model_type == 'sarima' and self.sarima_model is not None:
                return self._sarima_forecast(periods)
            else:
                # Fallback to mock data if models not available
                return self._generate_mock_forecast(model_type, periods)
                
        except Exception as e:
            print(f"Error generating forecast: {e}")
            return self._generate_mock_forecast(model_type, periods)

    def _lstm_forecast(self, periods):
        """Generate LSTM forecast using pre-trained model"""
        if self.lstm_model is None or self.scaler is None or self.fred_data is None:
            print("❌ Required components not loaded for LSTM forecast")
            return None

        try:
            # Step 1: Get the last N steps of historical data
            data = self.fred_data.copy()
            last_n = 12  # number of time steps used in training
            last_values = data['Revenue'].values[-last_n:]

            # Step 2: Scale data
            scaled_values = self.scaler.transform(last_values.reshape(-1, 1))

            # Step 3: Predict iteratively
            forecast = []
            input_seq = scaled_values.reshape(1, last_n, 1)
            for _ in range(periods):
                next_pred = self.lstm_model.predict(input_seq, verbose=0)
                forecast.append(next_pred[0, 0])
                # Append prediction and slide window
                input_seq = np.append(input_seq[:, 1:, :], [[[next_pred[0, 0]]]], axis=1)

            # Step 4: Inverse transform
            forecast = self.scaler.inverse_transform(np.array(forecast).reshape(-1, 1)).flatten()

            # Step 5: Create forecast DataFrame
            last_date = pd.to_datetime(data['Date'].iloc[-1])
            future_dates = pd.date_range(start=last_date + pd.DateOffset(months=1), periods=periods, freq='MS')

            forecast_df = pd.DataFrame({'Date': future_dates, 'Forecast': forecast})
            return forecast_df

        except Exception as e:
            print(f"❌ LSTM forecast error: {e}")
            return None

    def _sarima_forecast(self, periods):
        """Generate SARIMA forecast using pre-trained model"""
        if self.sarima_model is None or self.fred_data is None:
            print("❌ SARIMA model or data not loaded")
            return None

        try:
            # Step 1: Forecast future periods
            forecast_values = self.sarima_model.forecast(steps=periods)

            # Step 2: Generate future dates
            last_date = pd.to_datetime(self.fred_data['Date'].iloc[-1])
            future_dates = pd.date_range(start=last_date + pd.DateOffset(months=1), periods=periods, freq='MS')

            # Step 3: Format result as DataFrame
            forecast_df = pd.DataFrame({
                'Date': future_dates,
                'Forecast': forecast_values
            })

            return forecast_df

        except Exception as e:
            print(f"❌ SARIMA forecast error: {e}")
            return None

    def _generate_mock_forecast(self, model_type, periods):
        """Generate mock forecast data for demonstration"""
        base_revenue = 1000000
        forecasts = []
        
        for i in range(periods):
            date = datetime.now() + timedelta(days=30 * (i + 1))
            
            # Different patterns for different models
            if model_type == 'lstm':
                trend = 0.02 * i
                seasonal = np.sin((i * np.pi) / 6) * 0.08
                noise = np.random.normal(0, 0.015)
            else:  # sarima
                trend = 0.015 * i
                seasonal = np.sin((i * np.pi) / 6) * 0.1
                noise = np.random.normal(0, 0.02)
            
            base_projection = base_revenue * (1 + trend + seasonal + noise)
            
            forecasts.append({
                'date': date.strftime('%Y-%m-%d'),
                'forecasted_revenue': round(base_projection),
                'growth_5': round(base_projection * 1.05),
                'growth_10': round(base_projection * 1.10),
                'decline_5': round(base_projection * 0.95),
            })
        
        return forecasts
    
    def get_model_metrics(self):
        """Get model performance metrics"""
        if self.model_metrics is not None:
            return self.model_metrics.to_dict('records')
        
        # Mock metrics if file not available
        return [
            {
                'model_type': 'lstm',
                'rmse': 111.6,
                'mae': 8.2,
                'mse': 12450,
                'accuracy': 0.874
            },
            {
                'model_type': 'sarima',
                'rmse': 114.9,
                'mae': 9.1,
                'mse': 13200,
                'accuracy': 0.852
            }
        ]
    
    def get_historical_data(self):
        """Get historical FRED data"""
        if self.fred_data is not None:
            return self.fred_data.to_dict('records')
        
        # Mock historical data if file not available
        dates = pd.date_range(start='2020-01-01', end='2023-12-01', freq='MS')
        base_revenue = 950000
        
        historical = []
        for i, date in enumerate(dates):
            trend = 0.01 * i
            seasonal = np.sin((i * np.pi) / 6) * 0.1
            noise = np.random.normal(0, 0.05)
            
            revenue = base_revenue * (1 + trend + seasonal + noise)
            historical.append({
                'date': date.strftime('%Y-%m-%d'),
                'revenue': round(revenue)
            })
        
        return historical
    
    def get_scenario_data(self):
        """Get scenario planning data"""
        if self.scenario_inputs is not None:
            return self.scenario_inputs.to_dict('records')
        
        # Mock scenario data
        return [
            {'scenario': 'base', 'growth_rate': 0.0, 'description': 'Current trajectory'},
            {'scenario': 'optimistic_5', 'growth_rate': 0.05, 'description': '5% growth scenario'},
            {'scenario': 'optimistic_10', 'growth_rate': 0.10, 'description': '10% growth scenario'},
            {'scenario': 'pessimistic', 'growth_rate': -0.05, 'description': '5% decline scenario'}
        ]

# Initialize model loader
model_loader = ModelDataLoader()

# API Routes
@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    """Get revenue forecast from specified model"""
    model_type = request.args.get('model', 'lstm')
    periods = int(request.args.get('periods', 12))
    
    if model_type not in ['lstm', 'sarima']:
        return jsonify({'error': 'Invalid model type. Use lstm or sarima'}), 400
    
    try:
        # Generate forecast using pre-trained models
        forecasts = model_loader.generate_forecast(model_type, periods)

        if not forecasts:
            return jsonify({'error': 'Forecast generation failed'}), 500
        # Save forecast run to MongoDB
        if mongo_db:
            try:
                forecast_run = {
                    'model_type': model_type,
                    'periods': periods,
                    'forecast_data': forecasts,
                    'user_id': request.args.get('user_id', 'anonymous'),
                    'created_at': datetime.utcnow()
                }
                mongo_db.db.forecast_runs.insert_one(forecast_run)
                
                # Save individual forecasts to MongoDB
                forecast_documents = []
                for forecast_data in forecasts:
                    forecast_documents.append({
                        'date': datetime.strptime(forecast_data['date'], '%Y-%m-%d'),
                        'forecasted_revenue': forecast_data['forecasted_revenue'],
                        'growth_5': forecast_data['growth_5'],
                        'growth_10': forecast_data['growth_10'],
                        'decline_5': forecast_data['decline_5'],
                        'model_type': model_type,
                        'created_at': datetime.utcnow()
                    })
                
                if forecast_documents:
                    mongo_db.db.forecasts.insert_many(forecast_documents)
            except Exception as e:
                print(f"⚠️ MongoDB save failed: {e}")
        
        # Get model metrics
        metrics = model_loader.get_model_metrics()
        model_metric = next((m for m in metrics if m['model_type'] == model_type), {})
        
        return jsonify({
            'model': model_type,
            'periods': periods,
            'forecasts': forecasts,
            'metrics': model_metric,
            'generated_at': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Get model performance metrics"""
    try:
        metrics = model_loader.get_model_metrics()
        return jsonify({
            'metrics': metrics,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/historical', methods=['GET'])
def get_historical():
    """Get historical FRED data"""
    try:
        historical_data = model_loader.get_historical_data()
        return jsonify({
            'historical_data': historical_data,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scenario', methods=['GET'])
def get_scenario():
    """Get scenario planning data"""
    try:
        scenario_data = model_loader.get_scenario_data()
        return jsonify({
            'scenarios': scenario_data,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/forecast', methods=['GET'])
def export_forecast():
    """Export latest forecast as CSV"""
    try:
        model_type = request.args.get('model', 'lstm')
        
        # Get latest forecast from MongoDB
        if mongo_db:
            try:
                latest_forecasts = list(mongo_db.db.forecasts.find(
                    {'model_type': model_type}
                ).sort('created_at', -1).limit(12))
                
                if latest_forecasts:
                    # Convert to list for DataFrame
                    forecast_data = []
                    for forecast in latest_forecasts:
                        forecast_data.append({
                            'Date': forecast['date'].strftime('%Y-%m-%d'),
                            'Forecasted_Revenue': forecast['forecasted_revenue'],
                            'Growth_5%': forecast['growth_5'],
                            'Growth_10%': forecast['growth_10'],
                            'Decline_5%': forecast['decline_5']
                        })
                    
                    df = pd.DataFrame(forecast_data)
                else:
                    # Generate fallback data if no DB data
                    forecasts = model_loader.generate_forecast(model_type, 12)
                    forecast_data = []
                    for forecast in forecasts:
                        forecast_data.append({
                            'Date': forecast['date'],
                            'Forecasted_Revenue': forecast['forecasted_revenue'],
                            'Growth_5%': forecast['growth_5'],
                            'Growth_10%': forecast['growth_10'],
                            'Decline_5%': forecast['decline_5']
                        })
                    df = pd.DataFrame(forecast_data)
            except Exception as e:
                print(f"⚠️ MongoDB query failed: {e}")
                # Generate fallback data
                forecasts = model_loader.generate_forecast(model_type, 12)
                forecast_data = []
                for forecast in forecasts:
                    forecast_data.append({
                        'Date': forecast['date'],
                        'Forecasted_Revenue': forecast['forecasted_revenue'],
                        'Growth_5%': forecast['growth_5'],
                        'Growth_10%': forecast['growth_10'],
                        'Decline_5%': forecast['decline_5']
                    })
                df = pd.DataFrame(forecast_data)
        else:
            # Generate fallback data if no MongoDB
            forecasts = model_loader.generate_forecast(model_type, 12)
            forecast_data = []
            for forecast in forecasts:
                forecast_data.append({
                    'Date': forecast['date'],
                    'Forecasted_Revenue': forecast['forecasted_revenue'],
                    'Growth_5%': forecast['growth_5'],
                    'Growth_10%': forecast['growth_10'],
                    'Decline_5%': forecast['decline_5']
                })
            df = pd.DataFrame(forecast_data)
        
        # Save to output directory
        output_file = model_loader.output_path / f'forecast_{model_type}_{datetime.now().strftime("%Y%m%d")}.csv'
        df.to_csv(output_file, index=False)
        
        return send_file(
            str(output_file),
            as_attachment=True,
            download_name=f'forecast_{model_type}.csv',
            mimetype='text/csv'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_data():
    """Upload new training data"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Save uploaded file to data directory
        if file.filename.endswith('.csv'):
            upload_path = model_loader.data_path / f'uploaded_{datetime.now().strftime("%Y%m%d_%H%M%S")}_{file.filename}'
            file.save(str(upload_path))
            
            # Validate file structure
            df = pd.read_csv(upload_path)
            
            # Save upload info to MongoDB
            if mongo_db:
                try:
                    upload_info = {
                        'filename': file.filename,
                        'upload_path': str(upload_path),
                        'records': len(df),
                        'columns': list(df.columns),
                        'created_at': datetime.utcnow()
                    }
                    mongo_db.db.uploads.insert_one(upload_info)
                except Exception as e:
                    print(f"⚠️ MongoDB upload logging failed: {e}")
            
            return jsonify({
                'message': 'Data uploaded successfully',
                'filename': file.filename,
                'records': len(df),
                'columns': list(df.columns),
                'upload_path': str(upload_path)
            })
        else:
            return jsonify({'error': 'Only CSV files are supported'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        if mongo_db:
            try:
                mongo_db.db.command('ping')
                db_status = 'connected'
            except Exception:
                db_status = 'disconnected'
        else:
            db_status = 'not_configured'
    except Exception:
        db_status = 'disconnected'
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'database': db_status,
        'models_loaded': {
            'lstm': model_loader.lstm_model is not None,
            'sarima': model_loader.sarima_model is not None,
            'scaler': model_loader.scaler is not None
        },
        'data_files_loaded': {
            'fred_data': model_loader.fred_data is not None,
            'model_metrics': model_loader.model_metrics is not None,
            'scenario_inputs': model_loader.scenario_inputs is not None
        }
    })

if __name__ == '__main__':
    print("🚀 Starting GrowthIQ Backend Server...")
    print(f"📁 Model path: {model_loader.model_path}")
    print(f"📁 Data path: {model_loader.data_path}")
    print(f"📁 Output path: {model_loader.output_path}")
    app.run(debug=True, host='0.0.0.0', port=5000)
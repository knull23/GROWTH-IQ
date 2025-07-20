# GrowthIQ - Enterprise Revenue Forecasting Platform

GrowthIQ is a comprehensive AI-powered revenue forecasting platform that integrates with your **pre-trained machine learning models** (SARIMA and LSTM) to provide accurate revenue projections with scenario planning capabilities. The platform is designed to work with existing trained models and data files, focusing on integration and usability rather than model retraining.

## 🚀 Features

### Core Functionality
- **Pre-trained Model Integration**: Uses your existing SARIMA and LSTM models for accurate revenue predictions
- **Dynamic Forecast Periods**: Choose from 6, 12, 18, or 24-month forecasting horizons
- **Historical Data Visualization**: Interactive charts showing revenue trends from your FRED data
- **Model Performance Comparison**: Side-by-side comparison of LSTM vs SARIMA metrics
- **Scenario Planning**: Provides growth (+5%, +10%) and decline (-5%) scenarios
- **CSV Data Integration**: Works with your existing CSV data files (fred_series.csv, model_metrics.csv, etc.)
- **Interactive Dashboard**: Modern React-based interface with Plotly.js visualizations
- **Data Export**: API-driven CSV export capabilities for Power BI and Excel integration
- **Admin Panel**: Model management, retraining, and system monitoring

### Technical Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Plotly.js
- **Backend**: Python Flask with MongoDB integration
- **Database**: MongoDB with optimized collections and indexes
- **ML Models**: TensorFlow/Keras (LSTM) + Statsmodels (SARIMA)
- **Task Queue**: Celery with Redis for background processing
- **Deployment**: Docker containerization with Docker Compose

## 🛠️ Installation

### Prerequisites
- Your pre-trained model files (lstm_model.h5, sarima_model.pkl, scaler.pkl)
- Your CSV data files (fred_series.csv, model_metrics.csv, scenario_inputs.csv)
- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.11+ (for local development)

### Setting Up Your Models and Data

1. **Place your pre-trained models in the backend/model/ directory:**
```
backend/model/
├── lstm_model.h5      # Your trained LSTM model
├── sarima_model.pkl   # Your trained SARIMA model
└── scaler.pkl         # Your data scaler
```

2. **Place your CSV data files in the backend/data/ directory:**
```
backend/data/
├── fred_series.csv      # Historical revenue data (Date, Revenue)
├── model_metrics.csv    # Model performance (model_type, rmse, mae, mse, accuracy)
├── revenue_stats.csv    # Revenue statistics
└── scenario_inputs.csv  # Scenario planning data
```

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone https://github.com/your-org/growthiq.git
cd growthiq
```

2. **Set up environment variables**
```bash
# The .env file is already included with default values
# Edit .env file with your specific configuration if needed
```

3. **Place your model and data files**
```bash
# Copy your files to the appropriate directories
cp your_models/* backend/model/
cp your_data/* backend/data/
```

4. **Start the application**
```bash
docker-compose up -d
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Local Development Setup

1. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **MongoDB Setup**
```bash
# Install MongoDB locally or use Docker
docker run --name growthiq-db -e MONGO_INITDB_ROOT_USERNAME=growthiq_user -e MONGO_INITDB_ROOT_PASSWORD=growthiq_password -p 27017:27017 -d mongo:7-jammy
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Start Development Servers**
```bash
# Backend (in backend directory)
python app.py

# Frontend (in frontend directory)
npm run dev
```

## 📊 Usage

### Dashboard
- **Model Selection**: Switch between SARIMA and LSTM models
- **Forecast Periods**: Choose 6, 12, 18, or 24-month forecasting horizons
- **Forecast Visualization**: Interactive charts showing revenue projections
- **Scenario Planning**: View optimistic and pessimistic scenarios
- **Export Data**: Download forecasts as CSV or JSON

### Admin Panel
- **Model Management**: Monitor model performance and system health
- **Data Upload**: Import historical revenue data
- **System Monitoring**: View model performance and system health
- **Configuration**: Adjust model parameters and scheduling

### API Endpoints

#### Get Forecast (Uses Your Pre-trained Models)
```bash
GET /api/forecast?model=sarima|lstm&periods=12  # Uses your lstm_model.h5 or sarima_model.pkl
```

#### Get Model Metrics (From Your CSV)
```bash
GET /api/metrics  # Returns data from model_metrics.csv
```

#### Get Historical Data (From Your CSV)
```bash
GET /api/historical  # Returns data from fred_series.csv
```

#### Get Scenario Data (From Your CSV)
```bash
GET /api/scenario  # Returns data from scenario_inputs.csv
```

#### Export Forecast (API-driven CSV)
```bash
GET /api/export/forecast?model=lstm|sarima  # Downloads CSV for Power BI/Excel
```

#### Health Check
```bash
GET /api/health  # Returns system status and model loading status
```

## 🏗️ Architecture

### Frontend Architecture
```
frontend/src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── ForecastChart.tsx # Plotly.js charts
│   ├── HistoricalChart.tsx # Historical data visualization
│   ├── ModelComparison.tsx # Model performance comparison
│   ├── ScenarioPlanner.tsx # Scenario planning interface
│   ├── PeriodSelector.tsx # Forecast period selector
│   ├── AdminPanel.tsx   # Admin interface
│   └── ...
├── services/           # API services
├── types/             # TypeScript types
└── utils/             # Utility functions
```

### Backend Architecture
```
backend/
├── app.py              # Flask application
├── model/              # Your pre-trained models (place here)
│   ├── lstm_model.h5   # Your LSTM model
│   ├── sarima_model.pkl # Your SARIMA model
│   └── scaler.pkl      # Your scaler
├── data/               # Your CSV data files (place here)
│   ├── fred_series.csv
│   ├── model_metrics.csv
│   └── scenario_inputs.csv
├── output/             # Generated exports
└── requirements.txt    # Dependencies
```

### Database Schema (MongoDB Collections)
- **forecasts**: Stores model predictions from your pre-trained models
- **forecast_runs**: Logs each forecast generation with timestamp and model used
- **uploads**: Tracks file uploads and data imports

## 🔧 Configuration

### Environment Variables (.env file included)
```env
# MongoDB
DB_USER=growthiq_user
DB_PASSWORD=growthiq_password
MONGO_URI=mongodb://growthiq_user:growthiq_password@localhost:27017/growthiq?authSource=admin

# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# API
API_HOST=0.0.0.0
API_PORT=5000
```

### Data File Formats

#### fred_series.csv
```csv
Date,Revenue
2020-01-01,950000
2020-02-01,980000
2020-03-01,1020000
```

#### model_metrics.csv
```csv
model_type,rmse,mae,mse,accuracy
lstm,111.6,8.2,12450,0.874
sarima,114.9,9.1,13200,0.852
```

#### scenario_inputs.csv
```csv
scenario,growth_rate,description
base,0.0,Current trajectory
optimistic_5,0.05,5% growth scenario
optimistic_10,0.10,10% growth scenario
pessimistic,-0.05,5% decline scenario
```

## 🚀 Deployment

### Docker Production Deployment
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Scale services
docker-compose up -d --scale api=3 --scale worker=2
```

### Cloud Deployment
The application is designed to be cloud-native and can be deployed on:
- AWS (ECS, EKS, or EC2)
- Google Cloud Platform (GKE or Compute Engine)
- Azure (AKS or Container Instances)
- Digital Ocean (App Platform or Droplets)

## 📈 Model Performance

The platform displays performance metrics from your `model_metrics.csv` file:
- **Model Comparison Charts**: Visual comparison of RMSE, MAE, MSE, and accuracy
- **Performance Tables**: Detailed metrics for each model
- **Real-time Integration**: Uses your actual trained model performance data

### Model Integration
- **No Retraining**: Uses your existing pre-trained models for inference only
- **File-based Loading**: Automatically loads models from the model/ directory
- **Fallback Support**: Provides mock data if model files are not found
- **Performance Tracking**: Logs forecast runs and model usage

## 🔍 Monitoring

### Health Checks
- **API Health**: `/api/health`
- **Model Loading Status**: Confirms which models are successfully loaded
- **Database**: Connection and query performance
- **File Availability**: Checks for required CSV and model files

### Logging
- **Forecast Runs**: Logs each forecast generation with model and timestamp
- **Model Loading**: Logs successful/failed model loading attempts
- **API Requests**: Request/response logging
- **File Operations**: CSV export and upload operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Testing

### API Testing
```bash
# Test model loading
curl http://localhost:5000/api/health

# Test forecast generation
curl http://localhost:5000/api/forecast?model=lstm&periods=12
curl http://localhost:5000/api/forecast?model=sarima&periods=24

# Test data endpoints
curl http://localhost:5000/api/metrics
curl http://localhost:5000/api/historical
curl http://localhost:5000/api/scenario
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Full Stack Testing
```bash
# Start the full application
docker-compose up -d

# Test the complete workflow
# 1. Place your model files in backend/model/
# 2. Place your CSV files in backend/data/
# 3. Access http://localhost:3000
# 4. Test model switching and data export
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please:
1. Ensure your model files are in the correct format and location
2. Verify your CSV files match the expected schema
3. Check the API health endpoint for model loading status
4. Review the backend logs for any file loading errors

## 🏆 Acknowledgments

- Your pre-trained SARIMA and LSTM models
- Historical FRED data integration
- TensorFlow team for ML frameworks
- React and Plotly.js communities
- Open source contributors

---

**GrowthIQ** - Enterprise Revenue Forecasting with Pre-trained Model Integration
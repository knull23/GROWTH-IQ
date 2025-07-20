# Model Directory

Place your pre-trained models in this directory:

## Required Files:
- `lstm_model.h5` - Pre-trained LSTM model (Keras/TensorFlow format)
- `sarima_model.pkl` - Pre-trained SARIMA model (pickle format)
- `scaler.pkl` - Scaler used for LSTM preprocessing (joblib format)

## File Structure:
```
model/
├── lstm_model.h5      # LSTM time series model
├── sarima_model.pkl   # SARIMA model
└── scaler.pkl         # Data scaler for LSTM
```

## Usage:
The application will automatically load these models on startup. If models are not found, the application will use mock data for demonstration purposes.

## Model Training:
These models should be pre-trained on your historical retail sales data. The application does NOT retrain models - it only uses the existing trained models for inference.
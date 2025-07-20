# Output Directory

This directory stores generated forecast outputs and exported files:

## Generated Files:
- `forecast_lstm_YYYYMMDD.csv` - LSTM forecast exports
- `forecast_sarima_YYYYMMDD.csv` - SARIMA forecast exports
- `forecast.csv` - Latest forecast results

## File Structure:
```
output/
├── forecast_lstm_20240106.csv    # Daily LSTM exports
├── forecast_sarima_20240106.csv  # Daily SARIMA exports
└── forecast.csv                  # Latest forecast
```

## Export Format:
```csv
Date,Forecasted_Revenue,Growth_5%,Growth_10%,Decline_5%
2024-02-01,1050000,1102500,1155000,997500
2024-03-01,1080000,1134000,1188000,1026000
...
```

## Usage:
- Files are automatically generated when forecasts are exported via the API
- CSV files can be imported into Power BI, Excel, or other business intelligence tools
- Files are timestamped to maintain version history
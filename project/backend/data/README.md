# Data Directory

Place your CSV data files in this directory:

## Required Files:
- `fred_series.csv` - Monthly U.S. retail sales data (Date, Revenue)
- `model_metrics.csv` - RMSE and model performance comparison
- `revenue_stats.csv` - Summary statistics for historical revenue
- `scenario_inputs.csv` - Forecasted values with growth/decline assumptions

## File Structure:
```
data/
├── fred_series.csv      # Historical revenue data
├── model_metrics.csv    # Model performance metrics
├── revenue_stats.csv    # Revenue statistics
└── scenario_inputs.csv  # Scenario planning data
```

## Expected CSV Formats:

### fred_series.csv
```csv
Date,Revenue
2020-01-01,950000
2020-02-01,980000
...
```

### model_metrics.csv
```csv
model_type,rmse,mae,mse,accuracy
lstm,111.6,8.2,12450,0.874
sarima,114.9,9.1,13200,0.852
```

### scenario_inputs.csv
```csv
scenario,growth_rate,description
base,0.0,Current trajectory
optimistic_5,0.05,5% growth scenario
optimistic_10,0.10,10% growth scenario
pessimistic,-0.05,5% decline scenario
```

## Usage:
The application will automatically load these CSV files on startup. If files are not found, the application will use mock data for demonstration purposes.
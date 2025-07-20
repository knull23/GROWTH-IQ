-- GrowthIQ Database Schema
-- Initialize database with required tables and indexes

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create forecasts table
CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    forecasted_revenue DECIMAL(15, 2) NOT NULL,
    growth_5 DECIMAL(15, 2) NOT NULL,
    growth_10 DECIMAL(15, 2) NOT NULL,
    decline_5 DECIMAL(15, 2) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create model_metrics table
CREATE TABLE IF NOT EXISTS model_metrics (
    id SERIAL PRIMARY KEY,
    model_type VARCHAR(50) NOT NULL,
    accuracy DECIMAL(6, 4) NOT NULL,
    mse DECIMAL(15, 2) NOT NULL,
    rmse DECIMAL(15, 2) NOT NULL,
    mae DECIMAL(15, 2) NOT NULL,
    training_data_size INTEGER,
    training_duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create economic_indicators table
CREATE TABLE IF NOT EXISTS economic_indicators (
    id SERIAL PRIMARY KEY,
    indicator_name VARCHAR(100) NOT NULL,
    indicator_code VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    value DECIMAL(15, 6) NOT NULL,
    source VARCHAR(50) DEFAULT 'FRED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(indicator_code, date)
);

-- Create training_data table
CREATE TABLE IF NOT EXISTS training_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    revenue DECIMAL(15, 2) NOT NULL,
    source VARCHAR(100),
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- Create model_configs table
CREATE TABLE IF NOT EXISTS model_configs (
    id SERIAL PRIMARY KEY,
    model_type VARCHAR(50) NOT NULL,
    config_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    log_level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    component VARCHAR(50),
    user_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forecasts_date ON forecasts(date);
CREATE INDEX IF NOT EXISTS idx_forecasts_model_type ON forecasts(model_type);
CREATE INDEX IF NOT EXISTS idx_forecasts_created_at ON forecasts(created_at);

CREATE INDEX IF NOT EXISTS idx_model_metrics_model_type ON model_metrics(model_type);
CREATE INDEX IF NOT EXISTS idx_model_metrics_created_at ON model_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_economic_indicators_code ON economic_indicators(indicator_code);
CREATE INDEX IF NOT EXISTS idx_economic_indicators_date ON economic_indicators(date);

CREATE INDEX IF NOT EXISTS idx_training_data_date ON training_data(date);
CREATE INDEX IF NOT EXISTS idx_training_data_is_validated ON training_data(is_validated);

CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_log_level ON system_logs(log_level);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_forecasts_updated_at BEFORE UPDATE ON forecasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_data_updated_at BEFORE UPDATE ON training_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_configs_updated_at BEFORE UPDATE ON model_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default model configurations
INSERT INTO model_configs (model_type, config_json) VALUES 
('sarima', '{"order": [1, 1, 1], "seasonal_order": [1, 1, 1, 12], "enforce_stationarity": false, "enforce_invertibility": false}'),
('lstm', '{"lookback_window": 12, "lstm_units": 50, "dropout_rate": 0.2, "epochs": 100, "batch_size": 32}')
ON CONFLICT DO NOTHING;

-- Insert sample training data (optional)
INSERT INTO training_data (date, revenue, source) VALUES 
('2023-01-01', 950000.00, 'Historical Data'),
('2023-02-01', 980000.00, 'Historical Data'),
('2023-03-01', 1020000.00, 'Historical Data'),
('2023-04-01', 1050000.00, 'Historical Data'),
('2023-05-01', 1080000.00, 'Historical Data'),
('2023-06-01', 1120000.00, 'Historical Data'),
('2023-07-01', 1150000.00, 'Historical Data'),
('2023-08-01', 1180000.00, 'Historical Data'),
('2023-09-01', 1200000.00, 'Historical Data'),
('2023-10-01', 1230000.00, 'Historical Data'),
('2023-11-01', 1250000.00, 'Historical Data'),
('2023-12-01', 1280000.00, 'Historical Data')
ON CONFLICT DO NOTHING;

-- Create default admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('admin@growthiq.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNjH7fJqCHcQy', 'Admin', 'User', 'admin')
ON CONFLICT DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE forecasts IS 'Stores generated revenue forecasts from ML models';
COMMENT ON TABLE model_metrics IS 'Stores performance metrics for trained models';
COMMENT ON TABLE economic_indicators IS 'Stores economic data from FRED API';
COMMENT ON TABLE training_data IS 'Stores historical revenue data for model training';
COMMENT ON TABLE model_configs IS 'Stores configuration parameters for ML models';
COMMENT ON TABLE system_logs IS 'Stores system logs and audit trail';
COMMENT ON TABLE users IS 'Stores user authentication and profile information';
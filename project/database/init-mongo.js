// MongoDB initialization script for GrowthIQ
// This script creates the initial database structure and sample data

// Switch to the growthiq database
db = db.getSiblingDB('growthiq');

// Create collections with validation schemas
db.createCollection('forecasts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['date', 'forecasted_revenue', 'growth_5', 'growth_10', 'decline_5', 'model_type', 'created_at'],
      properties: {
        date: { bsonType: 'date' },
        forecasted_revenue: { bsonType: 'number' },
        growth_5: { bsonType: 'number' },
        growth_10: { bsonType: 'number' },
        decline_5: { bsonType: 'number' },
        model_type: { bsonType: 'string', enum: ['lstm', 'sarima'] },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('forecast_runs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['model_type', 'forecast_data', 'created_at'],
      properties: {
        model_type: { bsonType: 'string', enum: ['lstm', 'sarima'] },
        forecast_data: { bsonType: 'array' },
        user_id: { bsonType: 'string' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('model_metrics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['model_type', 'accuracy', 'mse', 'rmse', 'mae', 'created_at'],
      properties: {
        model_type: { bsonType: 'string', enum: ['lstm', 'sarima'] },
        accuracy: { bsonType: 'number', minimum: 0, maximum: 1 },
        mse: { bsonType: 'number', minimum: 0 },
        rmse: { bsonType: 'number', minimum: 0 },
        mae: { bsonType: 'number', minimum: 0 },
        training_data_size: { bsonType: 'int' },
        training_duration_seconds: { bsonType: 'int' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('training_data', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['date', 'revenue', 'created_at'],
      properties: {
        date: { bsonType: 'date' },
        revenue: { bsonType: 'number', minimum: 0 },
        source: { bsonType: 'string' },
        is_validated: { bsonType: 'bool' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('uploads', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['filename', 'created_at'],
      properties: {
        filename: { bsonType: 'string' },
        upload_path: { bsonType: 'string' },
        records: { bsonType: 'int' },
        columns: { bsonType: 'array' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password_hash', 'created_at'],
      properties: {
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        password_hash: { bsonType: 'string' },
        first_name: { bsonType: 'string' },
        last_name: { bsonType: 'string' },
        role: { bsonType: 'string', enum: ['user', 'admin'] },
        is_active: { bsonType: 'bool' },
        last_login: { bsonType: 'date' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for better performance
db.forecasts.createIndex({ 'date': 1 });
db.forecasts.createIndex({ 'model_type': 1 });
db.forecasts.createIndex({ 'created_at': -1 });

db.forecast_runs.createIndex({ 'model_type': 1 });
db.forecast_runs.createIndex({ 'created_at': -1 });

db.model_metrics.createIndex({ 'model_type': 1 });
db.model_metrics.createIndex({ 'created_at': -1 });

db.training_data.createIndex({ 'date': 1 }, { unique: true });
db.training_data.createIndex({ 'is_validated': 1 });

db.uploads.createIndex({ 'created_at': -1 });

db.users.createIndex({ 'email': 1 }, { unique: true });

// Insert sample training data
db.training_data.insertMany([
  {
    date: new Date('2023-01-01'),
    revenue: 950000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-02-01'),
    revenue: 980000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-03-01'),
    revenue: 1020000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-04-01'),
    revenue: 1050000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-05-01'),
    revenue: 1080000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-06-01'),
    revenue: 1120000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-07-01'),
    revenue: 1150000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-08-01'),
    revenue: 1180000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-09-01'),
    revenue: 1200000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-10-01'),
    revenue: 1230000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-11-01'),
    revenue: 1250000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    date: new Date('2023-12-01'),
    revenue: 1280000.00,
    source: 'Historical Data',
    is_validated: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Insert default admin user (password: admin123)
// Note: In production, use proper password hashing
db.users.insertOne({
  email: 'admin@growthiq.com',
  password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNjH7fJqCHcQy',
  first_name: 'Admin',
  last_name: 'User',
  role: 'admin',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
});

print('GrowthIQ MongoDB database initialized successfully!');
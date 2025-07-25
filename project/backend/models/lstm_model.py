import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib
import warnings
warnings.filterwarnings('ignore')

@tf.keras.saving.register_keras_serializable(package="Custom", name="mae")
def custom_mae(y_true, y_pred):
    return tf.keras.metrics.mean_absolute_error(y_true, y_pred)

class LSTMForecaster:
    def __init__(self, lookback_window=12, lstm_units=50, dropout_rate=0.2):
        """
        Initialize LSTM model for time series forecasting

        Args:
            lookback_window: Number of previous time steps to use for prediction
            lstm_units: Number of LSTM units in the hidden layer
            dropout_rate: Dropout rate for regularization
        """
        self.lookback_window = lookback_window
        self.lstm_units = lstm_units
        self.dropout_rate = dropout_rate
        self.model = None
        self.scaler = MinMaxScaler()
        self.is_fitted = False
        self.history = None
        self.training_data = None

    def prepare_data(self, data):
        """Prepare time series data for LSTM modeling"""
        if isinstance(data, pd.DataFrame):
            data = data.copy()
            data.columns = ['date', 'revenue']
            data['date'] = pd.to_datetime(data['date'])
            data = data.set_index('date')
            data = data.asfreq('MS')  # Monthly start frequency

        return data['revenue'].values.reshape(-1, 1)

    def create_sequences(self, data, lookback_window):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(lookback_window, len(data)):
            X.append(data[i - lookback_window:i])
            y.append(data[i])
        return np.array(X), np.array(y)

    def build_model(self):
        """Build LSTM model architecture"""
        self.model = Sequential([
            LSTM(self.lstm_units, return_sequences=True, input_shape=(self.lookback_window, 1)),
            Dropout(self.dropout_rate),
            LSTM(self.lstm_units, return_sequences=False),
            Dropout(self.dropout_rate),
            Dense(25),
            Dense(1)
        ])

        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mean_squared_error',
            metrics=[tf.keras.metrics.MeanAbsoluteError()]
        )

        return self.model

    def fit(self, data, validation_split=0.2, epochs=100, batch_size=32):
        """Fit LSTM model to training data"""
        try:
            # Save original data for forecasting
            self.training_data = data

            # Prepare and scale data
            ts_data = self.prepare_data(data)
            scaled_data = self.scaler.fit_transform(ts_data)

            # Create sequences
            X, y = self.create_sequences(scaled_data, self.lookback_window)

            if len(X) < self.lookback_window:
                raise ValueError(f"Not enough data points. Need at least {self.lookback_window} points.")

            # Build model
            self.build_model()

            # Callbacks
            early_stopping = EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            )
            reduce_lr = ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.2,
                patience=5,
                min_lr=0.0001
            )

            # Train
            self.history = self.model.fit(
                X, y,
                epochs=epochs,
                batch_size=batch_size,
                validation_split=validation_split,
                callbacks=[early_stopping, reduce_lr],
                verbose=0
            )

            self.is_fitted = True
            return self.history

        except Exception as e:
            print(f"Error fitting LSTM model: {e}")
            raise

    def forecast(self, steps=12):
        """Generate forecasts for specified number of steps"""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before forecasting")

        try:
            last_sequence = self.scaler.transform(
                self.prepare_data(self.training_data)[-self.lookback_window:]
            )

            forecasts = []
            current_sequence = last_sequence.copy()

            for _ in range(steps):
                input_seq = current_sequence.reshape(1, self.lookback_window, 1)
                prediction = self.model.predict(input_seq, verbose=0)
                forecasts.append(prediction[0, 0])
                current_sequence = np.roll(current_sequence, -1)
                current_sequence[-1] = prediction[0, 0]

            forecasts = np.array(forecasts).reshape(-1, 1)
            forecasts = self.scaler.inverse_transform(forecasts).flatten()

            last_date = pd.Timestamp.now().replace(day=1)
            forecast_dates = pd.date_range(
                start=last_date + pd.DateOffset(months=1),
                periods=steps,
                freq='MS'
            )

            forecast_df = pd.DataFrame({
                'date': forecast_dates,
                'forecasted_revenue': forecasts
            })

            forecast_df['growth_5'] = forecast_df['forecasted_revenue'] * 1.05
            forecast_df['growth_10'] = forecast_df['forecasted_revenue'] * 1.10
            forecast_df['decline_5'] = forecast_df['forecasted_revenue'] * 0.95

            return forecast_df

        except Exception as e:
            print(f"Error generating forecasts: {e}")
            raise

    def evaluate(self, test_data):
        """Evaluate model performance on test data"""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before evaluation")

        try:
            ts_test = self.prepare_data(test_data)
            scaled_test = self.scaler.transform(ts_test)

            X_test, y_test = self.create_sequences(scaled_test, self.lookback_window)

            predictions = self.model.predict(X_test, verbose=0)

            predictions = self.scaler.inverse_transform(predictions)
            y_test = self.scaler.inverse_transform(y_test)

            mse = mean_squared_error(y_test, predictions)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_test, predictions)
            mape = np.mean(np.abs((y_test - predictions) / y_test)) * 100
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

    def save_model(self, model_path, scaler_path):
        """Save trained model and scaler"""
        if not self.is_fitted:
            raise ValueError("Model must be fitted before saving")

        try:
            self.model.save(model_path)
            joblib.dump(self.scaler, scaler_path)
            print(f"Model saved to {model_path}")
            print(f"Scaler saved to {scaler_path}")

        except Exception as e:
            print(f"Error saving model: {e}")
            raise

    def load_model(self, model_path, scaler_path):
        """Load trained model and scaler"""
        try:
            self.model = load_model(model_path, custom_objects={"mae": custom_mae})
            self.scaler = joblib.load(scaler_path)
            self.is_fitted = True
            print(f"Model loaded from {model_path}")
            print(f"Scaler loaded from {scaler_path}")

        except Exception as e:
            print(f"Error loading model: {e}")
            raise

    def plot_training_history(self):
        """Plot training history"""
        if not self.history:
            raise ValueError("No training history available")

        import matplotlib.pyplot as plt

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))

        ax1.plot(self.history.history['loss'], label='Training Loss')
        ax1.plot(self.history.history['val_loss'], label='Validation Loss')
        ax1.set_title('Model Loss')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss')
        ax1.legend()

        ax2.plot(self.history.history['mean_absolute_error'], label='Training MAE')
        ax2.plot(self.history.history['val_mean_absolute_error'], label='Validation MAE')
        ax2.set_title('Model MAE')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('MAE')
        ax2.legend()

        plt.tight_layout()
        plt.show()

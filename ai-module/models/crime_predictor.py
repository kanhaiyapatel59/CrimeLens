"""
Crime Predictor - Predicts future crime hotspots and trends
"""

import os
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import lightgbm as lgb
import joblib

logger = logging.getLogger(__name__)


class CrimePredictor:
    """Crime prediction model for forecasting hotspots and trends"""
    
    def __init__(self, model_type='xgboost'):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = None
        self.is_trained = False
        
        # Load pre-trained model if exists
        self._load_model()
    
    def _get_model(self):
        """Get the appropriate model instance"""
        if self.model_type == 'xgboost':
            return xgb.XGBRegressor(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == 'lightgbm':
            return lgb.LGBMRegressor(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == 'random_forest':
            return RandomForestRegressor(
                n_estimators=200,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
        else:
            return GradientBoostingRegressor(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.1,
                random_state=42
            )
    
    def _load_model(self):
        """Load pre-trained model from file"""
        model_path = f'saved_models/crime_predictor_{self.model_type}.pkl'
        scaler_path = f'saved_models/crime_predictor_scaler.pkl'
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.is_trained = True
                logger.info(f"✅ Loaded pre-trained crime predictor ({self.model_type})")
                return True
            except Exception as e:
                logger.error(f"❌ Failed to load model: {e}")
                self.is_trained = False
                return False
        return False
    
    def _save_model(self):
        """Save trained model to file"""
        os.makedirs('saved_models', exist_ok=True)
        
        model_path = f'saved_models/crime_predictor_{self.model_type}.pkl'
        scaler_path = f'saved_models/crime_predictor_scaler.pkl'
        
        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        logger.info(f"✅ Saved crime predictor ({self.model_type})")
    
    def prepare_features(self, crimes_df):
        """Prepare features for training or prediction"""
        features = []
        
        # Temporal features
        crimes_df['date'] = pd.to_datetime(crimes_df['date'])
        features.extend([
            crimes_df['date'].dt.year.values,
            crimes_df['date'].dt.month.values,
            crimes_df['date'].dt.day.values,
            crimes_df['date'].dt.dayofweek.values,
            crimes_df['date'].dt.hour.values if 'hour' in crimes_df else np.zeros(len(crimes_df))
        ])
        
        # Location features
        if 'latitude' in crimes_df and 'longitude' in crimes_df:
            features.extend([
                crimes_df['latitude'].values,
                crimes_df['longitude'].values
            ])
        
        # Crime features
        if 'crime_type' in crimes_df:
            features.append(crimes_df['crime_type'].values)
        
        if 'severity' in crimes_df:
            severity_map = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
            features.append(crimes_df['severity'].map(severity_map).values)
        
        # Historical crime count (rolling window)
        if len(crimes_df) > 30:
            crimes_df['crime_count_7d'] = crimes_df.groupby('location')['date'].apply(
                lambda x: x.rolling('7D').count()
            )
            features.append(crimes_df['crime_count_7d'].values)
        
        # Stack features
        X = np.column_stack(features)
        self.feature_names = [
            'year', 'month', 'day', 'day_of_week', 'hour',
            'latitude', 'longitude', 'crime_type', 'severity', 'crime_count_7d'
        ][:X.shape[1]]
        
        return X
    
    def train(self, crimes_data, target):
        """Train the crime prediction model"""
        try:
            # Prepare features
            X = self.prepare_features(crimes_data)
            y = np.array(target)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model = self._get_model()
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            
            metrics = {
                'mae': mean_absolute_error(y_test, y_pred),
                'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
                'r2': r2_score(y_test, y_pred),
                'cv_score': np.mean(cross_val_score(self.model, X_train_scaled, y_train, cv=5))
            }
            
            self.is_trained = True
            
            # Save model
            self._save_model()
            
            logger.info(f"✅ Crime predictor trained successfully: {metrics}")
            
            return {
                'success': True,
                'metrics': metrics,
                'model_type': self.model_type
            }
            
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def predict(self, features):
        """Make predictions"""
        if not self.is_trained or self.model is None:
            return {'error': 'Model not trained'}
        
        try:
            # Prepare features
            if isinstance(features, dict):
                # Single prediction
                X = self.prepare_features(pd.DataFrame([features]))
            else:
                # Batch prediction
                X = self.prepare_features(features)
            
            # Scale
            X_scaled = self.scaler.transform(X)
            
            # Predict
            predictions = self.model.predict(X_scaled)
            
            return {
                'success': True,
                'predictions': predictions.tolist(),
                'count': len(predictions)
            }
            
        except Exception as e:
            logger.error(f"❌ Prediction failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def predict_hotspots(self, locations, date_range):
        """Predict crime hotspots for given locations and date range"""
        if not self.is_trained:
            return {'error': 'Model not trained'}
        
        try:
            # Generate features for each location-date combination
            predictions = []
            
            for location in locations:
                for single_date in date_range:
                    features = {
                        'date': single_date,
                        'latitude': location.get('latitude', 0),
                        'longitude': location.get('longitude', 0),
                        'crime_type': location.get('crime_type', 0),
                        'severity': location.get('severity', 'medium'),
                        'hour': 12
                    }
                    
                    result = self.predict(features)
                    
                    if result.get('success'):
                        predictions.append({
                            'location': location,
                            'date': single_date.isoformat(),
                            'predicted_crimes': result['predictions'][0]
                        })
            
            return {
                'success': True,
                'predictions': predictions,
                'count': len(predictions)
            }
            
        except Exception as e:
            logger.error(f"❌ Hotspot prediction failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
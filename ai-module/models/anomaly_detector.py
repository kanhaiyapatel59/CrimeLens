"""
Anomaly Detector - Detects unusual crime patterns and outliers
"""

import os
import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """Detects anomalies in crime patterns"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model"""
        model_path = 'saved_models/anomaly_detector.pkl'
        scaler_path = 'saved_models/anomaly_detector_scaler.pkl'
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.is_trained = True
                logger.info("✅ Loaded pre-trained anomaly detector")
                return True
            except Exception as e:
                logger.error(f"❌ Failed to load anomaly detector: {e}")
                return False
        return False
    
    def _save_model(self):
        """Save trained model"""
        os.makedirs('saved_models', exist_ok=True)
        joblib.dump(self.model, 'saved_models/anomaly_detector.pkl')
        joblib.dump(self.scaler, 'saved_models/anomaly_detector_scaler.pkl')
        logger.info("✅ Saved anomaly detector")
    
    def prepare_features(self, crimes_df):
        """Prepare features for anomaly detection"""
        features = []
        
        # Temporal features
        crimes_df['date'] = pd.to_datetime(crimes_df['date'])
        features.extend([
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
        
        # Aggregate features
        if 'victim_count' in crimes_df:
            features.append(crimes_df['victim_count'].values)
        
        if 'suspect_count' in crimes_df:
            features.append(crimes_df['suspect_count'].values)
        
        return np.column_stack(features)
    
    def train(self, crimes_data):
        """Train the anomaly detector"""
        try:
            X = self.prepare_features(crimes_data)
            
            # Scale
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model = IsolationForest(
                contamination=0.1,
                random_state=42,
                n_estimators=200,
                max_samples='auto'
            )
            
            self.model.fit(X_scaled)
            
            self.is_trained = True
            self._save_model()
            
            logger.info("✅ Anomaly detector trained successfully")
            
            return {
                'success': True,
                'training_samples': len(X_scaled)
            }
            
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def detect(self, crimes_data):
        """Detect anomalies in crime data"""
        if not self.is_trained or self.model is None:
            return {'error': 'Model not trained'}
        
        try:
            X = self.prepare_features(crimes_data)
            X_scaled = self.scaler.transform(X)
            
            # Predict anomalies
            predictions = self.model.predict(X_scaled)
            
            # -1 = anomaly, 1 = normal
            anomalies = predictions == -1
            
            # Calculate anomaly scores
            scores = self.model.score_samples(X_scaled)
            
            # Normalize scores to 0-1
            scores_normalized = (scores - scores.min()) / (scores.max() - scores.min())
            
            return {
                'success': True,
                'is_anomaly': anomalies.tolist(),
                'anomaly_scores': scores_normalized.tolist(),
                'anomaly_count': int(anomalies.sum()),
                'normal_count': int((~anomalies).sum())
            }
            
        except Exception as e:
            logger.error(f"❌ Anomaly detection failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
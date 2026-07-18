"""
Risk Scorer - Scores risk for suspects, offenders, and locations
"""

import os
import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

logger = logging.getLogger(__name__)


class RiskScorer:
    """Risk scoring model for individuals and locations"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model"""
        model_path = 'saved_models/risk_scorer.pkl'
        scaler_path = 'saved_models/risk_scorer_scaler.pkl'
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.is_trained = True
                logger.info("✅ Loaded pre-trained risk scorer")
                return True
            except Exception as e:
                logger.error(f"❌ Failed to load risk scorer: {e}")
                return False
        return False
    
    def _save_model(self):
        """Save trained model"""
        os.makedirs('saved_models', exist_ok=True)
        joblib.dump(self.model, 'saved_models/risk_scorer.pkl')
        joblib.dump(self.scaler, 'saved_models/risk_scorer_scaler.pkl')
        logger.info("✅ Saved risk scorer")
    
    def prepare_features(self, data_df):
        """Prepare features for risk scoring"""
        features = []
        
        # Criminal history
        if 'criminal_count' in data_df:
            features.append(data_df['criminal_count'].values)
        
        if 'current_crimes' in data_df:
            features.append(data_df['current_crimes'].values)
        
        # Demographic
        if 'age' in data_df:
            features.append(data_df['age'].values)
        
        if 'gender' in data_df:
            gender_map = {'male': 0, 'female': 1, 'other': 2}
            features.append(data_df['gender'].map(gender_map).values)
        
        # Severity of crimes
        if 'severity_score' in data_df:
            features.append(data_df['severity_score'].values)
        
        # Recidivism
        if 'recidivism' in data_df:
            features.append(data_df['recidivism'].values)
        
        # Social factors
        if 'social_connections' in data_df:
            features.append(data_df['social_connections'].values)
        
        return np.column_stack(features)
    
    def train(self, data, labels):
        """Train the risk scorer model"""
        try:
            X = self.prepare_features(data)
            y = np.array(labels)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model = RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                random_state=42,
                n_jobs=-1,
                class_weight='balanced'
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test_scaled)
            
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, average='weighted'),
                'recall': recall_score(y_test, y_pred, average='weighted'),
                'f1': f1_score(y_test, y_pred, average='weighted')
            }
            
            self.is_trained = True
            self._save_model()
            
            logger.info(f"✅ Risk scorer trained successfully: {metrics}")
            
            return {
                'success': True,
                'metrics': metrics
            }
            
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def predict(self, data):
        """Predict risk scores"""
        if not self.is_trained or self.model is None:
            return {'error': 'Model not trained'}
        
        try:
            X = self.prepare_features(data)
            X_scaled = self.scaler.transform(X)
            
            # Get probabilities
            probabilities = self.model.predict_proba(X_scaled)
            risk_score = np.max(probabilities, axis=1) * 100
            
            # Get risk level
            risk_levels = []
            for score in risk_score:
                if score < 30:
                    risk_levels.append('low')
                elif score < 60:
                    risk_levels.append('medium')
                elif score < 80:
                    risk_levels.append('high')
                else:
                    risk_levels.append('critical')
            
            return {
                'success': True,
                'risk_scores': risk_score.tolist(),
                'risk_levels': risk_levels,
                'probabilities': probabilities.tolist()
            }
            
        except Exception as e:
            logger.error(f"❌ Risk prediction failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def calculate_individual_risk(self, individual_data):
        """Calculate risk score for a single individual"""
        result = self.predict(pd.DataFrame([individual_data]))
        
        if result.get('success'):
            return {
                'success': True,
                'risk_score': result['risk_scores'][0],
                'risk_level': result['risk_levels'][0],
                'probability': result['probabilities'][0]
            }
        
        return {'error': 'Failed to calculate risk'}
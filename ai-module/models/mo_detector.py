"""
Modus Operandi Detector - Identifies criminal patterns and MOs
"""

import os
import logging
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import joblib

logger = logging.getLogger(__name__)


class MODetector:
    """Detects Modus Operandi patterns in crimes"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)
        self.is_trained = False
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model"""
        model_path = 'saved_models/mo_detector.pkl'
        scaler_path = 'saved_models/mo_detector_scaler.pkl'
        pca_path = 'saved_models/mo_detector_pca.pkl'
        
        if all(os.path.exists(p) for p in [model_path, scaler_path, pca_path]):
            try:
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                self.pca = joblib.load(pca_path)
                self.is_trained = True
                logger.info("✅ Loaded pre-trained MO detector")
                return True
            except Exception as e:
                logger.error(f"❌ Failed to load MO detector: {e}")
                return False
        return False
    
    def _save_model(self):
        """Save trained model"""
        os.makedirs('saved_models', exist_ok=True)
        joblib.dump(self.model, 'saved_models/mo_detector.pkl')
        joblib.dump(self.scaler, 'saved_models/mo_detector_scaler.pkl')
        joblib.dump(self.pca, 'saved_models/mo_detector_pca.pkl')
        logger.info("✅ Saved MO detector")
    
    def prepare_features(self, crimes_df):
        """Prepare features for MO detection"""
        features = []
        
        # Temporal features
        crimes_df['date'] = pd.to_datetime(crimes_df['date'])
        features.extend([
            crimes_df['date'].dt.hour.values,
            crimes_df['date'].dt.dayofweek.values,
            crimes_df['date'].dt.month.values
        ])
        
        # Location features
        if 'latitude' in crimes_df and 'longitude' in crimes_df:
            features.extend([
                crimes_df['latitude'].values,
                crimes_df['longitude'].values
            ])
        
        # Crime type
        if 'crime_type' in crimes_df:
            features.append(crimes_df['crime_type'].values)
        
        # Severity
        if 'severity' in crimes_df:
            severity_map = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
            features.append(crimes_df['severity'].map(severity_map).values)
        
        # Victim count
        if 'victim_count' in crimes_df:
            features.append(crimes_df['victim_count'].values)
        
        # Method features (if available)
        if 'method_type' in crimes_df:
            features.append(crimes_df['method_type'].values)
        
        return np.column_stack(features)
    
    def train(self, crimes_data, n_clusters=8):
        """Train the MO detector"""
        try:
            X = self.prepare_features(crimes_data)
            
            # Scale
            X_scaled = self.scaler.fit_transform(X)
            
            # Reduce dimensions
            X_pca = self.pca.fit_transform(X_scaled)
            
            # Cluster
            self.model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            self.model.fit(X_pca)
            
            self.is_trained = True
            self._save_model()
            
            logger.info(f"✅ MO detector trained with {n_clusters} clusters")
            
            return {
                'success': True,
                'n_clusters': n_clusters,
                'inertia': self.model.inertia_
            }
            
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def detect(self, crimes_data):
        """Detect MO patterns in crimes"""
        if not self.is_trained or self.model is None:
            return {'error': 'Model not trained'}
        
        try:
            X = self.prepare_features(crimes_data)
            X_scaled = self.scaler.transform(X)
            X_pca = self.pca.transform(X_scaled)
            
            # Predict clusters
            clusters = self.model.predict(X_pca)
            
            # Get cluster centers
            centers = self.model.cluster_centers_
            
            # Calculate distances to centers
            distances = self.model.transform(X_pca)
            confidence = 1 - (distances.min(axis=1) / distances.max(axis=1).max())
            
            return {
                'success': True,
                'cluster_ids': clusters.tolist(),
                'confidence_scores': confidence.tolist(),
                'n_clusters': self.model.n_clusters,
                'inertia': self.model.inertia_
            }
            
        except Exception as e:
            logger.error(f"❌ MO detection failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def describe_cluster(self, cluster_id):
        """Describe a specific cluster's characteristics"""
        if not self.is_trained:
            return {'error': 'Model not trained'}
        
        if cluster_id >= self.model.n_clusters:
            return {'error': 'Invalid cluster ID'}
        
        # Get cluster center
        center = self.model.cluster_centers_[cluster_id]
        
        # Convert back to original space
        center_original = self.scaler.inverse_transform(
            self.pca.inverse_transform([center])
        )[0]
        
        return {
            'success': True,
            'cluster_id': cluster_id,
            'center': center_original.tolist(),
            'size': 0,  # Would need data to calculate
            'characteristics': {
                'typical_hour': int(center_original[0]) if len(center_original) > 0 else 12,
                'typical_day': int(center_original[1]) if len(center_original) > 1 else 3,
                'typical_month': int(center_original[2]) if len(center_original) > 2 else 6
            }
        }
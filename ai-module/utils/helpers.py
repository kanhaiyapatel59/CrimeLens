"""
Helper Functions - Common utilities for AI module
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class Helpers:
    """Utility functions for AI module"""
    
    @staticmethod
    def prepare_crime_data(crimes):
        """Prepare crime data for ML models"""
        df = pd.DataFrame(crimes)
        
        # Extract features
        features = {}
        
        # Temporal features
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            features['day_of_week'] = df['date'].dt.dayofweek.values
            features['month'] = df['date'].dt.month.values
            features['quarter'] = df['date'].dt.quarter.values
            features['hour'] = df['date'].dt.hour.values if 'hour' in df.columns else np.zeros(len(df))
        
        # Spatial features
        if 'location' in df.columns:
            features['latitude'] = df['location'].apply(
                lambda x: x.get('coordinates', [0, 0])[1] if x else 0
            ).values
            features['longitude'] = df['location'].apply(
                lambda x: x.get('coordinates', [0, 0])[0] if x else 0
            ).values
        
        # Categorical features
        if 'crimeType' in df.columns:
            features['crime_type'] = df['crimeType'].values
        
        if 'severity' in df.columns:
            severity_map = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
            features['severity'] = df['severity'].map(severity_map).values
        
        if 'status' in df.columns:
            status_map = {'reported': 0, 'investigating': 1, 'in_progress': 2, 
                         'resolved': 3, 'closed': 4, 'pending': 5}
            features['status'] = df['status'].map(status_map).values
        
        return features
    
    @staticmethod
    def prepare_suspect_data(suspects):
        """Prepare suspect data for risk scoring"""
        df = pd.DataFrame(suspects)
        
        features = {}
        
        # Criminal history
        if 'criminalHistory' in df.columns:
            features['criminal_count'] = df['criminalHistory'].apply(len).values
        
        if 'currentCrimes' in df.columns:
            features['current_crimes'] = df['currentCrimes'].apply(len).values
        
        # Risk assessment
        if 'riskAssessment' in df.columns:
            features['risk_score'] = df['riskAssessment'].apply(
                lambda x: x.get('score', 0) if x else 0
            ).values
        
        # Age
        if 'age' in df.columns:
            features['age'] = df['age'].values
        
        return features
    
    @staticmethod
    def normalize_data(data, min_val=0, max_val=1):
        """Normalize data to range [min_val, max_val]"""
        if not data:
            return data
        
        data_min = np.min(data)
        data_max = np.max(data)
        
        if data_max == data_min:
            return np.zeros_like(data)
        
        return min_val + (data - data_min) / (data_max - data_min) * (max_val - min_val)
    
    @staticmethod
    def create_time_features(date):
        """Create time-based features from a date"""
        if isinstance(date, str):
            date = datetime.fromisoformat(date)
        
        return {
            'year': date.year,
            'month': date.month,
            'day': date.day,
            'day_of_week': date.weekday(),
            'quarter': (date.month - 1) // 3 + 1,
            'is_weekend': 1 if date.weekday() >= 5 else 0,
            'is_holiday': 0  # Would need holiday data
        }
    
    @staticmethod
    def calculate_risk_score(age, criminal_count, severity, recidivism):
        """Calculate risk score based on multiple factors"""
        score = 0
        
        # Age factor (younger = higher risk)
        if age < 25:
            score += 30
        elif age < 35:
            score += 20
        elif age < 50:
            score += 10
        else:
            score += 5
        
        # Criminal history factor
        score += min(criminal_count * 10, 40)
        
        # Severity factor
        severity_map = {'low': 0, 'medium': 10, 'high': 20, 'critical': 30}
        score += severity_map.get(severity, 10)
        
        # Recidivism factor
        if recidivism:
            score += 20
        
        return min(score, 100)
    
    @staticmethod
    def load_json_file(filepath):
        """Load JSON file"""
        with open(filepath, 'r') as f:
            return json.load(f)
    
    @staticmethod
    def save_json_file(data, filepath):
        """Save data to JSON file"""
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    @staticmethod
    def get_date_range(days=30):
        """Get date range for last N days"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        return start_date, end_date
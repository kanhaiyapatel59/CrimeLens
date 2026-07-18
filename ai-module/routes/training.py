"""
Training Routes - Model training endpoints
"""

from flask import Blueprint, request, jsonify
import logging
import pandas as pd
from datetime import datetime

from models.crime_predictor import CrimePredictor
from models.risk_scorer import RiskScorer
from models.anomaly_detector import AnomalyDetector
from models.mo_detector import MODetector
from utils.db_connection import db

logger = logging.getLogger(__name__)
training_bp = Blueprint('training', __name__)


@training_bp.route('/crime', methods=['POST'])
def train_crime_predictor():
    """Train the crime prediction model"""
    try:
        data = request.get_json()
        
        # Get training data from database or request
        if data and data.get('crimes'):
            crimes = data['crimes']
        else:
            # Fetch from database
            collection = db.get_collection('crimeincidents')
            crimes = list(collection.find({
                'deletedAt': None
            }).limit(1000))
        
        if not crimes:
            return jsonify({
                'success': False,
                'error': 'No training data available'
            }), 400
        
        # Prepare data
        df = pd.DataFrame(crimes)
        
        # Extract features and target
        # For demonstration, use severity as target
        severity_map = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
        target = df['severity'].map(severity_map).fillna(0).values
        
        # Train model
        predictor = CrimePredictor()
        result = predictor.train(df, target)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Crime predictor trained successfully',
                'metrics': result['metrics'],
                'model_type': result['model_type']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Training failed')
            }), 500
            
    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@training_bp.route('/risk', methods=['POST'])
def train_risk_scorer():
    """Train the risk scoring model"""
    try:
        data = request.get_json()
        
        if not data or not data.get('data') or not data.get('labels'):
            return jsonify({
                'success': False,
                'error': 'Training data and labels required'
            }), 400
        
        # Prepare data
        df = pd.DataFrame(data['data'])
        labels = data['labels']
        
        # Train model
        scorer = RiskScorer()
        result = scorer.train(df, labels)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Risk scorer trained successfully',
                'metrics': result['metrics']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Training failed')
            }), 500
            
    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@training_bp.route('/anomaly', methods=['POST'])
def train_anomaly_detector():
    """Train the anomaly detection model"""
    try:
        data = request.get_json()
        
        # Get training data
        if data and data.get('crimes'):
            crimes = data['crimes']
        else:
            # Fetch from database
            collection = db.get_collection('crimeincidents')
            crimes = list(collection.find({
                'deletedAt': None
            }).limit(1000))
        
        if not crimes:
            return jsonify({
                'success': False,
                'error': 'No training data available'
            }), 400
        
        # Prepare data
        df = pd.DataFrame(crimes)
        
        # Train model
        detector = AnomalyDetector()
        result = detector.train(df)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Anomaly detector trained successfully',
                'training_samples': result['training_samples']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Training failed')
            }), 500
            
    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@training_bp.route('/mo', methods=['POST'])
def train_mo_detector():
    """Train the Modus Operandi detector"""
    try:
        data = request.get_json()
        
        # Get training data
        if data and data.get('crimes'):
            crimes = data['crimes']
            n_clusters = data.get('n_clusters', 8)
        else:
            # Fetch from database
            collection = db.get_collection('crimeincidents')
            crimes = list(collection.find({
                'deletedAt': None
            }).limit(1000))
            n_clusters = 8
        
        if not crimes:
            return jsonify({
                'success': False,
                'error': 'No training data available'
            }), 400
        
        # Prepare data
        df = pd.DataFrame(crimes)
        
        # Train model
        detector = MODetector()
        result = detector.train(df, n_clusters)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'MO detector trained successfully',
                'n_clusters': result['n_clusters'],
                'inertia': result['inertia']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Training failed')
            }), 500
            
    except Exception as e:
        logger.error(f"Training error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@training_bp.route('/status', methods=['GET'])
def training_status():
    """Get training status of all models"""
    return jsonify({
        'success': True,
        'models': {
            'crime_predictor': CrimePredictor().is_trained,
            'risk_scorer': RiskScorer().is_trained,
            'anomaly_detector': AnomalyDetector().is_trained,
            'mo_detector': MODetector().is_trained
        }
    })
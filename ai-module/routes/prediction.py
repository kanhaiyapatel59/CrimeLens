"""
Prediction Routes - AI prediction endpoints
"""

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime, timedelta

from models.crime_predictor import CrimePredictor
from models.risk_scorer import RiskScorer
from models.anomaly_detector import AnomalyDetector
from models.mo_detector import MODetector
from utils.db_connection import db

logger = logging.getLogger(__name__)
prediction_bp = Blueprint('prediction', __name__)

# Initialize models
crime_predictor = CrimePredictor()
risk_scorer = RiskScorer()
anomaly_detector = AnomalyDetector()
mo_detector = MODetector()


@prediction_bp.route('/crime', methods=['POST'])
def predict_crime():
    """Predict crime occurrences"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Get locations and date range
        locations = data.get('locations', [])
        days = data.get('days', 30)
        
        # Generate date range
        start_date = datetime.now()
        date_range = [start_date + timedelta(days=i) for i in range(days)]
        
        # Make predictions
        result = crime_predictor.predict_hotspots(locations, date_range)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'predictions': result['predictions'],
                'count': result['count']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Prediction failed')
            }), 500
            
    except Exception as e:
        logger.error(f"Crime prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@prediction_bp.route('/risk', methods=['POST'])
def predict_risk():
    """Predict risk scores for individuals"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Get individual data
        individuals = data.get('individuals', [])
        
        if not individuals:
            return jsonify({
                'success': False,
                'error': 'No individuals provided'
            }), 400
        
        # Prepare data
        import pandas as pd
        df = pd.DataFrame(individuals)
        
        # Predict risk
        result = risk_scorer.predict(df)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'risk_scores': result['risk_scores'],
                'risk_levels': result['risk_levels']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Risk prediction failed')
            }), 500
            
    except Exception as e:
        logger.error(f"Risk prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@prediction_bp.route('/anomaly', methods=['POST'])
def detect_anomalies():
    """Detect anomalies in crime data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Get crime data
        crimes = data.get('crimes', [])
        
        if not crimes:
            return jsonify({
                'success': False,
                'error': 'No crime data provided'
            }), 400
        
        # Prepare data
        import pandas as pd
        df = pd.DataFrame(crimes)
        
        # Detect anomalies
        result = anomaly_detector.detect(df)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'anomalies': result['is_anomaly'],
                'anomaly_scores': result['anomaly_scores'],
                'anomaly_count': result['anomaly_count'],
                'normal_count': result['normal_count']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Anomaly detection failed')
            }), 500
            
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@prediction_bp.route('/mo', methods=['POST'])
def detect_mo():
    """Detect Modus Operandi patterns"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Get crime data
        crimes = data.get('crimes', [])
        
        if not crimes:
            return jsonify({
                'success': False,
                'error': 'No crime data provided'
            }), 400
        
        # Prepare data
        import pandas as pd
        df = pd.DataFrame(crimes)
        
        # Detect MO patterns
        result = mo_detector.detect(df)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'cluster_ids': result['cluster_ids'],
                'confidence_scores': result['confidence_scores'],
                'n_clusters': result['n_clusters']
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'MO detection failed')
            }), 500
            
    except Exception as e:
        logger.error(f"MO detection error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@prediction_bp.route('/cluster/<int:cluster_id>', methods=['GET'])
def describe_cluster(cluster_id):
    """Describe a specific MO cluster"""
    try:
        result = mo_detector.describe_cluster(cluster_id)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'cluster': result
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to describe cluster')
            }), 404
            
    except Exception as e:
        logger.error(f"Describe cluster error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
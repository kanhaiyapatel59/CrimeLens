"""
Analysis Routes - Data analysis endpoints
"""

from flask import Blueprint, request, jsonify
import logging
import pandas as pd
from datetime import datetime, timedelta

from utils.db_connection import db
from utils.helpers import Helpers

logger = logging.getLogger(__name__)
analysis_bp = Blueprint('analysis', __name__)


@analysis_bp.route('/correlation', methods=['POST'])
def analyze_correlation():
    """Analyze correlation between crime and socio-economic factors"""
    try:
        data = request.get_json()
        
        # Get crime data
        crimes = data.get('crimes', [])
        socio_economic = data.get('socio_economic', [])
        
        if not crimes:
            # Fetch from database
            collection = db.get_collection('crimeincidents')
            crimes = list(collection.find({
                'deletedAt': None
            }).limit(1000))
        
        if not crimes:
            return jsonify({
                'success': False,
                'error': 'No crime data available'
            }), 400
        
        # Analyze patterns
        df = pd.DataFrame(crimes)
        
        analysis = {
            'temporal_patterns': analyze_temporal(df),
            'spatial_patterns': analyze_spatial(df),
            'severity_distribution': analyze_severity(df),
            'crime_type_distribution': analyze_crime_types(df)
        }
        
        if socio_economic:
            analysis['socio_economic_correlation'] = analyze_socio_economic(df, socio_economic)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def analyze_temporal(df):
    """Analyze temporal patterns"""
    df['date'] = pd.to_datetime(df['date'])
    
    return {
        'hourly_distribution': df['hour'].value_counts().to_dict() if 'hour' in df else {},
        'daily_distribution': df['date'].dt.dayofweek.value_counts().to_dict(),
        'monthly_distribution': df['date'].dt.month.value_counts().to_dict(),
        'seasonal_patterns': {
            'Q1': len(df[df['date'].dt.quarter == 1]),
            'Q2': len(df[df['date'].dt.quarter == 2]),
            'Q3': len(df[df['date'].dt.quarter == 3]),
            'Q4': len(df[df['date'].dt.quarter == 4])
        }
    }


def analyze_spatial(df):
    """Analyze spatial patterns"""
    if 'latitude' in df and 'longitude' in df:
        return {
            'center': {
                'latitude': df['latitude'].mean(),
                'longitude': df['longitude'].mean()
            },
            'spread': {
                'latitude_std': df['latitude'].std(),
                'longitude_std': df['longitude'].std()
            },
            'cluster_count': len(df.groupby(['latitude', 'longitude']))
        }
    return {}


def analyze_severity(df):
    """Analyze severity distribution"""
    severity_map = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
    severity_counts = df['severity'].value_counts().to_dict() if 'severity' in df else {}
    
    return {
        'distribution': severity_counts,
        'average_severity': df['severity'].map(severity_map).mean() if 'severity' in df else 0,
        'critical_count': len(df[df['severity'] == 'critical']) if 'severity' in df else 0
    }


def analyze_crime_types(df):
    """Analyze crime type distribution"""
    if 'crime_type' in df:
        return df['crime_type'].value_counts().to_dict()
    return {}


def analyze_socio_economic(crime_df, socio_economic_df):
    """Analyze correlation with socio-economic factors"""
    # This would require merging data and calculating correlations
    # Simplified version
    return {
        'correlation': 'Analysis requires merged data',
        'factors': ['income', 'population_density', 'literacy_rate']
    }


@analysis_bp.route('/trends', methods=['POST'])
def analyze_trends():
    """Analyze crime trends over time"""
    try:
        data = request.get_json()
        
        days = data.get('days', 30)
        interval = data.get('interval', 'day')  # day, week, month
        
        # Fetch data
        collection = db.get_collection('crimeincidents')
        start_date = datetime.now() - timedelta(days=days)
        
        crimes = list(collection.find({
            'date': {'$gte': start_date},
            'deletedAt': None
        }))
        
        if not crimes:
            return jsonify({
                'success': False,
                'error': 'No crime data available'
            }), 400
        
        df = pd.DataFrame(crimes)
        df['date'] = pd.to_datetime(df['date'])
        
        # Group by interval
        if interval == 'day':
            df['period'] = df['date'].dt.date
        elif interval == 'week':
            df['period'] = df['date'].dt.to_period('W').dt.start_time
        else:
            df['period'] = df['date'].dt.to_period('M').dt.start_time
        
        trends = df.groupby('period').size().to_dict()
        
        # Calculate trend indicators
        values = list(trends.values())
        if len(values) > 1:
            trend_direction = 'increasing' if values[-1] > values[0] else 'decreasing'
            trend_rate = (values[-1] - values[0]) / values[0] * 100 if values[0] > 0 else 0
        else:
            trend_direction = 'stable'
            trend_rate = 0
        
        return jsonify({
            'success': True,
            'trends': {
                'periods': list(trends.keys()),
                'values': list(trends.values()),
                'direction': trend_direction,
                'rate': round(trend_rate, 2),
                'total': sum(values)
            }
        })
        
    except Exception as e:
        logger.error(f"Trend analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@analysis_bp.route('/hotspots', methods=['POST'])
def analyze_hotspots():
    """Analyze crime hotspots"""
    try:
        data = request.get_json()
        
        days = data.get('days', 30)
        min_crimes = data.get('min_crimes', 3)
        
        # Fetch data
        collection = db.get_collection('crimeincidents')
        start_date = datetime.now() - timedelta(days=days)
        
        crimes = list(collection.find({
            'date': {'$gte': start_date},
            'deletedAt': None
        }))
        
        if not crimes:
            return jsonify({
                'success': False,
                'error': 'No crime data available'
            }), 400
        
        df = pd.DataFrame(crimes)
        
        # Group by location
        if 'latitude' in df and 'longitude' in df:
            hotspots = df.groupby(['latitude', 'longitude']).size()
            hotspots = hotspots[hotspots >= min_crimes]
            
            return jsonify({
                'success': True,
                'hotspots': [
                    {
                        'latitude': float(lat),
                        'longitude': float(lon),
                        'crime_count': int(count)
                    }
                    for (lat, lon), count in hotspots.items()
                ],
                'count': len(hotspots)
            })
        
        return jsonify({
            'success': False,
            'error': 'Location data not available'
        }), 400
        
    except Exception as e:
        logger.error(f"Hotspot analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
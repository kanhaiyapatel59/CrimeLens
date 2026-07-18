"""
CrimeLens AI Module - Flask Application
Provides AI/ML services for crime intelligence
"""

import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s [%(name)s] %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)

# Import routes
from routes.prediction import prediction_bp
from routes.training import training_bp
from routes.analysis import analysis_bp

# Register blueprints
app.register_blueprint(prediction_bp, url_prefix='/api/predict')
app.register_blueprint(training_bp, url_prefix='/api/train')
app.register_blueprint(analysis_bp, url_prefix='/api/analyze')

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'crime-ai',
        'version': '1.0.0',
        'timestamp': __import__('datetime').datetime.now().isoformat()
    })

# Error handler
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('AI_PORT', 5001))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"🚀 Starting CrimeLens AI Module on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
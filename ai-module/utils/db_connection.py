"""
Database Connection Helper - MongoDB connection for AI module
"""

import os
import logging
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class DatabaseConnection:
    """MongoDB connection manager for AI module"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize MongoDB connection"""
        try:
            mongo_uri = os.getenv('MONGODB_URI') or \
                f"mongodb://{os.getenv('MONGO_USERNAME')}:{os.getenv('MONGO_PASSWORD')}@" \
                f"{os.getenv('MONGO_HOST')}:{os.getenv('MONGO_PORT')}/" \
                f"{os.getenv('MONGO_DATABASE')}?authSource=admin"
            
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            self.db = self.client[os.getenv('MONGO_DATABASE', 'crimelens')]
            
            # Test connection
            self.client.admin.command('ping')
            logger.info("✅ Connected to MongoDB successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    def get_collection(self, collection_name):
        """Get a collection from the database"""
        return self.db[collection_name]
    
    def close(self):
        """Close the database connection"""
        if self.client:
            self.client.close()
            logger.info("✅ MongoDB connection closed")


# Singleton instance
db = DatabaseConnection()
"""
Model Service for ML Model Management and Inference
Handles model loading, prediction, and serving
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import joblib
import tensorflow as tf
from pathlib import Path

from ..models.carbon_sequestration_model import CarbonSequestrationModel
from ..models.satellite_image_classifier import SatelliteImageClassifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelService:
    """
    Service for managing and serving ML models
    """
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        
        self.carbon_model = None
        self.satellite_classifier = None
        self.model_metadata = {}
        
        # Load existing models
        self._load_models()
    
    def _load_models(self) -> None:
        """Load existing trained models"""
        try:
            # Load carbon sequestration model
            carbon_model_path = self.models_dir / "carbon_sequestration_model.pkl"
            if carbon_model_path.exists():
                self.carbon_model = CarbonSequestrationModel()
                self.carbon_model.load_model(str(carbon_model_path))
                logger.info("Carbon sequestration model loaded")
            
            # Load satellite classifier
            satellite_model_path = self.models_dir / "satellite_classifier.h5"
            if satellite_model_path.exists():
                self.satellite_classifier = SatelliteImageClassifier()
                self.satellite_classifier.load_model(str(satellite_model_path))
                logger.info("Satellite image classifier loaded")
            
            # Load model metadata
            metadata_path = self.models_dir / "model_metadata.json"
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    self.model_metadata = json.load(f)
                logger.info("Model metadata loaded")
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    def _save_metadata(self) -> None:
        """Save model metadata"""
        metadata_path = self.models_dir / "model_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(self.model_metadata, f, indent=2, default=str)
    
    def train_carbon_model(self, data: pd.DataFrame, 
                          model_type: str = 'xgboost') -> Dict[str, Any]:
        """Train the carbon sequestration model"""
        try:
            logger.info("Training carbon sequestration model...")
            
            self.carbon_model = CarbonSequestrationModel(model_type)
            results = self.carbon_model.train(data)
            
            # Save model
            model_path = self.models_dir / "carbon_sequestration_model.pkl"
            self.carbon_model.save_model(str(model_path))
            
            # Update metadata
            self.model_metadata['carbon_model'] = {
                'model_type': model_type,
                'trained_at': datetime.now().isoformat(),
                'performance': results['validation_metrics'],
                'n_features': results['n_features'],
                'n_samples': results['n_samples']
            }
            self._save_metadata()
            
            logger.info("Carbon sequestration model trained and saved")
            return results
            
        except Exception as e:
            logger.error(f"Error training carbon model: {e}")
            raise
    
    def train_satellite_classifier(self, train_dir: str, val_dir: str,
                                 epochs: int = 100) -> Dict[str, Any]:
        """Train the satellite image classifier"""
        try:
            logger.info("Training satellite image classifier...")
            
            self.satellite_classifier = SatelliteImageClassifier()
            self.satellite_classifier.compile_model()
            
            # Create data generators
            train_gen, val_gen = self.satellite_classifier.create_data_generators(
                train_dir, val_dir
            )
            
            # Train model
            results = self.satellite_classifier.train(train_gen, val_gen, epochs)
            
            # Save model
            model_path = self.models_dir / "satellite_classifier.h5"
            self.satellite_classifier.save_model(str(model_path))
            
            # Update metadata
            self.model_metadata['satellite_classifier'] = {
                'trained_at': datetime.now().isoformat(),
                'performance': {
                    'val_accuracy': results['val_accuracy'],
                    'val_top3_accuracy': results['val_top3_accuracy']
                },
                'epochs_trained': results['epochs_trained']
            }
            self._save_metadata()
            
            logger.info("Satellite image classifier trained and saved")
            return results
            
        except Exception as e:
            logger.error(f"Error training satellite classifier: {e}")
            raise
    
    def predict_carbon_sequestration(self, data: Union[pd.DataFrame, Dict[str, Any]]) -> Dict[str, Any]:
        """Predict carbon sequestration for given data"""
        if self.carbon_model is None or not self.carbon_model.is_trained:
            raise ValueError("Carbon sequestration model not trained")
        
        try:
            # Convert dict to DataFrame if needed
            if isinstance(data, dict):
                data = pd.DataFrame([data])
            
            # Make predictions
            predictions = self.carbon_model.predict(data)
            
            # Format results
            results = {
                'predictions': {
                    'carbon_stored': predictions['carbon_stored'].tolist(),
                    'sequestration_rate': predictions['sequestration_rate'].tolist()
                },
                'model_info': self.carbon_model.get_model_info(),
                'timestamp': datetime.now().isoformat()
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Error making carbon predictions: {e}")
            raise
    
    def classify_satellite_image(self, image_path: str) -> Dict[str, Any]:
        """Classify a satellite image"""
        if self.satellite_classifier is None or not self.satellite_classifier.is_trained:
            raise ValueError("Satellite image classifier not trained")
        
        try:
            # Make prediction
            predicted_class, confidence = self.satellite_classifier.predict_single_image(image_path)
            
            # Format results
            results = {
                'prediction': {
                    'class': predicted_class,
                    'confidence': float(confidence)
                },
                'model_info': {
                    'is_trained': self.satellite_classifier.is_trained,
                    'num_classes': self.satellite_classifier.num_classes,
                    'class_names': self.satellite_classifier.class_names
                },
                'timestamp': datetime.now().isoformat()
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Error classifying satellite image: {e}")
            raise
    
    def batch_predict_carbon(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Make batch predictions for carbon sequestration"""
        if self.carbon_model is None or not self.carbon_model.is_trained:
            raise ValueError("Carbon sequestration model not trained")
        
        try:
            # Make predictions
            predictions = self.carbon_model.predict(data)
            
            # Add predictions to original data
            result_df = data.copy()
            result_df['predicted_carbon_stored'] = predictions['carbon_stored']
            result_df['predicted_sequestration_rate'] = predictions['sequestration_rate']
            
            # Calculate summary statistics
            summary = {
                'total_samples': len(data),
                'avg_carbon_stored': float(np.mean(predictions['carbon_stored'])),
                'avg_sequestration_rate': float(np.mean(predictions['sequestration_rate'])),
                'total_carbon_stored': float(np.sum(predictions['carbon_stored'])),
                'total_sequestration_rate': float(np.sum(predictions['sequestration_rate']))
            }
            
            results = {
                'predictions': result_df.to_dict('records'),
                'summary': summary,
                'model_info': self.carbon_model.get_model_info(),
                'timestamp': datetime.now().isoformat()
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Error making batch carbon predictions: {e}")
            raise
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        status = {
            'carbon_model': {
                'available': self.carbon_model is not None and self.carbon_model.is_trained,
                'metadata': self.model_metadata.get('carbon_model', {})
            },
            'satellite_classifier': {
                'available': self.satellite_classifier is not None and self.satellite_classifier.is_trained,
                'metadata': self.model_metadata.get('satellite_classifier', {})
            },
            'models_directory': str(self.models_dir),
            'last_updated': datetime.now().isoformat()
        }
        
        return status
    
    def get_model_performance(self, model_name: str) -> Dict[str, Any]:
        """Get performance metrics for a specific model"""
        if model_name not in self.model_metadata:
            raise ValueError(f"Model {model_name} not found")
        
        return self.model_metadata[model_name]
    
    def retrain_model(self, model_name: str, **kwargs) -> Dict[str, Any]:
        """Retrain a specific model with new data"""
        if model_name == 'carbon_model':
            if 'data' not in kwargs:
                raise ValueError("Training data required for carbon model")
            return self.train_carbon_model(kwargs['data'], kwargs.get('model_type', 'xgboost'))
        
        elif model_name == 'satellite_classifier':
            if 'train_dir' not in kwargs or 'val_dir' not in kwargs:
                raise ValueError("Training and validation directories required for satellite classifier")
            return self.train_satellite_classifier(
                kwargs['train_dir'], 
                kwargs['val_dir'], 
                kwargs.get('epochs', 100)
            )
        
        else:
            raise ValueError(f"Unknown model: {model_name}")
    
    def validate_model(self, model_name: str, test_data: Any) -> Dict[str, Any]:
        """Validate a model with test data"""
        if model_name == 'carbon_model':
            if self.carbon_model is None or not self.carbon_model.is_trained:
                raise ValueError("Carbon model not trained")
            
            # Make predictions on test data
            predictions = self.carbon_model.predict(test_data)
            
            # Calculate validation metrics (simplified)
            validation_results = {
                'model_name': model_name,
                'validation_timestamp': datetime.now().isoformat(),
                'predictions_count': len(predictions['carbon_stored']),
                'avg_carbon_stored': float(np.mean(predictions['carbon_stored'])),
                'avg_sequestration_rate': float(np.mean(predictions['sequestration_rate']))
            }
            
            return validation_results
        
        elif model_name == 'satellite_classifier':
            if self.satellite_classifier is None or not self.satellite_classifier.is_trained:
                raise ValueError("Satellite classifier not trained")
            
            # This would require test data generator
            # For now, return basic validation info
            validation_results = {
                'model_name': model_name,
                'validation_timestamp': datetime.now().isoformat(),
                'model_available': True
            }
            
            return validation_results
        
        else:
            raise ValueError(f"Unknown model: {model_name}")


# Global model service instance
model_service = ModelService()


def get_model_service() -> ModelService:
    """Get the global model service instance"""
    return model_service

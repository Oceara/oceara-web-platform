"""
CNN Models for Mangrove and Wetland Analysis
- Crown detection from drone imagery
- Species classification (Rhizophora, Avicennia, Bruguiera)
- Tree health assessment from satellite data
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
import cv2
from typing import Dict, List, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CrownDetectionCNN:
    """
    CNN model for detecting tree crowns in drone imagery
    """
    
    def __init__(self, input_shape: Tuple[int, int, int] = (256, 256, 3)):
        self.input_shape = input_shape
        self.model = self._build_model()
        
    def _build_model(self) -> keras.Model:
        """Build the crown detection CNN architecture"""
        
        inputs = keras.Input(shape=self.input_shape, name='drone_image')
        
        # Encoder (Feature Extraction)
        x = layers.Conv2D(32, 3, activation='relu', padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(32, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        
        x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        
        x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        
        x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        
        # Decoder (Segmentation)
        x = layers.Conv2DTranspose(128, 3, strides=2, activation='relu', padding='same')(x)
        x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
        
        x = layers.Conv2DTranspose(64, 3, strides=2, activation='relu', padding='same')(x)
        x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
        
        x = layers.Conv2DTranspose(32, 3, strides=2, activation='relu', padding='same')(x)
        x = layers.Conv2D(32, 3, activation='relu', padding='same')(x)
        
        x = layers.Conv2DTranspose(16, 3, strides=2, activation='relu', padding='same')(x)
        x = layers.Conv2D(16, 3, activation='relu', padding='same')(x)
        
        # Output layer for crown segmentation
        outputs = layers.Conv2D(1, 1, activation='sigmoid', name='crown_mask')(x)
        
        model = keras.Model(inputs, outputs, name='crown_detection_cnn')
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        return model
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess drone image for crown detection"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Convert BGR to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize to model input shape
            image = cv2.resize(image, (self.input_shape[0], self.input_shape[1]))
            
            # Normalize pixel values
            image = image.astype(np.float32) / 255.0
            
            # Add batch dimension
            image = np.expand_dims(image, axis=0)
            
            return image
            
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {str(e)}")
            raise
    
    def detect_crowns(self, image_path: str) -> Dict:
        """Detect tree crowns in drone imagery"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_path)
            
            # Make prediction
            prediction = self.model.predict(processed_image, verbose=0)
            
            # Post-process prediction
            crown_mask = (prediction[0] > 0.5).astype(np.uint8)
            
            # Count crowns (connected components)
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(crown_mask, connectivity=8)
            crown_count = num_labels - 1  # Subtract background label
            
            # Calculate crown coverage percentage
            total_pixels = crown_mask.shape[0] * crown_mask.shape[1]
            crown_pixels = np.sum(crown_mask)
            coverage_percentage = (crown_pixels / total_pixels) * 100
            
            return {
                'crown_count': crown_count,
                'coverage_percentage': round(coverage_percentage, 2),
                'crown_mask': crown_mask.tolist(),
                'centroids': centroids[1:].tolist() if crown_count > 0 else [],  # Exclude background
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error detecting crowns: {str(e)}")
            return {
                'crown_count': 0,
                'coverage_percentage': 0.0,
                'crown_mask': [],
                'centroids': [],
                'status': 'error',
                'error': str(e)
            }


class SpeciesClassificationCNN:
    """
    CNN model for classifying mangrove species
    """
    
    def __init__(self, input_shape: Tuple[int, int, int] = (224, 224, 3)):
        self.input_shape = input_shape
        self.species_classes = ['Rhizophora', 'Avicennia', 'Bruguiera', 'Other']
        self.model = self._build_model()
        
    def _build_model(self) -> keras.Model:
        """Build the species classification CNN architecture"""
        
        inputs = keras.Input(shape=self.input_shape, name='tree_image')
        
        # Use EfficientNet backbone for better performance
        base_model = keras.applications.EfficientNetB3(
            weights='imagenet',
            include_top=False,
            input_tensor=inputs
        )
        
        # Freeze early layers
        for layer in base_model.layers[:-20]:
            layer.trainable = False
        
        # Add custom classification head
        x = base_model.output
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(512, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        
        # Output layer for species classification
        outputs = layers.Dense(len(self.species_classes), activation='softmax', name='species_classification')(x)
        
        model = keras.Model(inputs, outputs, name='species_classification_cnn')
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        return model
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess tree image for species classification"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Convert BGR to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize to model input shape
            image = cv2.resize(image, (self.input_shape[0], self.input_shape[1]))
            
            # Normalize pixel values (EfficientNet preprocessing)
            image = keras.applications.efficientnet.preprocess_input(image)
            
            # Add batch dimension
            image = np.expand_dims(image, axis=0)
            
            return image
            
        except Exception as e:
            logger.error(f"Error preprocessing image {image_path}: {str(e)}")
            raise
    
    def classify_species(self, image_path: str) -> Dict:
        """Classify mangrove species from tree image"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image_path)
            
            # Make prediction
            prediction = self.model.predict(processed_image, verbose=0)
            
            # Get top predictions
            top_indices = np.argsort(prediction[0])[::-1][:3]
            top_predictions = []
            
            for idx in top_indices:
                species = self.species_classes[idx]
                confidence = float(prediction[0][idx])
                top_predictions.append({
                    'species': species,
                    'confidence': round(confidence, 4)
                })
            
            # Get primary prediction
            primary_species = self.species_classes[top_indices[0]]
            primary_confidence = float(prediction[0][top_indices[0]])
            
            return {
                'primary_species': primary_species,
                'primary_confidence': round(primary_confidence, 4),
                'all_predictions': top_predictions,
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error classifying species: {str(e)}")
            return {
                'primary_species': 'Unknown',
                'primary_confidence': 0.0,
                'all_predictions': [],
                'status': 'error',
                'error': str(e)
            }


class TreeHealthAssessmentCNN:
    """
    CNN model for assessing tree health from satellite imagery
    """
    
    def __init__(self, input_shape: Tuple[int, int, int] = (256, 256, 4)):
        self.input_shape = input_shape  # RGB + NIR bands
        self.health_classes = ['Healthy', 'Stressed', 'Diseased', 'Dead']
        self.model = self._build_model()
        
    def _build_model(self) -> keras.Model:
        """Build the tree health assessment CNN architecture"""
        
        inputs = keras.Input(shape=self.input_shape, name='satellite_image')
        
        # Multi-scale feature extraction
        x = layers.Conv2D(32, 3, activation='relu', padding='same')(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(32, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        
        x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        
        x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
        x = layers.MaxPooling2D(2)(x)
        
        x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
        x = layers.GlobalAveragePooling2D()(x)
        
        # Health assessment head
        x = layers.Dense(512, activation='relu')(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        
        # Output layer for health classification
        outputs = layers.Dense(len(self.health_classes), activation='softmax', name='health_classification')(x)
        
        model = keras.Model(inputs, outputs, name='tree_health_assessment_cnn')
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def preprocess_satellite_image(self, image_path: str) -> np.ndarray:
        """Preprocess satellite image for health assessment"""
        try:
            # Load multi-band satellite image (RGB + NIR)
            # For demo purposes, we'll simulate NIR band
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Convert BGR to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Simulate NIR band (in practice, this would come from satellite data)
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            nir_band = cv2.addWeighted(gray, 0.7, image[:,:,1], 0.3, 0)  # Simulate NIR
            
            # Combine RGB + NIR
            image_4band = np.dstack([image, nir_band])
            
            # Resize to model input shape
            image_4band = cv2.resize(image_4band, (self.input_shape[0], self.input_shape[1]))
            
            # Normalize pixel values
            image_4band = image_4band.astype(np.float32) / 255.0
            
            # Add batch dimension
            image_4band = np.expand_dims(image_4band, axis=0)
            
            return image_4band
            
        except Exception as e:
            logger.error(f"Error preprocessing satellite image {image_path}: {str(e)}")
            raise
    
    def assess_tree_health(self, image_path: str) -> Dict:
        """Assess tree health from satellite imagery"""
        try:
            # Preprocess image
            processed_image = self.preprocess_satellite_image(image_path)
            
            # Make prediction
            prediction = self.model.predict(processed_image, verbose=0)
            
            # Get health assessment
            health_index = np.argmax(prediction[0])
            health_status = self.health_classes[health_index]
            confidence = float(prediction[0][health_index])
            
            # Calculate health score (0-100)
            health_scores = {
                'Healthy': 90,
                'Stressed': 60,
                'Diseased': 30,
                'Dead': 0
            }
            health_score = health_scores[health_status]
            
            # Get all predictions
            all_predictions = []
            for i, health_class in enumerate(self.health_classes):
                all_predictions.append({
                    'health_status': health_class,
                    'confidence': round(float(prediction[0][i]), 4)
                })
            
            return {
                'health_status': health_status,
                'health_score': health_score,
                'confidence': round(confidence, 4),
                'all_predictions': all_predictions,
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error assessing tree health: {str(e)}")
            return {
                'health_status': 'Unknown',
                'health_score': 0,
                'confidence': 0.0,
                'all_predictions': [],
                'status': 'error',
                'error': str(e)
            }


class CNNModelManager:
    """
    Manager class for all CNN models
    """
    
    def __init__(self):
        self.crown_detector = CrownDetectionCNN()
        self.species_classifier = SpeciesClassificationCNN()
        self.health_assessor = TreeHealthAssessmentCNN()
        
        logger.info("CNN models initialized successfully")
    
    def process_drone_image(self, image_path: str) -> Dict:
        """Process drone image for crown detection and species classification"""
        try:
            # Detect crowns
            crown_results = self.crown_detector.detect_crowns(image_path)
            
            # Classify species
            species_results = self.species_classifier.classify_species(image_path)
            
            return {
                'crown_detection': crown_results,
                'species_classification': species_results,
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error processing drone image: {str(e)}")
            return {
                'crown_detection': {'status': 'error', 'error': str(e)},
                'species_classification': {'status': 'error', 'error': str(e)},
                'status': 'error',
                'error': str(e)
            }
    
    def process_satellite_image(self, image_path: str) -> Dict:
        """Process satellite image for health assessment"""
        try:
            # Assess tree health
            health_results = self.health_assessor.assess_tree_health(image_path)
            
            return {
                'health_assessment': health_results,
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error processing satellite image: {str(e)}")
            return {
                'health_assessment': {'status': 'error', 'error': str(e)},
                'status': 'error',
                'error': str(e)
            }
    
    def get_model_summaries(self) -> Dict:
        """Get summaries of all CNN models"""
        return {
            'crown_detection': {
                'input_shape': self.crown_detector.input_shape,
                'parameters': self.crown_detector.model.count_params(),
                'architecture': 'U-Net based segmentation'
            },
            'species_classification': {
                'input_shape': self.species_classifier.input_shape,
                'parameters': self.species_classifier.model.count_params(),
                'architecture': 'EfficientNetB3 based classification',
                'classes': self.species_classifier.species_classes
            },
            'health_assessment': {
                'input_shape': self.health_assessor.input_shape,
                'parameters': self.health_assessor.model.count_params(),
                'architecture': 'Multi-scale CNN',
                'classes': self.health_assessor.health_classes
            }
        }


# Example usage and testing
if __name__ == "__main__":
    # Initialize model manager
    cnn_manager = CNNModelManager()
    
    # Test with sample images (replace with actual image paths)
    sample_drone_image = "sample_drone.jpg"
    sample_satellite_image = "sample_satellite.jpg"
    
    # Process drone image
    if cv2.imread(sample_drone_image) is not None:
        drone_results = cnn_manager.process_drone_image(sample_drone_image)
        print("Drone Image Processing Results:")
        print(drone_results)
    
    # Process satellite image
    if cv2.imread(sample_satellite_image) is not None:
        satellite_results = cnn_manager.process_satellite_image(sample_satellite_image)
        print("\nSatellite Image Processing Results:")
        print(satellite_results)
    
    # Get model summaries
    model_summaries = cnn_manager.get_model_summaries()
    print("\nModel Summaries:")
    print(model_summaries)

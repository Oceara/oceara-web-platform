"""
Satellite Image Classification Model
CNN model for classifying blue carbon ecosystems from satellite imagery
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import cv2
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Any
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SatelliteImageClassifier:
    """
    CNN model for classifying blue carbon ecosystems from satellite imagery
    """
    
    def __init__(self, input_shape: Tuple[int, int, int] = (256, 256, 3), 
                 num_classes: int = 5):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = None
        self.class_names = ['mangrove', 'wetland', 'seagrass', 'saltmarsh', 'other']
        self.history = None
        self.is_trained = False
        
    def build_model(self) -> keras.Model:
        """Build the CNN architecture"""
        model = models.Sequential([
            # Input layer
            layers.Input(shape=self.input_shape),
            
            # First convolutional block
            layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Second convolutional block
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Third convolutional block
            layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Fourth convolutional block
            layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
            layers.BatchNormalization(),
            layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Dropout(0.25),
            
            # Global average pooling
            layers.GlobalAveragePooling2D(),
            
            # Dense layers
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            
            # Output layer
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        return model
    
    def compile_model(self, learning_rate: float = 0.001) -> None:
        """Compile the model with optimizer and loss function"""
        if self.model is None:
            self.model = self.build_model()
        
        optimizer = optimizers.Adam(learning_rate=learning_rate)
        
        self.model.compile(
            optimizer=optimizer,
            loss='categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        logger.info("Model compiled successfully")
    
    def create_data_generators(self, train_dir: str, val_dir: str, 
                             batch_size: int = 32) -> Tuple[ImageDataGenerator, ImageDataGenerator]:
        """Create data generators for training and validation"""
        
        # Training data generator with augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            vertical_flip=True,
            zoom_range=0.2,
            brightness_range=[0.8, 1.2],
            channel_shift_range=0.1,
            fill_mode='nearest'
        )
        
        # Validation data generator (no augmentation)
        val_datagen = ImageDataGenerator(rescale=1./255)
        
        # Create generators
        train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=self.input_shape[:2],
            batch_size=batch_size,
            class_mode='categorical',
            shuffle=True
        )
        
        val_generator = val_datagen.flow_from_directory(
            val_dir,
            target_size=self.input_shape[:2],
            batch_size=batch_size,
            class_mode='categorical',
            shuffle=False
        )
        
        return train_generator, val_generator
    
    def train(self, train_generator: ImageDataGenerator, 
              val_generator: ImageDataGenerator,
              epochs: int = 100,
              patience: int = 10) -> Dict[str, Any]:
        """Train the model"""
        
        if self.model is None:
            self.compile_model()
        
        # Callbacks
        callbacks_list = [
            callbacks.EarlyStopping(
                monitor='val_loss',
                patience=patience,
                restore_best_weights=True
            ),
            callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            callbacks.ModelCheckpoint(
                'best_model.h5',
                monitor='val_accuracy',
                save_best_only=True,
                mode='max'
            )
        ]
        
        # Train the model
        logger.info("Starting training...")
        self.history = self.model.fit(
            train_generator,
            epochs=epochs,
            validation_data=val_generator,
            callbacks=callbacks_list,
            verbose=1
        )
        
        self.is_trained = True
        
        # Evaluate the model
        val_loss, val_accuracy, val_top3_accuracy = self.model.evaluate(val_generator)
        
        results = {
            'val_loss': val_loss,
            'val_accuracy': val_accuracy,
            'val_top3_accuracy': val_top3_accuracy,
            'epochs_trained': len(self.history.history['loss']),
            'best_val_accuracy': max(self.history.history['val_accuracy'])
        }
        
        logger.info(f"Training completed. Best validation accuracy: {results['best_val_accuracy']:.4f}")
        return results
    
    def predict(self, images: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Make predictions on new images"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Preprocess images
        if images.max() > 1.0:
            images = images / 255.0
        
        # Make predictions
        predictions = self.model.predict(images)
        predicted_classes = np.argmax(predictions, axis=1)
        confidence_scores = np.max(predictions, axis=1)
        
        return predicted_classes, confidence_scores
    
    def predict_single_image(self, image_path: str) -> Tuple[str, float]:
        """Predict class for a single image"""
        # Load and preprocess image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, self.input_shape[:2])
        image = np.expand_dims(image, axis=0)
        image = image / 255.0
        
        # Make prediction
        predicted_class, confidence = self.predict(image)
        
        return self.class_names[predicted_class[0]], confidence[0]
    
    def evaluate(self, test_generator: ImageDataGenerator) -> Dict[str, Any]:
        """Evaluate the model on test data"""
        if not self.is_trained:
            raise ValueError("Model must be trained before evaluation")
        
        # Get predictions
        predictions = self.model.predict(test_generator)
        predicted_classes = np.argmax(predictions, axis=1)
        true_classes = test_generator.classes
        
        # Calculate metrics
        test_loss, test_accuracy, test_top3_accuracy = self.model.evaluate(test_generator)
        
        # Classification report
        class_report = classification_report(
            true_classes, 
            predicted_classes, 
            target_names=self.class_names,
            output_dict=True
        )
        
        # Confusion matrix
        conf_matrix = confusion_matrix(true_classes, predicted_classes)
        
        results = {
            'test_loss': test_loss,
            'test_accuracy': test_accuracy,
            'test_top3_accuracy': test_top3_accuracy,
            'classification_report': class_report,
            'confusion_matrix': conf_matrix.tolist()
        }
        
        return results
    
    def plot_training_history(self, save_path: str = None) -> None:
        """Plot training history"""
        if self.history is None:
            logger.warning("No training history available")
            return
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Loss
        axes[0, 0].plot(self.history.history['loss'], label='Training Loss')
        axes[0, 0].plot(self.history.history['val_loss'], label='Validation Loss')
        axes[0, 0].set_title('Model Loss')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Loss')
        axes[0, 0].legend()
        
        # Accuracy
        axes[0, 1].plot(self.history.history['accuracy'], label='Training Accuracy')
        axes[0, 1].plot(self.history.history['val_accuracy'], label='Validation Accuracy')
        axes[0, 1].set_title('Model Accuracy')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Accuracy')
        axes[0, 1].legend()
        
        # Top-3 Accuracy
        axes[1, 0].plot(self.history.history['top_3_accuracy'], label='Training Top-3 Accuracy')
        axes[1, 0].plot(self.history.history['val_top_3_accuracy'], label='Validation Top-3 Accuracy')
        axes[1, 0].set_title('Model Top-3 Accuracy')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Top-3 Accuracy')
        axes[1, 0].legend()
        
        # Learning rate (if available)
        if 'lr' in self.history.history:
            axes[1, 1].plot(self.history.history['lr'])
            axes[1, 1].set_title('Learning Rate')
            axes[1, 1].set_xlabel('Epoch')
            axes[1, 1].set_ylabel('Learning Rate')
            axes[1, 1].set_yscale('log')
        else:
            axes[1, 1].axis('off')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Training history plot saved to {save_path}")
        
        plt.show()
    
    def plot_confusion_matrix(self, conf_matrix: np.ndarray, save_path: str = None) -> None:
        """Plot confusion matrix"""
        plt.figure(figsize=(10, 8))
        sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues',
                   xticklabels=self.class_names, yticklabels=self.class_names)
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted Class')
        plt.ylabel('True Class')
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            logger.info(f"Confusion matrix plot saved to {save_path}")
        
        plt.show()
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        self.model.save(filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model"""
        self.model = keras.models.load_model(filepath)
        self.is_trained = True
        logger.info(f"Model loaded from {filepath}")
    
    def get_model_summary(self) -> str:
        """Get model architecture summary"""
        if self.model is None:
            return "Model not built yet"
        
        import io
        import sys
        
        old_stdout = sys.stdout
        sys.stdout = buffer = io.StringIO()
        self.model.summary()
        summary = buffer.getvalue()
        sys.stdout = old_stdout
        
        return summary


def create_sample_data(data_dir: str, n_samples_per_class: int = 100) -> None:
    """Create sample satellite image data for testing"""
    import os
    import numpy as np
    from PIL import Image
    
    # Create directory structure
    classes = ['mangrove', 'wetland', 'seagrass', 'saltmarsh', 'other']
    
    for split in ['train', 'val', 'test']:
        for class_name in classes:
            class_dir = os.path.join(data_dir, split, class_name)
            os.makedirs(class_dir, exist_ok=True)
    
    # Generate sample images
    np.random.seed(42)
    
    for split in ['train', 'val', 'test']:
        n_samples = n_samples_per_class * 2 if split == 'train' else n_samples_per_class // 2
        
        for class_name in classes:
            class_dir = os.path.join(data_dir, split, class_name)
            
            for i in range(n_samples):
                # Create a random image with different characteristics for each class
                if class_name == 'mangrove':
                    # Green-dominated image
                    image = np.random.randint(0, 50, (256, 256, 3))
                    image[:, :, 1] += np.random.randint(100, 200, (256, 256))  # More green
                elif class_name == 'wetland':
                    # Blue-green mix
                    image = np.random.randint(0, 100, (256, 256, 3))
                    image[:, :, 1] += np.random.randint(50, 150, (256, 256))  # Green
                    image[:, :, 2] += np.random.randint(50, 150, (256, 256))  # Blue
                elif class_name == 'seagrass':
                    # Blue-dominated with some green
                    image = np.random.randint(0, 50, (256, 256, 3))
                    image[:, :, 2] += np.random.randint(100, 200, (256, 256))  # More blue
                    image[:, :, 1] += np.random.randint(50, 100, (256, 256))  # Some green
                elif class_name == 'saltmarsh':
                    # Brown-green mix
                    image = np.random.randint(50, 150, (256, 256, 3))
                    image[:, :, 1] += np.random.randint(50, 100, (256, 256))  # Some green
                else:  # other
                    # Random mix
                    image = np.random.randint(0, 255, (256, 256, 3))
                
                # Add some noise
                noise = np.random.randint(-20, 20, (256, 256, 3))
                image = np.clip(image + noise, 0, 255).astype(np.uint8)
                
                # Save image
                img = Image.fromarray(image)
                img.save(os.path.join(class_dir, f'{class_name}_{i:04d}.jpg'))


if __name__ == "__main__":
    # Example usage
    data_dir = 'sample_satellite_data'
    
    logger.info("Creating sample data...")
    create_sample_data(data_dir, n_samples_per_class=50)
    
    logger.info("Building model...")
    classifier = SatelliteImageClassifier()
    classifier.compile_model()
    
    logger.info("Creating data generators...")
    train_gen, val_gen = classifier.create_data_generators(
        os.path.join(data_dir, 'train'),
        os.path.join(data_dir, 'val'),
        batch_size=16
    )
    
    logger.info("Training model...")
    results = classifier.train(train_gen, val_gen, epochs=10)
    
    logger.info("Training results:")
    for key, value in results.items():
        logger.info(f"  {key}: {value}")
    
    logger.info("Saving model...")
    classifier.save_model('satellite_classifier.h5')
    
    logger.info("Model training completed!")

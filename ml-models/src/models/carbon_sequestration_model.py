"""
Carbon Sequestration Prediction Model
Predicts carbon storage and sequestration rates for blue carbon ecosystems
"""

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import json
from typing import Dict, List, Tuple, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CarbonSequestrationModel:
    """
    Machine Learning model for predicting carbon sequestration in blue carbon ecosystems
    """
    
    def __init__(self, model_type: str = 'xgboost'):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.target_columns = ['carbon_stored', 'sequestration_rate']
        self.is_trained = False
        
    def _prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Prepare and encode features for model training/prediction"""
        df = data.copy()
        
        # Encode categorical variables
        categorical_columns = ['ecosystem_type', 'climate_zone', 'soil_type', 'threat_level']
        for col in categorical_columns:
            if col in df.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
                else:
                    df[col] = self.label_encoders[col].transform(df[col].astype(str))
        
        # Handle missing values
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())
        
        return df
    
    def _extract_features(self, data: pd.DataFrame) -> List[str]:
        """Extract feature column names"""
        feature_columns = []
        
        # Geographic features
        geographic_features = ['latitude', 'longitude', 'elevation', 'distance_to_coast']
        feature_columns.extend([f for f in geographic_features if f in data.columns])
        
        # Environmental features
        environmental_features = [
            'temperature', 'precipitation', 'humidity', 'wind_speed',
            'sea_level_rise', 'storm_frequency', 'tidal_range'
        ]
        feature_columns.extend([f for f in environmental_features if f in data.columns])
        
        # Ecosystem features
        ecosystem_features = [
            'ecosystem_type', 'age', 'density', 'species_richness',
            'threat_level', 'protection_status', 'management_quality'
        ]
        feature_columns.extend([f for f in ecosystem_features if f in data.columns])
        
        # Soil and water features
        soil_water_features = [
            'soil_type', 'soil_ph', 'soil_organic_matter', 'water_depth',
            'salinity', 'nutrient_availability', 'sediment_load'
        ]
        feature_columns.extend([f for f in soil_water_features if f in data.columns])
        
        # Satellite-derived features
        satellite_features = [
            'ndvi', 'ndwi', 'evi', 'lai', 'biomass_index',
            'canopy_cover', 'vegetation_height', 'water_extent'
        ]
        feature_columns.extend([f for f in satellite_features if f in data.columns])
        
        return feature_columns
    
    def train(self, data: pd.DataFrame, validation_split: float = 0.2) -> Dict[str, Any]:
        """
        Train the carbon sequestration model
        
        Args:
            data: Training data with features and targets
            validation_split: Fraction of data to use for validation
            
        Returns:
            Training metrics and model performance
        """
        logger.info("Starting model training...")
        
        # Prepare data
        df = self._prepare_features(data)
        self.feature_columns = self._extract_features(df)
        
        # Separate features and targets
        X = df[self.feature_columns]
        y = df[self.target_columns]
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X, y, test_size=validation_split, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Initialize model
        if self.model_type == 'xgboost':
            self.model = xgb.XGBRegressor(
                n_estimators=1000,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == 'random_forest':
            self.model = RandomForestRegressor(
                n_estimators=500,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_train_pred = self.model.predict(X_train_scaled)
        y_val_pred = self.model.predict(X_val_scaled)
        
        # Calculate metrics
        train_metrics = self._calculate_metrics(y_train, y_train_pred)
        val_metrics = self._calculate_metrics(y_val, y_val_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(
            self.model, X_train_scaled, y_train, 
            cv=5, scoring='neg_mean_squared_error'
        )
        
        self.is_trained = True
        
        results = {
            'training_metrics': train_metrics,
            'validation_metrics': val_metrics,
            'cross_validation_scores': cv_scores.tolist(),
            'feature_importance': self._get_feature_importance(),
            'model_type': self.model_type,
            'n_features': len(self.feature_columns),
            'n_samples': len(X_train)
        }
        
        logger.info(f"Training completed. Validation R²: {val_metrics['r2_score']:.4f}")
        return results
    
    def predict(self, data: pd.DataFrame) -> Dict[str, np.ndarray]:
        """
        Make predictions on new data
        
        Args:
            data: Input data for prediction
            
        Returns:
            Predictions for carbon stored and sequestration rate
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Prepare data
        df = self._prepare_features(data)
        
        # Ensure all required features are present
        missing_features = set(self.feature_columns) - set(df.columns)
        if missing_features:
            logger.warning(f"Missing features: {missing_features}")
            for feature in missing_features:
                df[feature] = 0  # Fill with default values
        
        # Select and scale features
        X = df[self.feature_columns]
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        
        return {
            'carbon_stored': predictions[:, 0],
            'sequestration_rate': predictions[:, 1]
        }
    
    def _calculate_metrics(self, y_true: pd.DataFrame, y_pred: np.ndarray) -> Dict[str, float]:
        """Calculate regression metrics"""
        metrics = {}
        
        for i, target in enumerate(self.target_columns):
            metrics[f'{target}_mse'] = mean_squared_error(y_true[target], y_pred[:, i])
            metrics[f'{target}_rmse'] = np.sqrt(metrics[f'{target}_mse'])
            metrics[f'{target}_mae'] = mean_absolute_error(y_true[target], y_pred[:, i])
            metrics[f'{target}_r2'] = r2_score(y_true[target], y_pred[:, i])
        
        # Overall metrics (average across targets)
        metrics['overall_mse'] = np.mean([metrics[f'{target}_mse'] for target in self.target_columns])
        metrics['overall_rmse'] = np.sqrt(metrics['overall_mse'])
        metrics['overall_mae'] = np.mean([metrics[f'{target}_mae'] for target in self.target_columns])
        metrics['overall_r2'] = np.mean([metrics[f'{target}_r2'] for target in self.target_columns])
        
        return metrics
    
    def _get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        if self.model_type == 'xgboost':
            importance = self.model.feature_importances_
        elif self.model_type == 'random_forest':
            importance = self.model.feature_importances_
        else:
            return {}
        
        return dict(zip(self.feature_columns, importance))
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model and preprocessing objects"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_columns': self.feature_columns,
            'target_columns': self.target_columns,
            'model_type': self.model_type,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model and preprocessing objects"""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.label_encoders = model_data['label_encoders']
        self.feature_columns = model_data['feature_columns']
        self.target_columns = model_data['target_columns']
        self.model_type = model_data['model_type']
        self.is_trained = model_data['is_trained']
        
        logger.info(f"Model loaded from {filepath}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the trained model"""
        if not self.is_trained:
            return {'is_trained': False}
        
        return {
            'is_trained': True,
            'model_type': self.model_type,
            'n_features': len(self.feature_columns),
            'feature_columns': self.feature_columns,
            'target_columns': self.target_columns,
            'feature_importance': self._get_feature_importance()
        }


def create_sample_data(n_samples: int = 1000) -> pd.DataFrame:
    """Create sample training data for testing"""
    np.random.seed(42)
    
    data = {
        # Geographic features
        'latitude': np.random.uniform(-60, 60, n_samples),
        'longitude': np.random.uniform(-180, 180, n_samples),
        'elevation': np.random.uniform(0, 100, n_samples),
        'distance_to_coast': np.random.uniform(0, 50, n_samples),
        
        # Environmental features
        'temperature': np.random.uniform(15, 35, n_samples),
        'precipitation': np.random.uniform(500, 3000, n_samples),
        'humidity': np.random.uniform(60, 95, n_samples),
        'wind_speed': np.random.uniform(2, 15, n_samples),
        'sea_level_rise': np.random.uniform(0, 5, n_samples),
        'storm_frequency': np.random.uniform(0, 20, n_samples),
        'tidal_range': np.random.uniform(1, 10, n_samples),
        
        # Ecosystem features
        'ecosystem_type': np.random.choice(['mangrove', 'wetland', 'seagrass', 'saltmarsh'], n_samples),
        'age': np.random.uniform(1, 100, n_samples),
        'density': np.random.uniform(0.1, 1.0, n_samples),
        'species_richness': np.random.uniform(5, 50, n_samples),
        'threat_level': np.random.choice(['low', 'medium', 'high'], n_samples),
        'protection_status': np.random.choice(['unprotected', 'protected', 'restricted'], n_samples),
        'management_quality': np.random.uniform(1, 10, n_samples),
        
        # Soil and water features
        'soil_type': np.random.choice(['clay', 'silt', 'sand', 'organic'], n_samples),
        'soil_ph': np.random.uniform(6, 8, n_samples),
        'soil_organic_matter': np.random.uniform(1, 20, n_samples),
        'water_depth': np.random.uniform(0, 5, n_samples),
        'salinity': np.random.uniform(0, 35, n_samples),
        'nutrient_availability': np.random.uniform(1, 10, n_samples),
        'sediment_load': np.random.uniform(0, 100, n_samples),
        
        # Satellite-derived features
        'ndvi': np.random.uniform(0.2, 0.9, n_samples),
        'ndwi': np.random.uniform(0.1, 0.8, n_samples),
        'evi': np.random.uniform(0.1, 0.7, n_samples),
        'lai': np.random.uniform(0.5, 8, n_samples),
        'biomass_index': np.random.uniform(0.1, 1.0, n_samples),
        'canopy_cover': np.random.uniform(0.1, 1.0, n_samples),
        'vegetation_height': np.random.uniform(0.5, 30, n_samples),
        'water_extent': np.random.uniform(0, 1, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Generate target variables based on ecosystem type and other features
    carbon_stored = []
    sequestration_rate = []
    
    for _, row in df.iterrows():
        base_carbon = 1000  # Base carbon storage
        
        # Ecosystem type multiplier
        ecosystem_multipliers = {
            'mangrove': 1.5,
            'wetland': 1.2,
            'seagrass': 1.0,
            'saltmarsh': 1.3
        }
        
        multiplier = ecosystem_multipliers.get(row['ecosystem_type'], 1.0)
        
        # Add effects from other features
        carbon = base_carbon * multiplier
        carbon += row['age'] * 10  # Older ecosystems store more
        carbon += row['density'] * 500  # Higher density = more carbon
        carbon += row['species_richness'] * 5  # More species = more carbon
        carbon += row['ndvi'] * 200  # Higher vegetation index = more carbon
        carbon += row['lai'] * 50  # Higher leaf area = more carbon
        
        # Add some noise
        carbon += np.random.normal(0, 100)
        carbon = max(0, carbon)  # Ensure non-negative
        
        carbon_stored.append(carbon)
        
        # Sequestration rate (tons per year)
        seq_rate = carbon * 0.02 + np.random.normal(0, 5)  # ~2% of stored carbon per year
        seq_rate = max(0, seq_rate)
        sequestration_rate.append(seq_rate)
    
    df['carbon_stored'] = carbon_stored
    df['sequestration_rate'] = sequestration_rate
    
    return df


if __name__ == "__main__":
    # Example usage
    logger.info("Creating sample data...")
    data = create_sample_data(1000)
    
    logger.info("Training model...")
    model = CarbonSequestrationModel('xgboost')
    results = model.train(data)
    
    logger.info("Training results:")
    for key, value in results['validation_metrics'].items():
        logger.info(f"  {key}: {value:.4f}")
    
    logger.info("Saving model...")
    model.save_model('carbon_sequestration_model.pkl')
    
    logger.info("Making predictions on new data...")
    new_data = create_sample_data(10)
    predictions = model.predict(new_data)
    
    logger.info("Sample predictions:")
    for i in range(5):
        logger.info(f"  Sample {i+1}: Carbon stored: {predictions['carbon_stored'][i]:.2f} tons, "
                   f"Sequestration rate: {predictions['sequestration_rate'][i]:.2f} tons/year")

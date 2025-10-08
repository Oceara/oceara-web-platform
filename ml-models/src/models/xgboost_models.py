"""
XGBoost Models for Carbon Sequestration and Biomass Estimation
- Carbon sequestration prediction using environmental and tree data
- Biomass estimation using allometric equations and ML enhancement
"""

import xgboost as xgb
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Union
import joblib
import logging
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CarbonSequestrationPredictor:
    """
    XGBoost model for predicting carbon sequestration rates
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'tree_age', 'tree_height', 'dbh', 'species_encoded', 'soil_ph',
            'soil_organic_matter', 'precipitation', 'temperature', 'humidity',
            'elevation', 'slope', 'aspect', 'distance_to_water', 'canopy_density',
            'leaf_area_index', 'ndvi', 'tree_count_per_hectare'
        ]
        self.species_encoder = LabelEncoder()
        self.is_trained = False
        
    def _prepare_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data for carbon sequestration prediction
        In production, this would load from a real dataset
        """
        np.random.seed(42)
        n_samples = 10000
        
        # Generate synthetic features
        data = {
            'tree_age': np.random.uniform(1, 50, n_samples),
            'tree_height': np.random.uniform(2, 25, n_samples),
            'dbh': np.random.uniform(5, 80, n_samples),  # Diameter at breast height (cm)
            'species': np.random.choice(['Rhizophora', 'Avicennia', 'Bruguiera'], n_samples),
            'soil_ph': np.random.uniform(6.0, 8.5, n_samples),
            'soil_organic_matter': np.random.uniform(2.0, 15.0, n_samples),
            'precipitation': np.random.uniform(1000, 4000, n_samples),  # mm/year
            'temperature': np.random.uniform(20, 35, n_samples),  # Celsius
            'humidity': np.random.uniform(60, 95, n_samples),  # %
            'elevation': np.random.uniform(0, 10, n_samples),  # meters above sea level
            'slope': np.random.uniform(0, 30, n_samples),  # degrees
            'aspect': np.random.uniform(0, 360, n_samples),  # degrees
            'distance_to_water': np.random.uniform(0, 1000, n_samples),  # meters
            'canopy_density': np.random.uniform(0.3, 1.0, n_samples),
            'leaf_area_index': np.random.uniform(2.0, 8.0, n_samples),
            'ndvi': np.random.uniform(0.3, 0.9, n_samples),
            'tree_count_per_hectare': np.random.uniform(100, 2000, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Encode species
        df['species_encoded'] = self.species_encoder.fit_transform(df['species'])
        
        # Calculate carbon sequestration using allometric equations and environmental factors
        # This is a simplified model - in reality, this would be based on extensive research
        carbon_sequestration = []
        
        for _, row in df.iterrows():
            # Base carbon sequestration from allometric equations
            if row['species'] == 'Rhizophora':
                # Rhizophora-specific allometric equation
                biomass = 0.0673 * (row['dbh'] ** 2.46) * (row['tree_height'] ** 0.976)
            elif row['species'] == 'Avicennia':
                # Avicennia-specific allometric equation
                biomass = 0.251 * (row['dbh'] ** 2.46)
            else:  # Bruguiera
                # Bruguiera-specific allometric equation
                biomass = 0.0673 * (row['dbh'] ** 2.46) * (row['tree_height'] ** 0.976)
            
            # Carbon content (typically 45-50% of biomass)
            carbon_content = biomass * 0.47
            
            # Environmental modifiers
            temp_modifier = 1.0 + (row['temperature'] - 27) * 0.02  # Optimal at 27°C
            precip_modifier = 1.0 + (row['precipitation'] - 2500) * 0.0001  # Optimal at 2500mm
            soil_modifier = 1.0 + (row['soil_organic_matter'] - 8) * 0.05  # Better with more organic matter
            age_modifier = min(1.0, row['tree_age'] / 20)  # Peak at 20 years
            
            # Annual carbon sequestration (kg C/year)
            annual_sequestration = carbon_content * temp_modifier * precip_modifier * soil_modifier * age_modifier / row['tree_age']
            
            carbon_sequestration.append(annual_sequestration)
        
        df['carbon_sequestration'] = carbon_sequestration
        
        # Prepare features and target
        X = df[self.feature_names].values
        y = df['carbon_sequestration'].values
        
        return X, y
    
    def train(self, X: Optional[np.ndarray] = None, y: Optional[np.ndarray] = None) -> Dict:
        """Train the carbon sequestration prediction model"""
        try:
            if X is None or y is None:
                logger.info("Generating synthetic training data...")
                X, y = self._prepare_training_data()
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train XGBoost model
            self.model = xgb.XGBRegressor(
                n_estimators=1000,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(
                X_train_scaled, y_train,
                eval_set=[(X_test_scaled, y_test)],
                early_stopping_rounds=50,
                verbose=False
            )
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            rmse = math.sqrt(mse)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            self.is_trained = True
            
            logger.info(f"Carbon sequestration model trained successfully")
            logger.info(f"RMSE: {rmse:.2f}, MAE: {mae:.2f}, R²: {r2:.4f}")
            
            return {
                'status': 'success',
                'metrics': {
                    'rmse': round(rmse, 2),
                    'mae': round(mae, 2),
                    'r2': round(r2, 4)
                },
                'feature_importance': dict(zip(self.feature_names, self.model.feature_importances_))
            }
            
        except Exception as e:
            logger.error(f"Error training carbon sequestration model: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def predict_carbon_sequestration(self, features: Dict) -> Dict:
        """Predict carbon sequestration for given features"""
        try:
            if not self.is_trained:
                logger.warning("Model not trained. Training with synthetic data...")
                self.train()
            
            # Prepare feature vector
            feature_vector = []
            for feature_name in self.feature_names:
                if feature_name == 'species_encoded':
                    # Encode species
                    species = features.get('species', 'Rhizophora')
                    if species in self.species_encoder.classes_:
                        species_encoded = self.species_encoder.transform([species])[0]
                    else:
                        species_encoded = 0  # Default to first species
                    feature_vector.append(species_encoded)
                else:
                    feature_vector.append(features.get(feature_name, 0))
            
            # Convert to numpy array and scale
            X = np.array(feature_vector).reshape(1, -1)
            X_scaled = self.scaler.transform(X)
            
            # Make prediction
            prediction = self.model.predict(X_scaled)[0]
            
            # Calculate confidence interval (simplified)
            confidence_interval = prediction * 0.15  # ±15% confidence
            
            return {
                'carbon_sequestration_kg_per_year': round(prediction, 2),
                'confidence_interval': round(confidence_interval, 2),
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error predicting carbon sequestration: {str(e)}")
            return {
                'carbon_sequestration_kg_per_year': 0,
                'confidence_interval': 0,
                'status': 'error',
                'error': str(e)
            }


class BiomassEstimator:
    """
    XGBoost model for biomass estimation using allometric equations and ML enhancement
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'dbh', 'tree_height', 'species_encoded', 'crown_diameter',
            'wood_density', 'bark_thickness', 'tree_age', 'site_index',
            'competition_index', 'soil_fertility', 'climate_zone'
        ]
        self.species_encoder = LabelEncoder()
        self.is_trained = False
        
        # Allometric equation coefficients for different species
        self.allometric_coefficients = {
            'Rhizophora': {'a': 0.0673, 'b': 2.46, 'c': 0.976},
            'Avicennia': {'a': 0.251, 'b': 2.46, 'c': 0},
            'Bruguiera': {'a': 0.0673, 'b': 2.46, 'c': 0.976}
        }
    
    def _prepare_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data for biomass estimation
        """
        np.random.seed(42)
        n_samples = 8000
        
        # Generate synthetic features
        data = {
            'dbh': np.random.uniform(5, 80, n_samples),  # cm
            'tree_height': np.random.uniform(2, 25, n_samples),  # m
            'species': np.random.choice(['Rhizophora', 'Avicennia', 'Bruguiera'], n_samples),
            'crown_diameter': np.random.uniform(2, 15, n_samples),  # m
            'wood_density': np.random.uniform(0.4, 0.8, n_samples),  # g/cm³
            'bark_thickness': np.random.uniform(0.5, 3.0, n_samples),  # cm
            'tree_age': np.random.uniform(1, 50, n_samples),  # years
            'site_index': np.random.uniform(10, 30, n_samples),  # site quality index
            'competition_index': np.random.uniform(0.1, 1.0, n_samples),
            'soil_fertility': np.random.uniform(0.3, 1.0, n_samples),
            'climate_zone': np.random.choice(['tropical', 'subtropical', 'temperate'], n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Encode categorical variables
        df['species_encoded'] = self.species_encoder.fit_transform(df['species'])
        df['climate_zone_encoded'] = LabelEncoder().fit_transform(df['climate_zone'])
        
        # Calculate biomass using allometric equations
        biomass = []
        for _, row in df.iterrows():
            species = row['species']
            dbh = row['dbh']
            height = row['tree_height']
            
            # Get allometric coefficients
            coeffs = self.allometric_coefficients[species]
            
            # Calculate biomass using species-specific equation
            if coeffs['c'] == 0:  # Avicennia (height not used)
                biomass_kg = coeffs['a'] * (dbh ** coeffs['b'])
            else:  # Rhizophora and Bruguiera
                biomass_kg = coeffs['a'] * (dbh ** coeffs['b']) * (height ** coeffs['c'])
            
            # Apply environmental modifiers
            wood_density_modifier = row['wood_density'] / 0.6  # Normalize to average density
            site_modifier = row['site_index'] / 20  # Normalize to average site index
            age_modifier = min(1.0, row['tree_age'] / 25)  # Peak at 25 years
            
            # Final biomass with modifiers
            final_biomass = biomass_kg * wood_density_modifier * site_modifier * age_modifier
            biomass.append(final_biomass)
        
        df['biomass'] = biomass
        
        # Prepare features (exclude climate_zone, use encoded version)
        feature_names = [f for f in self.feature_names if f != 'climate_zone'] + ['climate_zone_encoded']
        X = df[feature_names].values
        y = df['biomass'].values
        
        return X, y
    
    def train(self, X: Optional[np.ndarray] = None, y: Optional[np.ndarray] = None) -> Dict:
        """Train the biomass estimation model"""
        try:
            if X is None or y is None:
                logger.info("Generating synthetic training data for biomass estimation...")
                X, y = self._prepare_training_data()
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train XGBoost model
            self.model = xgb.XGBRegressor(
                n_estimators=800,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(
                X_train_scaled, y_train,
                eval_set=[(X_test_scaled, y_test)],
                early_stopping_rounds=50,
                verbose=False
            )
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            rmse = math.sqrt(mse)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            self.is_trained = True
            
            logger.info(f"Biomass estimation model trained successfully")
            logger.info(f"RMSE: {rmse:.2f} kg, MAE: {mae:.2f} kg, R²: {r2:.4f}")
            
            return {
                'status': 'success',
                'metrics': {
                    'rmse': round(rmse, 2),
                    'mae': round(mae, 2),
                    'r2': round(r2, 4)
                },
                'feature_importance': dict(zip(self.feature_names, self.model.feature_importances_))
            }
            
        except Exception as e:
            logger.error(f"Error training biomass estimation model: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def estimate_biomass(self, features: Dict) -> Dict:
        """Estimate biomass for given tree features"""
        try:
            if not self.is_trained:
                logger.warning("Model not trained. Training with synthetic data...")
                self.train()
            
            # Calculate allometric biomass first
            species = features.get('species', 'Rhizophora')
            dbh = features.get('dbh', 20)
            height = features.get('tree_height', 10)
            
            coeffs = self.allometric_coefficients.get(species, self.allometric_coefficients['Rhizophora'])
            
            if coeffs['c'] == 0:  # Avicennia
                allometric_biomass = coeffs['a'] * (dbh ** coeffs['b'])
            else:  # Rhizophora and Bruguiera
                allometric_biomass = coeffs['a'] * (dbh ** coeffs['b']) * (height ** coeffs['c'])
            
            # Prepare feature vector for ML model
            feature_vector = []
            for feature_name in self.feature_names:
                if feature_name == 'species_encoded':
                    if species in self.species_encoder.classes_:
                        species_encoded = self.species_encoder.transform([species])[0]
                    else:
                        species_encoded = 0
                    feature_vector.append(species_encoded)
                else:
                    feature_vector.append(features.get(feature_name, 0))
            
            # Add climate zone encoding
            climate_zone = features.get('climate_zone', 'tropical')
            climate_encoder = LabelEncoder()
            climate_encoder.fit(['tropical', 'subtropical', 'temperate'])
            climate_encoded = climate_encoder.transform([climate_zone])[0]
            feature_vector.append(climate_encoded)
            
            # Convert to numpy array and scale
            X = np.array(feature_vector).reshape(1, -1)
            X_scaled = self.scaler.transform(X)
            
            # Make ML prediction
            ml_biomass = self.model.predict(X_scaled)[0]
            
            # Combine allometric and ML predictions (weighted average)
            final_biomass = 0.7 * allometric_biomass + 0.3 * ml_biomass
            
            # Calculate carbon content (47% of biomass)
            carbon_content = final_biomass * 0.47
            
            return {
                'biomass_kg': round(final_biomass, 2),
                'carbon_content_kg': round(carbon_content, 2),
                'allometric_biomass_kg': round(allometric_biomass, 2),
                'ml_biomass_kg': round(ml_biomass, 2),
                'status': 'success'
            }
            
        except Exception as e:
            logger.error(f"Error estimating biomass: {str(e)}")
            return {
                'biomass_kg': 0,
                'carbon_content_kg': 0,
                'allometric_biomass_kg': 0,
                'ml_biomass_kg': 0,
                'status': 'error',
                'error': str(e)
            }


class XGBoostModelManager:
    """
    Manager class for all XGBoost models
    """
    
    def __init__(self):
        self.carbon_predictor = CarbonSequestrationPredictor()
        self.biomass_estimator = BiomassEstimator()
        
        logger.info("XGBoost models initialized successfully")
    
    def train_all_models(self) -> Dict:
        """Train all XGBoost models"""
        try:
            results = {}
            
            # Train carbon sequestration model
            logger.info("Training carbon sequestration model...")
            carbon_results = self.carbon_predictor.train()
            results['carbon_sequestration'] = carbon_results
            
            # Train biomass estimation model
            logger.info("Training biomass estimation model...")
            biomass_results = self.biomass_estimator.train()
            results['biomass_estimation'] = biomass_results
            
            return {
                'status': 'success',
                'results': results
            }
            
        except Exception as e:
            logger.error(f"Error training XGBoost models: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def predict_carbon_sequestration(self, features: Dict) -> Dict:
        """Predict carbon sequestration for given features"""
        return self.carbon_predictor.predict_carbon_sequestration(features)
    
    def estimate_biomass(self, features: Dict) -> Dict:
        """Estimate biomass for given tree features"""
        return self.biomass_estimator.estimate_biomass(features)
    
    def comprehensive_analysis(self, tree_data: Dict) -> Dict:
        """Perform comprehensive carbon and biomass analysis"""
        try:
            # Estimate biomass
            biomass_results = self.estimate_biomass(tree_data)
            
            # Predict carbon sequestration
            carbon_results = self.predict_carbon_sequestration(tree_data)
            
            # Calculate additional metrics
            if biomass_results['status'] == 'success' and carbon_results['status'] == 'success':
                biomass_kg = biomass_results['biomass_kg']
                carbon_kg = biomass_results['carbon_content_kg']
                annual_sequestration = carbon_results['carbon_sequestration_kg_per_year']
                
                # Calculate carbon density
                area_hectares = tree_data.get('area_hectares', 1)
                carbon_density = carbon_kg / area_hectares
                
                # Calculate sequestration rate
                sequestration_rate = annual_sequestration / area_hectares
                
                return {
                    'biomass_analysis': biomass_results,
                    'carbon_sequestration': carbon_results,
                    'ecosystem_metrics': {
                        'carbon_density_kg_per_hectare': round(carbon_density, 2),
                        'annual_sequestration_rate_kg_per_hectare': round(sequestration_rate, 2),
                        'total_carbon_storage_kg': round(carbon_kg, 2),
                        'total_biomass_kg': round(biomass_kg, 2)
                    },
                    'status': 'success'
                }
            else:
                return {
                    'biomass_analysis': biomass_results,
                    'carbon_sequestration': carbon_results,
                    'status': 'error',
                    'error': 'Failed to perform comprehensive analysis'
                }
                
        except Exception as e:
            logger.error(f"Error in comprehensive analysis: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def save_models(self, model_path: str) -> Dict:
        """Save trained models to disk"""
        try:
            import os
            os.makedirs(model_path, exist_ok=True)
            
            # Save carbon sequestration model
            if self.carbon_predictor.is_trained:
                joblib.dump(self.carbon_predictor.model, f"{model_path}/carbon_sequestration_model.pkl")
                joblib.dump(self.carbon_predictor.scaler, f"{model_path}/carbon_sequestration_scaler.pkl")
                joblib.dump(self.carbon_predictor.species_encoder, f"{model_path}/carbon_species_encoder.pkl")
            
            # Save biomass estimation model
            if self.biomass_estimator.is_trained:
                joblib.dump(self.biomass_estimator.model, f"{model_path}/biomass_estimation_model.pkl")
                joblib.dump(self.biomass_estimator.scaler, f"{model_path}/biomass_estimation_scaler.pkl")
                joblib.dump(self.biomass_estimator.species_encoder, f"{model_path}/biomass_species_encoder.pkl")
            
            return {
                'status': 'success',
                'message': f'Models saved to {model_path}'
            }
            
        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def load_models(self, model_path: str) -> Dict:
        """Load trained models from disk"""
        try:
            # Load carbon sequestration model
            self.carbon_predictor.model = joblib.load(f"{model_path}/carbon_sequestration_model.pkl")
            self.carbon_predictor.scaler = joblib.load(f"{model_path}/carbon_sequestration_scaler.pkl")
            self.carbon_predictor.species_encoder = joblib.load(f"{model_path}/carbon_species_encoder.pkl")
            self.carbon_predictor.is_trained = True
            
            # Load biomass estimation model
            self.biomass_estimator.model = joblib.load(f"{model_path}/biomass_estimation_model.pkl")
            self.biomass_estimator.scaler = joblib.load(f"{model_path}/biomass_estimation_scaler.pkl")
            self.biomass_estimator.species_encoder = joblib.load(f"{model_path}/biomass_species_encoder.pkl")
            self.biomass_estimator.is_trained = True
            
            return {
                'status': 'success',
                'message': f'Models loaded from {model_path}'
            }
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }


# Example usage and testing
if __name__ == "__main__":
    # Initialize model manager
    xgb_manager = XGBoostModelManager()
    
    # Train all models
    training_results = xgb_manager.train_all_models()
    print("Training Results:")
    print(training_results)
    
    # Test with sample data
    sample_tree_data = {
        'tree_age': 15,
        'tree_height': 12,
        'dbh': 25,
        'species': 'Rhizophora',
        'soil_ph': 7.2,
        'soil_organic_matter': 8.5,
        'precipitation': 2500,
        'temperature': 28,
        'humidity': 80,
        'elevation': 2,
        'slope': 5,
        'aspect': 180,
        'distance_to_water': 50,
        'canopy_density': 0.8,
        'leaf_area_index': 5.5,
        'ndvi': 0.7,
        'tree_count_per_hectare': 500,
        'crown_diameter': 8,
        'wood_density': 0.6,
        'bark_thickness': 1.5,
        'site_index': 20,
        'competition_index': 0.6,
        'soil_fertility': 0.8,
        'climate_zone': 'tropical',
        'area_hectares': 1
    }
    
    # Perform comprehensive analysis
    analysis_results = xgb_manager.comprehensive_analysis(sample_tree_data)
    print("\nComprehensive Analysis Results:")
    print(analysis_results)

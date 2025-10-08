#!/usr/bin/env python3
"""
Carbon Calculation Script using XGBoost Models
Called by the Node.js API to calculate carbon sequestration and biomass
"""

import sys
import json
import argparse
import os
from pathlib import Path
import logging
from typing import Dict, List, Any
from datetime import datetime

# Add the models directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))

from xgboost_models import XGBoostModelManager

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def calculate_carbon(parameters: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
    """
    Calculate carbon sequestration and biomass using XGBoost models
    
    Args:
        parameters: Calculation parameters including tree_data, environmental_data, etc.
        output_dir: Directory to save results
    
    Returns:
        Dictionary containing calculation results
    """
    try:
        # Initialize XGBoost model manager
        xgb_manager = XGBoostModelManager()
        
        # Extract data from parameters
        tree_data = parameters.get('tree_data', {})
        environmental_data = parameters.get('environmental_data', {})
        ecosystem_data = parameters.get('ecosystem_data', {})
        
        # Check if this is a training request
        if parameters.get('training', False):
            return handle_model_training(xgb_manager, parameters, output_dir)
        
        # Validate required tree data
        required_fields = ['dbh', 'tree_height', 'species']
        missing_fields = [field for field in required_fields if not tree_data.get(field)]
        
        if missing_fields:
            return {
                'status': 'error',
                'error': f'Missing required fields: {", ".join(missing_fields)}',
                'results': {}
            }
        
        # Combine all data for comprehensive analysis
        combined_data = {
            **tree_data,
            **environmental_data,
            **ecosystem_data
        }
        
        # Set default values for missing fields
        defaults = {
            'tree_age': 10,
            'soil_ph': 7.0,
            'soil_organic_matter': 5.0,
            'precipitation': 2000,
            'temperature': 25,
            'humidity': 70,
            'elevation': 0,
            'slope': 0,
            'aspect': 0,
            'distance_to_water': 100,
            'canopy_density': 0.7,
            'leaf_area_index': 4.0,
            'ndvi': 0.6,
            'tree_count_per_hectare': 500,
            'crown_diameter': 5,
            'wood_density': 0.6,
            'bark_thickness': 1.0,
            'site_index': 20,
            'competition_index': 0.5,
            'soil_fertility': 0.7,
            'climate_zone': 'tropical',
            'area_hectares': 1
        }
        
        for key, default_value in defaults.items():
            if key not in combined_data:
                combined_data[key] = default_value
        
        # Perform comprehensive analysis
        logger.info("Performing comprehensive carbon and biomass analysis...")
        analysis_results = xgb_manager.comprehensive_analysis(combined_data)
        
        # Add metadata
        results = {
            'status': 'success',
            'timestamp': parameters.get('timestamp', datetime.now().isoformat()),
            'user_id': parameters.get('user_id'),
            'input_data': {
                'tree_data': tree_data,
                'environmental_data': environmental_data,
                'ecosystem_data': ecosystem_data
            },
            'analysis_results': analysis_results,
            'recommendations': generate_recommendations(analysis_results),
            'model_info': {
                'carbon_model': 'XGBoost Regressor',
                'biomass_model': 'XGBoost + Allometric Equations',
                'version': '1.0.0'
            }
        }
        
        # Save results to output directory
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, f"carbon_calculation_results_{parameters.get('timestamp', 'unknown')}.json")
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Results saved to: {output_file}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in calculate_carbon: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'results': {},
            'timestamp': parameters.get('timestamp', datetime.now().isoformat())
        }

def handle_model_training(xgb_manager: XGBoostModelManager, parameters: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
    """
    Handle model training requests
    
    Args:
        xgb_manager: XGBoost model manager instance
        parameters: Training parameters
        output_dir: Directory to save trained models
    
    Returns:
        Dictionary containing training results
    """
    try:
        model_type = parameters.get('model_type', 'all')
        training_params = parameters.get('parameters', {})
        
        logger.info(f"Starting model training for type: {model_type}")
        
        # Train models
        training_results = xgb_manager.train_all_models()
        
        if training_results['status'] == 'success':
            # Save trained models
            model_path = os.path.join(output_dir, 'trained_models')
            save_results = xgb_manager.save_models(model_path)
            
            if save_results['status'] == 'success':
                logger.info("Models trained and saved successfully")
                
                return {
                    'status': 'success',
                    'message': 'Model training completed successfully',
                    'training_results': training_results,
                    'model_path': model_path,
                    'timestamp': parameters.get('timestamp', datetime.now().isoformat())
                }
            else:
                return {
                    'status': 'error',
                    'error': f"Failed to save models: {save_results['error']}",
                    'training_results': training_results
                }
        else:
            return {
                'status': 'error',
                'error': f"Training failed: {training_results.get('error', 'Unknown error')}",
                'training_results': training_results
            }
            
    except Exception as e:
        logger.error(f"Error in model training: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': parameters.get('timestamp', datetime.now().isoformat())
        }

def generate_recommendations(analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate recommendations based on analysis results
    
    Args:
        analysis_results: Results from comprehensive analysis
    
    Returns:
        List of recommendations
    """
    recommendations = []
    
    try:
        if analysis_results['status'] != 'success':
            return recommendations
        
        # Extract key metrics
        biomass_analysis = analysis_results.get('biomass_analysis', {})
        carbon_sequestration = analysis_results.get('carbon_sequestration', {})
        ecosystem_metrics = analysis_results.get('ecosystem_metrics', {})
        
        # Biomass recommendations
        if biomass_analysis.get('status') == 'success':
            biomass_kg = biomass_analysis.get('biomass_kg', 0)
            
            if biomass_kg < 50:
                recommendations.append({
                    'type': 'biomass',
                    'priority': 'high',
                    'title': 'Low Biomass Detected',
                    'description': 'The estimated biomass is below optimal levels. Consider soil improvement and nutrient management.',
                    'action': 'Implement soil enrichment and fertilization program'
                })
            elif biomass_kg > 200:
                recommendations.append({
                    'type': 'biomass',
                    'priority': 'low',
                    'title': 'High Biomass Achievement',
                    'description': 'Excellent biomass levels detected. Maintain current management practices.',
                    'action': 'Continue current management and monitor for sustainability'
                })
        
        # Carbon sequestration recommendations
        if carbon_sequestration.get('status') == 'success':
            annual_sequestration = carbon_sequestration.get('carbon_sequestration_kg_per_year', 0)
            
            if annual_sequestration < 10:
                recommendations.append({
                    'type': 'carbon',
                    'priority': 'high',
                    'title': 'Low Carbon Sequestration',
                    'description': 'Carbon sequestration rate is below expected levels. Environmental factors may need attention.',
                    'action': 'Review environmental conditions and consider species diversification'
                })
            elif annual_sequestration > 50:
                recommendations.append({
                    'type': 'carbon',
                    'priority': 'low',
                    'title': 'Excellent Carbon Sequestration',
                    'description': 'Outstanding carbon sequestration performance. Consider expanding similar practices.',
                    'action': 'Document successful practices for replication in other areas'
                })
        
        # Ecosystem-level recommendations
        if ecosystem_metrics:
            carbon_density = ecosystem_metrics.get('carbon_density_kg_per_hectare', 0)
            
            if carbon_density < 1000:
                recommendations.append({
                    'type': 'ecosystem',
                    'priority': 'medium',
                    'title': 'Low Carbon Density',
                    'description': 'Ecosystem carbon density is below optimal levels for maximum carbon credit generation.',
                    'action': 'Consider increasing tree density or improving species selection'
                })
        
        # General recommendations
        recommendations.append({
            'type': 'general',
            'priority': 'low',
            'title': 'Regular Monitoring',
            'description': 'Continue regular monitoring and data collection for optimal ecosystem management.',
            'action': 'Schedule quarterly assessments and data updates'
        })
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        recommendations.append({
            'type': 'error',
            'priority': 'high',
            'title': 'Analysis Error',
            'description': 'An error occurred during analysis. Please review input data.',
            'action': 'Verify input data and retry analysis'
        })
    
    return recommendations

def main():
    """Main function to handle command line arguments"""
    parser = argparse.ArgumentParser(description='Calculate carbon sequestration and biomass using XGBoost models')
    parser.add_argument('--parameters', required=True, help='JSON string of calculation parameters')
    parser.add_argument('--output-dir', required=True, help='Output directory for results')
    
    args = parser.parse_args()
    
    # Parse parameters
    try:
        parameters = json.loads(args.parameters)
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing parameters: {e}")
        sys.exit(1)
    
    # Add timestamp if not provided
    if 'timestamp' not in parameters:
        parameters['timestamp'] = datetime.now().isoformat()
    
    # Calculate carbon
    try:
        results = calculate_carbon(parameters, args.output_dir)
        
        # Output results as JSON to stdout
        print(json.dumps(results, indent=2, default=str))
        
        # Exit with appropriate code
        if results['status'] == 'success':
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        error_result = {
            'status': 'error',
            'error': str(e),
            'results': {},
            'timestamp': parameters.get('timestamp', datetime.now().isoformat())
        }
        print(json.dumps(error_result, indent=2, default=str))
        sys.exit(1)

if __name__ == '__main__':
    main()

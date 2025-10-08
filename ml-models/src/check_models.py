#!/usr/bin/env python3
"""
Model Status Check Script
Called by the Node.js API to check the status of all ML models
"""

import sys
import json
import os
import logging
from pathlib import Path
from typing import Dict, Any

# Add the models directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))

try:
    from cnn_models import CNNModelManager
    from xgboost_models import XGBoostModelManager
except ImportError as e:
    print(json.dumps({
        'status': 'error',
        'error': f'Failed to import ML models: {str(e)}',
        'models': {}
    }))
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_models_status() -> Dict[str, Any]:
    """
    Check the status of all ML models
    
    Returns:
        Dictionary containing model status information
    """
    try:
        status = {
            'status': 'success',
            'timestamp': None,
            'models': {
                'cnn_models': {},
                'xgboost_models': {}
            },
            'system_info': {
                'python_version': sys.version,
                'working_directory': os.getcwd(),
                'script_path': __file__
            }
        }
        
        # Add timestamp
        from datetime import datetime
        status['timestamp'] = datetime.now().isoformat()
        
        # Check CNN models
        try:
            cnn_manager = CNNModelManager()
            cnn_summaries = cnn_manager.get_model_summaries()
            
            status['models']['cnn_models'] = {
                'status': 'available',
                'models': cnn_summaries,
                'total_models': len(cnn_summaries)
            }
            
        except Exception as e:
            status['models']['cnn_models'] = {
                'status': 'error',
                'error': str(e),
                'models': {},
                'total_models': 0
            }
        
        # Check XGBoost models
        try:
            xgb_manager = XGBoostModelManager()
            
            # Check if models are trained
            carbon_trained = xgb_manager.carbon_predictor.is_trained
            biomass_trained = xgb_manager.biomass_estimator.is_trained
            
            status['models']['xgboost_models'] = {
                'status': 'available',
                'models': {
                    'carbon_sequestration': {
                        'trained': carbon_trained,
                        'model_type': 'XGBoost Regressor',
                        'features': len(xgb_manager.carbon_predictor.feature_names)
                    },
                    'biomass_estimation': {
                        'trained': biomass_trained,
                        'model_type': 'XGBoost + Allometric Equations',
                        'features': len(xgb_manager.biomass_estimator.feature_names)
                    }
                },
                'total_models': 2,
                'trained_models': sum([carbon_trained, biomass_trained])
            }
            
        except Exception as e:
            status['models']['xgboost_models'] = {
                'status': 'error',
                'error': str(e),
                'models': {},
                'total_models': 0,
                'trained_models': 0
            }
        
        # Calculate overall status
        cnn_available = status['models']['cnn_models']['status'] == 'available'
        xgb_available = status['models']['xgboost_models']['status'] == 'available'
        
        if cnn_available and xgb_available:
            status['overall_status'] = 'all_models_available'
        elif cnn_available or xgb_available:
            status['overall_status'] = 'partial_availability'
        else:
            status['overall_status'] = 'no_models_available'
        
        return status
        
    except Exception as e:
        logger.error(f"Error checking model status: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'models': {},
            'timestamp': None
        }

def main():
    """Main function"""
    try:
        status = check_models_status()
        
        # Output results as JSON to stdout
        print(json.dumps(status, indent=2, default=str))
        
        # Exit with appropriate code
        if status['status'] == 'success':
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        error_result = {
            'status': 'error',
            'error': str(e),
            'models': {},
            'timestamp': None
        }
        print(json.dumps(error_result, indent=2, default=str))
        sys.exit(1)

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Image Processing Script for CNN Models
Called by the Node.js API to process uploaded images
"""

import sys
import json
import argparse
import os
from pathlib import Path
import logging
from typing import Dict, List, Any

# Add the models directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))

from cnn_models import CNNModelManager

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def process_images(files: List[str], parameters: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
    """
    Process uploaded images using CNN models
    
    Args:
        files: List of image file paths
        parameters: Processing parameters
        output_dir: Directory to save results
    
    Returns:
        Dictionary containing processing results
    """
    try:
        # Initialize CNN model manager
        cnn_manager = CNNModelManager()
        
        results = {
            'status': 'success',
            'processed_files': [],
            'summary': {
                'total_files': len(files),
                'successful_processing': 0,
                'failed_processing': 0,
                'total_crowns_detected': 0,
                'species_detected': {},
                'health_assessments': {}
            }
        }
        
        # Process each image
        for file_path in files:
            try:
                logger.info(f"Processing image: {file_path}")
                
                # Check if file exists
                if not os.path.exists(file_path):
                    logger.warning(f"File not found: {file_path}")
                    results['processed_files'].append({
                        'file_path': file_path,
                        'status': 'error',
                        'error': 'File not found'
                    })
                    results['summary']['failed_processing'] += 1
                    continue
                
                # Determine image type based on parameters or file name
                image_type = parameters.get('image_type', 'auto')
                if image_type == 'auto':
                    # Auto-detect based on file name or other heuristics
                    if 'drone' in file_path.lower() or 'aerial' in file_path.lower():
                        image_type = 'drone'
                    elif 'satellite' in file_path.lower() or 'landsat' in file_path.lower():
                        image_type = 'satellite'
                    else:
                        image_type = 'drone'  # Default to drone
                
                file_result = {
                    'file_path': file_path,
                    'file_name': os.path.basename(file_path),
                    'image_type': image_type,
                    'status': 'success'
                }
                
                # Process based on image type
                if image_type == 'drone':
                    # Process drone image for crown detection and species classification
                    drone_results = cnn_manager.process_drone_image(file_path)
                    file_result['drone_analysis'] = drone_results
                    
                    # Update summary
                    if drone_results['status'] == 'success':
                        results['summary']['successful_processing'] += 1
                        
                        # Count crowns
                        crown_count = drone_results['crown_detection'].get('crown_count', 0)
                        results['summary']['total_crowns_detected'] += crown_count
                        
                        # Track species
                        species = drone_results['species_classification'].get('primary_species', 'Unknown')
                        if species in results['summary']['species_detected']:
                            results['summary']['species_detected'][species] += 1
                        else:
                            results['summary']['species_detected'][species] = 1
                    else:
                        results['summary']['failed_processing'] += 1
                        file_result['status'] = 'error'
                        file_result['error'] = drone_results.get('error', 'Unknown error')
                
                elif image_type == 'satellite':
                    # Process satellite image for health assessment
                    satellite_results = cnn_manager.process_satellite_image(file_path)
                    file_result['satellite_analysis'] = satellite_results
                    
                    # Update summary
                    if satellite_results['status'] == 'success':
                        results['summary']['successful_processing'] += 1
                        
                        # Track health assessments
                        health_status = satellite_results['health_assessment'].get('health_status', 'Unknown')
                        if health_status in results['summary']['health_assessments']:
                            results['summary']['health_assessments'][health_status] += 1
                        else:
                            results['summary']['health_assessments'][health_status] = 1
                    else:
                        results['summary']['failed_processing'] += 1
                        file_result['status'] = 'error'
                        file_result['error'] = satellite_results.get('error', 'Unknown error')
                
                else:
                    # Unknown image type
                    file_result['status'] = 'error'
                    file_result['error'] = f'Unknown image type: {image_type}'
                    results['summary']['failed_processing'] += 1
                
                results['processed_files'].append(file_result)
                
            except Exception as e:
                logger.error(f"Error processing file {file_path}: {str(e)}")
                results['processed_files'].append({
                    'file_path': file_path,
                    'status': 'error',
                    'error': str(e)
                })
                results['summary']['failed_processing'] += 1
        
        # Calculate additional metrics
        if results['summary']['successful_processing'] > 0:
            results['summary']['success_rate'] = (
                results['summary']['successful_processing'] / 
                results['summary']['total_files']
            ) * 100
        else:
            results['summary']['success_rate'] = 0
        
        # Save results to output directory
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, f"image_processing_results_{parameters.get('timestamp', 'unknown')}.json")
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Results saved to: {output_file}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in process_images: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'processed_files': [],
            'summary': {
                'total_files': len(files),
                'successful_processing': 0,
                'failed_processing': len(files),
                'success_rate': 0
            }
        }

def main():
    """Main function to handle command line arguments"""
    parser = argparse.ArgumentParser(description='Process images using CNN models')
    parser.add_argument('--files', required=True, help='Comma-separated list of image file paths')
    parser.add_argument('--output-dir', required=True, help='Output directory for results')
    parser.add_argument('--parameters', help='JSON string of processing parameters')
    
    args = parser.parse_args()
    
    # Parse file paths
    files = [f.strip() for f in args.files.split(',') if f.strip()]
    
    # Parse parameters
    parameters = {}
    if args.parameters:
        try:
            parameters = json.loads(args.parameters)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing parameters: {e}")
            sys.exit(1)
    
    # Add timestamp if not provided
    if 'timestamp' not in parameters:
        from datetime import datetime
        parameters['timestamp'] = datetime.now().isoformat()
    
    # Process images
    try:
        results = process_images(files, parameters, args.output_dir)
        
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
            'processed_files': [],
            'summary': {
                'total_files': len(files),
                'successful_processing': 0,
                'failed_processing': len(files),
                'success_rate': 0
            }
        }
        print(json.dumps(error_result, indent=2, default=str))
        sys.exit(1)

if __name__ == '__main__':
    main()

# AI/ML System Documentation

## Overview

The Oceara platform implements a comprehensive AI/ML system for data verification, carbon sequestration prediction, and ecosystem analysis. The system consists of CNN models for image processing and XGBoost models for carbon calculations.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   ML Models     │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Queue System   │
                       │  (Batch Proc.)  │
                       └─────────────────┘
```

## CNN Models

### 1. Crown Detection CNN
**Purpose**: Detect tree crowns in drone imagery
**Architecture**: U-Net based segmentation model
**Input**: 256x256x3 RGB images
**Output**: Binary mask with crown locations

**Features**:
- Crown count detection
- Coverage percentage calculation
- Centroid coordinates
- Connected component analysis

**Usage**:
```python
from cnn_models import CrownDetectionCNN

detector = CrownDetectionCNN()
results = detector.detect_crowns('drone_image.jpg')
```

### 2. Species Classification CNN
**Purpose**: Classify mangrove species from tree images
**Architecture**: EfficientNetB3 based classification
**Input**: 224x224x3 RGB images
**Output**: Species classification with confidence scores

**Supported Species**:
- Rhizophora mucronata
- Avicennia marina
- Bruguiera gymnorrhiza
- Other/Unknown

**Usage**:
```python
from cnn_models import SpeciesClassificationCNN

classifier = SpeciesClassificationCNN()
results = classifier.classify_species('tree_image.jpg')
```

### 3. Tree Health Assessment CNN
**Purpose**: Assess tree health from satellite imagery
**Architecture**: Multi-scale CNN with 4-band input
**Input**: 256x256x4 (RGB + NIR) satellite images
**Output**: Health status classification

**Health Categories**:
- Healthy (90-100 score)
- Stressed (60-89 score)
- Diseased (30-59 score)
- Dead (0-29 score)

**Usage**:
```python
from cnn_models import TreeHealthAssessmentCNN

assessor = TreeHealthAssessmentCNN()
results = assessor.assess_tree_health('satellite_image.jpg')
```

## XGBoost Models

### 1. Carbon Sequestration Predictor
**Purpose**: Predict annual carbon sequestration rates
**Model**: XGBoost Regressor
**Features**: 17 environmental and tree parameters

**Input Features**:
- Tree age, height, DBH
- Species (encoded)
- Soil pH, organic matter
- Climate data (precipitation, temperature, humidity)
- Topography (elevation, slope, aspect)
- Distance to water
- Canopy density, LAI, NDVI
- Tree count per hectare

**Output**: Annual carbon sequestration in kg C/year

**Usage**:
```python
from xgboost_models import CarbonSequestrationPredictor

predictor = CarbonSequestrationPredictor()
predictor.train()  # Train with synthetic data

features = {
    'tree_age': 15,
    'tree_height': 12,
    'dbh': 25,
    'species': 'Rhizophora',
    # ... other features
}

results = predictor.predict_carbon_sequestration(features)
```

### 2. Biomass Estimator
**Purpose**: Estimate tree biomass using allometric equations + ML
**Model**: XGBoost + Allometric Equations
**Features**: 11 tree and site parameters

**Allometric Equations**:
- **Rhizophora**: `biomass = 0.0673 * (DBH^2.46) * (height^0.976)`
- **Avicennia**: `biomass = 0.251 * (DBH^2.46)`
- **Bruguiera**: `biomass = 0.0673 * (DBH^2.46) * (height^0.976)`

**ML Enhancement**: 30% weight to ML prediction, 70% to allometric

**Usage**:
```python
from xgboost_models import BiomassEstimator

estimator = BiomassEstimator()
estimator.train()  # Train with synthetic data

features = {
    'dbh': 25,
    'tree_height': 12,
    'species': 'Rhizophora',
    # ... other features
}

results = estimator.estimate_biomass(features)
```

## API Endpoints

### Image Processing
```
POST /api/ai/process-images
```
**Purpose**: Process uploaded images using CNN models
**Authentication**: Required (JWT token)
**Input**: Multipart form data with images
**Output**: Job ID for async processing

**Request**:
```javascript
const formData = new FormData();
formData.append('images', imageFile1);
formData.append('images', imageFile2);
formData.append('parameters', JSON.stringify({
  image_type: 'drone', // or 'satellite'
  user_id: 'user123'
}));

const response = await fetch('/api/ai/process-images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Carbon Calculation
```
POST /api/ai/calculate-carbon
```
**Purpose**: Calculate carbon sequestration and biomass
**Authentication**: Required (JWT token)
**Input**: JSON with tree and environmental data
**Output**: Job ID for async processing

**Request**:
```javascript
const response = await fetch('/api/ai/calculate-carbon', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    tree_data: {
      dbh: 25,
      tree_height: 12,
      species: 'Rhizophora',
      tree_age: 15
    },
    environmental_data: {
      soil_ph: 7.2,
      precipitation: 2500,
      temperature: 28
    },
    ecosystem_data: {
      area_hectares: 1,
      tree_count_per_hectare: 500
    }
  })
});
```

### Job Status
```
GET /api/ai/job/:jobId
```
**Purpose**: Get job status and results
**Authentication**: Required (JWT token)
**Output**: Job status, results, or error

**Response**:
```json
{
  "success": true,
  "job_id": "job_1234567890_abc123",
  "type": "image_processing",
  "status": "completed",
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:32:00Z",
  "result": {
    "processed_files": [...],
    "summary": {
      "total_files": 2,
      "successful_processing": 2,
      "total_crowns_detected": 15,
      "species_detected": {
        "Rhizophora": 8,
        "Avicennia": 7
      }
    }
  }
}
```

## Queue System

### Architecture
The queue system processes jobs asynchronously to handle batch processing of uploaded data.

**Job Types**:
- `image_processing`: CNN model processing
- `carbon_calculation`: XGBoost model processing

**Job States**:
- `pending`: Queued for processing
- `processing`: Currently being processed
- `completed`: Successfully completed
- `failed`: Processing failed

### Queue Management
```typescript
// Add job to queue
const jobId = processingQueue.addJob({
  type: 'image_processing',
  files: ['image1.jpg', 'image2.jpg'],
  parameters: { user_id: 'user123' }
});

// Get job status
const job = processingQueue.getJob(jobId);
```

## Python Scripts

### 1. process_images.py
**Purpose**: Process images using CNN models
**Usage**: Called by Node.js API via spawn

```bash
python process_images.py --files "image1.jpg,image2.jpg" --output-dir "/results" --parameters '{"image_type":"drone"}'
```

### 2. calculate_carbon.py
**Purpose**: Calculate carbon using XGBoost models
**Usage**: Called by Node.js API via spawn

```bash
python calculate_carbon.py --parameters '{"tree_data":{"dbh":25,"species":"Rhizophora"}}' --output-dir "/results"
```

### 3. check_models.py
**Purpose**: Check status of all ML models
**Usage**: Called by Node.js API for health checks

```bash
python check_models.py
```

## Model Training

### Synthetic Data Generation
Both CNN and XGBoost models use synthetic data for training:

**CNN Models**: Generate synthetic images with known labels
**XGBoost Models**: Generate synthetic tree and environmental data with calculated targets

### Training Process
```python
# Train all models
xgb_manager = XGBoostModelManager()
training_results = xgb_manager.train_all_models()

# Save trained models
xgb_manager.save_models('/path/to/models')
```

## Performance Metrics

### CNN Models
- **Crown Detection**: Binary segmentation accuracy
- **Species Classification**: Top-3 accuracy, per-class precision/recall
- **Health Assessment**: Multi-class classification accuracy

### XGBoost Models
- **Carbon Sequestration**: RMSE, MAE, R²
- **Biomass Estimation**: RMSE, MAE, R²

## File Structure

```
ml-models/
├── src/
│   ├── models/
│   │   ├── cnn_models.py          # CNN model implementations
│   │   └── xgboost_models.py      # XGBoost model implementations
│   ├── process_images.py          # Image processing script
│   ├── calculate_carbon.py        # Carbon calculation script
│   └── check_models.py            # Model status check script
├── requirements.txt               # Python dependencies
└── README.md                     # ML models documentation

backend/
├── src/
│   ├── routes/
│   │   └── ai.ts                 # AI API endpoints
│   ├── uploads/                  # Uploaded files
│   └── results/                  # Processing results
└── package.json                  # Backend dependencies
```

## Error Handling

### API Level
- Input validation
- File type checking
- Authentication verification
- Rate limiting

### Model Level
- File existence checks
- Image format validation
- Feature validation
- Graceful degradation

### Queue Level
- Job retry logic
- Error logging
- Resource cleanup
- Status tracking

## Security Considerations

1. **File Upload Security**:
   - File type validation
   - File size limits (50MB)
   - Secure file storage

2. **API Security**:
   - JWT authentication
   - Rate limiting
   - Input sanitization

3. **Model Security**:
   - Input validation
   - Error handling
   - Resource limits

## Monitoring and Logging

### Logging Levels
- **INFO**: Normal operations
- **WARNING**: Non-critical issues
- **ERROR**: Processing failures
- **DEBUG**: Detailed debugging info

### Metrics Tracking
- Job processing times
- Success/failure rates
- Model performance metrics
- Resource usage

## Future Enhancements

1. **Model Improvements**:
   - Real training data integration
   - Model fine-tuning
   - Ensemble methods

2. **Performance Optimizations**:
   - GPU acceleration
   - Model quantization
   - Batch processing optimization

3. **Additional Features**:
   - Real-time processing
   - Model versioning
   - A/B testing framework

## Troubleshooting

### Common Issues

1. **Python Import Errors**:
   - Check Python path configuration
   - Verify all dependencies are installed
   - Ensure model files are accessible

2. **File Processing Errors**:
   - Verify file formats are supported
   - Check file permissions
   - Ensure sufficient disk space

3. **Model Training Issues**:
   - Check data format and quality
   - Verify feature engineering
   - Monitor training progress

### Debug Mode
Enable debug logging for detailed troubleshooting:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Support

For technical support or questions about the AI/ML system:
- Check the logs for error messages
- Verify model status using `/api/ai/models/status`
- Review the API documentation
- Contact the development team

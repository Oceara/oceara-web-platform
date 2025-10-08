import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/satellite_images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|tiff|tif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation rules
const carbonPredictionValidation = [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('ecosystemType').isIn(['mangrove', 'wetland', 'seagrass', 'saltmarsh', 'kelp']).withMessage('Invalid ecosystem type'),
  body('temperature').optional().isFloat().withMessage('Temperature must be numeric'),
  body('precipitation').optional().isFloat().withMessage('Precipitation must be numeric'),
  body('age').optional().isFloat({ min: 0 }).withMessage('Age must be non-negative'),
  body('density').optional().isFloat({ min: 0, max: 1 }).withMessage('Density must be between 0 and 1'),
];

/**
 * @swagger
 * /api/ml/carbon/predict:
 *   post:
 *     summary: Predict carbon sequestration for an ecosystem
 *     tags: [Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *               - ecosystemType
 *             properties:
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               ecosystemType:
 *                 type: string
 *                 enum: [mangrove, wetland, seagrass, saltmarsh, kelp]
 *               temperature:
 *                 type: number
 *               precipitation:
 *                 type: number
 *               age:
 *                 type: number
 *                 minimum: 0
 *               density:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *     responses:
 *       200:
 *         description: Carbon sequestration prediction successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/carbon/predict', authenticateToken, carbonPredictionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      latitude,
      longitude,
      ecosystemType,
      temperature = 25,
      precipitation = 1500,
      age = 10,
      density = 0.7,
      speciesRichness = 20,
      threatLevel = 'medium',
      protectionStatus = 'unprotected',
      managementQuality = 5,
      soilType = 'clay',
      soilPh = 7,
      soilOrganicMatter = 5,
      waterDepth = 1,
      salinity = 15,
      nutrientAvailability = 5,
      sedimentLoad = 20,
      ndvi = 0.6,
      ndwi = 0.4,
      evi = 0.5,
      lai = 3,
      biomassIndex = 0.6,
      canopyCover = 0.7,
      vegetationHeight = 5,
      waterExtent = 0.8
    } = req.body;

    // Create input data for the model
    const inputData = {
      latitude,
      longitude,
      elevation: 0,
      distance_to_coast: 1,
      temperature,
      precipitation,
      humidity: 80,
      wind_speed: 5,
      sea_level_rise: 2,
      storm_frequency: 5,
      tidal_range: 3,
      ecosystem_type: ecosystemType,
      age,
      density,
      species_richness: speciesRichness,
      threat_level: threatLevel,
      protection_status: protectionStatus,
      management_quality: managementQuality,
      soil_type: soilType,
      soil_ph: soilPh,
      soil_organic_matter: soilOrganicMatter,
      water_depth: waterDepth,
      salinity,
      nutrient_availability: nutrientAvailability,
      sediment_load: sedimentLoad,
      ndvi,
      ndwi,
      evi,
      lai,
      biomass_index: biomassIndex,
      canopy_cover: canopyCover,
      vegetation_height: vegetationHeight,
      water_extent: waterExtent
    };

    // TODO: Call the actual ML model service
    // For now, return mock predictions
    const mockPredictions = {
      carbon_stored: [Math.random() * 1000 + 500],
      sequestration_rate: [Math.random() * 50 + 10]
    };

    // Calculate confidence based on data completeness
    const dataCompleteness = Object.values(inputData).filter(v => v !== null && v !== undefined).length / Object.keys(inputData).length;
    const confidence = Math.min(0.95, 0.5 + dataCompleteness * 0.45);

    res.json({
      success: true,
      data: {
        predictions: {
          carbon_stored: mockPredictions.carbon_stored[0],
          sequestration_rate: mockPredictions.sequestration_rate[0],
          confidence: confidence
        },
        input_data: inputData,
        model_info: {
          model_type: 'xgboost',
          version: '1.0.0',
          trained_at: '2024-01-01T00:00:00Z'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Carbon prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make carbon sequestration prediction',
    });
  }
});

/**
 * @swagger
 * /api/ml/satellite/classify:
 *   post:
 *     summary: Classify satellite image for ecosystem type
 *     tags: [Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Satellite image file
 *     responses:
 *       200:
 *         description: Image classification successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/satellite/classify', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const imagePath = req.file.path;

    // TODO: Call the actual ML model service for image classification
    // For now, return mock classification
    const ecosystemTypes = ['mangrove', 'wetland', 'seagrass', 'saltmarsh', 'other'];
    const mockClassification = {
      class: ecosystemTypes[Math.floor(Math.random() * ecosystemTypes.length)],
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      data: {
        classification: mockClassification,
        model_info: {
          model_type: 'cnn',
          version: '1.0.0',
          trained_at: '2024-01-01T00:00:00Z'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Satellite classification error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to classify satellite image',
    });
  }
});

/**
 * @swagger
 * /api/ml/batch/carbon:
 *   post:
 *     summary: Make batch carbon sequestration predictions
 *     tags: [Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     ecosystemType:
 *                       type: string
 *     responses:
 *       200:
 *         description: Batch predictions successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/batch/carbon', authenticateToken, async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data array is required and must not be empty',
      });
    }

    if (data.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 predictions allowed per batch',
      });
    }

    // TODO: Call the actual ML model service for batch predictions
    // For now, return mock batch predictions
    const mockPredictions = data.map((item, index) => ({
      id: index,
      input: item,
      prediction: {
        carbon_stored: Math.random() * 1000 + 500,
        sequestration_rate: Math.random() * 50 + 10,
        confidence: Math.random() * 0.3 + 0.7
      }
    }));

    const summary = {
      total_samples: data.length,
      avg_carbon_stored: mockPredictions.reduce((sum, p) => sum + p.prediction.carbon_stored, 0) / data.length,
      avg_sequestration_rate: mockPredictions.reduce((sum, p) => sum + p.prediction.sequestration_rate, 0) / data.length,
      total_carbon_stored: mockPredictions.reduce((sum, p) => sum + p.prediction.carbon_stored, 0),
      total_sequestration_rate: mockPredictions.reduce((sum, p) => sum + p.prediction.sequestration_rate, 0)
    };

    res.json({
      success: true,
      data: {
        predictions: mockPredictions,
        summary,
        model_info: {
          model_type: 'xgboost',
          version: '1.0.0',
          trained_at: '2024-01-01T00:00:00Z'
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Batch carbon prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make batch carbon predictions',
    });
  }
});

/**
 * @swagger
 * /api/ml/models/status:
 *   get:
 *     summary: Get status of all ML models
 *     tags: [Machine Learning]
 *     responses:
 *       200:
 *         description: Model status retrieved successfully
 */
router.get('/models/status', async (req, res) => {
  try {
    // TODO: Get actual model status from model service
    const mockStatus = {
      carbon_model: {
        available: true,
        metadata: {
          model_type: 'xgboost',
          trained_at: '2024-01-01T00:00:00Z',
          performance: {
            overall_r2: 0.85,
            overall_rmse: 150.2
          },
          n_features: 30,
          n_samples: 10000
        }
      },
      satellite_classifier: {
        available: true,
        metadata: {
          trained_at: '2024-01-01T00:00:00Z',
          performance: {
            val_accuracy: 0.92,
            val_top3_accuracy: 0.98
          },
          epochs_trained: 50
        }
      },
      models_directory: '/models',
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockStatus
    });

  } catch (error) {
    logger.error('Get model status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get model status',
    });
  }
});

/**
 * @swagger
 * /api/ml/models/retrain:
 *   post:
 *     summary: Retrain a specific ML model
 *     tags: [Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model_name
 *             properties:
 *               model_name:
 *                 type: string
 *                 enum: [carbon_model, satellite_classifier]
 *               training_data:
 *                 type: object
 *                 description: Training data specific to the model
 *     responses:
 *       200:
 *         description: Model retraining initiated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/models/retrain', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { model_name, training_data } = req.body;

    if (!model_name || !['carbon_model', 'satellite_classifier'].includes(model_name)) {
      return res.status(400).json({
        success: false,
        message: 'Valid model name is required',
      });
    }

    // TODO: Implement actual model retraining
    // This would typically be an async job
    logger.info(`Retraining model: ${model_name}`);

    res.json({
      success: true,
      message: `Model ${model_name} retraining initiated`,
      data: {
        model_name,
        status: 'training_initiated',
        estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Model retraining error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate model retraining',
    });
  }
});

export default router;

/**
 * AI/ML API Routes for Image Processing and Carbon Calculation
 * - /api/ai/process-images - CNN models for image analysis
 * - /api/ai/calculate-carbon - XGBoost models for carbon prediction
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Request, Response } from 'express';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
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
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and data files
    const allowedTypes = /jpeg|jpg|png|tiff|tif|pdf|csv|json/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and data files are allowed.'));
    }
  }
});

// Queue system for batch processing
interface ProcessingJob {
  id: string;
  type: 'image_processing' | 'carbon_calculation';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  files: string[];
  parameters?: any;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

class ProcessingQueue {
  private jobs: Map<string, ProcessingJob> = new Map();
  private processing: boolean = false;

  addJob(job: Omit<ProcessingJob, 'id' | 'status' | 'createdAt'>): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newJob: ProcessingJob = {
      ...job,
      id,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.jobs.set(id, newJob);
    logger.info(`Job ${id} added to queue`);
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
    
    return id;
  }

  getJob(id: string): ProcessingJob | undefined {
    return this.jobs.get(id);
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    logger.info('Starting queue processing...');
    
    while (true) {
      const pendingJobs = Array.from(this.jobs.values())
        .filter(job => job.status === 'pending');
      
      if (pendingJobs.length === 0) {
        this.processing = false;
        logger.info('Queue processing completed');
        break;
      }
      
      for (const job of pendingJobs) {
        await this.processJob(job);
      }
      
      // Small delay between job processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private async processJob(job: ProcessingJob): Promise<void> {
    try {
      job.status = 'processing';
      logger.info(`Processing job ${job.id} of type ${job.type}`);
      
      if (job.type === 'image_processing') {
        job.result = await this.processImages(job.files, job.parameters);
      } else if (job.type === 'carbon_calculation') {
        job.result = await this.calculateCarbon(job.parameters);
      }
      
      job.status = 'completed';
      job.completedAt = new Date();
      logger.info(`Job ${job.id} completed successfully`);
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      logger.error(`Job ${job.id} failed: ${job.error}`);
    }
  }

  private async processImages(files: string[], parameters?: any): Promise<any> {
    // Call Python script for image processing
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../../../ml-models/src/process_images.py');
      const args = [
        pythonScript,
        '--files', files.join(','),
        '--output-dir', path.join(__dirname, '../../results')
      ];
      
      if (parameters) {
        args.push('--parameters', JSON.stringify(parameters));
      }
      
      const pythonProcess = spawn('python', args);
      
      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (error) {
            reject(new Error('Failed to parse Python script output'));
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }

  private async calculateCarbon(parameters: any): Promise<any> {
    // Call Python script for carbon calculation
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../../../ml-models/src/calculate_carbon.py');
      const args = [
        pythonScript,
        '--parameters', JSON.stringify(parameters),
        '--output-dir', path.join(__dirname, '../../results')
      ];
      
      const pythonProcess = spawn('python', args);
      
      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (error) {
            reject(new Error('Failed to parse Python script output'));
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

const processingQueue = new ProcessingQueue();

/**
 * POST /api/ai/process-images
 * Process uploaded images using CNN models
 */
router.post('/process-images', authenticateToken, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const parameters = req.body.parameters ? JSON.parse(req.body.parameters) : {};
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.mimetype));
    
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file types. Only JPEG, PNG, and TIFF images are allowed.'
      });
    }
    
    // Add job to processing queue
    const filePaths = files.map(file => file.path);
    const jobId = processingQueue.addJob({
      type: 'image_processing',
      files: filePaths,
      parameters: {
        ...parameters,
        user_id: (req as any).user.id,
        timestamp: new Date().toISOString()
      }
    });
    
    logger.info(`Image processing job ${jobId} queued for ${files.length} files`);
    
    res.status(202).json({
      success: true,
      message: 'Images queued for processing',
      job_id: jobId,
      files_uploaded: files.length
    });
    
  } catch (error) {
    logger.error('Error processing images:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/calculate-carbon
 * Calculate carbon sequestration and biomass using XGBoost models
 */
router.post('/calculate-carbon', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      tree_data,
      environmental_data,
      ecosystem_data
    } = req.body;
    
    if (!tree_data) {
      return res.status(400).json({
        success: false,
        message: 'Tree data is required'
      });
    }
    
    // Validate required fields
    const requiredFields = ['dbh', 'tree_height', 'species'];
    const missingFields = requiredFields.filter(field => !tree_data[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Add job to processing queue
    const jobId = processingQueue.addJob({
      type: 'carbon_calculation',
      files: [],
      parameters: {
        tree_data,
        environmental_data,
        ecosystem_data,
        user_id: (req as any).user.id,
        timestamp: new Date().toISOString()
      }
    });
    
    logger.info(`Carbon calculation job ${jobId} queued`);
    
    res.status(202).json({
      success: true,
      message: 'Carbon calculation queued for processing',
      job_id: jobId
    });
    
  } catch (error) {
    logger.error('Error calculating carbon:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai/job/:jobId
 * Get job status and results
 */
router.get('/job/:jobId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = processingQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if user has access to this job
    if (job.parameters?.user_id !== (req as any).user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const response: any = {
      success: true,
      job_id: job.id,
      type: job.type,
      status: job.status,
      created_at: job.createdAt,
      files_count: job.files.length
    };
    
    if (job.status === 'completed') {
      response.result = job.result;
      response.completed_at = job.completedAt;
    } else if (job.status === 'failed') {
      response.error = job.error;
      response.completed_at = job.completedAt;
    }
    
    res.json(response);
    
  } catch (error) {
    logger.error('Error getting job status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai/jobs
 * Get all jobs for the authenticated user
 */
router.get('/jobs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, type, limit = 50, offset = 0 } = req.query;
    
    // Get all jobs (in a real implementation, this would be stored in a database)
    const allJobs = Array.from(processingQueue['jobs'].values())
      .filter(job => job.parameters?.user_id === userId);
    
    // Apply filters
    let filteredJobs = allJobs;
    
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }
    
    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }
    
    // Apply pagination
    const startIndex = parseInt(offset as string) || 0;
    const endIndex = startIndex + (parseInt(limit as string) || 50);
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
    
    const jobs = paginatedJobs.map(job => ({
      id: job.id,
      type: job.type,
      status: job.status,
      created_at: job.createdAt,
      completed_at: job.completedAt,
      files_count: job.files.length,
      error: job.error
    }));
    
    res.json({
      success: true,
      jobs,
      total: filteredJobs.length,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0
    });
    
  } catch (error) {
    logger.error('Error getting jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/ai/job/:jobId
 * Cancel or delete a job
 */
router.delete('/job/:jobId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = processingQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if user has access to this job
    if (job.parameters?.user_id !== (req as any).user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Only allow deletion of pending or failed jobs
    if (job.status === 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete job that is currently processing'
      });
    }
    
    // Remove job from queue
    processingQueue['jobs'].delete(jobId);
    
    // Clean up files if they exist
    for (const filePath of job.files) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        logger.warn(`Failed to delete file ${filePath}:`, error);
      }
    }
    
    logger.info(`Job ${jobId} deleted by user ${(req as any).user.id}`);
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
    
  } catch (error) {
    logger.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ai/models/status
 * Get status of all ML models
 */
router.get('/models/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if Python ML service is available
    const pythonScript = path.join(__dirname, '../../../ml-models/src/check_models.py');
    
    const pythonProcess = spawn('python', [pythonScript]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const modelStatus = JSON.parse(output);
          res.json({
            success: true,
            models: modelStatus
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Failed to parse model status',
            error: 'Invalid JSON response from ML service'
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'ML service unavailable',
          error: errorOutput
        });
      }
    });
    
  } catch (error) {
    logger.error('Error checking model status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ai/train-models
 * Train or retrain ML models (Admin only)
 */
router.post('/train-models', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const { model_type, parameters } = req.body;
    
    // Add training job to queue
    const jobId = processingQueue.addJob({
      type: 'carbon_calculation', // Reuse existing type for training
      files: [],
      parameters: {
        training: true,
        model_type,
        parameters,
        user_id: (req as any).user.id,
        timestamp: new Date().toISOString()
      }
    });
    
    logger.info(`Model training job ${jobId} queued by admin ${(req as any).user.id}`);
    
    res.status(202).json({
      success: true,
      message: 'Model training queued',
      job_id: jobId
    });
    
  } catch (error) {
    logger.error('Error training models:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

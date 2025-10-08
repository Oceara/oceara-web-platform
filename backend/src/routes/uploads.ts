/**
 * Upload API Routes
 * File upload endpoints with S3/Cloud Storage integration
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middleware/auth';
import fileStorageService from '../services/fileStorageService';
import Upload from '../models/Upload';
import Project from '../models/Project';
import { createAuditLog } from '../services/auditLogger';
import { logger } from '../utils/logger';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/gif',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/json',
      'application/vnd.google-earth.kml+xml',
      'application/zip'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

/**
 * Upload drone images
 * POST /api/uploads/drone-images
 */
router.post(
  '/drone-images',
  authenticate,
  requireRole(['landowner', 'admin']),
  upload.array('images', 50),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { projectId } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
      }

      // Upload files to storage
      const uploadResults = await fileStorageService.uploadMultipleFiles(files, {
        userId,
        projectId,
        uploadType: 'drone_image',
        userRole,
        isPublic: false
      });

      // Update project with upload references
      const project = await Project.findById(projectId);
      if (project) {
        for (const result of uploadResults) {
          await project.addUpload('droneImages', {
            fileId: result.uploadRecord._id,
            uploadDate: new Date(),
            fileType: result.uploadRecord.fileType,
            fileSize: result.size,
            s3Key: result.key,
            s3Url: result.url,
            processed: false
          });
        }
      }

      await createAuditLog({
        userId,
        action: 'UPLOAD_DRONE_IMAGES',
        resource: 'upload',
        resourceId: projectId,
        details: `Uploaded ${uploadResults.length} drone images`,
        metadata: { projectId, fileCount: uploadResults.length }
      });

      res.status(201).json({
        success: true,
        message: `${uploadResults.length} files uploaded successfully`,
        data: uploadResults
      });
    } catch (error) {
      logger.error('Error uploading drone images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: (error as Error).message
      });
    }
  }
);

/**
 * Upload field data
 * POST /api/uploads/field-data
 */
router.post(
  '/field-data',
  authenticate,
  requireRole(['landowner', 'admin']),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { projectId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await fileStorageService.uploadFile(file, {
        userId,
        projectId,
        uploadType: 'field_data',
        userRole,
        isPublic: false
      });

      // Update project
      const project = await Project.findById(projectId);
      if (project) {
        await project.addUpload('fieldData', {
          fileId: result.uploadRecord._id,
          uploadDate: new Date(),
          fileType: result.uploadRecord.fileType,
          fileSize: result.size,
          s3Key: result.key,
          s3Url: result.url,
          parsed: false
        });
      }

      await createAuditLog({
        userId,
        action: 'UPLOAD_FIELD_DATA',
        resource: 'upload',
        resourceId: projectId,
        details: 'Uploaded field data file',
        metadata: { projectId, filename: result.filename }
      });

      res.status(201).json({
        success: true,
        message: 'Field data uploaded successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error uploading field data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: (error as Error).message
      });
    }
  }
);

/**
 * Upload GPS data
 * POST /api/uploads/gps-data
 */
router.post(
  '/gps-data',
  authenticate,
  requireRole(['landowner', 'admin']),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { projectId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await fileStorageService.uploadFile(file, {
        userId,
        projectId,
        uploadType: 'gps_data',
        userRole,
        isPublic: false
      });

      // Update project
      const project = await Project.findById(projectId);
      if (project) {
        await project.addUpload('gpsData', {
          fileId: result.uploadRecord._id,
          uploadDate: new Date(),
          fileType: result.uploadRecord.fileType,
          fileSize: result.size,
          s3Key: result.key,
          s3Url: result.url,
          parsed: false
        });
      }

      await createAuditLog({
        userId,
        action: 'UPLOAD_GPS_DATA',
        resource: 'upload',
        resourceId: projectId,
        details: 'Uploaded GPS data file',
        metadata: { projectId, filename: result.filename }
      });

      res.status(201).json({
        success: true,
        message: 'GPS data uploaded successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error uploading GPS data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: (error as Error).message
      });
    }
  }
);

/**
 * Upload before/after photos
 * POST /api/uploads/before-after-photos
 */
router.post(
  '/before-after-photos',
  authenticate,
  requireRole(['landowner', 'admin']),
  upload.array('photos', 20),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { projectId, type, description } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      if (!type || !['before', 'after'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be "before" or "after"'
        });
      }

      const uploadResults = await fileStorageService.uploadMultipleFiles(files, {
        userId,
        projectId,
        uploadType: 'before_after_photo',
        userRole,
        metadata: { type, description },
        isPublic: true // Before/after photos are public
      });

      // Update project
      const project = await Project.findById(projectId);
      if (project) {
        for (const result of uploadResults) {
          await project.addUpload('beforeAfterPhotos', {
            type,
            fileId: result.uploadRecord._id,
            uploadDate: new Date(),
            s3Key: result.key,
            s3Url: result.url,
            description
          });
        }
      }

      await createAuditLog({
        userId,
        action: 'UPLOAD_BEFORE_AFTER_PHOTOS',
        resource: 'upload',
        resourceId: projectId,
        details: `Uploaded ${uploadResults.length} ${type} photos`,
        metadata: { projectId, type, fileCount: uploadResults.length }
      });

      res.status(201).json({
        success: true,
        message: `${uploadResults.length} photos uploaded successfully`,
        data: uploadResults
      });
    } catch (error) {
      logger.error('Error uploading before/after photos:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload photos',
        error: (error as Error).message
      });
    }
  }
);

/**
 * Get all uploads for a project
 * GET /api/uploads/project/:projectId
 */
router.get('/project/:projectId', authenticate, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { uploadType, status } = req.query;

    const query: any = { projectId };
    if (uploadType) query.uploadType = uploadType;
    if (status) query.status = status;

    const uploads = await Upload.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: uploads
    });
  } catch (error) {
    logger.error('Error fetching uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch uploads',
      error: (error as Error).message
    });
  }
});

/**
 * Get single upload
 * GET /api/uploads/:uploadId
 */
router.get('/:uploadId', authenticate, async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;

    const upload = await Upload.findOne({ uploadId })
      .populate('userId', 'name email')
      .populate('projectId', 'name projectId');

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Record access
    await upload.recordAccess(
      (req as any).user.id,
      'view',
      req.ip
    );

    res.json({
      success: true,
      data: upload
    });
  } catch (error) {
    logger.error('Error fetching upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upload',
      error: (error as Error).message
    });
  }
});

/**
 * Download file
 * GET /api/uploads/:uploadId/download
 */
router.get('/:uploadId/download', authenticate, async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;

    const upload = await Upload.findOne({ uploadId });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Record download
    await upload.recordAccess(
      (req as any).user.id,
      'download',
      req.ip
    );

    // Get signed URL
    const signedUrl = await fileStorageService.getSignedUrl(upload.storage.key, 300); // 5 min expiry

    res.json({
      success: true,
      data: {
        url: signedUrl,
        filename: upload.originalFilename,
        expiresIn: 300
      }
    });
  } catch (error) {
    logger.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: (error as Error).message
    });
  }
});

/**
 * Delete upload
 * DELETE /api/uploads/:uploadId
 */
router.delete('/:uploadId', authenticate, requireRole(['landowner', 'admin']), async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;
    const userId = (req as any).user.id;

    const upload = await Upload.findOne({ uploadId });

    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Check permissions
    if (upload.userId.toString() !== userId && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete from storage
    await fileStorageService.deleteFile(upload.storage.key);

    // Soft delete from database
    await upload.softDelete(userId);

    await createAuditLog({
      userId,
      action: 'DELETE_UPLOAD',
      resource: 'upload',
      resourceId: uploadId,
      details: `Deleted file: ${upload.originalFilename}`,
      metadata: { uploadId, filename: upload.originalFilename }
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: (error as Error).message
    });
  }
});

/**
 * Get upload statistics
 * GET /api/uploads/stats/summary
 */
router.get('/stats/summary', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const query: any = {};
    if (userRole === 'landowner') {
      query.userId = userId;
    }

    const [
      totalUploads,
      totalSize,
      byType,
      byStatus,
      recentUploads
    ] = await Promise.all([
      Upload.countDocuments(query),
      Upload.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$fileSize' } } }
      ]),
      Upload.aggregate([
        { $match: query },
        { $group: { _id: '$uploadType', count: { $sum: 1 } } }
      ]),
      Upload.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Upload.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .select('uploadId originalFilename uploadType fileSize status createdAt')
    ]);

    res.json({
      success: true,
      data: {
        totalUploads,
        totalSize: totalSize[0]?.total || 0,
        byType,
        byStatus,
        recentUploads
      }
    });
  } catch (error) {
    logger.error('Error fetching upload statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: (error as Error).message
    });
  }
});

export default router;

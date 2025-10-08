/**
 * Project API Routes
 * Comprehensive endpoints for project management
 */

import express, { Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import Project from '../models/Project';
import { createAuditLog } from '../services/auditLogger';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Create new project
 * POST /api/projects
 */
router.post('/', authenticate, requireRole(['landowner', 'admin']), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userName = (req as any).user.name;

    const projectData = {
      ...req.body,
      projectId: `PROJ-${uuidv4().substring(0, 8).toUpperCase()}`,
      ownerId: userId,
      ownerName: userName,
      lastModifiedBy: userId
    };

    const project = await Project.create(projectData);

    await createAuditLog({
      userId,
      action: 'CREATE_PROJECT',
      resource: 'project',
      resourceId: project._id.toString(),
      details: `Created project: ${project.name}`,
      metadata: { projectId: project.projectId }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    logger.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: (error as Error).message
    });
  }
});

/**
 * Get all projects (with filters and pagination)
 * GET /api/projects
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const {
      page = 1,
      limit = 20,
      status,
      verificationStatus,
      ecosystemType,
      country,
      projectType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query: any = {};

    // Role-based filtering
    if (userRole === 'landowner') {
      query.ownerId = userId;
    } else if (userRole === 'buyer') {
      query.verificationStatus = 'verified';
      query.visibility = 'public';
    }

    // Apply filters
    if (status) query.status = status;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (ecosystemType) query.ecosystemType = ecosystemType;
    if (country) query.country = country;
    if (projectType) query.projectType = projectType;

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { projectId: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('ownerId', 'name email')
        .lean(),
      Project.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: (error as Error).message
    });
  }
});

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const project = await Project.findById(id)
      .populate('ownerId', 'name email phone')
      .populate('verificationHistory.verifiedBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (
      userRole === 'landowner' &&
      project.ownerId._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: (error as Error).message
    });
  }
});

/**
 * Update project
 * PUT /api/projects/:id
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (
      userRole === 'landowner' &&
      project.ownerId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        ...req.body,
        lastModifiedBy: userId
      },
      { new: true }
    );

    await createAuditLog({
      userId,
      action: 'UPDATE_PROJECT',
      resource: 'project',
      resourceId: id,
      details: `Updated project: ${project.name}`,
      metadata: { changes: req.body }
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: (error as Error).message
    });
  }
});

/**
 * Delete project
 * DELETE /api/projects/:id
 */
router.delete('/:id', authenticate, requireRole(['landowner', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (
      userRole === 'landowner' &&
      project.ownerId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    await Project.findByIdAndUpdate(id, {
      status: 'archived',
      lastModifiedBy: userId
    });

    await createAuditLog({
      userId,
      action: 'DELETE_PROJECT',
      resource: 'project',
      resourceId: id,
      details: `Deleted project: ${project.name}`
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: (error as Error).message
    });
  }
});

/**
 * Submit project for verification
 * POST /api/projects/:id/submit
 */
router.post('/:id/submit', authenticate, requireRole(['landowner']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (project.verificationStatus !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Project already submitted'
      });
    }

    await project.updateVerificationStatus('submitted', userId, 'Submitted for verification');

    await createAuditLog({
      userId,
      action: 'SUBMIT_PROJECT',
      resource: 'project',
      resourceId: id,
      details: `Submitted project for verification: ${project.name}`
    });

    res.json({
      success: true,
      message: 'Project submitted for verification',
      data: project
    });
  } catch (error) {
    logger.error('Error submitting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit project',
      error: (error as Error).message
    });
  }
});

/**
 * Get project statistics
 * GET /api/projects/:id/statistics
 */
router.get('/:id/statistics', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const statistics = {
      carbon: {
        totalSequestration: project.carbonData.calculatedSequestration || project.carbonData.estimatedSequestration,
        annualSequestration: project.carbonData.annualSequestration,
        carbonStock: project.carbonData.carbonStock,
        totalBiomass: project.carbonData.totalBiomass
      },
      credits: {
        issued: project.creditsIssued,
        available: project.creditsAvailable,
        retired: project.creditsRetired,
        total: project.creditsIssued + project.creditsAvailable
      },
      vegetation: {
        totalTrees: project.vegetationData.totalTrees,
        density: project.vegetationData.density,
        survivalRate: project.vegetationData.survivalRate,
        healthScore: project.vegetationData.healthScore
      },
      uploads: {
        droneImages: project.uploads.droneImages.length,
        fieldData: project.uploads.fieldData.length,
        gpsData: project.uploads.gpsData.length,
        beforeAfterPhotos: project.uploads.beforeAfterPhotos.length,
        documents: project.uploads.documents.length
      },
      financial: {
        totalEarnings: project.earnings.totalEarnings,
        pendingPayments: project.earnings.pendingPayments,
        transactionCount: project.earnings.transactions.length
      },
      timeline: {
        startDate: project.startDate,
        restorationDate: project.restorationDate,
        completionDate: project.completionDate,
        projectDuration: project.projectDuration,
        daysElapsed: Math.floor((Date.now() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    logger.error('Error fetching project statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: (error as Error).message
    });
  }
});

/**
 * Get nearby projects
 * GET /api/projects/:id/nearby
 */
router.get('/:id/nearby', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { maxDistance = 50000 } = req.query; // Default 50km

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const nearbyProjects = await Project.find({
      _id: { $ne: id },
      location: {
        $near: {
          $geometry: project.location,
          $maxDistance: Number(maxDistance)
        }
      },
      verificationStatus: 'verified',
      visibility: 'public'
    }).limit(10);

    res.json({
      success: true,
      data: nearbyProjects
    });
  } catch (error) {
    logger.error('Error fetching nearby projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby projects',
      error: (error as Error).message
    });
  }
});

export default router;

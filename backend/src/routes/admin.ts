/**
 * Admin API Routes
 * Handles administrative operations, project approvals, and audit logging
 */

import express, { Request, Response } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { ROLES } from '../../frontend/lib/auth';
import { logger } from '../utils/logger';
import blockchainService from '../services/blockchain';
import { createAuditLog } from '../services/auditLogger';

const router = express.Router();

/**
 * GET /api/admin/projects
 * Get all projects for admin review
 */
router.get('/projects', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    // In production, fetch from database
    const projects = []; // Fetch from DB with filters
    
    logger.info(`Admin ${(req as any).user.id} fetched projects`);
    await createAuditLog({
      userId: (req as any).user.id,
      action: 'VIEW_PROJECTS',
      resource: 'projects',
      details: `Viewed projects list with filters: ${JSON.stringify({ status, page, limit })}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/projects/:id
 * Get detailed project information
 */
router.get('/projects/:id', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch project details
    const project = {}; // Fetch from DB

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'VIEW_PROJECT_DETAILS',
      resource: 'project',
      resourceId: id,
      details: `Viewed project #${id} details`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error('Error fetching project details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/projects/:id/approve
 * Approve a project for verification
 */
router.post('/projects/:id/approve', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes, verificationStage } = req.body;

    // Update project status in database
    // const project = await updateProjectStatus(id, 'approved', notes);

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'APPROVE_PROJECT',
      resource: 'project',
      resourceId: id,
      details: `Approved project #${id} for verification. Notes: ${notes}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    logger.info(`Project ${id} approved by admin ${(req as any).user.id}`);

    res.json({
      success: true,
      message: 'Project approved successfully',
      data: {
        projectId: id,
        status: 'approved',
        verificationStage
      }
    });
  } catch (error) {
    logger.error('Error approving project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/projects/:id/reject
 * Reject a project
 */
router.post('/projects/:id/reject', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Update project status in database
    // const project = await updateProjectStatus(id, 'rejected', reason);

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'REJECT_PROJECT',
      resource: 'project',
      resourceId: id,
      details: `Rejected project #${id}. Reason: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    logger.info(`Project ${id} rejected by admin ${(req as any).user.id}`);

    res.json({
      success: true,
      message: 'Project rejected',
      data: {
        projectId: id,
        status: 'rejected',
        reason
      }
    });
  } catch (error) {
    logger.error('Error rejecting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/projects/:id/request-changes
 * Request changes to a project
 */
router.post('/projects/:id/request-changes', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { changes } = req.body;

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Changes list is required'
      });
    }

    // Update project status and add change requests
    // const project = await addChangeRequests(id, changes);

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'REQUEST_PROJECT_CHANGES',
      resource: 'project',
      resourceId: id,
      details: `Requested changes for project #${id}. Changes: ${changes.join(', ')}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    logger.info(`Changes requested for project ${id} by admin ${(req as any).user.id}`);

    res.json({
      success: true,
      message: 'Change requests submitted',
      data: {
        projectId: id,
        changes
      }
    });
  } catch (error) {
    logger.error('Error requesting changes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request changes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/ai/override
 * Override AI/ML model results
 */
router.post('/ai/override', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { projectId, field, originalValue, newValue, reason } = req.body;

    if (!projectId || !field || !newValue || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectId, field, newValue, reason'
      });
    }

    // Update AI results in database
    // const result = await overrideAIResult(projectId, field, newValue);

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'AI_OVERRIDE',
      resource: 'ai_result',
      resourceId: projectId,
      details: `Overrode AI result for project #${projectId}, field: ${field}. Original: ${JSON.stringify(originalValue)}, New: ${JSON.stringify(newValue)}. Reason: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    logger.info(`AI result overridden for project ${projectId} by admin ${(req as any).user.id}`);

    res.json({
      success: true,
      message: 'AI result overridden successfully',
      data: {
        projectId,
        field,
        newValue
      }
    });
  } catch (error) {
    logger.error('Error overriding AI result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to override AI result',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/credits/mint
 * Mint carbon credits after verification
 */
router.post('/credits/mint', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { 
      projectId, 
      recipient, 
      carbonAmount, 
      vintageYear,
      methodology,
      location,
      species
    } = req.body;

    if (!projectId || !recipient || !carbonAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: projectId, recipient, carbonAmount'
      });
    }

    // Verify project is approved
    // const project = await getProject(projectId);
    // if (project.status !== 'approved') {
    //   return res.status(400).json({ success: false, message: 'Project not approved' });
    // }

    // Mint credits on blockchain
    const tokenURI = `https://api.oceara.com/metadata/${projectId}`;
    const result = await blockchainService.mintCredit(
      recipient,
      projectId,
      carbonAmount,
      vintageYear,
      methodology,
      location,
      species,
      tokenURI
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to mint credit');
    }

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'MINT_CARBON_CREDITS',
      resource: 'carbon_credit',
      resourceId: result.tokenId,
      details: `Minted ${carbonAmount} tons of carbon credits for project #${projectId}. Token ID: ${result.tokenId}, TX: ${result.txHash}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    logger.info(`Carbon credits minted for project ${projectId} by admin ${(req as any).user.id}`);

    res.json({
      success: true,
      message: 'Carbon credits minted successfully',
      data: {
        projectId,
        tokenId: result.tokenId,
        txHash: result.txHash,
        carbonAmount
      }
    });
  } catch (error) {
    logger.error('Error minting credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mint credits',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/audit-logs
 * Get audit logs
 */
router.get('/audit-logs', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;

    // Fetch audit logs from database
    const logs = []; // Fetch from DB with filters

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/blockchain/transactions
 * Get blockchain transactions
 */
router.get('/blockchain/transactions', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, type, projectId } = req.query;

    // Fetch blockchain transactions from database
    const transactions = []; // Fetch from DB with filters

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching blockchain transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blockchain transactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/reports/export
 * Export compliance reports
 */
router.get('/reports/export', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { type, format = 'pdf', startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }

    // Generate report based on type
    let reportData;
    switch (type) {
      case 'verification':
        reportData = {}; // Generate verification report
        break;
      case 'registry':
        reportData = {}; // Generate registry report
        break;
      case 'audit':
        reportData = {}; // Generate audit report
        break;
      case 'ai':
        reportData = {}; // Generate AI analysis report
        break;
      case 'blockchain':
        reportData = {}; // Generate blockchain report
        break;
      case 'compliance':
        reportData = {}; // Generate compliance report
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'EXPORT_REPORT',
      resource: 'report',
      details: `Exported ${type} report in ${format} format`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    logger.info(`Report exported by admin ${(req as any).user.id}: ${type}`);

    // In production, generate actual PDF/CSV file
    res.json({
      success: true,
      message: 'Report generated successfully',
      data: {
        type,
        format,
        downloadUrl: `/downloads/reports/${type}_${Date.now()}.${format}`
      }
    });
  } catch (error) {
    logger.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/statistics
 * Get admin dashboard statistics
 */
router.get('/statistics', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    // Fetch statistics from database
    const stats = {
      totalProjects: 0,
      pendingReview: 0,
      underVerification: 0,
      approved: 0,
      rejected: 0,
      totalCarbonCredits: 0,
      totalCarbonAmount: 0,
      recentActivity: []
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/verifications/:id/approve
 * Approve a verification report
 */
router.post('/verifications/:id/approve', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Approve verification in database
    // const verification = await approveVerification(id, notes);

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'APPROVE_VERIFICATION',
      resource: 'verification',
      resourceId: id,
      details: `Approved verification #${id}. Notes: ${notes}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    logger.info(`Verification ${id} approved by admin ${(req as any).user.id}`);

    res.json({
      success: true,
      message: 'Verification approved successfully',
      data: {
        verificationId: id,
        status: 'approved'
      }
    });
  } catch (error) {
    logger.error('Error approving verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve verification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/verifications/:id/reject
 * Reject a verification report
 */
router.post('/verifications/:id/reject', authenticateToken, authorizeRoles([ROLES.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Reject verification in database
    // const verification = await rejectVerification(id, reason);

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'REJECT_VERIFICATION',
      resource: 'verification',
      resourceId: id,
      details: `Rejected verification #${id}. Reason: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    logger.info(`Verification ${id} rejected by admin ${(req as any).user.id}`);

    res.json({
      success: true,
      message: 'Verification rejected',
      data: {
        verificationId: id,
        status: 'rejected',
        reason
      }
    });
  } catch (error) {
    logger.error('Error rejecting verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject verification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

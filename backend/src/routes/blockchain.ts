/**
 * Blockchain API Routes for Carbon Credit Smart Contracts
 * Handles all blockchain interactions for carbon credits
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import blockchainService from '../services/blockchain';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * POST /api/blockchain/mint-credit
 * Mint a new carbon credit NFT
 */
router.post('/mint-credit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      to,
      projectId,
      carbonAmount,
      vintageYear,
      methodology,
      location,
      species,
      tokenURI
    } = req.body;

    // Validate required fields
    const requiredFields = ['to', 'projectId', 'carbonAmount', 'vintageYear', 'methodology', 'location', 'species'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const result = await blockchainService.mintCredit(
      to,
      projectId,
      carbonAmount,
      vintageYear,
      methodology,
      location,
      species,
      tokenURI || ''
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Carbon credit minted successfully',
        data: {
          tokenId: result.tokenId,
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to mint carbon credit',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in mint-credit endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/transfer-credit
 * Transfer a carbon credit
 */
router.post('/transfer-credit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tokenId, from, to } = req.body;

    // Validate required fields
    if (!tokenId || !from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenId, from, to'
      });
    }

    const result = await blockchainService.transferCredit(tokenId, from, to);

    if (result.success) {
      res.json({
        success: true,
        message: 'Carbon credit transferred successfully',
        data: {
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to transfer carbon credit',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in transfer-credit endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/retire-credit
 * Retire a carbon credit
 */
router.post('/retire-credit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tokenId, retirementReason } = req.body;

    // Validate required fields
    if (!tokenId || !retirementReason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenId, retirementReason'
      });
    }

    const result = await blockchainService.retireCredit(tokenId, retirementReason);

    if (result.success) {
      res.json({
        success: true,
        message: 'Carbon credit retired successfully',
        data: {
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to retire carbon credit',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in retire-credit endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/verify-credit
 * Verify a carbon credit
 */
router.post('/verify-credit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tokenId, verified, verificationNotes } = req.body;

    // Validate required fields
    if (!tokenId || typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenId, verified'
      });
    }

    // Check if user has verifier role
    if ((req as any).user.role !== 'admin' && (req as any).user.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to verify credits'
      });
    }

    const result = await blockchainService.verifyCredit(tokenId, verified, verificationNotes || '');

    if (result.success) {
      res.json({
        success: true,
        message: 'Carbon credit verification completed',
        data: {
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to verify carbon credit',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in verify-credit endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/create-project
 * Create a new carbon project
 */
router.post('/create-project', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      location,
      methodology,
      totalArea,
      estimatedCarbon,
      vintageYear
    } = req.body;

    // Validate required fields
    const requiredFields = ['name', 'description', 'location', 'methodology', 'totalArea', 'estimatedCarbon', 'vintageYear'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const result = await blockchainService.createProject(
      name,
      description,
      location,
      methodology,
      totalArea,
      estimatedCarbon,
      vintageYear
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Carbon project created successfully',
        data: {
          projectId: result.projectId,
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create carbon project',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in create-project endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/submit-verification-report
 * Submit a verification report
 */
router.post('/submit-verification-report', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      carbonAmount,
      reportHash,
      notes,
      expiryDate
    } = req.body;

    // Validate required fields
    const requiredFields = ['projectId', 'carbonAmount', 'reportHash', 'expiryDate'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if user has verifier role
    if ((req as any).user.role !== 'admin' && (req as any).user.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to submit verification reports'
      });
    }

    const result = await blockchainService.submitVerificationReport(
      projectId,
      carbonAmount,
      reportHash,
      notes || '',
      expiryDate
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Verification report submitted successfully',
        data: {
          verificationId: result.verificationId,
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to submit verification report',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in submit-verification-report endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/issue-credits
 * Issue credits for a verified project
 */
router.post('/issue-credits', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      projectId,
      recipient,
      carbonAmount,
      tokenURI
    } = req.body;

    // Validate required fields
    const requiredFields = ['projectId', 'recipient', 'carbonAmount'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if user has admin or minter role
    if ((req as any).user.role !== 'admin' && (req as any).user.role !== 'minter') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to issue credits'
      });
    }

    const result = await blockchainService.issueCredits(
      projectId,
      recipient,
      carbonAmount,
      tokenURI || ''
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Credits issued successfully',
        data: {
          tokenIds: result.tokenIds,
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to issue credits',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in issue-credits endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/create-listing
 * Create a marketplace listing
 */
router.post('/create-listing', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      tokenId,
      price,
      duration,
      listingType
    } = req.body;

    // Validate required fields
    const requiredFields = ['tokenId', 'price', 'duration', 'listingType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    let result;
    if (listingType === 'fixed') {
      result = await blockchainService.createFixedPriceListing(tokenId, price, duration);
    } else if (listingType === 'auction') {
      result = await blockchainService.createAuctionListing(tokenId, price, duration);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing type. Must be "fixed" or "auction"'
      });
    }

    if (result.success) {
      res.json({
        success: true,
        message: 'Listing created successfully',
        data: {
          listingId: result.listingId,
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create listing',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in create-listing endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/blockchain/buy-credit
 * Buy a carbon credit from marketplace
 */
router.post('/buy-credit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: listingId'
      });
    }

    const result = await blockchainService.buyCredit(listingId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Carbon credit purchased successfully',
        data: {
          txHash: result.txHash
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to buy carbon credit',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in buy-credit endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/credit/:tokenId
 * Get carbon credit data
 */
router.get('/credit/:tokenId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: 'Missing tokenId parameter'
      });
    }

    const result = await blockchainService.getCarbonCreditData(tokenId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get carbon credit data',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in get-credit endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/project/:projectId
 * Get project information
 */
router.get('/project/:projectId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Missing projectId parameter'
      });
    }

    const result = await blockchainService.getProjectInfo(projectId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get project information',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in get-project endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/listing/:listingId
 * Get listing information
 */
router.get('/listing/:listingId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Missing listingId parameter'
      });
    }

    const result = await blockchainService.getListingInfo(listingId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get listing information',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in get-listing endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/credits/:owner
 * Get credits owned by an address
 */
router.get('/credits/:owner', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { owner } = req.params;

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: 'Missing owner parameter'
      });
    }

    const result = await blockchainService.getCreditsByOwner(owner);

    if (result.success) {
      res.json({
        success: true,
        data: {
          tokenIds: result.tokenIds
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get credits by owner',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in get-credits-by-owner endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/total-carbon/:owner
 * Get total carbon amount owned by an address
 */
router.get('/total-carbon/:owner', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { owner } = req.params;

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: 'Missing owner parameter'
      });
    }

    const result = await blockchainService.getTotalCarbonByOwner(owner);

    if (result.success) {
      res.json({
        success: true,
        data: {
          totalCarbon: result.totalCarbon
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get total carbon by owner',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in get-total-carbon endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/blockchain/network-info
 * Get blockchain network information
 */
router.get('/network-info', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await blockchainService.getNetworkInfo();

    if (result.success) {
      res.json({
        success: true,
        data: result.network
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to get network information',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in get-network-info endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
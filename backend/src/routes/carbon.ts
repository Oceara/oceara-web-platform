/**
 * Carbon Calculation API Routes
 */

import express, { Request, Response } from 'express';
import carbonCalculationService from '../services/carbonCalculationService';
import { authenticate, requireRole } from '../middleware/auth';
import { createAuditLog } from '../services/auditLogger';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Calculate carbon for single tree
 * POST /api/carbon/calculate-single
 */
router.post('/calculate-single', authenticate, async (req: Request, res: Response) => {
  try {
    const { speciesType, dbh, height, crownRadius, age, healthScore } = req.body;

    if (!speciesType || !dbh || !height) {
      return res.status(400).json({
        success: false,
        message: 'Species type, DBH, and height are required'
      });
    }

    const result = carbonCalculationService.calculateSingleTree({
      speciesType,
      dbh,
      height,
      crownRadius,
      age,
      healthScore
    });

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'CALCULATE_SINGLE_TREE',
      resource: 'carbon_calculation',
      details: `Calculated carbon for single ${speciesType} tree`,
      metadata: { result }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error calculating single tree carbon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate carbon',
      error: (error as Error).message
    });
  }
});

/**
 * Calculate carbon for forest/ecosystem
 * POST /api/carbon/calculate-forest
 */
router.post('/calculate-forest', authenticate, async (req: Request, res: Response) => {
  try {
    const { trees, areaHectares, environment } = req.body;

    if (!trees || !Array.isArray(trees) || trees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Trees array is required and must not be empty'
      });
    }

    if (!areaHectares || areaHectares <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Area in hectares is required and must be positive'
      });
    }

    // Validate measurements
    const validation = carbonCalculationService.validateMeasurements(trees);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tree measurements',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }

    const result = carbonCalculationService.calculateForest(
      trees,
      areaHectares,
      environment
    );

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'CALCULATE_FOREST_CARBON',
      resource: 'carbon_calculation',
      details: `Calculated carbon for ${trees.length} trees over ${areaHectares} hectares`,
      metadata: {
        treeCount: trees.length,
        area: areaHectares,
        totalCO2: result.co2Sequestration,
        confidence: result.confidence
      }
    });

    res.json({
      success: true,
      data: result,
      warnings: validation.warnings
    });
  } catch (error) {
    logger.error('Error calculating forest carbon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate carbon',
      error: (error as Error).message
    });
  }
});

/**
 * Calculate carbon from AI/ML results
 * POST /api/carbon/calculate-from-ai
 */
router.post('/calculate-from-ai', authenticate, async (req: Request, res: Response) => {
  try {
    const { aiResults, fieldData, manualOverrides } = req.body;

    if (!aiResults || !fieldData) {
      return res.status(400).json({
        success: false,
        message: 'AI results and field data are required'
      });
    }

    const result = await carbonCalculationService.calculateFromAIResults(
      aiResults,
      fieldData,
      manualOverrides
    );

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'CALCULATE_FROM_AI',
      resource: 'carbon_calculation',
      details: 'Calculated carbon from AI/ML results',
      metadata: {
        hasManualOverrides: !!manualOverrides,
        totalCO2: result.co2Sequestration,
        confidence: result.confidence
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error calculating carbon from AI results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate carbon',
      error: (error as Error).message
    });
  }
});

/**
 * Admin override for carbon calculations
 * POST /api/carbon/admin-override
 */
router.post(
  '/admin-override',
  authenticate,
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    try {
      const { calculationId, overrides, reason } = req.body;

      if (!calculationId || !overrides) {
        return res.status(400).json({
          success: false,
          message: 'Calculation ID and overrides are required'
        });
      }

      // Here you would typically update the calculation in the database
      // For now, we'll just recalculate with the overrides

      const { aiResults, fieldData } = req.body;

      const result = await carbonCalculationService.calculateFromAIResults(
        aiResults,
        fieldData,
        overrides
      );

      await createAuditLog({
        userId: (req as any).user.id,
        action: 'ADMIN_CARBON_OVERRIDE',
        resource: 'carbon_calculation',
        details: `Admin override applied: ${reason || 'No reason provided'}`,
        metadata: {
          calculationId,
          overrides,
          result,
          reason
        }
      });

      res.json({
        success: true,
        message: 'Carbon calculation updated with admin overrides',
        data: result
      });
    } catch (error) {
      logger.error('Error applying admin override:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply admin override',
        error: (error as Error).message
      });
    }
  }
);

/**
 * Get species parameters
 * GET /api/carbon/species/:speciesType
 */
router.get('/species/:speciesType', authenticate, async (req: Request, res: Response) => {
  try {
    const { speciesType } = req.params;
    const parameters = carbonCalculationService.getSpeciesParameters(speciesType);

    res.json({
      success: true,
      data: parameters
    });
  } catch (error) {
    logger.error('Error getting species parameters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get species parameters',
      error: (error as Error).message
    });
  }
});

/**
 * List all available species
 * GET /api/carbon/species
 */
router.get('/species', authenticate, async (req: Request, res: Response) => {
  try {
    const species = carbonCalculationService.listAvailableSpecies();

    res.json({
      success: true,
      data: species
    });
  } catch (error) {
    logger.error('Error listing species:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list species',
      error: (error as Error).message
    });
  }
});

/**
 * Validate tree measurements
 * POST /api/carbon/validate
 */
router.post('/validate', authenticate, async (req: Request, res: Response) => {
  try {
    const { trees } = req.body;

    if (!trees || !Array.isArray(trees)) {
      return res.status(400).json({
        success: false,
        message: 'Trees array is required'
      });
    }

    const validation = carbonCalculationService.validateMeasurements(trees);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Error validating measurements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate measurements',
      error: (error as Error).message
    });
  }
});

/**
 * Generate carbon calculation report
 * POST /api/carbon/report
 */
router.post('/report', authenticate, async (req: Request, res: Response) => {
  try {
    const { result, projectName } = req.body;

    if (!result || !projectName) {
      return res.status(400).json({
        success: false,
        message: 'Calculation result and project name are required'
      });
    }

    const report = carbonCalculationService.generateReport(result, projectName);

    await createAuditLog({
      userId: (req as any).user.id,
      action: 'GENERATE_CARBON_REPORT',
      resource: 'carbon_calculation',
      details: `Generated carbon report for ${projectName}`,
      metadata: { projectName }
    });

    res.json({
      success: true,
      data: {
        report,
        projectName,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: (error as Error).message
    });
  }
});

/**
 * Calculate formula examples
 * GET /api/carbon/formulas
 */
router.get('/formulas', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      formulas: [
        {
          name: 'Crown Area',
          formula: 'Crown_Area = π × (Crown_Radius)²',
          unit: 'm²',
          description: 'Calculate the crown area from crown radius'
        },
        {
          name: 'Basal Area',
          formula: 'Basal_Area = π × (DBH/2)²',
          unit: 'm²',
          description: 'Calculate the basal area from diameter at breast height'
        },
        {
          name: 'Above-Ground Biomass (Primary)',
          formula: 'AGB = 0.25 × π × D² × H × ρ × BEF',
          unit: 'tons',
          description: 'Calculate AGB using volume-based formula',
          variables: {
            D: 'Diameter at Breast Height (m)',
            H: 'Height (m)',
            ρ: 'Wood density (kg/m³)',
            BEF: 'Biomass Expansion Factor'
          }
        },
        {
          name: 'Above-Ground Biomass (Allometric)',
          formula: 'AGB = 0.168 × DBH^2.471',
          unit: 'kg',
          description: 'Allometric equation for mangroves (Komiyama et al., 2005)',
          variables: {
            DBH: 'Diameter at Breast Height (cm)'
          }
        },
        {
          name: 'Below-Ground Biomass',
          formula: 'BGB = AGB × Root-Shoot Ratio',
          unit: 'tons',
          description: 'Calculate BGB from AGB and species-specific root-shoot ratio'
        },
        {
          name: 'Carbon Stock',
          formula: 'Carbon_Stock = Total_Biomass × 0.46',
          unit: 'tons C',
          description: 'Calculate carbon stock (IPCC default carbon fraction: 0.46)'
        },
        {
          name: 'CO₂ Sequestration',
          formula: 'CO₂_Sequestration = Carbon_Stock × 3.67',
          unit: 'tons CO₂e',
          description: 'Convert carbon to CO₂ equivalent (molecular weight ratio: 44/12)'
        }
      ],
      references: [
        'IPCC Guidelines for National Greenhouse Gas Inventories (2006)',
        'Komiyama, A., et al. (2005). Allometry, biomass, and productivity of mangrove forests',
        'Alongi, D.M. (2014). Carbon cycling and storage in mangrove forests',
        'Donato, D.C., et al. (2011). Mangroves among the most carbon-rich forests in the tropics'
      ]
    }
  });
});

export default router;

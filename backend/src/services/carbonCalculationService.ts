/**
 * Carbon Calculation Service
 * Scientific carbon sequestration calculations for mangroves and wetlands
 * Based on IPCC guidelines and peer-reviewed research
 */

import { logger } from '../utils/logger';
import { createAuditLog } from './auditLogger';

// Species-specific parameters
interface SpeciesParameters {
  name: string;
  scientificName: string;
  woodDensity: number; // kg/m³
  biomasExpansionFactor: number;
  rootShootRatio: number;
  carbonFraction: number;
  growthRate: number; // cm/year
  maxHeight: number; // meters
  maxDBH: number; // cm
}

// Tree measurement data
interface TreeMeasurement {
  speciesType: string;
  dbh: number; // Diameter at Breast Height (cm)
  height: number; // meters
  crownRadius?: number; // meters
  age?: number; // years
  healthScore?: number; // 0-100
}

// Environmental parameters
interface EnvironmentalParameters {
  soilType: string;
  salinity: number; // ppt
  tidalRange: number; // meters
  precipitation: number; // mm/year
  temperature: number; // °C
  latitude: number;
  longitude: number;
}

// Calculation result
interface CarbonCalculationResult {
  treeCount: number;
  totalAGB: number; // Above-ground biomass (tons)
  totalBGB: number; // Below-ground biomass (tons)
  totalBiomass: number; // Total biomass (tons)
  carbonStock: number; // Carbon stock (tons C)
  co2Sequestration: number; // CO2 equivalent (tons CO2e)
  annualSequestration: number; // Annual CO2 sequestration (tons CO2e/year)
  crownArea: number; // Total crown area (hectares)
  basalArea: number; // Total basal area (m²)
  confidence: number; // Calculation confidence (0-1)
  methodology: string;
  calculations: {
    perTree: {
      avgAGB: number;
      avgBGB: number;
      avgCarbonStock: number;
      avgCO2: number;
    };
    perHectare: {
      biomass: number;
      carbonStock: number;
      co2Sequestration: number;
    };
  };
  speciesBreakdown: Array<{
    species: string;
    count: number;
    totalAGB: number;
    carbonStock: number;
    co2Sequestration: number;
  }>;
}

// Species database
const SPECIES_DATABASE: Record<string, SpeciesParameters> = {
  'rhizophora_mucronata': {
    name: 'Rhizophora mucronata',
    scientificName: 'Rhizophora mucronata',
    woodDensity: 890, // kg/m³
    biomasExpansionFactor: 1.5,
    rootShootRatio: 0.39,
    carbonFraction: 0.464,
    growthRate: 1.2,
    maxHeight: 27,
    maxDBH: 70
  },
  'rhizophora_apiculata': {
    name: 'Rhizophora apiculata',
    scientificName: 'Rhizophora apiculata',
    woodDensity: 880,
    biomasExpansionFactor: 1.48,
    rootShootRatio: 0.37,
    carbonFraction: 0.458,
    growthRate: 1.1,
    maxHeight: 30,
    maxDBH: 80
  },
  'avicennia_marina': {
    name: 'Avicennia marina',
    scientificName: 'Avicennia marina',
    woodDensity: 730,
    biomasExpansionFactor: 1.4,
    rootShootRatio: 0.28,
    carbonFraction: 0.442,
    growthRate: 0.9,
    maxHeight: 14,
    maxDBH: 50
  },
  'avicennia_officinalis': {
    name: 'Avicennia officinalis',
    scientificName: 'Avicennia officinalis',
    woodDensity: 750,
    biomasExpansionFactor: 1.42,
    rootShootRatio: 0.30,
    carbonFraction: 0.448,
    growthRate: 1.0,
    maxHeight: 15,
    maxDBH: 60
  },
  'bruguiera_gymnorrhiza': {
    name: 'Bruguiera gymnorrhiza',
    scientificName: 'Bruguiera gymnorrhiza',
    woodDensity: 810,
    biomasExpansionFactor: 1.45,
    rootShootRatio: 0.33,
    carbonFraction: 0.455,
    growthRate: 0.8,
    maxHeight: 25,
    maxDBH: 60
  },
  'sonneratia_alba': {
    name: 'Sonneratia alba',
    scientificName: 'Sonneratia alba',
    woodDensity: 620,
    biomasExpansionFactor: 1.35,
    rootShootRatio: 0.25,
    carbonFraction: 0.435,
    growthRate: 1.3,
    maxHeight: 15,
    maxDBH: 50
  },
  'mixed_species': {
    name: 'Mixed Species',
    scientificName: 'Mixed mangrove species',
    woodDensity: 780, // Average
    biomasExpansionFactor: 1.44,
    rootShootRatio: 0.32,
    carbonFraction: 0.46,
    growthRate: 1.0,
    maxHeight: 20,
    maxDBH: 60
  }
};

class CarbonCalculationService {
  /**
   * Calculate crown area
   * Formula: Crown_Area = π × (Crown_Radius)²
   */
  calculateCrownArea(crownRadius: number): number {
    return Math.PI * Math.pow(crownRadius, 2);
  }

  /**
   * Calculate basal area from DBH
   * Formula: Basal_Area = π × (DBH/2)² / 10000 (convert cm² to m²)
   */
  calculateBasalArea(dbh: number): number {
    const radiusCm = dbh / 2;
    const areaCm2 = Math.PI * Math.pow(radiusCm, 2);
    return areaCm2 / 10000; // Convert to m²
  }

  /**
   * Calculate Above-Ground Biomass (AGB)
   * Formula: AGB = 0.25 × π × D² × H × ρ × BEF
   * Where:
   *   D = Diameter at Breast Height (cm)
   *   H = Height (m)
   *   ρ = Wood density (kg/m³)
   *   BEF = Biomass Expansion Factor
   */
  calculateAGB(
    dbh: number,
    height: number,
    woodDensity: number,
    bef: number
  ): number {
    // Convert DBH from cm to m for calculation
    const dbhMeters = dbh / 100;
    
    // AGB formula (result in kg)
    const agbKg = 0.25 * Math.PI * Math.pow(dbhMeters, 2) * height * woodDensity * bef;
    
    // Convert to tons
    return agbKg / 1000;
  }

  /**
   * Alternative allometric equation for AGB
   * Formula: AGB = a × DBH^b × H^c
   * Common equation: AGB = 0.168 × DBH^2.471 (Komiyama et al., 2005)
   */
  calculateAGBAllometric(dbh: number, height: number, speciesType: string): number {
    const species = SPECIES_DATABASE[speciesType] || SPECIES_DATABASE['mixed_species'];
    
    // Komiyama equation for mangroves
    const agbKg = 0.168 * Math.pow(dbh, 2.471);
    
    // Height adjustment factor
    const heightFactor = Math.min(height / species.maxHeight, 1.2);
    
    // Convert to tons
    return (agbKg * heightFactor) / 1000;
  }

  /**
   * Calculate Below-Ground Biomass (BGB)
   * Formula: BGB = AGB × Root-Shoot Ratio
   */
  calculateBGB(agb: number, rootShootRatio: number): number {
    return agb * rootShootRatio;
  }

  /**
   * Calculate Carbon Stock
   * Formula: Carbon_Stock = Biomass × Carbon_Fraction
   * Default carbon fraction for mangroves: 0.46 (IPCC)
   */
  calculateCarbonStock(totalBiomass: number, carbonFraction: number = 0.46): number {
    return totalBiomass * carbonFraction;
  }

  /**
   * Calculate CO2 Sequestration
   * Formula: CO₂_Sequestration = Carbon_Stock × 3.67
   * (3.67 is the ratio of molecular weights: CO2/C = 44/12)
   */
  calculateCO2Sequestration(carbonStock: number): number {
    return carbonStock * 3.67;
  }

  /**
   * Calculate annual CO2 sequestration based on tree age and growth rate
   */
  calculateAnnualSequestration(
    totalCO2: number,
    age: number,
    growthRate: number
  ): number {
    if (age <= 0) {
      // Use growth rate to estimate annual sequestration
      return totalCO2 * (growthRate / 100);
    }
    
    // Average annual sequestration over tree lifetime
    const baseAnnual = totalCO2 / age;
    
    // Adjust for current growth rate (younger trees sequester faster)
    const ageFactor = Math.max(0.5, 1 - (age / 50)); // Decreases with age
    
    return baseAnnual * (1 + ageFactor);
  }

  /**
   * Calculate carbon for a single tree
   */
  calculateSingleTree(
    measurement: TreeMeasurement,
    useAllometric: boolean = false
  ): {
    agb: number;
    bgb: number;
    totalBiomass: number;
    carbonStock: number;
    co2: number;
    annualCO2: number;
  } {
    const species = SPECIES_DATABASE[measurement.speciesType] || SPECIES_DATABASE['mixed_species'];

    // Calculate AGB
    let agb: number;
    if (useAllometric) {
      agb = this.calculateAGBAllometric(measurement.dbh, measurement.height, measurement.speciesType);
    } else {
      agb = this.calculateAGB(
        measurement.dbh,
        measurement.height,
        species.woodDensity,
        species.biomasExpansionFactor
      );
    }

    // Apply health score adjustment if available
    if (measurement.healthScore !== undefined) {
      const healthFactor = measurement.healthScore / 100;
      agb *= healthFactor;
    }

    // Calculate BGB
    const bgb = this.calculateBGB(agb, species.rootShootRatio);

    // Calculate total biomass
    const totalBiomass = agb + bgb;

    // Calculate carbon stock
    const carbonStock = this.calculateCarbonStock(totalBiomass, species.carbonFraction);

    // Calculate CO2 sequestration
    const co2 = this.calculateCO2Sequestration(carbonStock);

    // Calculate annual CO2 sequestration
    const annualCO2 = this.calculateAnnualSequestration(
      co2,
      measurement.age || 10,
      species.growthRate
    );

    return {
      agb,
      bgb,
      totalBiomass,
      carbonStock,
      co2,
      annualCO2
    };
  }

  /**
   * Calculate carbon for multiple trees
   */
  calculateForest(
    trees: TreeMeasurement[],
    areaHectares: number,
    environment?: EnvironmentalParameters
  ): CarbonCalculationResult {
    if (trees.length === 0) {
      throw new Error('No tree measurements provided');
    }

    let totalAGB = 0;
    let totalBGB = 0;
    let totalCrownArea = 0;
    let totalBasalArea = 0;
    let totalCO2Annual = 0;

    // Species breakdown
    const speciesMap = new Map<string, {
      count: number;
      agb: number;
      carbonStock: number;
      co2: number;
    }>();

    // Process each tree
    for (const tree of trees) {
      const result = this.calculateSingleTree(tree, true);

      totalAGB += result.agb;
      totalBGB += result.bgb;
      totalCO2Annual += result.annualCO2;

      // Calculate crown area if radius available
      if (tree.crownRadius) {
        totalCrownArea += this.calculateCrownArea(tree.crownRadius);
      }

      // Calculate basal area
      totalBasalArea += this.calculateBasalArea(tree.dbh);

      // Species breakdown
      const speciesKey = tree.speciesType;
      if (!speciesMap.has(speciesKey)) {
        speciesMap.set(speciesKey, {
          count: 0,
          agb: 0,
          carbonStock: 0,
          co2: 0
        });
      }

      const speciesData = speciesMap.get(speciesKey)!;
      speciesData.count++;
      speciesData.agb += result.agb;
      speciesData.carbonStock += result.carbonStock;
      speciesData.co2 += result.co2;
    }

    // Total calculations
    const totalBiomass = totalAGB + totalBGB;
    const carbonStock = this.calculateCarbonStock(totalBiomass);
    const co2Sequestration = this.calculateCO2Sequestration(carbonStock);

    // Per tree averages
    const avgAGB = totalAGB / trees.length;
    const avgBGB = totalBGB / trees.length;
    const avgCarbonStock = carbonStock / trees.length;
    const avgCO2 = co2Sequestration / trees.length;

    // Per hectare calculations
    const biomassPerHa = totalBiomass / areaHectares;
    const carbonStockPerHa = carbonStock / areaHectares;
    const co2PerHa = co2Sequestration / areaHectares;

    // Confidence calculation
    const confidence = this.calculateConfidence(trees, environment);

    // Species breakdown array
    const speciesBreakdown = Array.from(speciesMap.entries()).map(([species, data]) => ({
      species,
      count: data.count,
      totalAGB: data.agb,
      carbonStock: data.carbonStock,
      co2Sequestration: data.co2
    }));

    return {
      treeCount: trees.length,
      totalAGB,
      totalBGB,
      totalBiomass,
      carbonStock,
      co2Sequestration,
      annualSequestration: totalCO2Annual,
      crownArea: totalCrownArea / 10000, // Convert m² to hectares
      basalArea: totalBasalArea,
      confidence,
      methodology: 'Allometric equations (Komiyama et al., 2005) + IPCC guidelines',
      calculations: {
        perTree: {
          avgAGB,
          avgBGB,
          avgCarbonStock,
          avgCO2
        },
        perHectare: {
          biomass: biomassPerHa,
          carbonStock: carbonStockPerHa,
          co2Sequestration: co2PerHa
        }
      },
      speciesBreakdown
    };
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidence(
    trees: TreeMeasurement[],
    environment?: EnvironmentalParameters
  ): number {
    let confidence = 0.7; // Base confidence

    // Sample size factor
    if (trees.length >= 100) {
      confidence += 0.15;
    } else if (trees.length >= 50) {
      confidence += 0.10;
    } else if (trees.length >= 20) {
      confidence += 0.05;
    }

    // Data completeness factor
    const hasHeight = trees.every(t => t.height > 0);
    const hasCrownRadius = trees.every(t => t.crownRadius && t.crownRadius > 0);
    const hasAge = trees.every(t => t.age && t.age > 0);
    const hasHealth = trees.every(t => t.healthScore !== undefined);

    if (hasHeight) confidence += 0.05;
    if (hasCrownRadius) confidence += 0.03;
    if (hasAge) confidence += 0.02;
    if (hasHealth) confidence += 0.05;

    // Environmental data factor
    if (environment) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Integrate with AI/ML results
   */
  async calculateFromAIResults(
    aiResults: {
      crownDetection: { crownsDetected: number; confidence: number };
      speciesClassification: { species: string; confidence: number };
      healthAssessment: { healthScore: number; confidence: number };
    },
    fieldData: {
      avgDBH: number;
      avgHeight: number;
      areaHectares: number;
      sampledTrees?: TreeMeasurement[];
    },
    manualOverrides?: {
      crownCount?: number;
      species?: string;
      healthScore?: number;
      confidence?: number;
    }
  ): Promise<CarbonCalculationResult> {
    try {
      // Apply manual overrides if provided
      const crownCount = manualOverrides?.crownCount || aiResults.crownDetection.crownsDetected;
      const species = manualOverrides?.species || aiResults.speciesClassification.species;
      const healthScore = manualOverrides?.healthScore || aiResults.healthAssessment.healthScore;

      // Generate synthetic tree measurements based on AI + field data
      const trees: TreeMeasurement[] = [];

      if (fieldData.sampledTrees && fieldData.sampledTrees.length > 0) {
        // Use actual sampled trees
        trees.push(...fieldData.sampledTrees.map(t => ({
          ...t,
          healthScore: t.healthScore || healthScore
        })));
      } else {
        // Generate from averages
        for (let i = 0; i < crownCount; i++) {
          // Add variability (±20%)
          const dbhVariation = (Math.random() - 0.5) * 0.4;
          const heightVariation = (Math.random() - 0.5) * 0.4;

          trees.push({
            speciesType: species.toLowerCase().replace(/\s+/g, '_'),
            dbh: fieldData.avgDBH * (1 + dbhVariation),
            height: fieldData.avgHeight * (1 + heightVariation),
            healthScore
          });
        }
      }

      // Calculate carbon
      const result = this.calculateForest(trees, fieldData.areaHectares);

      // Adjust confidence based on AI confidence and manual overrides
      const aiConfidence = (
        aiResults.crownDetection.confidence +
        aiResults.speciesClassification.confidence +
        aiResults.healthAssessment.confidence
      ) / 3;

      let adjustedConfidence = result.confidence * aiConfidence;

      // Boost confidence if manual overrides applied
      if (manualOverrides) {
        adjustedConfidence = Math.min(adjustedConfidence * 1.1, 0.95);
      }

      result.confidence = adjustedConfidence;

      // Log calculation
      await createAuditLog({
        userId: 'system',
        action: 'CARBON_CALCULATION',
        resource: 'carbon_calculation',
        details: `Calculated carbon for ${crownCount} trees: ${result.co2Sequestration.toFixed(2)} tons CO2e`,
        metadata: {
          crownCount,
          species,
          totalCO2: result.co2Sequestration,
          confidence: result.confidence,
          hasManualOverrides: !!manualOverrides
        }
      });

      return result;
    } catch (error) {
      logger.error('Error calculating carbon from AI results:', error);
      throw error;
    }
  }

  /**
   * Get species parameters
   */
  getSpeciesParameters(speciesType: string): SpeciesParameters {
    return SPECIES_DATABASE[speciesType] || SPECIES_DATABASE['mixed_species'];
  }

  /**
   * List all available species
   */
  listAvailableSpecies(): SpeciesParameters[] {
    return Object.values(SPECIES_DATABASE);
  }

  /**
   * Validate tree measurements
   */
  validateMeasurements(trees: TreeMeasurement[]): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < trees.length; i++) {
      const tree = trees[i];

      // Check DBH
      if (tree.dbh <= 0) {
        errors.push(`Tree ${i + 1}: DBH must be positive`);
      } else if (tree.dbh > 200) {
        warnings.push(`Tree ${i + 1}: DBH ${tree.dbh}cm seems unusually large`);
      }

      // Check height
      if (tree.height <= 0) {
        errors.push(`Tree ${i + 1}: Height must be positive`);
      } else if (tree.height > 40) {
        warnings.push(`Tree ${i + 1}: Height ${tree.height}m seems unusually large for mangroves`);
      }

      // Check species
      if (!SPECIES_DATABASE[tree.speciesType] && tree.speciesType !== 'mixed_species') {
        warnings.push(`Tree ${i + 1}: Unknown species '${tree.speciesType}', using mixed species parameters`);
      }

      // Check health score
      if (tree.healthScore !== undefined && (tree.healthScore < 0 || tree.healthScore > 100)) {
        errors.push(`Tree ${i + 1}: Health score must be between 0 and 100`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate calculation report
   */
  generateReport(result: CarbonCalculationResult, projectName: string): string {
    let report = `
CARBON CALCULATION REPORT
Project: ${projectName}
Generated: ${new Date().toISOString()}
Methodology: ${result.methodology}
Confidence: ${(result.confidence * 100).toFixed(1)}%

============================================
SUMMARY
============================================
Total Trees: ${result.treeCount}
Area: Crown Area ${result.crownArea.toFixed(2)} ha, Basal Area ${result.basalArea.toFixed(2)} m²

Above-Ground Biomass (AGB): ${result.totalAGB.toFixed(2)} tons
Below-Ground Biomass (BGB): ${result.totalBGB.toFixed(2)} tons
Total Biomass: ${result.totalBiomass.toFixed(2)} tons

Carbon Stock: ${result.carbonStock.toFixed(2)} tons C
CO₂ Sequestration: ${result.co2Sequestration.toFixed(2)} tons CO₂e
Annual CO₂ Sequestration: ${result.annualSequestration.toFixed(2)} tons CO₂e/year

============================================
PER TREE AVERAGES
============================================
Average AGB: ${result.calculations.perTree.avgAGB.toFixed(3)} tons
Average BGB: ${result.calculations.perTree.avgBGB.toFixed(3)} tons
Average Carbon Stock: ${result.calculations.perTree.avgCarbonStock.toFixed(3)} tons C
Average CO₂: ${result.calculations.perTree.avgCO2.toFixed(3)} tons CO₂e

============================================
PER HECTARE
============================================
Biomass: ${result.calculations.perHectare.biomass.toFixed(2)} tons/ha
Carbon Stock: ${result.calculations.perHectare.carbonStock.toFixed(2)} tons C/ha
CO₂ Sequestration: ${result.calculations.perHectare.co2Sequestration.toFixed(2)} tons CO₂e/ha

============================================
SPECIES BREAKDOWN
============================================
`;

    for (const species of result.speciesBreakdown) {
      report += `
${species.species}:
  Count: ${species.count} trees (${((species.count / result.treeCount) * 100).toFixed(1)}%)
  AGB: ${species.totalAGB.toFixed(2)} tons
  Carbon Stock: ${species.carbonStock.toFixed(2)} tons C
  CO₂: ${species.co2Sequestration.toFixed(2)} tons CO₂e
`;
    }

    report += `
============================================
FORMULAS USED
============================================
1. Crown Area = π × (Crown_Radius)²
2. Basal Area = π × (DBH/2)²
3. AGB = 0.168 × DBH^2.471 (Komiyama et al., 2005)
4. BGB = AGB × Root-Shoot Ratio
5. Carbon Stock = Total Biomass × 0.46
6. CO₂ Sequestration = Carbon Stock × 3.67

============================================
`;

    return report;
  }
}

export default new CarbonCalculationService();

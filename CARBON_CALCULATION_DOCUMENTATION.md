# Carbon Calculation System Documentation

## Overview

The Carbon Calculation System is a comprehensive scientific framework for accurately calculating carbon sequestration in mangrove and wetland ecosystems. It implements peer-reviewed methodologies from IPCC guidelines and leading research institutions.

---

## Scientific Methodology

### Core Formulas

#### 1. **Crown Area Calculation**
```
Crown_Area = π × (Crown_Radius)²
```
- **Input**: Crown radius (meters)
- **Output**: Crown area (m²)
- **Purpose**: Estimate canopy coverage and forest density

#### 2. **Basal Area Calculation**
```
Basal_Area = π × (DBH/2)²
```
- **Input**: Diameter at Breast Height (cm)
- **Output**: Basal area (m²)
- **Purpose**: Measure tree cross-sectional area and stand density

#### 3. **Above-Ground Biomass (Volume-Based)**
```
AGB = 0.25 × π × D² × H × ρ × BEF
```
**Variables**:
- `D` = Diameter at Breast Height (meters)
- `H` = Tree height (meters)
- `ρ` = Wood density (kg/m³)
- `BEF` = Biomass Expansion Factor

**Output**: Above-ground biomass (tons)

#### 4. **Above-Ground Biomass (Allometric)**
```
AGB = 0.168 × DBH^2.471
```
**Based on**: Komiyama et al. (2005) - Mangrove-specific equation
- **Input**: DBH (cm)
- **Output**: Above-ground biomass (kg)
- **Application**: Preferred method for mangrove forests

#### 5. **Below-Ground Biomass**
```
BGB = AGB × Root-Shoot Ratio
```
- **Input**: Above-ground biomass, species-specific root-shoot ratio
- **Output**: Below-ground biomass (tons)
- **Note**: Root-shoot ratios vary by species (0.25-0.39 for mangroves)

#### 6. **Carbon Stock**
```
Carbon_Stock = Total_Biomass × Carbon_Fraction
```
- **Input**: Total biomass (AGB + BGB)
- **Carbon Fraction**: 0.46 (IPCC default for mangroves)
- **Output**: Carbon stock (tons C)

#### 7. **CO₂ Sequestration**
```
CO₂_Sequestration = Carbon_Stock × 3.67
```
- **Conversion Factor**: 3.67 (molecular weight ratio: CO₂/C = 44/12)
- **Output**: CO₂ equivalent (tons CO₂e)

---

## Species-Specific Parameters

### Supported Mangrove Species

#### 1. **Rhizophora mucronata**
- **Common Name**: Red Mangrove
- **Wood Density**: 890 kg/m³
- **BEF**: 1.5
- **Root-Shoot Ratio**: 0.39
- **Carbon Fraction**: 0.464
- **Growth Rate**: 1.2 cm/year
- **Max Height**: 27 m
- **Max DBH**: 70 cm

#### 2. **Rhizophora apiculata**
- **Common Name**: Tall-stilt Mangrove
- **Wood Density**: 880 kg/m³
- **BEF**: 1.48
- **Root-Shoot Ratio**: 0.37
- **Carbon Fraction**: 0.458
- **Growth Rate**: 1.1 cm/year
- **Max Height**: 30 m
- **Max DBH**: 80 cm

#### 3. **Avicennia marina**
- **Common Name**: Grey Mangrove
- **Wood Density**: 730 kg/m³
- **BEF**: 1.4
- **Root-Shoot Ratio**: 0.28
- **Carbon Fraction**: 0.442
- **Growth Rate**: 0.9 cm/year
- **Max Height**: 14 m
- **Max DBH**: 50 cm

#### 4. **Avicennia officinalis**
- **Common Name**: Indian Mangrove
- **Wood Density**: 750 kg/m³
- **BEF**: 1.42
- **Root-Shoot Ratio**: 0.30
- **Carbon Fraction**: 0.448
- **Growth Rate**: 1.0 cm/year
- **Max Height**: 15 m
- **Max DBH**: 60 cm

#### 5. **Bruguiera gymnorrhiza**
- **Common Name**: Large-leafed Mangrove
- **Wood Density**: 810 kg/m³
- **BEF**: 1.45
- **Root-Shoot Ratio**: 0.33
- **Carbon Fraction**: 0.455
- **Growth Rate**: 0.8 cm/year
- **Max Height**: 25 m
- **Max Height**: 60 cm

#### 6. **Sonneratia alba**
- **Common Name**: Mangrove Apple
- **Wood Density**: 620 kg/m³
- **BEF**: 1.35
- **Root-Shoot Ratio**: 0.25
- **Carbon Fraction**: 0.435
- **Growth Rate**: 1.3 cm/year
- **Max Height**: 15 m
- **Max DBH**: 50 cm

#### 7. **Mixed Species**
- **Wood Density**: 780 kg/m³ (average)
- **BEF**: 1.44
- **Root-Shoot Ratio**: 0.32
- **Carbon Fraction**: 0.46
- **Growth Rate**: 1.0 cm/year

---

## API Endpoints

### 1. Calculate Single Tree
**Endpoint**: `POST /api/carbon/calculate-single`

**Request Body**:
```json
{
  "speciesType": "rhizophora_mucronata",
  "dbh": 25.5,
  "height": 12.3,
  "crownRadius": 3.2,
  "age": 15,
  "healthScore": 85
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "agb": 0.458,
    "bgb": 0.179,
    "totalBiomass": 0.637,
    "carbonStock": 0.296,
    "co2": 1.086,
    "annualCO2": 0.091
  }
}
```

### 2. Calculate Forest/Ecosystem
**Endpoint**: `POST /api/carbon/calculate-forest`

**Request Body**:
```json
{
  "trees": [
    {
      "speciesType": "rhizophora_mucronata",
      "dbh": 25.5,
      "height": 12.3,
      "crownRadius": 3.2,
      "healthScore": 85
    },
    // ... more trees
  ],
  "areaHectares": 2.5,
  "environment": {
    "soilType": "muddy",
    "salinity": 25,
    "tidalRange": 2.1,
    "precipitation": 2500,
    "temperature": 28,
    "latitude": -6.123,
    "longitude": 106.789
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "treeCount": 150,
    "totalAGB": 68.7,
    "totalBGB": 26.8,
    "totalBiomass": 95.5,
    "carbonStock": 43.9,
    "co2Sequestration": 161.2,
    "annualSequestration": 13.7,
    "crownArea": 1.2,
    "basalArea": 15.3,
    "confidence": 0.87,
    "methodology": "Allometric equations (Komiyama et al., 2005) + IPCC guidelines",
    "calculations": {
      "perTree": {
        "avgAGB": 0.458,
        "avgBGB": 0.179,
        "avgCarbonStock": 0.293,
        "avgCO2": 1.075
      },
      "perHectare": {
        "biomass": 38.2,
        "carbonStock": 17.6,
        "co2Sequestration": 64.5
      }
    },
    "speciesBreakdown": [
      {
        "species": "rhizophora_mucronata",
        "count": 90,
        "totalAGB": 41.2,
        "carbonStock": 26.3,
        "co2Sequestration": 96.6
      },
      {
        "species": "avicennia_marina",
        "count": 60,
        "totalAGB": 27.5,
        "carbonStock": 17.6,
        "co2Sequestration": 64.6
      }
    ]
  },
  "warnings": []
}
```

### 3. Calculate from AI/ML Results
**Endpoint**: `POST /api/carbon/calculate-from-ai`

**Request Body**:
```json
{
  "aiResults": {
    "crownDetection": {
      "crownsDetected": 245,
      "confidence": 0.92
    },
    "speciesClassification": {
      "species": "rhizophora_mucronata",
      "confidence": 0.88
    },
    "healthAssessment": {
      "healthScore": 82,
      "confidence": 0.85
    }
  },
  "fieldData": {
    "avgDBH": 28.3,
    "avgHeight": 14.2,
    "areaHectares": 3.5
  },
  "manualOverrides": {
    "crownCount": 250,
    "species": "rhizophora_apiculata",
    "healthScore": 80,
    "confidence": 0.95
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "treeCount": 250,
    "totalAGB": 114.5,
    "totalBGB": 44.7,
    "totalBiomass": 159.2,
    "carbonStock": 73.2,
    "co2Sequestration": 268.6,
    "annualSequestration": 22.4,
    "confidence": 0.92,
    // ... full calculation result
  }
}
```

### 4. Admin Override
**Endpoint**: `POST /api/carbon/admin-override`

**Authentication**: Admin role required

**Request Body**:
```json
{
  "calculationId": "calc_123456",
  "aiResults": { /* ... */ },
  "fieldData": { /* ... */ },
  "overrides": {
    "crownCount": 230,
    "species": "mixed_species",
    "healthScore": 75
  },
  "reason": "Manual verification revealed mixed species composition"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Carbon calculation updated with admin overrides",
  "data": {
    // Updated calculation result
  }
}
```

### 5. Get Species Parameters
**Endpoint**: `GET /api/carbon/species/:speciesType`

**Example**: `GET /api/carbon/species/rhizophora_mucronata`

**Response**:
```json
{
  "success": true,
  "data": {
    "name": "Rhizophora mucronata",
    "scientificName": "Rhizophora mucronata",
    "woodDensity": 890,
    "biomasExpansionFactor": 1.5,
    "rootShootRatio": 0.39,
    "carbonFraction": 0.464,
    "growthRate": 1.2,
    "maxHeight": 27,
    "maxDBH": 70
  }
}
```

### 6. List All Species
**Endpoint**: `GET /api/carbon/species`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "Rhizophora mucronata",
      // ... parameters
    },
    // ... all species
  ]
}
```

### 7. Validate Measurements
**Endpoint**: `POST /api/carbon/validate`

**Request Body**:
```json
{
  "trees": [
    {
      "speciesType": "rhizophora_mucronata",
      "dbh": 25.5,
      "height": 12.3
    },
    {
      "speciesType": "avicennia_marina",
      "dbh": -5.0,
      "height": 50.0
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "valid": false,
    "errors": [
      "Tree 2: DBH must be positive"
    ],
    "warnings": [
      "Tree 2: Height 50.0m seems unusually large for mangroves"
    ]
  }
}
```

### 8. Generate Report
**Endpoint**: `POST /api/carbon/report`

**Request Body**:
```json
{
  "result": { /* calculation result object */ },
  "projectName": "Sundarbans Restoration Project"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "report": "CARBON CALCULATION REPORT\nProject: Sundarbans Restoration Project\n...",
    "projectName": "Sundarbans Restoration Project",
    "generatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 9. Get Formulas
**Endpoint**: `GET /api/carbon/formulas`

**Response**: Complete list of all formulas, variables, and references

---

## Integration with AI/ML

### Workflow

1. **Image Processing**
   - AI/ML models analyze drone imagery
   - Crown detection identifies individual trees
   - Species classification determines mangrove type
   - Health assessment evaluates tree condition

2. **Data Combination**
   - AI results combined with field measurements
   - Manual overrides applied if needed
   - Validation checks ensure data quality

3. **Carbon Calculation**
   - Automated processing using AI-derived parameters
   - Species-specific formulas applied
   - Confidence scores calculated

4. **Admin Review**
   - Admins can review AI results
   - Manual overrides for corrections
   - Audit trail maintained

### Example Integration
```typescript
// Step 1: Process images with AI
const aiResults = await processImages(droneImages);

// Step 2: Get field data
const fieldData = {
  avgDBH: 28.3,
  avgHeight: 14.2,
  areaHectares: 3.5
};

// Step 3: Calculate carbon
const carbonResult = await carbonCalculationService.calculateFromAIResults(
  aiResults,
  fieldData
);

// Step 4: Admin review (if needed)
if (carbonResult.confidence < 0.8) {
  // Flag for manual review
  await flagForAdminReview(carbonResult);
}
```

---

## Confidence Scoring

### Factors Affecting Confidence

1. **Sample Size**
   - ≥100 trees: +15%
   - ≥50 trees: +10%
   - ≥20 trees: +5%
   - <20 trees: Base confidence

2. **Data Completeness**
   - Height measurements: +5%
   - Crown radius: +3%
   - Tree age: +2%
   - Health scores: +5%

3. **Environmental Data**
   - Complete environmental parameters: +5%

4. **AI Integration**
   - AI confidence score factored in
   - Manual overrides boost confidence by 10%

### Confidence Interpretation
- **0.9-1.0**: Very High - Publication quality
- **0.8-0.89**: High - Reliable for carbon credits
- **0.7-0.79**: Moderate - Acceptable with review
- **0.6-0.69**: Low - Requires validation
- **<0.6**: Very Low - Not recommended for certification

---

## Manual Override Capabilities

### Admin Powers

1. **Crown Count Adjustment**
   - Override AI-detected crown count
   - Useful for dense canopy or overlapping crowns

2. **Species Correction**
   - Change species classification
   - Important for mixed-species stands

3. **Health Score Override**
   - Manual health assessment
   - Accounts for field observations

4. **Confidence Boost**
   - Manual verification increases confidence
   - Admin approval = quality assurance

### Audit Trail

All manual overrides are logged:
- User ID and timestamp
- Original values vs. override values
- Reason for override
- Impact on final calculations

---

## Best Practices

### Data Collection

1. **Field Measurements**
   - Measure DBH at 1.3m height
   - Use diameter tape for accuracy
   - Record species for each tree
   - Sample at least 10% of trees

2. **Drone Imagery**
   - Fly at 50-100m altitude
   - 80% overlap between images
   - Sunny conditions preferred
   - Multiple angles for crown detection

3. **GPS Coordinates**
   - Record plot corners
   - Use differential GPS when possible
   - Accuracy within 5 meters

### Calculation Strategy

1. **Use Allometric Equations**
   - More accurate for mangroves
   - Species-specific when possible
   - Validated by peer-reviewed research

2. **Include Below-Ground Biomass**
   - Mangroves have extensive root systems
   - BGB is 25-39% of AGB
   - Critical for total carbon stock

3. **Account for Tree Health**
   - Dead/dying trees sequester less
   - Health factor: 0-100%
   - Use AI assessment + field validation

4. **Environmental Context**
   - Salinity affects growth
   - Tidal range influences species
   - Precipitation impacts biomass

---

## Validation & Quality Control

### Automated Checks

1. **Range Validation**
   - DBH: 5-200 cm
   - Height: 1-40 m
   - Health: 0-100%

2. **Species Validation**
   - Check against species database
   - Flag unknown species
   - Suggest "mixed_species" fallback

3. **Outlier Detection**
   - Flag measurements >2 standard deviations
   - Suggest review for extreme values

### Manual Review Triggers

- Confidence <0.7
- Large carbon stock (>100 tons CO₂e/ha)
- Unusual species distribution
- Health scores <50%

---

## Scientific References

1. **IPCC (2006)**
   - "Guidelines for National Greenhouse Gas Inventories"
   - Carbon fraction: 0.46
   - Biomass conversion factors

2. **Komiyama et al. (2005)**
   - "Allometry, biomass, and productivity of mangrove forests"
   - Allometric equation: AGB = 0.168 × DBH^2.471
   - Species-specific parameters

3. **Alongi (2014)**
   - "Carbon cycling and storage in mangrove forests"
   - Root-shoot ratios
   - Carbon sequestration rates

4. **Donato et al. (2011)**
   - "Mangroves among the most carbon-rich forests in the tropics"
   - Mangrove carbon density data
   - Global carbon stock estimates

5. **Kauffman & Donato (2012)**
   - "Protocols for the measurement, monitoring and reporting of structure, biomass and carbon stocks in mangrove forests"
   - Field methodology
   - Measurement protocols

---

## Example Use Cases

### Use Case 1: New Restoration Project

**Scenario**: 50 hectares of newly planted mangroves

**Data**:
- 5,000 saplings planted
- Species: Rhizophora mucronata
- Average age: 3 years
- Average DBH: 5 cm
- Average height: 2.5 m

**Expected Result**:
- Total biomass: ~25 tons
- Carbon stock: ~11.5 tons C
- CO₂ sequestration: ~42 tons CO₂e
- Annual sequestration: ~14 tons CO₂e/year

### Use Case 2: Mature Forest Assessment

**Scenario**: Established mangrove forest

**Data**:
- 10 hectares
- Mixed species
- 150 trees/hectare (1,500 total)
- Average DBH: 30 cm
- Average height: 15 m
- Age: 25 years

**Expected Result**:
- Total biomass: ~500 tons
- Carbon stock: ~230 tons C
- CO₂ sequestration: ~844 tons CO₂e
- Per hectare: 84.4 tons CO₂e/ha

### Use Case 3: AI-Assisted Survey

**Scenario**: Large-scale drone survey

**Data**:
- 100 hectares surveyed
- AI detected 12,000 crowns
- Species: 60% Rhizophora, 40% Avicennia
- Field-validated sample: 200 trees
- AI confidence: 0.88

**Process**:
1. AI processes drone imagery
2. Generates tree count and species distribution
3. Combines with field measurements
4. Calculates carbon with confidence score
5. Admin reviews if confidence <0.8

---

## Troubleshooting

### Common Issues

**Issue**: "Invalid tree measurements"
- **Cause**: DBH or height out of valid range
- **Solution**: Check input data, ensure realistic values

**Issue**: "Low confidence score"
- **Cause**: Insufficient data or quality issues
- **Solution**: Collect more field measurements, improve image quality

**Issue**: "Species not found"
- **Cause**: Unsupported species type
- **Solution**: Use "mixed_species" or add species to database

**Issue**: "Unusually high carbon stock"
- **Cause**: Data entry error or exceptional forest
- **Solution**: Validate measurements, review calculation manually

---

## Future Enhancements

1. **Additional Species**
   - Expand species database
   - Regional variations
   - Wetland vegetation types

2. **Soil Carbon**
   - Integrate soil carbon stocks
   - Blue carbon methodology
   - Complete ecosystem carbon

3. **Temporal Analysis**
   - Track carbon change over time
   - Growth modeling
   - Sequestration projections

4. **Machine Learning Integration**
   - Biomass prediction from imagery
   - Automated species detection
   - Health assessment algorithms

5. **Blockchain Integration**
   - Immutable carbon records
   - Credit tokenization
   - Transparent verification

---

## Support

For technical support or questions:
- **Documentation**: `/api-docs`
- **Formulas Reference**: `GET /api/carbon/formulas`
- **Species Database**: `GET /api/carbon/species`

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained by**: Oceara Development Team

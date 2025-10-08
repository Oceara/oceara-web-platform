# Carbon Calculation System - Quick Start Guide

## 🚀 Quick Overview

The Carbon Calculation System is a scientific framework for calculating CO₂ sequestration in mangrove ecosystems. It implements IPCC-compliant formulas and peer-reviewed research.

---

## 📋 Key Formulas

```
1. Crown Area = π × (Crown_Radius)²
2. Basal Area = π × (DBH/2)²
3. AGB = 0.25 × π × D² × H × ρ × BEF
4. AGB (Allometric) = 0.168 × DBH^2.471
5. BGB = AGB × Root-Shoot Ratio
6. Carbon Stock = Biomass × 0.46
7. CO₂ Sequestration = Carbon × 3.67
```

---

## 🌳 Supported Species

1. **Rhizophora mucronata** - Red Mangrove
2. **Rhizophora apiculata** - Tall-stilt Mangrove
3. **Avicennia marina** - Grey Mangrove
4. **Avicennia officinalis** - Indian Mangrove
5. **Bruguiera gymnorrhiza** - Large-leafed Mangrove
6. **Sonneratia alba** - Mangrove Apple
7. **Mixed Species** - Average parameters

---

## 🔧 API Usage Examples

### 1. Calculate Single Tree

```bash
POST /api/carbon/calculate-single
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

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

### 2. Calculate Forest

```bash
POST /api/carbon/calculate-forest
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "trees": [
    {
      "speciesType": "rhizophora_mucronata",
      "dbh": 25.5,
      "height": 12.3
    },
    // ... more trees
  ],
  "areaHectares": 2.5
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "treeCount": 150,
    "totalBiomass": 95.5,
    "carbonStock": 43.9,
    "co2Sequestration": 161.2,
    "confidence": 0.87
  }
}
```

### 3. AI-Assisted Calculation

```bash
POST /api/carbon/calculate-from-ai
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

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
  }
}
```

### 4. Admin Override

```bash
POST /api/carbon/admin-override
Content-Type: application/json
Authorization: Bearer <admin-jwt-token>

{
  "calculationId": "calc_123456",
  "aiResults": { /* ... */ },
  "fieldData": { /* ... */ },
  "overrides": {
    "crownCount": 250,
    "species": "mixed_species",
    "healthScore": 80
  },
  "reason": "Manual verification revealed mixed species"
}
```

---

## 💻 Frontend Usage

### Using the Carbon Calculator Component

```tsx
import CarbonCalculator from '@/components/carbon/CarbonCalculator';

export default function MyPage() {
  return (
    <div>
      <CarbonCalculator />
    </div>
  );
}
```

### Accessing the Calculator Page

Navigate to: `http://localhost:3000/carbon-calculator`

---

## 🎯 Quick Calculations

### Example 1: Small Restoration Plot
- **Area**: 1 hectare
- **Trees**: 50
- **Species**: Rhizophora mucronata
- **Avg DBH**: 15 cm
- **Avg Height**: 8 m

**Expected CO₂**: ~20-25 tons CO₂e

### Example 2: Mature Forest
- **Area**: 10 hectares
- **Trees**: 1,500
- **Species**: Mixed
- **Avg DBH**: 30 cm
- **Avg Height**: 15 m

**Expected CO₂**: ~800-900 tons CO₂e

### Example 3: Large Ecosystem
- **Area**: 100 hectares
- **Trees**: 12,000
- **Species**: Mixed
- **Avg DBH**: 25 cm
- **Avg Height**: 12 m

**Expected CO₂**: ~6,000-7,000 tons CO₂e

---

## 📊 Understanding Results

### Key Metrics

**AGB (Above-Ground Biomass)**:
- Trunk, branches, leaves
- Measured in tons
- ~70-80% of total biomass

**BGB (Below-Ground Biomass)**:
- Roots and underground parts
- Measured in tons
- ~20-30% of total biomass

**Carbon Stock**:
- Total carbon content
- Biomass × 0.46
- Measured in tons C

**CO₂ Sequestration**:
- CO₂ equivalent
- Carbon × 3.67
- Measured in tons CO₂e
- **This is the carbon credit value!**

**Annual Sequestration**:
- Yearly CO₂ capture rate
- Based on tree age and growth
- Measured in tons CO₂e/year

### Confidence Scores

- **0.9-1.0**: Very High - Publication quality
- **0.8-0.89**: High - Reliable for credits
- **0.7-0.79**: Moderate - Acceptable
- **0.6-0.69**: Low - Needs validation
- **<0.6**: Very Low - Not recommended

---

## 🔍 Data Requirements

### Minimum Required
- Species type
- DBH (Diameter at Breast Height) in cm
- Height in meters
- Area in hectares (for forest calculations)

### Optional (Improves Accuracy)
- Crown radius (meters)
- Tree age (years)
- Health score (0-100)
- Environmental data (salinity, temperature, etc.)

### Measurement Tips

**DBH (Diameter at Breast Height)**:
- Measure at 1.3 meters above ground
- Use diameter tape for accuracy
- Record in centimeters
- Typical range: 5-80 cm for mangroves

**Height**:
- Measure from ground to top of crown
- Use clinometer or laser rangefinder
- Record in meters
- Typical range: 2-30 m for mangroves

**Crown Radius**:
- Measure from trunk center to edge of canopy
- Average of 4 directions (N, S, E, W)
- Record in meters
- Typical range: 1-5 m

---

## 🚨 Common Errors & Solutions

### Error: "Invalid tree measurements"
**Cause**: DBH or height out of range  
**Solution**: Check values (DBH: 5-200cm, Height: 1-40m)

### Error: "Species not found"
**Cause**: Unknown species type  
**Solution**: Use "mixed_species" or check species list

### Warning: "Low confidence score"
**Cause**: Insufficient data or quality issues  
**Solution**: Add more measurements, include optional fields

### Warning: "Unusually high carbon stock"
**Cause**: Exceptional forest or data error  
**Solution**: Validate measurements, review calculations

---

## 📚 Integration with Other Systems

### Land Owner Dashboard
```typescript
// 1. Upload drone images
// 2. AI processes images
// 3. Automatic carbon calculation
const carbonResult = await calculateFromAI(aiResults, fieldData);

// 4. Display results
console.log(`CO₂: ${carbonResult.co2Sequestration} tons`);
```

### Admin Dashboard
```typescript
// 1. Review AI results
// 2. Apply manual override if needed
const overrideResult = await adminOverride({
  calculationId,
  overrides: { crownCount: 250 },
  reason: "Manual verification"
});

// 3. Approve for credit minting
await mintCredits(overrideResult.co2Sequestration);
```

### Blockchain Integration
```typescript
// 1. Carbon calculation approved
// 2. Trigger credit minting
const creditAmount = carbonResult.co2Sequestration;

await blockchainService.mintCarbonCredit({
  projectId,
  amount: creditAmount,
  metadata: carbonResult
});
```

---

## 🎓 Scientific Validation

### IPCC Compliance
- ✅ Carbon fraction: 0.46 (IPCC 2006)
- ✅ Methodology framework
- ✅ Greenhouse gas inventory standards

### Peer-Reviewed Research
- ✅ Komiyama et al. (2005) - Allometric equations
- ✅ Alongi (2014) - Carbon cycling
- ✅ Donato et al. (2011) - Carbon-rich forests
- ✅ Kauffman & Donato (2012) - Measurement protocols

---

## 🔗 Quick Links

- **API Documentation**: `http://localhost:5000/api-docs`
- **Frontend Calculator**: `http://localhost:3000/carbon-calculator`
- **Formula Reference**: `GET /api/carbon/formulas`
- **Species List**: `GET /api/carbon/species`

---

## 📞 Support

For questions or issues:
1. Check API documentation: `/api-docs`
2. Review formula reference: `GET /api/carbon/formulas`
3. Validate your measurements: `POST /api/carbon/validate`
4. Generate detailed report: `POST /api/carbon/report`

---

**Quick Start Guide v1.0**  
**Last Updated**: January 2025  
**Oceara Development Team**

🌳 **Accurate. Scientific. IPCC-Compliant.** 🌳

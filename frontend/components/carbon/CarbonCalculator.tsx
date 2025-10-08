'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TreeMeasurement {
  speciesType: string;
  dbh: number;
  height: number;
  crownRadius?: number;
  age?: number;
  healthScore?: number;
}

interface CarbonResult {
  treeCount: number;
  totalAGB: number;
  totalBGB: number;
  totalBiomass: number;
  carbonStock: number;
  co2Sequestration: number;
  annualSequestration: number;
  confidence: number;
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

const SPECIES_OPTIONS = [
  { value: 'rhizophora_mucronata', label: 'Rhizophora mucronata (Red Mangrove)' },
  { value: 'rhizophora_apiculata', label: 'Rhizophora apiculata (Tall-stilt Mangrove)' },
  { value: 'avicennia_marina', label: 'Avicennia marina (Grey Mangrove)' },
  { value: 'avicennia_officinalis', label: 'Avicennia officinalis (Indian Mangrove)' },
  { value: 'bruguiera_gymnorrhiza', label: 'Bruguiera gymnorrhiza (Large-leafed Mangrove)' },
  { value: 'sonneratia_alba', label: 'Sonneratia alba (Mangrove Apple)' },
  { value: 'mixed_species', label: 'Mixed Species' },
];

export default function CarbonCalculator() {
  const [calculatorMode, setCalculatorMode] = useState<'single' | 'forest' | 'ai'>('single');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CarbonResult | null>(null);

  // Single tree form
  const [singleTree, setSingleTree] = useState<TreeMeasurement>({
    speciesType: 'rhizophora_mucronata',
    dbh: 25,
    height: 12,
    crownRadius: 3,
    age: 10,
    healthScore: 85,
  });

  // Forest form
  const [forestData, setForestData] = useState({
    areaHectares: 1,
    avgDBH: 25,
    avgHeight: 12,
    treeCount: 100,
    species: 'rhizophora_mucronata',
  });

  const calculateSingleTree = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/carbon/calculate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleTree),
      });

      const data = await response.json();
      if (data.success) {
        // Convert single tree result to display format
        const singleResult = {
          treeCount: 1,
          totalAGB: data.data.agb,
          totalBGB: data.data.bgb,
          totalBiomass: data.data.totalBiomass,
          carbonStock: data.data.carbonStock,
          co2Sequestration: data.data.co2,
          annualSequestration: data.data.annualCO2,
          confidence: 0.95,
          methodology: 'Allometric equations (Komiyama et al., 2005)',
          calculations: {
            perTree: {
              avgAGB: data.data.agb,
              avgBGB: data.data.bgb,
              avgCarbonStock: data.data.carbonStock,
              avgCO2: data.data.co2,
            },
            perHectare: {
              biomass: 0,
              carbonStock: 0,
              co2Sequestration: 0,
            },
          },
          speciesBreakdown: [],
        };
        setResult(singleResult);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate carbon');
    } finally {
      setLoading(false);
    }
  };

  const calculateForest = async () => {
    setLoading(true);
    try {
      // Generate synthetic tree data
      const trees: TreeMeasurement[] = [];
      for (let i = 0; i < forestData.treeCount; i++) {
        const variation = (Math.random() - 0.5) * 0.3;
        trees.push({
          speciesType: forestData.species,
          dbh: forestData.avgDBH * (1 + variation),
          height: forestData.avgHeight * (1 + variation),
          healthScore: 80 + Math.random() * 15,
        });
      }

      const response = await fetch('/api/carbon/calculate-forest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trees,
          areaHectares: forestData.areaHectares,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate carbon');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    if (!result) return;

    try {
      const response = await fetch('/api/carbon/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result,
          projectName: 'Carbon Calculation Report',
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Create downloadable text file
        const blob = new Blob([data.data.report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carbon-report-${Date.now()}.txt`;
        a.click();
      }
    } catch (error) {
      console.error('Report generation error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Carbon Calculation System
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Scientific carbon sequestration calculations based on IPCC guidelines and peer-reviewed research
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-4 mb-8 justify-center">
        <button
          onClick={() => setCalculatorMode('single')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            calculatorMode === 'single'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Single Tree
        </button>
        <button
          onClick={() => setCalculatorMode('forest')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            calculatorMode === 'forest'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Forest/Ecosystem
        </button>
        <button
          onClick={() => setCalculatorMode('ai')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            calculatorMode === 'ai'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          AI Integration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {calculatorMode === 'single' && 'Single Tree Calculation'}
            {calculatorMode === 'forest' && 'Forest Calculation'}
            {calculatorMode === 'ai' && 'AI-Assisted Calculation'}
          </h2>

          {/* Single Tree Form */}
          {calculatorMode === 'single' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species Type
                </label>
                <select
                  value={singleTree.speciesType}
                  onChange={(e) =>
                    setSingleTree({ ...singleTree, speciesType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {SPECIES_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DBH (Diameter at Breast Height) - cm
                </label>
                <input
                  type="number"
                  value={singleTree.dbh}
                  onChange={(e) =>
                    setSingleTree({ ...singleTree, dbh: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height - meters
                </label>
                <input
                  type="number"
                  value={singleTree.height}
                  onChange={(e) =>
                    setSingleTree({ ...singleTree, height: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crown Radius - meters (optional)
                </label>
                <input
                  type="number"
                  value={singleTree.crownRadius || ''}
                  onChange={(e) =>
                    setSingleTree({
                      ...singleTree,
                      crownRadius: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age - years (optional)
                </label>
                <input
                  type="number"
                  value={singleTree.age || ''}
                  onChange={(e) =>
                    setSingleTree({
                      ...singleTree,
                      age: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Score - 0-100 (optional)
                </label>
                <input
                  type="number"
                  value={singleTree.healthScore || ''}
                  onChange={(e) =>
                    setSingleTree({
                      ...singleTree,
                      healthScore: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>

              <button
                onClick={calculateSingleTree}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Calculating...' : 'Calculate Carbon'}
              </button>
            </div>
          )}

          {/* Forest Form */}
          {calculatorMode === 'forest' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dominant Species
                </label>
                <select
                  value={forestData.species}
                  onChange={(e) =>
                    setForestData({ ...forestData, species: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {SPECIES_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area - hectares
                </label>
                <input
                  type="number"
                  value={forestData.areaHectares}
                  onChange={(e) =>
                    setForestData({ ...forestData, areaHectares: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tree Count
                </label>
                <input
                  type="number"
                  value={forestData.treeCount}
                  onChange={(e) =>
                    setForestData({ ...forestData, treeCount: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average DBH - cm
                </label>
                <input
                  type="number"
                  value={forestData.avgDBH}
                  onChange={(e) =>
                    setForestData({ ...forestData, avgDBH: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Height - meters
                </label>
                <input
                  type="number"
                  value={forestData.avgHeight}
                  onChange={(e) =>
                    setForestData({ ...forestData, avgHeight: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                />
              </div>

              <button
                onClick={calculateForest}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Calculating...' : 'Calculate Carbon'}
              </button>
            </div>
          )}

          {/* AI Integration Form */}
          {calculatorMode === 'ai' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>AI Integration:</strong> This mode combines AI/ML results from drone imagery analysis with field measurements for automated carbon calculation.
                </p>
              </div>
              <p className="text-gray-600">
                AI integration is available through the Land Owner dashboard's data upload process.
              </p>
            </div>
          )}

          {/* Formula Reference */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Key Formulas:</h3>
            <div className="text-xs space-y-2 text-gray-600">
              <p>• AGB = 0.168 × DBH²·⁴⁷¹</p>
              <p>• BGB = AGB × Root-Shoot Ratio</p>
              <p>• Carbon Stock = Biomass × 0.46</p>
              <p>• CO₂ = Carbon × 3.67</p>
            </div>
          </div>
        </motion.div>

        {/* Results Display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Results</h2>

          {result ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">CO₂ Sequestration</p>
                  <p className="text-2xl font-bold text-green-700">
                    {result.co2Sequestration.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">tons CO₂e</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Carbon Stock</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {result.carbonStock.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">tons C</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Biomass</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {result.totalBiomass.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">tons</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Annual Sequestration</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {result.annualSequestration.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">tons CO₂e/year</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Detailed Breakdown:</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Above-Ground Biomass (AGB):</span>
                    <span className="font-semibold">{result.totalAGB.toFixed(3)} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Below-Ground Biomass (BGB):</span>
                    <span className="font-semibold">{result.totalBGB.toFixed(3)} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tree Count:</span>
                    <span className="font-semibold">{result.treeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence Score:</span>
                    <span className="font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Per Tree Averages */}
              {result.treeCount > 1 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Per Tree Averages:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average CO₂:</span>
                      <span className="font-semibold">
                        {result.calculations.perTree.avgCO2.toFixed(3)} tons
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Carbon:</span>
                      <span className="font-semibold">
                        {result.calculations.perTree.avgCarbonStock.toFixed(3)} tons
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Per Hectare */}
              {result.calculations.perHectare.biomass > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Per Hectare:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biomass:</span>
                      <span className="font-semibold">
                        {result.calculations.perHectare.biomass.toFixed(2)} tons/ha
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CO₂:</span>
                      <span className="font-semibold">
                        {result.calculations.perHectare.co2Sequestration.toFixed(2)} tons CO₂e/ha
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Methodology */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Methodology:</strong> {result.methodology}
                </p>
              </div>

              {/* Download Report */}
              <button
                onClick={downloadReport}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
              >
                Download Full Report
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-24 w-24 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-gray-500">
                Enter tree measurements and click "Calculate Carbon" to see results
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <h3 className="font-bold text-green-900 mb-2">🌿 IPCC Compliant</h3>
          <p className="text-sm text-green-800">
            Calculations follow IPCC 2006 guidelines for greenhouse gas inventories
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">🔬 Peer-Reviewed</h3>
          <p className="text-sm text-blue-800">
            Based on Komiyama et al. (2005) allometric equations for mangroves
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <h3 className="font-bold text-purple-900 mb-2">📊 Species-Specific</h3>
          <p className="text-sm text-purple-800">
            Accurate parameters for 6+ mangrove species with mixed-species support
          </p>
        </div>
      </div>
    </div>
  );
}

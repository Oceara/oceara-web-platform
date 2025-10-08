'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import CarbonCalculator from '@/components/carbon/CarbonCalculator';

export default function CarbonCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="pt-20">
        <CarbonCalculator />
      </main>
    </div>
  );
}

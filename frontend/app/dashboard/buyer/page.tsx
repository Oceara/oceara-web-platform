'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const BuyerDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [marketplace, setMarketplace] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Fetch marketplace and purchase data
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        // const marketplaceResponse = await fetch('/api/marketplace/credits');
        // const purchasesResponse = await fetch('/api/carbon-credits/my-purchases');
        
        // Mock data for now
        setMarketplace([
          {
            id: 1,
            ecosystemName: 'Sundarbans Mangroves',
            ecosystemType: 'mangrove',
            location: 'West Bengal, India',
            amount: 1000,
            price: 50,
            verification: 'VCS Certified',
            seller: 'Sundarbans Trust',
            image: '/api/placeholder/300/200',
          },
          {
            id: 2,
            ecosystemName: 'Kerala Wetlands',
            ecosystemType: 'wetland',
            location: 'Kerala, India',
            amount: 500,
            price: 45,
            verification: 'Gold Standard',
            seller: 'Kerala Forest Dept',
            image: '/api/placeholder/300/200',
          },
          {
            id: 3,
            ecosystemName: 'Andaman Seagrass',
            ecosystemType: 'seagrass',
            location: 'Andaman Islands, India',
            amount: 750,
            price: 55,
            verification: 'CDM Approved',
            seller: 'Andaman Marine Trust',
            image: '/api/placeholder/300/200',
          },
        ]);

        setPurchases([
          {
            id: 1,
            ecosystemName: 'Mangrove Forest - Goa',
            amount: 200,
            price: 50,
            purchaseDate: '2024-01-15',
            status: 'retired',
            impact: '2.2 tons CO2 offset',
          },
          {
            id: 2,
            ecosystemName: 'Coastal Wetland - Tamil Nadu',
            amount: 100,
            price: 45,
            purchaseDate: '2024-01-10',
            status: 'active',
            impact: '1.1 tons CO2 offset',
          },
        ]);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: 'Credits Purchased',
      value: purchases.length,
      icon: '💚',
      color: 'text-green-400',
    },
    {
      title: 'Total Impact',
      value: `${purchases.reduce((sum, purchase) => sum + purchase.amount, 0)} tons CO2`,
      icon: '🌱',
      color: 'text-emerald-400',
    },
    {
      title: 'Total Spent',
      value: `$${purchases.reduce((sum, purchase) => sum + (purchase.amount * purchase.price), 0).toLocaleString()}`,
      icon: '💰',
      color: 'text-yellow-400',
    },
    {
      title: 'Credits Retired',
      value: purchases.filter(p => p.status === 'retired').length,
      icon: '♻️',
      color: 'text-blue-400',
    },
  ];

  const filteredMarketplace = selectedFilter === 'all' 
    ? marketplace 
    : marketplace.filter(credit => credit.ecosystemType === selectedFilter);

  return (
    <ProtectedRoute requiredRole={ROLES.BUYER}>
      <div className="min-h-screen bg-carbon-900">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-cyan-800 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Carbon Credit Marketplace
                </h1>
                <p className="text-xl text-blue-100 mb-8">
                  Purchase verified carbon credits and make a real impact on climate change
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Browse Credits
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
                  >
                    View My Impact
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-12 bg-carbon-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6 text-center"
                  >
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-carbon-300 text-sm">{stat.title}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Marketplace Section */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Available Credits</h2>
                    <p className="text-carbon-300">
                      Purchase verified carbon credits from blue carbon ecosystems
                    </p>
                  </div>
                  
                  {/* Filter Buttons */}
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    {['all', 'mangrove', 'wetland', 'seagrass'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedFilter === filter
                            ? 'bg-ocean-500 text-white'
                            : 'bg-carbon-700 text-carbon-300 hover:bg-carbon-600'
                        }`}
                      >
                        {filter === 'all' ? 'All Types' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMarketplace.map((credit, index) => (
                    <motion.div
                      key={credit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                      className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl overflow-hidden hover:border-ocean-500/50 transition-all duration-200"
                    >
                      {/* Image */}
                      <div className="h-48 bg-gradient-to-br from-ocean-500 to-cyan-600 flex items-center justify-center">
                        <div className="text-6xl">
                          {credit.ecosystemType === 'mangrove' && '🌊'}
                          {credit.ecosystemType === 'wetland' && '🦅'}
                          {credit.ecosystemType === 'seagrass' && '🌱'}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-white">
                            {credit.ecosystemName}
                          </h3>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            {credit.verification}
                          </span>
                        </div>
                        
                        <p className="text-carbon-300 text-sm mb-4">{credit.location}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-carbon-400 text-xs">Amount</div>
                            <div className="text-white font-semibold">{credit.amount} tons</div>
                          </div>
                          <div>
                            <div className="text-carbon-400 text-xs">Price</div>
                            <div className="text-white font-semibold">${credit.price}/ton</div>
                          </div>
                        </div>
                        
                        <div className="text-carbon-400 text-xs mb-4">
                          Seller: {credit.seller}
                        </div>
                        
                        <div className="flex space-x-3">
                          <button className="flex-1 bg-ocean-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-ocean-600 transition-colors">
                            Buy Now
                          </button>
                          <button className="flex-1 border border-carbon-600 text-carbon-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-carbon-700 transition-colors">
                            Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* My Purchases Section */}
          <section className="py-12 bg-carbon-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-bold text-white mb-4">My Purchases</h2>
                <p className="text-carbon-300">
                  Track your carbon credit purchases and their impact
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="space-y-4"
              >
                {purchases.map((purchase, index) => (
                  <div
                    key={purchase.id}
                    className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {purchase.ecosystemName}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-carbon-400">Amount</div>
                            <div className="text-white font-semibold">{purchase.amount} tons</div>
                          </div>
                          <div>
                            <div className="text-carbon-400">Price</div>
                            <div className="text-white font-semibold">${purchase.price}/ton</div>
                          </div>
                          <div>
                            <div className="text-carbon-400">Date</div>
                            <div className="text-white font-semibold">{purchase.purchaseDate}</div>
                          </div>
                          <div>
                            <div className="text-carbon-400">Impact</div>
                            <div className="text-white font-semibold">{purchase.impact}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          purchase.status === 'retired' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {purchase.status}
                        </span>
                        <button className="text-ocean-400 hover:text-ocean-300 text-sm font-medium">
                          View Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default BuyerDashboard;

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapPinIcon,
  CalendarIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface CarbonCredit {
  id: number;
  tokenId: string;
  projectId: number;
  projectName: string;
  location: string;
  country: string;
  region: string;
  carbonAmount: number;
  pricePerTon: number;
  totalPrice: number;
  vintageYear: number;
  projectType: 'mangrove' | 'wetland' | 'seagrass' | 'saltmarsh';
  methodology: string;
  verificationStatus: 'verified' | 'pending' | 'in_progress';
  verifiedBy: string;
  seller: string;
  sellerReputation: number;
  issuanceDate: string;
  expiryDate: string;
  communityImpact: {
    jobsCreated: number;
    communitiesSupported: number;
    biodiversityScore: number;
  };
  imageUrl: string;
  satelliteImageUrl: string;
  trending: boolean;
  featured: boolean;
  sdgAlignment: string[];
  cobenefits: string[];
}

const Marketplace: React.FC = () => {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [filteredCredits, setFilteredCredits] = useState<CarbonCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    location: 'all',
    priceMin: '',
    priceMax: '',
    projectType: 'all',
    verificationStatus: 'all',
    vintageYear: 'all',
    sortBy: 'price_asc'
  });

  // Mock data - in production, fetch from API
  useEffect(() => {
    const mockCredits: CarbonCredit[] = [
      {
        id: 1,
        tokenId: '0x1234...5678',
        projectId: 101,
        projectName: 'Sundarbans Mangrove Restoration',
        location: 'Sundarbans, West Bengal',
        country: 'India',
        region: 'South Asia',
        carbonAmount: 100,
        pricePerTon: 25,
        totalPrice: 2500,
        vintageYear: 2023,
        projectType: 'mangrove',
        methodology: 'VCS VM0007',
        verificationStatus: 'verified',
        verifiedBy: 'Verra',
        seller: '0xabcd...efgh',
        sellerReputation: 4.8,
        issuanceDate: '2024-01-15',
        expiryDate: '2034-01-15',
        communityImpact: {
          jobsCreated: 150,
          communitiesSupported: 12,
          biodiversityScore: 92
        },
        imageUrl: '/images/sundarbans.jpg',
        satelliteImageUrl: '/images/sundarbans_satellite.jpg',
        trending: true,
        featured: true,
        sdgAlignment: ['SDG 13', 'SDG 14', 'SDG 15'],
        cobenefits: ['Biodiversity', 'Coastal Protection', 'Livelihoods']
      },
      {
        id: 2,
        tokenId: '0x2345...6789',
        projectId: 102,
        projectName: 'Kerala Wetland Protection',
        location: 'Vembanad Lake, Kerala',
        country: 'India',
        region: 'South Asia',
        carbonAmount: 75,
        pricePerTon: 22,
        totalPrice: 1650,
        vintageYear: 2023,
        projectType: 'wetland',
        methodology: 'VCS VM0009',
        verificationStatus: 'verified',
        verifiedBy: 'Gold Standard',
        seller: '0x1234...abcd',
        sellerReputation: 4.6,
        issuanceDate: '2024-01-10',
        expiryDate: '2034-01-10',
        communityImpact: {
          jobsCreated: 80,
          communitiesSupported: 8,
          biodiversityScore: 88
        },
        imageUrl: '/images/kerala.jpg',
        satelliteImageUrl: '/images/kerala_satellite.jpg',
        trending: false,
        featured: true,
        sdgAlignment: ['SDG 6', 'SDG 13', 'SDG 15'],
        cobenefits: ['Water Quality', 'Fisheries', 'Tourism']
      },
      {
        id: 3,
        tokenId: '0x3456...7890',
        projectId: 103,
        projectName: 'Andaman Seagrass Conservation',
        location: 'Andaman Islands',
        country: 'India',
        region: 'South Asia',
        carbonAmount: 50,
        pricePerTon: 30,
        totalPrice: 1500,
        vintageYear: 2024,
        projectType: 'seagrass',
        methodology: 'VCS VM0033',
        verificationStatus: 'verified',
        verifiedBy: 'Verra',
        seller: '0x5678...ijkl',
        sellerReputation: 4.9,
        issuanceDate: '2024-01-20',
        expiryDate: '2034-01-20',
        communityImpact: {
          jobsCreated: 60,
          communitiesSupported: 5,
          biodiversityScore: 95
        },
        imageUrl: '/images/andaman.jpg',
        satelliteImageUrl: '/images/andaman_satellite.jpg',
        trending: true,
        featured: false,
        sdgAlignment: ['SDG 14', 'SDG 13'],
        cobenefits: ['Marine Biodiversity', 'Fisheries', 'Carbon Storage']
      }
    ];

    setCredits(mockCredits);
    setFilteredCredits(mockCredits);
    setIsLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...credits];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(credit =>
        credit.projectName.toLowerCase().includes(filters.search.toLowerCase()) ||
        credit.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(credit => credit.country === filters.location);
    }

    // Price range filter
    if (filters.priceMin) {
      filtered = filtered.filter(credit => credit.pricePerTon >= Number(filters.priceMin));
    }
    if (filters.priceMax) {
      filtered = filtered.filter(credit => credit.pricePerTon <= Number(filters.priceMax));
    }

    // Project type filter
    if (filters.projectType !== 'all') {
      filtered = filtered.filter(credit => credit.projectType === filters.projectType);
    }

    // Verification status filter
    if (filters.verificationStatus !== 'all') {
      filtered = filtered.filter(credit => credit.verificationStatus === filters.verificationStatus);
    }

    // Vintage year filter
    if (filters.vintageYear !== 'all') {
      filtered = filtered.filter(credit => credit.vintageYear === Number(filters.vintageYear));
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.pricePerTon - b.pricePerTon);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.pricePerTon - a.pricePerTon);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.issuanceDate).getTime() - new Date(a.issuanceDate).getTime());
        break;
      case 'carbon_amount':
        filtered.sort((a, b) => b.carbonAmount - a.carbonAmount);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
        break;
    }

    setFilteredCredits(filtered);
  }, [filters, credits]);

  const toggleFavorite = (creditId: number) => {
    setFavorites(prev =>
      prev.includes(creditId)
        ? prev.filter(id => id !== creditId)
        : [...prev, creditId]
    );
  };

  const addToCart = (creditId: number) => {
    if (!cart.includes(creditId)) {
      setCart([...cart, creditId]);
    }
  };

  const openCreditDetails = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setShowDetailsModal(true);
  };

  const handlePurchase = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setShowWalletModal(true);
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'mangrove': return 'bg-green-500/20 text-green-400';
      case 'wetland': return 'bg-blue-500/20 text-blue-400';
      case 'seagrass': return 'bg-cyan-500/20 text-cyan-400';
      case 'saltmarsh': return 'bg-teal-500/20 text-teal-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-carbon-900">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-ocean-600 to-ocean-800 py-16">
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
              <p className="text-xl text-ocean-100 mb-8">
                Trade verified blue carbon credits and support ocean conservation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                  <div className="text-2xl font-bold">{credits.length}</div>
                  <div className="text-sm text-ocean-100">Available Credits</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                  <div className="text-2xl font-bold">
                    {credits.reduce((sum, c) => sum + c.carbonAmount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-ocean-100">Tons CO2e</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                  <div className="text-2xl font-bold">
                    ${Math.round(credits.reduce((sum, c) => sum + c.totalPrice, 0) / credits.length)}
                  </div>
                  <div className="text-sm text-ocean-100">Avg Price/Ton</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 bg-carbon-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-carbon-400" />
                    <input
                      type="text"
                      placeholder="Search by project name or location..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-carbon-700 border border-carbon-600 rounded-lg text-white placeholder-carbon-400 focus:border-ocean-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-ocean-500 text-white'
                        : 'bg-carbon-700 text-carbon-300 hover:bg-carbon-600'
                    }`}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-ocean-500 text-white'
                        : 'bg-carbon-700 text-carbon-300 hover:bg-carbon-600'
                    }`}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="px-4 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white focus:border-ocean-500 focus:outline-none"
                >
                  <option value="all">All Locations</option>
                  <option value="India">India</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Brazil">Brazil</option>
                </select>

                <select
                  value={filters.projectType}
                  onChange={(e) => setFilters({ ...filters, projectType: e.target.value })}
                  className="px-4 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white focus:border-ocean-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="mangrove">Mangrove</option>
                  <option value="wetland">Wetland</option>
                  <option value="seagrass">Seagrass</option>
                  <option value="saltmarsh">Salt Marsh</option>
                </select>

                <select
                  value={filters.verificationStatus}
                  onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
                  className="px-4 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white focus:border-ocean-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="px-4 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white focus:border-ocean-500 focus:outline-none"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="carbon_amount">Carbon Amount</option>
                  <option value="trending">Trending</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="flex gap-4 mt-4">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  className="flex-1 px-4 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white placeholder-carbon-400 focus:border-ocean-500 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  className="flex-1 px-4 py-2 bg-carbon-700 border border-carbon-600 rounded-lg text-white placeholder-carbon-400 focus:border-ocean-500 focus:outline-none"
                />
              </div>

              {/* Active Filters Count */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-carbon-300">
                  Showing <span className="text-white font-semibold">{filteredCredits.length}</span> of{' '}
                  <span className="text-white font-semibold">{credits.length}</span> credits
                </div>
                {cart.length > 0 && (
                  <div className="flex items-center space-x-2 bg-ocean-500/20 text-ocean-400 px-4 py-2 rounded-lg">
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span>{cart.length} in cart</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Credits Grid/List */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center text-white">Loading credits...</div>
            ) : filteredCredits.length === 0 ? (
              <div className="text-center text-carbon-300 py-12">
                <p className="text-xl mb-4">No credits found matching your filters</p>
                <button
                  onClick={() => setFilters({
                    search: '',
                    location: 'all',
                    priceMin: '',
                    priceMax: '',
                    projectType: 'all',
                    verificationStatus: 'all',
                    vintageYear: 'all',
                    sortBy: 'price_asc'
                  })}
                  className="bg-ocean-500 text-white px-6 py-2 rounded-lg hover:bg-ocean-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredCredits.map((credit, index) => (
                  <motion.div
                    key={credit.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl overflow-hidden hover:border-ocean-500 transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-carbon-700 overflow-hidden">
                      {credit.featured && (
                        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <SparklesIcon className="w-3 h-3" />
                          <span>Featured</span>
                        </div>
                      )}
                      {credit.trending && (
                        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <ArrowTrendingUpIcon className="w-3 h-3" />
                          <span>Trending</span>
                        </div>
                      )}
                      <div className="w-full h-full bg-gradient-to-br from-ocean-600 to-ocean-800 flex items-center justify-center">
                        <PhotoIcon className="w-16 h-16 text-ocean-300" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={() => toggleFavorite(credit.id)}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          {favorites.includes(credit.id) ? (
                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5 text-carbon-700" />
                          )}
                        </button>
                        <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <ShareIcon className="w-5 h-5 text-carbon-700" />
                        </button>
                        <button
                          onClick={() => openCreditDetails(credit)}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <EyeIcon className="w-5 h-5 text-carbon-700" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Project Type Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectTypeColor(credit.projectType)}`}>
                          {credit.projectType.charAt(0).toUpperCase() + credit.projectType.slice(1)}
                        </span>
                        {credit.verificationStatus === 'verified' && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckBadgeIcon className="w-4 h-4" />
                            <span className="text-xs">Verified</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {credit.projectName}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-carbon-300 text-sm mb-4">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {credit.location}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-carbon-700">
                        <div>
                          <div className="text-carbon-400 text-xs">Carbon Amount</div>
                          <div className="text-white font-semibold">{credit.carbonAmount} tons</div>
                        </div>
                        <div>
                          <div className="text-carbon-400 text-xs">Vintage Year</div>
                          <div className="text-white font-semibold">{credit.vintageYear}</div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-ocean-400 text-2xl font-bold">
                              ${credit.pricePerTon}
                            </span>
                            <span className="text-carbon-400 text-sm ml-1">/ton</span>
                          </div>
                          <div className="text-carbon-300 text-sm">
                            Total: ${credit.totalPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Community Impact */}
                      <div className="flex items-center justify-between text-xs text-carbon-400 mb-4">
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{credit.communityImpact.communitiesSupported} communities</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChartBarIcon className="w-4 h-4" />
                          <span>{credit.communityImpact.biodiversityScore}% biodiversity</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePurchase(credit)}
                          className="flex-1 bg-ocean-500 text-white py-2 px-4 rounded-lg hover:bg-ocean-600 transition-colors font-semibold"
                        >
                          Purchase
                        </button>
                        <button
                          onClick={() => addToCart(credit.id)}
                          className="p-2 border border-carbon-600 text-carbon-300 rounded-lg hover:bg-carbon-700 hover:text-white transition-colors"
                          disabled={cart.includes(credit.id)}
                        >
                          <ShoppingCartIcon className={`w-5 h-5 ${cart.includes(credit.id) ? 'text-ocean-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredCredits.map((credit, index) => (
                  <motion.div
                    key={credit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-6 hover:border-ocean-500 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      <div className="w-full md:w-48 h-48 bg-gradient-to-br from-ocean-600 to-ocean-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <PhotoIcon className="w-16 h-16 text-ocean-300" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectTypeColor(credit.projectType)}`}>
                                {credit.projectType.charAt(0).toUpperCase() + credit.projectType.slice(1)}
                              </span>
                              {credit.verificationStatus === 'verified' && (
                                <div className="flex items-center space-x-1 text-green-400">
                                  <CheckBadgeIcon className="w-4 h-4" />
                                  <span className="text-xs">Verified by {credit.verifiedBy}</span>
                                </div>
                              )}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{credit.projectName}</h3>
                            <div className="flex items-center text-carbon-300 text-sm">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {credit.location}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-ocean-400 text-3xl font-bold">${credit.pricePerTon}</div>
                            <div className="text-carbon-400 text-sm">/ton CO2e</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-carbon-400 text-xs">Carbon Amount</div>
                            <div className="text-white font-semibold">{credit.carbonAmount} tons</div>
                          </div>
                          <div>
                            <div className="text-carbon-400 text-xs">Vintage Year</div>
                            <div className="text-white font-semibold">{credit.vintageYear}</div>
                          </div>
                          <div>
                            <div className="text-carbon-400 text-xs">Jobs Created</div>
                            <div className="text-white font-semibold">{credit.communityImpact.jobsCreated}</div>
                          </div>
                          <div>
                            <div className="text-carbon-400 text-xs">Biodiversity</div>
                            <div className="text-white font-semibold">{credit.communityImpact.biodiversityScore}%</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {credit.cobenefits.slice(0, 3).map((benefit, idx) => (
                            <span key={idx} className="px-2 py-1 bg-carbon-700 text-carbon-300 rounded text-xs">
                              {benefit}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePurchase(credit)}
                            className="bg-ocean-500 text-white py-2 px-6 rounded-lg hover:bg-ocean-600 transition-colors font-semibold"
                          >
                            Purchase ${credit.totalPrice.toLocaleString()}
                          </button>
                          <button
                            onClick={() => openCreditDetails(credit)}
                            className="border border-carbon-600 text-carbon-300 py-2 px-6 rounded-lg hover:bg-carbon-700 hover:text-white transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => addToCart(credit.id)}
                            className="p-2 border border-carbon-600 text-carbon-300 rounded-lg hover:bg-carbon-700 hover:text-white transition-colors"
                            disabled={cart.includes(credit.id)}
                          >
                            <ShoppingCartIcon className={`w-5 h-5 ${cart.includes(credit.id) ? 'text-ocean-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => toggleFavorite(credit.id)}
                            className="p-2 border border-carbon-600 text-carbon-300 rounded-lg hover:bg-carbon-700 transition-colors"
                          >
                            {favorites.includes(credit.id) ? (
                              <HeartSolidIcon className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;


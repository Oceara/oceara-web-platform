'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/explore', label: 'Explore' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/contact', label: 'Contact' },
  ];

  const dashboardItems = [
    { href: '/dashboard/landowner', label: 'Land Owner', icon: '🏞️' },
    { href: '/dashboard/buyer', label: 'Buyer', icon: '💰' },
    { href: '/dashboard/admin', label: 'Admin', icon: '⚖️' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-carbon-900/95 backdrop-blur-lg border-b border-ocean-500/30 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-ocean-400/25 transition-all duration-300">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white group-hover:text-ocean-300 transition-colors duration-300">Oceara</span>
              <span className="text-xs text-carbon-400 -mt-1">Blue Carbon Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-carbon-300 hover:text-white hover:bg-carbon-800/50 rounded-lg transition-all duration-200 font-medium relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-ocean-400 transition-all duration-200 group-hover:w-full group-hover:left-0"></span>
              </Link>
            ))}
            
            {/* Dashboard Dropdown */}
            <div className="relative group">
              <button className="px-4 py-2 text-carbon-300 hover:text-white hover:bg-carbon-800/50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-1">
                <span>Dashboards</span>
                <ChevronDownIcon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-carbon-800/95 backdrop-blur-lg rounded-xl shadow-2xl border border-carbon-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-3">
                  <div className="px-4 py-2 text-xs font-semibold text-carbon-400 uppercase tracking-wider">
                    Access Your Dashboard
                  </div>
                  {dashboardItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-3 text-carbon-300 hover:text-white hover:bg-carbon-700/50 transition-all duration-200 group/item"
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-carbon-500 group-hover/item:text-carbon-400">
                          {item.label === 'Land Owner' && 'Manage ecosystems'}
                          {item.label === 'Buyer' && 'Purchase credits'}
                          {item.label === 'Admin' && 'Platform management'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              href="/signin"
              className="px-4 py-2 text-carbon-300 hover:text-white hover:bg-carbon-800/50 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-carbon-700"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white rounded-lg font-semibold hover:from-ocean-600 hover:to-ocean-700 transition-all duration-200 shadow-lg hover:shadow-ocean-500/25 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 rounded-xl text-carbon-300 hover:text-white hover:bg-carbon-800/50 transition-all duration-200 border border-carbon-700/50 hover:border-carbon-600"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-carbon-700/50 bg-carbon-900/95 backdrop-blur-lg"
          >
            <div className="py-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-carbon-300 hover:text-white hover:bg-carbon-800/50 transition-all duration-200 font-medium rounded-lg mx-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Dashboard Links for Mobile */}
              <div className="pt-4 border-t border-carbon-700/50 mx-2">
                <div className="px-4 py-2 text-carbon-400 text-sm font-semibold uppercase tracking-wider">Dashboards</div>
                {dashboardItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-carbon-300 hover:text-white hover:bg-carbon-800/50 transition-all duration-200 font-medium rounded-lg mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span className="text-xs text-carbon-500">
                        {item.label === 'Land Owner' && 'Manage ecosystems'}
                        {item.label === 'Buyer' && 'Purchase credits'}
                        {item.label === 'Admin' && 'Platform management'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Auth Buttons for Mobile */}
              <div className="pt-4 border-t border-carbon-700/50 px-4 space-y-3">
                <Link
                  href="/signin"
                  className="block w-full px-4 py-3 text-carbon-300 hover:text-white hover:bg-carbon-800/50 transition-all duration-200 font-medium text-center rounded-lg border border-carbon-700/50 hover:border-carbon-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white rounded-lg font-semibold text-center hover:from-ocean-600 hover:to-ocean-700 transition-all duration-200 shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;

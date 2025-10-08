'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import IntegratedGlobe from '@/components/globe/IntegratedGlobe';
import { useInView } from 'react-intersection-observer';

const HomePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleGetStarted = () => {
    if (status === 'loading') {
      return; // Still loading
    }
    
    if (session) {
      // User is already authenticated, redirect to sign in to choose role
      router.push('/signin');
    } else {
      // User not authenticated, redirect to sign in
      router.push('/signin');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-carbon-900 via-carbon-800 to-carbon-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Oceara</span>
            </h1>
            <p className="text-xl md:text-2xl text-carbon-300 mb-8 max-w-3xl mx-auto">
              Where Oceans decide the future of Carbon and the earth
            </p>
            <p className="text-lg text-carbon-400 mb-12 max-w-4xl mx-auto">
              Mapping blue carbon ecosystems—mangroves, wetlands, and seagrass—to help protect coastlines 
              and accelerate climate action. Explore global hotspots, visualize satellite imagery, and connect 
              land owners and buyers to unlock sustainable value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="btn-primary text-lg px-8 py-4"
              >
                {session ? 'Access Dashboard' : 'Get Started'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Globe Section - Integrated with Real Projects */}
      <section className="py-20 bg-carbon-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Explore <span className="gradient-text">Live Projects</span>
            </h2>
            <p className="text-xl text-carbon-300 max-w-3xl mx-auto">
              Discover verified blue carbon restoration projects worldwide. Click on markers to view real-time 
              project details, carbon sequestration data, and purchase carbon credits.
            </p>
          </motion.div>

          <div className="relative">
            <div className="h-[600px] md:h-[800px] rounded-2xl overflow-hidden border border-carbon-700 shadow-2xl bg-gradient-to-br from-carbon-900 to-carbon-800">
              <IntegratedGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Access Section */}
      <section className="py-20 bg-carbon-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Access Your Dashboard
            </h2>
            <p className="text-xl text-carbon-300 max-w-3xl mx-auto">
              Choose your role and access your dedicated dashboard for managing ecosystems, trading carbon credits, or administering the platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏞️',
                title: 'Land Owner',
                description: 'Manage your ecosystems, track carbon sequestration, and earn from carbon credits.',
                features: ['Register ecosystems', 'Track carbon storage', 'Earn credits', 'View analytics'],
                color: 'from-green-500 to-emerald-600',
                path: '/dashboard/landowner',
              },
              {
                icon: '💰',
                title: 'Buyer',
                description: 'Browse and purchase verified carbon credits to offset your emissions.',
                features: ['Browse marketplace', 'Purchase credits', 'Track portfolio', 'Impact reports'],
                color: 'from-blue-500 to-cyan-600',
                path: '/dashboard/buyer',
              },
              {
                icon: '⚖️',
                title: 'Admin',
                description: 'Verify ecosystems, manage users, and oversee platform operations.',
                features: ['Verify ecosystems', 'Manage users', 'Oversee transactions', 'Platform analytics'],
                color: 'from-purple-500 to-violet-600',
                path: '/dashboard/admin',
              },
            ].map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-8 hover:border-ocean-500 transition-all duration-300 group"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{role.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{role.title}</h3>
                  <p className="text-carbon-300 mb-6">{role.description}</p>
                </div>
                
                <ul className="space-y-2 mb-8">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-carbon-300">
                      <span className="text-ocean-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(role.path)}
                  className={`w-full bg-gradient-to-r ${role.color} text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200`}
                >
                  Access {role.title} Dashboard
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-carbon-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
              Explore <span className="gradient-text">Blue Carbon Ecosystems</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-carbon-300 max-w-3xl mx-auto">
              Discover the world's most efficient carbon storage ecosystems protecting coastlines and supporting biodiversity.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants} className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl mb-6">🌊</div>
              <h3 className="text-2xl font-bold mb-4 text-ocean-400">Mangrove Forests</h3>
              <p className="text-carbon-300 leading-relaxed">
                Discover the world's most efficient carbon storage ecosystems protecting coastlines and supporting biodiversity.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl mb-6">🦅</div>
              <h3 className="text-2xl font-bold mb-4 text-ocean-400">Wetland Systems</h3>
              <p className="text-carbon-300 leading-relaxed">
                Explore critical wetland habitats that sequester carbon and provide essential ecosystem services.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl mb-6">🌱</div>
              <h3 className="text-2xl font-bold mb-4 text-ocean-400">Seagrass Meadows</h3>
              <p className="text-carbon-300 leading-relaxed">
                Uncover underwater carbon sinks that store carbon 35 times faster than tropical rainforests.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ocean-600 to-ocean-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-ocean-100 mb-8">
              Join our mission to protect and restore blue carbon ecosystems worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-white text-ocean-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-200"
              >
                {session ? 'Access Dashboard' : 'Get Started'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-ocean-600 transition-all duration-200"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

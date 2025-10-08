'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const SignUpPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleGoogleSignUp = async () => {
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }
    
    try {
      await signIn('google', { 
        callbackUrl: `/dashboard/${selectedRole}`,
        redirect: true 
      });
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      // TODO: Implement form-based registration
      console.log('Form submission:', { ...formData, role: selectedRole });
      alert('Form registration not yet implemented. Please use Google Sign Up.');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const roles = [
    {
      id: 'landowner',
      title: 'Land Owner',
      icon: '🏞️',
      description: 'Manage your ecosystems and earn from carbon credits',
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'buyer',
      title: 'Buyer',
      icon: '💰',
      description: 'Purchase carbon credits to offset emissions',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: '⚖️',
      description: 'Verify ecosystems and manage platform operations',
      color: 'from-purple-500 to-violet-600',
    },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (session) {
    // User is already signed in, redirect to their dashboard
    router.push('/dashboard/landowner'); // Default redirect
    return null;
  }

  return (
    <div className="min-h-screen bg-carbon-900">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-ocean-600 to-ocean-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Join Oceara
              </h1>
              <p className="text-xl text-ocean-100 mb-8">
                Create your account and start making a positive impact on our planet
              </p>
            </motion.div>
          </div>
        </section>

        {/* Registration Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Create Your Account
              </h2>
              <p className="text-lg text-carbon-300">
                Choose your role and create your account to get started
              </p>
            </motion.div>

            {/* Role Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    selectedRole === role.id
                      ? 'ring-2 ring-ocean-400 scale-105'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <div className="bg-carbon-800/50 backdrop-blur-sm border border-carbon-700 rounded-xl p-8 text-center h-full">
                    <div className="text-5xl mb-4">{role.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-3">{role.title}</h3>
                    <p className="text-carbon-300 mb-6">{role.description}</p>
                    
                    {selectedRole === role.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-ocean-400 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-md mx-auto"
            >
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-carbon-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-carbon-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-carbon-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-carbon-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
                    placeholder="Create a password (min. 8 characters)"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-carbon-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-carbon-800 border border-carbon-700 rounded-lg text-white placeholder-carbon-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedRole}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    selectedRole
                      ? 'bg-ocean-500 text-white hover:bg-ocean-600 hover:shadow-lg'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Create Account
                </button>
              </form>
            </motion.div>

            {/* Google Sign Up */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-8"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-carbon-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-carbon-900 text-carbon-400">Or continue with</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignUp}
                disabled={!selectedRole}
                className={`mt-6 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center mx-auto space-x-3 ${
                  selectedRole
                    ? 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-lg'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign up with Google</span>
              </button>
            </motion.div>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-center mt-12"
            >
              <p className="text-carbon-400 mb-4">Already have an account?</p>
              <Link
                href="/signin"
                className="text-ocean-400 hover:text-ocean-300 font-medium transition-colors"
              >
                Sign in to your account
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SignUpPage;

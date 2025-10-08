'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/lib/auth';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onClose }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async (role: string) => {
    if (!session) {
      // If not authenticated, redirect to Google OAuth
      await signIn('google', { callbackUrl: window.location.href });
      return;
    }

    setIsLoading(true);
    setSelectedRole(role);

    try {
      const response = await fetch('/api/auth/role-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to appropriate dashboard
        router.push(data.redirectUrl);
        onClose();
      } else {
        console.error('Role selection failed:', data.error);
        alert('Failed to select role. Please try again.');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  const roleOptions = [
    {
      id: ROLES.LANDOWNER,
      title: 'Land Owner',
      description: 'Manage your blue carbon ecosystems and create verified carbon credits',
      icon: '🌱',
      features: [
        'Register your ecosystems',
        'Create carbon credits',
        'Track carbon storage',
        'Manage verifications',
      ],
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: ROLES.BUYER,
      title: 'Buyer',
      description: 'Purchase verified carbon credits and support climate action',
      icon: '💚',
      features: [
        'Browse carbon credits',
        'Purchase verified credits',
        'Track your impact',
        'Retire credits',
      ],
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: ROLES.ADMIN,
      title: 'Admin',
      description: 'Manage the platform, verify ecosystems, and oversee operations',
      icon: '⚙️',
      features: [
        'Verify ecosystems',
        'Approve carbon credits',
        'Manage users',
        'Platform oversight',
      ],
      color: 'from-purple-500 to-violet-600',
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl mx-4 bg-carbon-900 rounded-2xl border border-carbon-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 border-b border-carbon-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Choose Your Role
                </h2>
                <p className="text-carbon-300">
                  Select how you'd like to participate in the Oceara ecosystem
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-carbon-400 hover:text-white transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Role Options */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roleOptions.map((role) => (
                <motion.div
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative bg-gradient-to-br ${role.color} rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    selectedRole === role.id ? 'ring-2 ring-white ring-opacity-50' : ''
                  }`}
                  onClick={() => handleRoleSelection(role.id)}
                >
                  {isLoading && selectedRole === role.id && (
                    <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-4xl mb-4">{role.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                    <p className="text-white/80 text-sm mb-4">{role.description}</p>
                    
                    <ul className="space-y-2 text-sm text-white/70">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-carbon-700 bg-carbon-800/50 rounded-b-2xl">
            <div className="text-center">
              <p className="text-carbon-400 text-sm mb-4">
                You can change your role later in your profile settings
              </p>
              {!session && (
                <div className="flex items-center justify-center space-x-2 text-carbon-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">You'll be prompted to sign in with Google</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleSelectionModal;

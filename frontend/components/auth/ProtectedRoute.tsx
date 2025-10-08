'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Role, ROLES } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  fallbackUrl?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackUrl = '/',
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      // Not authenticated, redirect to sign in
      router.push('/auth/signin');
      return;
    }

    if (!session.user.onboardingComplete) {
      // User hasn't completed onboarding, redirect to role selection
      router.push('/');
      return;
    }

    if (requiredRole && session.user.role !== requiredRole) {
      // User doesn't have required role, redirect to appropriate dashboard
      const roleDashboards = {
        [ROLES.LANDOWNER]: '/dashboard/landowner',
        [ROLES.BUYER]: '/dashboard/buyer',
        [ROLES.ADMIN]: '/dashboard/admin',
      };
      
      const userDashboard = roleDashboards[session.user.role as Role] || fallbackUrl;
      router.push(userDashboard);
      return;
    }
  }, [session, status, requiredRole, fallbackUrl, router]);

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
          <p className="text-carbon-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while redirecting
  if (!session || !session.user.onboardingComplete || (requiredRole && session.user.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-500 mx-auto mb-4"></div>
          <p className="text-carbon-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

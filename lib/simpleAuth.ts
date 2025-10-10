// ⚠️ SECURITY NOTICE: This is a DEMO AUTHENTICATION system for development/testing ONLY
// These are NOT real credentials and pose NO security risk
// For production, use Supabase Auth or Firebase Auth (already integrated)
// This file is ONLY for local testing and SIH presentation purposes

interface User {
  id: string
  email: string
  name: string
  role: 'landowner' | 'buyer' | 'administrator'
}

// ⚠️ DEMO USERS ONLY - NOT FOR PRODUCTION USE
// These credentials are intentionally simple for testing purposes
// Domain: oceara.com (not a real domain, demo only)
const DEMO_USERS = [
  {
    id: 'demo_1',
    email: 'landowner@oceara.demo',  // Changed to .demo to avoid confusion
    password: 'demo_landowner_2024',
    name: 'Demo Landowner',
    role: 'landowner' as const
  },
  {
    id: 'demo_2',
    email: 'buyer@oceara.demo',
    password: 'demo_buyer_2024',
    name: 'Demo Buyer',
    role: 'buyer' as const
  },
  {
    id: 'demo_3',
    email: 'admin@oceara.demo',
    password: 'demo_admin_2024',
    name: 'Demo Administrator',
    role: 'administrator' as const
  }
]

// Local storage key
const AUTH_KEY = 'oceara_auth_user'
const SESSION_KEY = 'oceara_session_id'

export const authService = {
  // Login with email and password
  login: (email: string, password: string): User | null => {
    const user = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    
    if (user) {
      const authUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
      
      // Store in localStorage
      localStorage.setItem(AUTH_KEY, JSON.stringify(authUser))
      localStorage.setItem(SESSION_KEY, `session_${Date.now()}`)
      
      return authUser
    }
    
    return null
  },

  // Signup (for demo, just creates a basic user)
  signup: (email: string, password: string, name: string, role: string): User => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      role: role as any
    }
    
    // Store in localStorage
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser))
    localStorage.setItem(SESSION_KEY, `session_${Date.now()}`)
    
    return newUser
  },

  // Get current user
  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(AUTH_KEY)
      const sessionId = localStorage.getItem(SESSION_KEY)
      
      if (userStr && sessionId) {
        return JSON.parse(userStr)
      }
    } catch (error) {
      console.error('Error getting current user:', error)
    }
    
    return null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const user = authService.getCurrentUser()
    return user !== null
  },

  // Check if user has specific role
  hasRole: (role: string): boolean => {
    const user = authService.getCurrentUser()
    return user?.role === role
  },

  // Logout
  logout: () => {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(SESSION_KEY)
  },

  // Demo user login (bypasses authentication)
  loginAsDemo: (role: 'landowner' | 'buyer' | 'administrator'): User => {
    const demoUser: User = {
      id: `demo_${role}`,
      email: `demo_${role}@oceara.com`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role
    }
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(demoUser))
    localStorage.setItem(SESSION_KEY, `demo_session_${Date.now()}`)
    
    return demoUser
  }
}

// ⚠️ DEMO CREDENTIALS FOR TESTING ONLY
// Display credentials for users during testing/presentation
export const DEMO_CREDENTIALS = {
  landowner: {
    email: 'landowner@oceara.demo',
    password: 'demo_landowner_2024'
  },
  buyer: {
    email: 'buyer@oceara.demo',
    password: 'demo_buyer_2024'
  },
  administrator: {
    email: 'admin@oceara.demo',
    password: 'demo_admin_2024'
  },
  admin: {
    email: 'admin@oceara.demo',
    password: 'demo_admin_2024'
  }
}


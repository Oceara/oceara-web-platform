// Simple authentication service for demo purposes
// In production, this would connect to Supabase/Firebase

interface User {
  id: string
  email: string
  name: string
  role: 'landowner' | 'buyer' | 'administrator'
}

// Demo users database
const DEMO_USERS = [
  {
    id: '1',
    email: 'landowner@oceara.com',
    password: 'landowner123',
    name: 'Demo Landowner',
    role: 'landowner' as const
  },
  {
    id: '2',
    email: 'buyer@oceara.com',
    password: 'buyer123',
    name: 'Demo Buyer',
    role: 'buyer' as const
  },
  {
    id: '3',
    email: 'admin@oceara.com',
    password: 'admin123',
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

// Get demo credentials for display
export const DEMO_CREDENTIALS = {
  landowner: {
    email: 'landowner@oceara.com',
    password: 'landowner123'
  },
  buyer: {
    email: 'buyer@oceara.com',
    password: 'buyer123'
  },
  administrator: {
    email: 'admin@oceara.com',
    password: 'admin123'
  },
  admin: {
    email: 'admin@oceara.com',
    password: 'admin123'
  }
}


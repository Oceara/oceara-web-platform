// Google OAuth 2.0 Authentication Service
// Handles Google login/signup and Earth Engine authentication

interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
  given_name: string
  family_name: string
}

interface AuthResponse {
  success: boolean
  user?: GoogleUser
  error?: string
  accessToken?: string
}

export class GoogleAuthService {
  private clientId: string
  private isInitialized: boolean = false

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '187601325863-45db1i9onqndts56g42ccub6gf0onqss.apps.googleusercontent.com'
    console.log('🔧 GoogleAuthService initialized with clientId:', this.clientId ? `${this.clientId.substring(0, 20)}...` : 'NOT SET')
  }

  /**
   * Initialize Google Identity Services
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    try {
      if (typeof window === 'undefined') return false

      // Load Google Identity Services
      await this.loadGoogleScript()
      
      if (window.google) {
        this.isInitialized = true
        console.log('✅ Google Auth initialized')
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Failed to initialize Google Auth:', error)
      return false
    }
  }

  /**
   * Load Google Identity Services script
   */
  private async loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'))
        return
      }

      // Check if already loaded
      if (window.google) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
      
      document.head.appendChild(script)
    })
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<AuthResponse> {
    try {
      await this.initialize()
      
      if (!window.google) {
        throw new Error('Google Identity Services not loaded')
      }

      return new Promise((resolve) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'openid email profile https://www.googleapis.com/auth/earthengine',
          callback: (response: any) => {
            console.log('OAuth response received:', response)
            if (response.access_token) {
              // Get user info
              this.getUserInfo(response.access_token)
                .then((userInfo) => {
                  console.log('User info retrieved:', userInfo)
                  resolve({
                    success: true,
                    user: userInfo,
                    accessToken: response.access_token
                  })
                })
                .catch((error) => {
                  console.error('Error getting user info:', error)
                  resolve({
                    success: false,
                    error: error.message
                  })
                })
            } else {
              console.error('No access token in response:', response)
              resolve({
                success: false,
                error: 'No access token received'
              })
            }
          },
          error_callback: (error: any) => {
            console.error('Google OAuth error:', error)
            resolve({
              success: false,
              error: error.type || 'Authentication failed'
            })
          }
        })

        // Request access token
        console.log('Requesting access token...')
        client.requestAccessToken()
      })
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get user information from Google
   */
  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info')
      }
      
      const userInfo = await response.json()
      
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      throw error
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.oauth2.revoke()
      }
      
      // Clear any stored tokens
      localStorage.removeItem('google_access_token')
      localStorage.removeItem('google_user')
      
      console.log('✅ Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return !!localStorage.getItem('google_access_token')
  }

  /**
   * Get stored user info
   */
  getStoredUser(): GoogleUser | null {
    try {
      const userStr = localStorage.getItem('google_user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing stored user:', error)
      return null
    }
  }

  /**
   * Store user info and token
   */
  storeAuthData(user: GoogleUser, accessToken: string): void {
    localStorage.setItem('google_user', JSON.stringify(user))
    localStorage.setItem('google_access_token', accessToken)
  }

  /**
   * Get stored access token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('google_access_token')
  }

  /**
   * Check if Google Auth is configured
   */
  isConfigured(): boolean {
    const isConfigured = this.clientId !== '' && this.clientId !== 'your_client_id_here'
    console.log('🔍 Google Auth configured check:', {
      clientId: this.clientId ? `${this.clientId.substring(0, 20)}...` : 'NOT SET',
      isConfigured
    })
    return isConfigured
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService()

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any
  }
}
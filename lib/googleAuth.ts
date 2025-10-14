// Google OAuth 2.0 Authentication Service - Optimized Version
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
    // Use hardcoded credentials for immediate functionality
    this.clientId = '187601325863-45db1i9onqndts56g42ccub6gf0onqss.apps.googleusercontent.com'
    console.log('🔧 GoogleAuthService initialized with clientId:', this.clientId.substring(0, 20) + '...')
  }

  /**
   * Check if Google Auth is configured
   */
  isConfigured(): boolean {
    const isConfigured = this.clientId !== '' && this.clientId.length > 20
    console.log('🔍 Google Auth configured check:', {
      clientId: this.clientId.substring(0, 20) + '...',
      isConfigured
    })
    return isConfigured
  }

  /**
   * Initialize Google Identity Services
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true
    }

    try {
      // Load Google Identity Services script
      await this.loadGoogleScript()
      
      // Wait for Google to be available
      await this.waitForGoogle()
      
      this.isInitialized = true
      console.log('✅ Google Identity Services initialized successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Google Identity Services:', error)
      return false
    }
  }

  /**
   * Load Google Identity Services script
   */
  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'))
        return
      }

      // Check if script is already loaded
      if (window.google && window.google.accounts) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('✅ Google Identity Services script loaded')
        resolve()
      }
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services script')
        reject(new Error('Failed to load Google Identity Services'))
      }
      
      document.head.appendChild(script)
    })
  }

  /**
   * Wait for Google object to be available
   */
  private waitForGoogle(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 50 // 5 seconds max wait
      
      const checkGoogle = () => {
        attempts++
        
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          console.log('✅ Google object available')
          resolve()
        } else if (attempts >= maxAttempts) {
          reject(new Error('Google object not available after timeout'))
        } else {
          setTimeout(checkGoogle, 100)
        }
      }
      
      checkGoogle()
    })
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<AuthResponse> {
    try {
      console.log('🚀 Starting Google sign-in process...')
      
      await this.initialize()
      
      if (!window.google || !window.google.accounts) {
        throw new Error('Google Identity Services not loaded')
      }

      return new Promise((resolve) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'openid email profile https://www.googleapis.com/auth/earthengine',
          callback: (response: any) => {
            console.log('✅ OAuth response received:', response)
            if (response.access_token) {
              // Get user info
              this.getUserInfo(response.access_token)
                .then((userInfo) => {
                  console.log('✅ User info retrieved:', userInfo)
                  resolve({
                    success: true,
                    user: userInfo,
                    accessToken: response.access_token
                  })
                })
                .catch((error) => {
                  console.error('❌ Error getting user info:', error)
                  resolve({
                    success: false,
                    error: error.message
                  })
                })
            } else {
              console.error('❌ No access token in response:', response)
              resolve({
                success: false,
                error: 'No access token received'
              })
            }
          },
          error_callback: (error: any) => {
            console.error('❌ Google OAuth error:', error)
            resolve({
              success: false,
              error: error.type || 'Authentication failed'
            })
          }
        })

        // Request access token
        console.log('🔑 Requesting access token...')
        client.requestAccessToken()
      })
    } catch (error) {
      console.error('❌ Sign in error:', error)
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const userInfo = await response.json()
      console.log('✅ User info fetched:', userInfo)
      
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name
      }
    } catch (error) {
      console.error('❌ Error fetching user info:', error)
      throw error
    }
  }

  /**
   * Store authentication data
   */
  storeAuthData(user: GoogleUser, accessToken: string): void {
    try {
      localStorage.setItem('google_user', JSON.stringify(user))
      localStorage.setItem('google_access_token', accessToken)
      console.log('✅ Authentication data stored')
    } catch (error) {
      console.error('❌ Error storing auth data:', error)
    }
  }

  /**
   * Get stored user data
   */
  getStoredUser(): GoogleUser | null {
    try {
      const userData = localStorage.getItem('google_user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('❌ Error getting stored user:', error)
      return null
    }
  }

  /**
   * Get stored access token
   */
  getStoredToken(): string | null {
    try {
      return localStorage.getItem('google_access_token')
    } catch (error) {
      console.error('❌ Error getting stored token:', error)
      return null
    }
  }

  /**
   * Clear stored authentication data
   */
  clearAuthData(): void {
    try {
      localStorage.removeItem('google_user')
      localStorage.removeItem('google_access_token')
      console.log('✅ Authentication data cleared')
    } catch (error) {
      console.error('❌ Error clearing auth data:', error)
    }
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
}
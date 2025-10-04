import { User } from '../types'
import { apiService } from './api'

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly USER_KEY = 'user'
  private static readonly REFRESH_INTERVAL = 15 * 60 * 1000 // 15 minutes

  private refreshTimer?: NodeJS.Timeout

  constructor() {
    this.startTokenRefresh()
  }

  // Get stored user data
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(AuthService.USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY)
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getUser()
    
    // Reject mock tokens in production
    if (token?.includes('mock-token')) {
      console.warn('Mock token detected, clearing auth data')
      this.clearAuthData()
      return false
    }
    
    return !!(token && user)
  }

  // Store authentication data
  setAuthData(user: User, token: string): void {
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user))
    localStorage.setItem(AuthService.TOKEN_KEY, token)
    this.startTokenRefresh()
  }

  // Clear authentication data
  clearAuthData(): void {
    localStorage.removeItem(AuthService.USER_KEY)
    localStorage.removeItem(AuthService.TOKEN_KEY)
    this.stopTokenRefresh()
  }

  // Login with username and platform
  async login(username: string, platform: string): Promise<{ authUrl: string }> {
    try {
      const response = await apiService.login(username, platform)
      console.log('[AUTH] Login response:', response)
      if (response.success && response.data) {
        return response.data
      }
      console.error('[AUTH] Login failed:', response)
      throw new Error(response.error || 'Login failed')
    } catch (error: any) {
      console.error('[AUTH] Login error:', error)
      console.error('[AUTH] Error response:', error.response?.data)
      console.error('[AUTH] Full error:', JSON.stringify(error, null, 2))
      throw error
    }
  }

  // Handle OAuth callback
  async handleCallback(code: string, state: string): Promise<User> {
    try {
      const response = await apiService.handleCallback(code, state)
      if (response.success && response.data) {
        this.setAuthData(response.data.user, response.data.token)
        return response.data.user
      }
      throw new Error(response.error || 'Authentication failed')
    } catch (error) {
      console.error('Callback error:', error)
      throw error
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuthData()
    }
  }

  // Refresh token
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiService.refreshToken()
      if (response.success && response.data) {
        localStorage.setItem(AuthService.TOKEN_KEY, response.data.token)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      this.clearAuthData()
      return false
    }
  }

  // Start automatic token refresh
  private startTokenRefresh(): void {
    this.stopTokenRefresh()
    
    if (this.isAuthenticated()) {
      this.refreshTimer = setInterval(async () => {
        const success = await this.refreshToken()
        if (!success) {
          this.clearAuthData()
          window.location.href = '/login'
        }
      }, AuthService.REFRESH_INTERVAL)
    }
  }

  // Stop automatic token refresh
  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = undefined
    }
  }

  // Get Twitter OAuth URL
  getOAuthUrl(platform: string): string {
    if (platform !== 'twitter') {
      throw new Error('Only Twitter is supported')
    }
    
    const baseUrl = window.location.origin
    const redirectUri = `${baseUrl}/auth/callback`
    
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.REACT_APP_TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read%20follows.read%20follows.write&state=${platform}`
  }

  // Parse OAuth callback parameters
  parseCallbackParams(): { code: string | null; state: string | null; error: string | null } {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      code: urlParams.get('code'),
      state: urlParams.get('state'),
      error: urlParams.get('error')
    }
  }

  // Clean up on unmount
  destroy(): void {
    this.stopTokenRefresh()
  }
}

export const authService = new AuthService()
export default authService

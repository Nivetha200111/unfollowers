import { useState, useEffect, useCallback } from 'react'
import { User } from '../types'
import { authService } from '../services/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getUser()
        if (storedUser && authService.isAuthenticated()) {
          setUser(storedUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        authService.clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = useCallback(async (username: string, platform: string) => {
    try {
      setIsLoading(true)
      const { authUrl } = await authService.login(username, platform)
      
      // Redirect to OAuth provider
      window.location.href = authUrl
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle OAuth callback
  const handleCallback = useCallback(async (code: string, state: string) => {
    try {
      setIsLoading(true)
      const user = await authService.handleCallback(code, state)
      setUser(user)
      return user
    } catch (error) {
      console.error('Callback error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update user data
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    handleCallback,
    logout,
    updateUser
  }
}

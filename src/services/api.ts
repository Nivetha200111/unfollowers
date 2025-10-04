import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  User, 
  Follower, 
  FollowerFilters, 
  UserSettings, 
  Removal, 
  ApiResponse, 
  PaginatedResponse 
} from '../types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(username: string, platform: string): Promise<ApiResponse<{ authUrl: string }>> {
    const response = await this.api.post('/v2/login', { username, platform })
    return response.data
  }

  async handleCallback(code: string, state: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.api.post('/v2/callback', { code, state })
    return response.data
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const response = await this.api.post('/auth/refresh')
    return response.data
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.api.post('/auth/logout')
    return response.data
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/user/profile')
    return response.data
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    const response = await this.api.put('/user/settings', settings)
    return response.data
  }

  async getSettings(): Promise<ApiResponse<UserSettings>> {
    const response = await this.api.get('/user/settings')
    return response.data
  }

  // Followers endpoints
  async getFollowers(page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<Follower>>> {
    const response = await this.api.get(`/followers?page=${page}&limit=${limit}`)
    return response.data
  }

  async analyzeFollowers(filters: FollowerFilters): Promise<ApiResponse<PaginatedResponse<Follower>>> {
    const response = await this.api.post('/followers/analyze', filters)
    return response.data
  }

  async removeFollowers(followerIds: string[], reason: string): Promise<ApiResponse<{ removedCount: number }>> {
    const response = await this.api.delete('/followers/remove', {
      data: { followerIds, reason }
    })
    return response.data
  }

  async getRemovalHistory(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Removal>>> {
    const response = await this.api.get(`/followers/history?page=${page}&limit=${limit}`)
    return response.data
  }

  // Utility methods
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health')
      return true
    } catch {
      return false
    }
  }

  // Batch operations
  async batchRemoveFollowers(
    followerIds: string[], 
    reason: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ removedCount: number; failedCount: number }>> {
    const batchSize = 10
    const batches = []
    
    for (let i = 0; i < followerIds.length; i += batchSize) {
      batches.push(followerIds.slice(i, i + batchSize))
    }

    let removedCount = 0
    let failedCount = 0

    for (let i = 0; i < batches.length; i++) {
      try {
        const response = await this.removeFollowers(batches[i], reason)
        if (response.success && response.data) {
          removedCount += response.data.removedCount
        } else {
          failedCount += batches[i].length
        }
      } catch (error) {
        failedCount += batches[i].length
      }

      if (onProgress) {
        onProgress(Math.round(((i + 1) / batches.length) * 100))
      }

      // Add delay between batches to respect rate limits
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return {
      success: true,
      data: { removedCount, failedCount }
    }
  }
}

export const apiService = new ApiService()
export default apiService

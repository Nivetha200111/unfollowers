import { useState, useEffect, useCallback } from 'react'
import { Follower, FollowerFilters, PaginatedResponse } from '../types'
import { apiService } from '../services/api'
import { BotDetector } from '../utils/botDetection'

interface UseFollowersReturn {
  followers: Follower[]
  filteredFollowers: Follower[]
  selectedFollowers: string[]
  isLoading: boolean
  error: string | null
  filters: FollowerFilters
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
  // Actions
  setFilters: (filters: Partial<FollowerFilters>) => void
  selectFollower: (followerId: string) => void
  deselectFollower: (followerId: string) => void
  selectAll: () => void
  deselectAll: () => void
  toggleFollower: (followerId: string) => void
  loadFollowers: (page?: number) => Promise<void>
  analyzeFollowers: () => Promise<void>
  removeSelected: (reason: string) => Promise<{ removedCount: number; failedCount: number }>
  clearError: () => void
}

export function useFollowers(): UseFollowersReturn {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [filteredFollowers, setFilteredFollowers] = useState<Follower[]>([])
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<FollowerFilters>({
    nonMutualOnly: false,
    minFollowerThreshold: 100,
    maxFollowingRatio: 10,
    botDetectionEnabled: true,
    unknownContactsOnly: false,
    verifiedOnly: false,
    privateAccountsOnly: false
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    hasNext: false,
    hasPrev: false
  })

  // Load followers from API
  const loadFollowers = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.getFollowers(page, pagination.limit)
      
      if (response.success && response.data) {
        const { data, pagination: paginationData } = response.data
        
        // Run bot detection if enabled
        const processedFollowers = filters.botDetectionEnabled 
          ? data.map(follower => ({
              ...follower,
              botScore: BotDetector.detectBot(follower).score
            }))
          : data

        setFollowers(processedFollowers)
        setPagination(paginationData)
        setPagination(prev => ({ ...prev, page }))
      } else {
        throw new Error(response.error || 'Failed to load followers')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load followers'
      setError(errorMessage)
      console.error('Load followers error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, filters.botDetectionEnabled])

  // Analyze followers with filters
  const analyzeFollowers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiService.analyzeFollowers(filters)
      
      if (response.success && response.data) {
        const { data, pagination: paginationData } = response.data
        setFilteredFollowers(data)
        setPagination(paginationData)
      } else {
        throw new Error(response.error || 'Failed to analyze followers')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze followers'
      setError(errorMessage)
      console.error('Analyze followers error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Apply filters to current followers
  const applyFilters = useCallback((followersList: Follower[], currentFilters: FollowerFilters) => {
    return followersList.filter(follower => {
      // Non-mutual only
      if (currentFilters.nonMutualOnly && follower.isMutual) {
        return false
      }

      // Minimum follower threshold
      if (follower.followerCount < currentFilters.minFollowerThreshold) {
        return false
      }

      // Maximum following ratio
      if (follower.followingCount > 0) {
        const ratio = follower.followerCount / follower.followingCount
        if (ratio > currentFilters.maxFollowingRatio) {
          return false
        }
      }

      // Bot detection
      if (currentFilters.botDetectionEnabled) {
        const botResult = BotDetector.detectBot(follower)
        if (botResult.isBot) {
          return false
        }
      }

      // Verified only
      if (currentFilters.verifiedOnly && !follower.isVerified) {
        return false
      }

      // Private accounts only
      if (currentFilters.privateAccountsOnly && !follower.isPrivate) {
        return false
      }

      return true
    })
  }, [])

  // Update filters
  const setFilters = useCallback((newFilters: Partial<FollowerFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFiltersState(updatedFilters)
    
    // Apply filters to current followers
    const filtered = applyFilters(followers, updatedFilters)
    setFilteredFollowers(filtered)
  }, [filters, followers, applyFilters])

  // Selection management
  const selectFollower = useCallback((followerId: string) => {
    setSelectedFollowers(prev => [...prev, followerId])
  }, [])

  const deselectFollower = useCallback((followerId: string) => {
    setSelectedFollowers(prev => prev.filter(id => id !== followerId))
  }, [])

  const toggleFollower = useCallback((followerId: string) => {
    setSelectedFollowers(prev => 
      prev.includes(followerId)
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    )
  }, [])

  const selectAll = useCallback(() => {
    setSelectedFollowers(filteredFollowers.map(f => f.id))
  }, [filteredFollowers])

  const deselectAll = useCallback(() => {
    setSelectedFollowers([])
  }, [])

  // Remove selected followers
  const removeSelected = useCallback(async (reason: string) => {
    if (selectedFollowers.length === 0) {
      throw new Error('No followers selected')
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await apiService.batchRemoveFollowers(
        selectedFollowers,
        reason,
        (progress) => {
          // Could emit progress events here
          console.log(`Removal progress: ${progress}%`)
        }
      )

      if (response.success && response.data) {
        // Remove from local state
        setFollowers(prev => prev.filter(f => !selectedFollowers.includes(f.id)))
        setFilteredFollowers(prev => prev.filter(f => !selectedFollowers.includes(f.id)))
        setSelectedFollowers([])
        
        return response.data
      } else {
        throw new Error(response.error || 'Failed to remove followers')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove followers'
      setError(errorMessage)
      console.error('Remove followers error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [selectedFollowers])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Apply filters when followers or filters change
  useEffect(() => {
    const filtered = applyFilters(followers, filters)
    setFilteredFollowers(filtered)
  }, [followers, filters, applyFilters])

  // Load followers on mount
  useEffect(() => {
    loadFollowers()
  }, [loadFollowers])

  return {
    followers,
    filteredFollowers,
    selectedFollowers,
    isLoading,
    error,
    filters,
    pagination,
    setFilters,
    selectFollower,
    deselectFollower,
    selectAll,
    deselectAll,
    toggleFollower,
    loadFollowers,
    analyzeFollowers,
    removeSelected,
    clearError
  }
}

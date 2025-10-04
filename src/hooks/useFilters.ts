import { useState, useCallback } from 'react'
import { FollowerFilters } from '../types'

interface UseFiltersReturn {
  filters: FollowerFilters
  setFilters: (filters: Partial<FollowerFilters>) => void
  resetFilters: () => void
  getFilterSummary: () => string
  isFilterActive: () => boolean
}

const defaultFilters: FollowerFilters = {
  nonMutualOnly: false,
  minFollowerThreshold: 100,
  maxFollowingRatio: 10,
  botDetectionEnabled: true,
  unknownContactsOnly: false,
  verifiedOnly: false,
  privateAccountsOnly: false
}

export function useFilters(initialFilters?: Partial<FollowerFilters>): UseFiltersReturn {
  const [filters, setFiltersState] = useState<FollowerFilters>({
    ...defaultFilters,
    ...initialFilters
  })

  const setFilters = useCallback((newFilters: Partial<FollowerFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
  }, [])

  const getFilterSummary = useCallback((): string => {
    const activeFilters: string[] = []

    if (filters.nonMutualOnly) {
      activeFilters.push('Non-mutual only')
    }

    if (filters.minFollowerThreshold > 0) {
      activeFilters.push(`Min ${filters.minFollowerThreshold} followers`)
    }

    if (filters.maxFollowingRatio < 1000) {
      activeFilters.push(`Max ${filters.maxFollowingRatio}:1 ratio`)
    }

    if (filters.botDetectionEnabled) {
      activeFilters.push('Bot detection')
    }

    if (filters.unknownContactsOnly) {
      activeFilters.push('Unknown contacts')
    }

    if (filters.verifiedOnly) {
      activeFilters.push('Verified only')
    }

    if (filters.privateAccountsOnly) {
      activeFilters.push('Private accounts')
    }

    return activeFilters.length > 0 
      ? `Active filters: ${activeFilters.join(', ')}`
      : 'No filters applied'
  }, [filters])

  const isFilterActive = useCallback((): boolean => {
    return (
      filters.nonMutualOnly ||
      filters.minFollowerThreshold > 0 ||
      filters.maxFollowingRatio < 1000 ||
      filters.botDetectionEnabled ||
      filters.unknownContactsOnly ||
      filters.verifiedOnly ||
      filters.privateAccountsOnly
    )
  }, [filters])

  return {
    filters,
    setFilters,
    resetFilters,
    getFilterSummary,
    isFilterActive
  }
}

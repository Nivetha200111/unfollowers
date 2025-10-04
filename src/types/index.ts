export interface User {
  id: string
  username: string
  platformId: string
  platform: 'twitter'
  accessToken?: string
  refreshToken?: string
  profileData?: {
    displayName?: string
    avatarUrl?: string
    bio?: string
    followerCount?: number
    followingCount?: number
    isVerified?: boolean
  }
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface Follower {
  id: string
  userId: string
  platformId: string
  username: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  followerCount: number
  followingCount: number
  isVerified: boolean
  isPrivate: boolean
  isMutual: boolean
  botScore: number
  lastAnalyzed: string
  createdAt: string
  updatedAt: string
}

export interface FollowerFilters {
  nonMutualOnly: boolean
  minFollowerThreshold: number
  maxFollowingRatio: number
  botDetectionEnabled: boolean
  unknownContactsOnly: boolean
  verifiedOnly: boolean
  privateAccountsOnly: boolean
}

export interface RemovalReason {
  id: string
  label: string
  description: string
}

export interface Removal {
  id: string
  userId: string
  followerIds: string[]
  reason: string
  count: number
  timestamp: string
}

export interface UserSettings {
  id: string
  userId: string
  minFollowerThreshold: number
  maxFollowingRatio: number
  botDetectionEnabled: boolean
  mutualOnlyMode: boolean
  emailNotifications: boolean
  removalConfirmations: boolean
  dataRetentionDays: number
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface BotDetectionResult {
  score: number
  reasons: string[]
  isBot: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface FollowersState {
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
}

export interface NotificationState {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const REMOVAL_REASONS: RemovalReason[] = [
  {
    id: 'non_mutual',
    label: 'Not Following Back',
    description: 'Accounts that don\'t follow you back'
  },
  {
    id: 'bot_detected',
    label: 'Suspected Bot',
    description: 'Accounts identified as likely bots'
  },
  {
    id: 'low_popularity',
    label: 'Low Popularity',
    description: 'Accounts with very few followers'
  },
  {
    id: 'unknown_contact',
    label: 'Unknown Contact',
    description: 'Accounts with no mutual connections'
  },
  {
    id: 'inactive',
    label: 'Inactive Account',
    description: 'Accounts that haven\'t posted recently'
  }
]

export const PLATFORMS = {
  twitter: {
    name: 'Twitter/X',
    icon: '🐦',
    color: 'text-blue-500'
  }
} as const

export type Platform = keyof typeof PLATFORMS

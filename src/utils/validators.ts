import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  platform: z.literal('twitter', {
    required_error: 'Platform must be Twitter'
  })
})

export const followerFiltersSchema = z.object({
  nonMutualOnly: z.boolean().default(false),
  minFollowerThreshold: z.number().min(0).max(10000000).default(100),
  maxFollowingRatio: z.number().min(0).max(1000).default(10),
  botDetectionEnabled: z.boolean().default(true),
  unknownContactsOnly: z.boolean().default(false),
  verifiedOnly: z.boolean().default(false),
  privateAccountsOnly: z.boolean().default(false)
})

export const userSettingsSchema = z.object({
  minFollowerThreshold: z.number().min(0).max(10000000),
  maxFollowingRatio: z.number().min(0).max(1000),
  botDetectionEnabled: z.boolean(),
  mutualOnlyMode: z.boolean(),
  emailNotifications: z.boolean(),
  removalConfirmations: z.boolean(),
  dataRetentionDays: z.number().min(1).max(365)
})

export const removalRequestSchema = z.object({
  followerIds: z.array(z.string()).min(1, 'At least one follower must be selected'),
  reason: z.string().min(1, 'Removal reason is required')
})

export type LoginFormData = z.infer<typeof loginSchema>
export type FollowerFiltersData = z.infer<typeof followerFiltersSchema>
export type UserSettingsData = z.infer<typeof userSettingsSchema>
export type RemovalRequestData = z.infer<typeof removalRequestSchema>

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/
  return usernameRegex.test(username)
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date()
  const d = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

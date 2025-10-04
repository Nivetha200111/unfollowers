import { supabase, Database } from '../lib/supabase'
import { User, Follower, UserSettings, Removal } from '../types'

type Tables = Database['public']['Tables']

export class DatabaseService {
  // User operations
  static async createUser(userData: {
    username: string
    platformId: string
    platform: 'twitter'
    accessToken: string
    refreshToken?: string
    profileData?: any
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        platform_id: userData.platformId,
        platform: userData.platform,
        access_token: userData.accessToken,
        refresh_token: userData.refreshToken,
        profile_data: userData.profileData
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return this.mapUserFromDb(data)
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to get user: ${error.message}`)
    }
    return this.mapUserFromDb(data)
  }

  static async getUserByPlatformId(platformId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('platform_id', platformId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to get user: ${error.message}`)
    }
    return this.mapUserFromDb(data)
  }

  static async updateUser(id: string, updates: Partial<{
    username: string
    accessToken: string
    refreshToken: string
    profileData: any
    lastLoginAt: string
  }>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        username: updates.username,
        access_token: updates.accessToken,
        refresh_token: updates.refreshToken,
        profile_data: updates.profileData,
        last_login_at: updates.lastLoginAt
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return this.mapUserFromDb(data)
  }

  // User settings operations
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to get user settings: ${error.message}`)
    }
    return this.mapUserSettingsFromDb(data)
  }

  static async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        min_follower_threshold: settings.minFollowerThreshold,
        max_following_ratio: settings.maxFollowingRatio,
        bot_detection_enabled: settings.botDetectionEnabled,
        mutual_only_mode: settings.mutualOnlyMode,
        email_notifications: settings.emailNotifications,
        removal_confirmations: settings.removalConfirmations,
        data_retention_days: settings.dataRetentionDays
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to update user settings: ${error.message}`)
    return this.mapUserSettingsFromDb(data)
  }

  // Follower operations
  static async getFollowers(userId: string, page = 1, limit = 50): Promise<{
    data: Follower[]
    total: number
  }> {
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('followers')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Failed to get followers: ${error.message}`)
    
    return {
      data: data?.map(this.mapFollowerFromDb) || [],
      total: count || 0
    }
  }

  static async upsertFollowers(userId: string, followers: Partial<Follower>[]): Promise<void> {
    const followersData = followers.map(follower => ({
      user_id: userId,
      platform_id: follower.platformId!,
      username: follower.username!,
      display_name: follower.displayName,
      bio: follower.bio,
      avatar_url: follower.avatarUrl,
      follower_count: follower.followerCount!,
      following_count: follower.followingCount!,
      is_verified: follower.isVerified || false,
      is_private: follower.isPrivate || false,
      is_mutual: follower.isMutual || false,
      bot_score: follower.botScore || 0,
      last_analyzed: follower.lastAnalyzed || new Date().toISOString()
    }))

    const { error } = await supabase
      .from('followers')
      .upsert(followersData, { 
        onConflict: 'user_id,platform_id',
        ignoreDuplicates: false 
      })

    if (error) throw new Error(`Failed to upsert followers: ${error.message}`)
  }

  static async deleteFollowers(userId: string, followerIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('user_id', userId)
      .in('id', followerIds)

    if (error) throw new Error(`Failed to delete followers: ${error.message}`)
  }

  // Removal operations
  static async createRemoval(removal: {
    userId: string
    followerIds: string[]
    reason: string
    count: number
  }): Promise<Removal> {
    const { data, error } = await supabase
      .from('removals')
      .insert({
        user_id: removal.userId,
        follower_ids: removal.followerIds,
        reason: removal.reason,
        count: removal.count
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create removal: ${error.message}`)
    return this.mapRemovalFromDb(data)
  }

  static async getRemovals(userId: string, page = 1, limit = 20): Promise<{
    data: Removal[]
    total: number
  }> {
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('removals')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Failed to get removals: ${error.message}`)
    
    return {
      data: data?.map(this.mapRemovalFromDb) || [],
      total: count || 0
    }
  }

  // Helper mapping functions
  private static mapUserFromDb(data: Tables['users']['Row']): User {
    return {
      id: data.id,
      username: data.username,
      platformId: data.platform_id,
      platform: data.platform,
      profileData: data.profile_data,
      createdAt: data.created_at,
      lastLoginAt: data.last_login_at || undefined
    }
  }

  private static mapUserSettingsFromDb(data: Tables['user_settings']['Row']): UserSettings {
    return {
      id: data.id,
      minFollowerThreshold: data.min_follower_threshold,
      maxFollowingRatio: data.max_following_ratio,
      botDetectionEnabled: data.bot_detection_enabled,
      mutualOnlyMode: data.mutual_only_mode,
      emailNotifications: data.email_notifications,
      removalConfirmations: data.removal_confirmations,
      dataRetentionDays: data.data_retention_days
    }
  }

  private static mapFollowerFromDb(data: Tables['followers']['Row']): Follower {
    return {
      id: data.id,
      platformId: data.platform_id,
      username: data.username,
      displayName: data.display_name || undefined,
      bio: data.bio || undefined,
      avatarUrl: data.avatar_url || undefined,
      followerCount: data.follower_count,
      followingCount: data.following_count,
      isVerified: data.is_verified,
      isPrivate: data.is_private,
      isMutual: data.is_mutual,
      botScore: data.bot_score,
      lastAnalyzed: data.last_analyzed,
      createdAt: data.created_at
    }
  }

  private static mapRemovalFromDb(data: Tables['removals']['Row']): Removal {
    return {
      id: data.id,
      followerIds: data.follower_ids,
      reason: data.reason,
      count: data.count,
      timestamp: data.timestamp
    }
  }
}

// Local database - no external dependencies needed
export const localDatabase = {
  // This will be replaced by the actual local database service
  // when running in the browser environment
}

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          platform_id: string
          platform: 'twitter'
          access_token: string
          refresh_token: string | null
          profile_data: any | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          username: string
          platform_id: string
          platform: 'twitter'
          access_token: string
          refresh_token?: string | null
          profile_data?: any | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          platform_id?: string
          platform?: 'twitter'
          access_token?: string
          refresh_token?: string | null
          profile_data?: any | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          min_follower_threshold: number
          max_following_ratio: number
          bot_detection_enabled: boolean
          mutual_only_mode: boolean
          email_notifications: boolean
          removal_confirmations: boolean
          data_retention_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          min_follower_threshold?: number
          max_following_ratio?: number
          bot_detection_enabled?: boolean
          mutual_only_mode?: boolean
          email_notifications?: boolean
          removal_confirmations?: boolean
          data_retention_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          min_follower_threshold?: number
          max_following_ratio?: number
          bot_detection_enabled?: boolean
          mutual_only_mode?: boolean
          email_notifications?: boolean
          removal_confirmations?: boolean
          data_retention_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      followers: {
        Row: {
          id: string
          user_id: string
          platform_id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          follower_count: number
          following_count: number
          is_verified: boolean
          is_private: boolean
          is_mutual: boolean
          bot_score: number
          last_analyzed: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform_id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          follower_count: number
          following_count: number
          is_verified?: boolean
          is_private?: boolean
          is_mutual?: boolean
          bot_score?: number
          last_analyzed?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform_id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          follower_count?: number
          following_count?: number
          is_verified?: boolean
          is_private?: boolean
          is_mutual?: boolean
          bot_score?: number
          last_analyzed?: string
          created_at?: string
          updated_at?: string
        }
      }
      removals: {
        Row: {
          id: string
          user_id: string
          follower_ids: string[]
          reason: string
          count: number
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          follower_ids: string[]
          reason: string
          count: number
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          follower_ids?: string[]
          reason?: string
          count?: number
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

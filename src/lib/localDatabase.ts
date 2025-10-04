import { User, Follower, Removal, UserSettings } from '../types'

interface LocalDB {
  users: User[]
  followers: Follower[]
  removals: Removal[]
  userSettings: UserSettings[]
}

// In-memory database for Vercel serverless functions
let db: LocalDB = {
  users: [],
  followers: [],
  removals: [],
  userSettings: []
}

// Initialize with sample data
function initializeSampleData() {
  if (db.users.length === 0) {
    const sampleUser: User = {
      id: 'sample-user-1',
      username: 'testuser',
      platformId: '123456789',
      platform: 'twitter',
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      profileData: {
        displayName: 'Test User',
        avatarUrl: 'https://via.placeholder.com/150',
        bio: 'A test user for the follower manager app.',
        followerCount: 1500,
        followingCount: 300,
        isVerified: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }

    const sampleFollowers: Follower[] = [
      {
        id: 'follower-1',
        userId: 'sample-user-1',
        platformId: '987654321',
        username: 'bot_account_123',
        displayName: 'Bot Account',
        bio: 'Follow me for crypto tips!',
        avatarUrl: 'https://via.placeholder.com/50',
        followerCount: 10,
        followingCount: 1500,
        isVerified: false,
        isPrivate: false,
        isMutual: false,
        botScore: 0.95,
        lastAnalyzed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'follower-2',
        userId: 'sample-user-1',
        platformId: '112233445',
        username: 'mutual_friend',
        displayName: 'Mutual Friend',
        bio: 'Loves coding and coffee.',
        avatarUrl: 'https://via.placeholder.com/50',
        followerCount: 500,
        followingCount: 400,
        isVerified: false,
        isPrivate: false,
        isMutual: true,
        botScore: 0.1,
        lastAnalyzed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]

    const sampleSettings: UserSettings = {
      id: 'settings-1',
      userId: 'sample-user-1',
      minFollowerThreshold: 50,
      maxFollowingRatio: 5.0,
      botDetectionEnabled: true,
      mutualOnlyMode: false,
      emailNotifications: false,
      removalConfirmations: true,
      dataRetentionDays: 60,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.users.push(sampleUser)
    db.followers.push(...sampleFollowers)
    db.userSettings.push(sampleSettings)
  }
}

class LocalDatabaseService {
  constructor() {
    initializeSampleData()
  }

  // User operations
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    }
    db.users.push(newUser)
    return newUser
  }

  async getUserByPlatformId(platformId: string): Promise<User | undefined> {
    return db.users.find(user => user.platformId === platformId)
  }

  async getUserById(id: string): Promise<User | undefined> {
    return db.users.find(user => user.id === id)
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const userIndex = db.users.findIndex(user => user.id === id)
    if (userIndex === -1) return undefined
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return db.users[userIndex]
  }

  // Follower operations
  async getFollowers(userId: string, page: number, limit: number): Promise<{ data: Follower[], total: number }> {
    const userFollowers = db.followers.filter(f => f.userId === userId)
    const start = (page - 1) * limit
    const end = start + limit
    return {
      data: userFollowers.slice(start, end),
      total: userFollowers.length
    }
  }

  async deleteFollowers(userId: string, followerIds: string[]): Promise<void> {
    db.followers = db.followers.filter(f => !(f.userId === userId && followerIds.includes(f.id)))
  }

  // Removal operations
  async createRemoval(removalData: Omit<Removal, 'id' | 'timestamp'>): Promise<Removal> {
    const newRemoval: Removal = {
      id: `removal-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...removalData
    }
    db.removals.push(newRemoval)
    return newRemoval
  }

  async getRemovals(userId: string, page: number, limit: number): Promise<{ data: Removal[], total: number }> {
    const userRemovals = db.removals.filter(r => r.userId === userId)
    const start = (page - 1) * limit
    const end = start + limit
    return {
      data: userRemovals.slice(start, end),
      total: userRemovals.length
    }
  }

  // User Settings operations
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return db.userSettings.find(settings => settings.userId === userId)
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | undefined> {
    const settingsIndex = db.userSettings.findIndex(settings => settings.userId === userId)
    if (settingsIndex === -1) {
      // Create if not exists
      const newSettings: UserSettings = {
        id: `settings-${Date.now()}`,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        minFollowerThreshold: 100,
        maxFollowingRatio: 10.0,
        botDetectionEnabled: true,
        mutualOnlyMode: false,
        emailNotifications: false,
        removalConfirmations: true,
        dataRetentionDays: 30,
        ...updates
      }
      db.userSettings.push(newSettings)
      return newSettings
    }
    db.userSettings[settingsIndex] = {
      ...db.userSettings[settingsIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return db.userSettings[settingsIndex]
  }

  // Initialize sample data
  async initializeSampleData(): Promise<void> {
    initializeSampleData()
  }
}

export const localDatabase = new LocalDatabaseService()

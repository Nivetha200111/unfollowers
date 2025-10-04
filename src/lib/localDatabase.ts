import { User, Follower, UserSettings, Removal } from '../types'
import fs from 'fs'
import path from 'path'

interface DatabaseData {
  users: User[]
  followers: Follower[]
  userSettings: UserSettings[]
  removals: Removal[]
}

class LocalDatabase {
  private dbPath: string
  private data: DatabaseData

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'database.json')
    this.ensureDataDirectory()
    this.data = this.loadData()
  }

  private ensureDataDirectory() {
    const dataDir = path.dirname(this.dbPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8')
        return JSON.parse(fileContent)
      }
    } catch (error) {
      console.error('Error loading database:', error)
    }

    // Return empty database structure
    return {
      users: [],
      followers: [],
      userSettings: [],
      removals: []
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error('Error saving database:', error)
    }
  }

  // User operations
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date().toISOString()
    }
    
    this.data.users.push(user)
    this.saveData()
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.data.users.find(user => user.id === id) || null
  }

  async getUserByPlatformId(platformId: string): Promise<User | null> {
    return this.data.users.find(user => user.platformId === platformId) || null
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.data.users.findIndex(user => user.id === id)
    if (userIndex === -1) return null

    this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates }
    this.saveData()
    return this.data.users[userIndex]
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    return this.data.userSettings.find(settings => settings.id === userId) || null
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    let userSettings = await this.getUserSettings(userId)
    
    if (!userSettings) {
      userSettings = {
        id: userId,
        minFollowerThreshold: 100,
        maxFollowingRatio: 10,
        botDetectionEnabled: true,
        mutualOnlyMode: false,
        emailNotifications: false,
        removalConfirmations: true,
        dataRetentionDays: 30
      }
      this.data.userSettings.push(userSettings)
    } else {
      Object.assign(userSettings, settings)
    }
    
    this.saveData()
    return userSettings
  }

  // Follower operations
  async getFollowers(userId: string, page = 1, limit = 50): Promise<{
    data: Follower[]
    total: number
  }> {
    const userFollowers = this.data.followers.filter(f => f.userId === userId)
    const offset = (page - 1) * limit
    const paginatedFollowers = userFollowers.slice(offset, offset + limit)
    
    return {
      data: paginatedFollowers,
      total: userFollowers.length
    }
  }

  async upsertFollowers(userId: string, followers: Partial<Follower>[]): Promise<void> {
    followers.forEach(followerData => {
      const existingIndex = this.data.followers.findIndex(
        f => f.userId === userId && f.platformId === followerData.platformId
      )

      const follower: Follower = {
        id: existingIndex >= 0 ? this.data.followers[existingIndex].id : this.generateId(),
        userId,
        platformId: followerData.platformId!,
        username: followerData.username!,
        displayName: followerData.displayName,
        bio: followerData.bio,
        avatarUrl: followerData.avatarUrl,
        followerCount: followerData.followerCount || 0,
        followingCount: followerData.followingCount || 0,
        isVerified: followerData.isVerified || false,
        isPrivate: followerData.isPrivate || false,
        isMutual: followerData.isMutual || false,
        botScore: followerData.botScore || 0,
        lastAnalyzed: followerData.lastAnalyzed || new Date().toISOString(),
        createdAt: existingIndex >= 0 ? this.data.followers[existingIndex].createdAt : new Date().toISOString()
      }

      if (existingIndex >= 0) {
        this.data.followers[existingIndex] = follower
      } else {
        this.data.followers.push(follower)
      }
    })

    this.saveData()
  }

  async deleteFollowers(userId: string, followerIds: string[]): Promise<void> {
    this.data.followers = this.data.followers.filter(
      f => !(f.userId === userId && followerIds.includes(f.id))
    )
    this.saveData()
  }

  // Removal operations
  async createRemoval(removal: Omit<Removal, 'id' | 'timestamp'>): Promise<Removal> {
    const newRemoval: Removal = {
      id: this.generateId(),
      ...removal,
      timestamp: new Date().toISOString()
    }
    
    this.data.removals.push(newRemoval)
    this.saveData()
    return newRemoval
  }

  async getRemovals(userId: string, page = 1, limit = 20): Promise<{
    data: Removal[]
    total: number
  }> {
    const userRemovals = this.data.removals.filter(r => r.userId === userId)
    const offset = (page - 1) * limit
    const paginatedRemovals = userRemovals.slice(offset, offset + limit)
    
    return {
      data: paginatedRemovals,
      total: userRemovals.length
    }
  }

  // Analytics functions
  async getUserStats(userId: string) {
    const followers = this.data.followers.filter(f => f.userId === userId)
    const removals = this.data.removals.filter(r => r.userId === userId)

    return {
      totalFollowers: followers.length,
      mutualFollowers: followers.filter(f => f.isMutual).length,
      nonMutualFollowers: followers.filter(f => !f.isMutual).length,
      verifiedFollowers: followers.filter(f => f.isVerified).length,
      botFollowers: followers.filter(f => f.botScore > 0.6).length,
      totalRemovals: removals.reduce((sum, r) => sum + r.count, 0)
    }
  }

  async getFollowerAnalytics(userId: string, daysBack = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    const followers = this.data.followers.filter(f => 
      f.userId === userId && new Date(f.createdAt) >= cutoffDate
    )
    const removals = this.data.removals.filter(r => 
      r.userId === userId && new Date(r.timestamp) >= cutoffDate
    )

    // Group by date
    const dailyData: { [key: string]: { added: number; removed: number } } = {}

    followers.forEach(f => {
      const date = f.createdAt.split('T')[0]
      if (!dailyData[date]) dailyData[date] = { added: 0, removed: 0 }
      dailyData[date].added++
    })

    removals.forEach(r => {
      const date = r.timestamp.split('T')[0]
      if (!dailyData[date]) dailyData[date] = { added: 0, removed: 0 }
      dailyData[date].removed += r.count
    })

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      followersAdded: data.added,
      followersRemoved: data.removed,
      netChange: data.added - data.removed
    }))
  }

  // Utility functions
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Initialize with sample data
  async initializeSampleData() {
    if (this.data.users.length === 0) {
      const testUser = await this.createUser({
        username: 'test_user',
        platformId: '123456789',
        platform: 'twitter',
        accessToken: 'sample_token',
        profileData: {
          displayName: 'Test User',
          followerCount: 1000,
          followingCount: 500,
          isVerified: false
        }
      })

      await this.updateUserSettings(testUser.id, {
        minFollowerThreshold: 100,
        botDetectionEnabled: true
      })

      // Add some sample followers
      const sampleFollowers: Partial<Follower>[] = [
        {
          platformId: 'f1',
          username: 'john_doe',
          displayName: 'John Doe',
          bio: 'Software developer',
          followerCount: 1500,
          followingCount: 300,
          isVerified: false,
          isMutual: false,
          botScore: 0.2
        },
        {
          platformId: 'f2',
          username: 'jane_smith',
          displayName: 'Jane Smith',
          bio: 'Designer and artist',
          followerCount: 800,
          followingCount: 200,
          isVerified: true,
          isMutual: true,
          botScore: 0.1
        },
        {
          platformId: 'f3',
          username: 'bot_user123',
          displayName: 'Bot User',
          bio: 'Follow me back!',
          followerCount: 50,
          followingCount: 5000,
          isVerified: false,
          isMutual: false,
          botScore: 0.9
        }
      ]

      await this.upsertFollowers(testUser.id, sampleFollowers)
    }
  }
}

export const localDatabase = new LocalDatabase()

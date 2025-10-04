import { Follower, BotDetectionResult } from '../types'

export class BotDetector {
  private static readonly BOT_PATTERNS = {
    // Username patterns that suggest bots
    usernamePatterns: [
      /^[a-z]+\d{4,}$/i, // username1234
      /^\d+[a-z]+\d+$/i, // 123username456
      /^[a-z]{2,}\d{2,}[a-z]{2,}$/i, // ab12cd
      /^[a-z]+\d+[a-z]+$/i, // user123name
      /^[a-z]{1,2}\d{6,}$/i, // a1234567
      /^\d{8,}$/, // 12345678
      /^[a-z]+\d{3,}[a-z]+\d{3,}$/i, // user123name456
    ],
    
    // Bio patterns that suggest bots
    bioPatterns: [
      /follow.*back/i,
      /follow.*me/i,
      /dm.*me/i,
      /link.*bio/i,
      /check.*bio/i,
      /click.*link/i,
      /promote.*your/i,
      /buy.*followers/i,
      /increase.*followers/i,
    ],
    
    // Suspicious words
    suspiciousWords: [
      'bot', 'spam', 'fake', 'promote', 'marketing',
      'business', 'dm', 'link', 'bio', 'followback',
      'f4f', 'l4l', 'follow4follow', 'like4like'
    ]
  }

  static detectBot(follower: Follower): BotDetectionResult {
    const reasons: string[] = []
    let score = 0

    // Check username patterns
    const usernameScore = this.checkUsernamePatterns(follower.username)
    if (usernameScore > 0) {
      score += usernameScore
      reasons.push('Suspicious username pattern')
    }

    // Check bio patterns
    if (follower.bio) {
      const bioScore = this.checkBioPatterns(follower.bio)
      if (bioScore > 0) {
        score += bioScore
        reasons.push('Suspicious bio content')
      }
    }

    // Check follower/following ratio
    const ratioScore = this.checkFollowerFollowingRatio(follower)
    if (ratioScore > 0) {
      score += ratioScore
      reasons.push('Unusual follower/following ratio')
    }

    // Check account age vs activity
    const ageScore = this.checkAccountAge(follower)
    if (ageScore > 0) {
      score += ageScore
      reasons.push('Suspicious account age vs activity')
    }

    // Check for default avatar (if we can detect it)
    const avatarScore = this.checkAvatar(follower.avatarUrl)
    if (avatarScore > 0) {
      score += avatarScore
      reasons.push('Default or suspicious avatar')
    }

    // Check for verification status
    if (!follower.isVerified && follower.followerCount > 10000) {
      score += 0.1
      reasons.push('High follower count without verification')
    }

    // Normalize score to 0-1 range
    const normalizedScore = Math.min(score, 1)
    const isBot = normalizedScore > 0.6

    return {
      score: normalizedScore,
      reasons,
      isBot
    }
  }

  private static checkUsernamePatterns(username: string): number {
    for (const pattern of this.BOT_PATTERNS.usernamePatterns) {
      if (pattern.test(username)) {
        return 0.3
      }
    }
    return 0
  }

  private static checkBioPatterns(bio: string): number {
    let score = 0
    
    // Check for pattern matches
    for (const pattern of this.BOT_PATTERNS.bioPatterns) {
      if (pattern.test(bio)) {
        score += 0.2
      }
    }

    // Check for suspicious words
    const bioLower = bio.toLowerCase()
    for (const word of this.BOT_PATTERNS.suspiciousWords) {
      if (bioLower.includes(word)) {
        score += 0.1
      }
    }

    // Check for excessive emojis
    const emojiCount = (bio.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length
    if (emojiCount > 5) {
      score += 0.1
    }

    return Math.min(score, 0.4)
  }

  private static checkFollowerFollowingRatio(follower: Follower): number {
    const { followerCount, followingCount } = follower
    
    if (followingCount === 0) return 0

    const ratio = followerCount / followingCount

    // Very high ratio (many followers, few following) - could be bot
    if (ratio > 50) return 0.3
    
    // Very low ratio (few followers, many following) - could be bot
    if (ratio < 0.01 && followingCount > 1000) return 0.2

    // Following way more than followers (follow/unfollow bot)
    if (followingCount > followerCount * 10 && followingCount > 500) return 0.2

    return 0
  }

  private static checkAccountAge(follower: Follower): number {
    // This would need actual account creation date from the platform
    // For now, we'll use a placeholder based on follower count
    const { followerCount, followingCount } = follower
    
    // New account with high activity
    if (followerCount > 1000 && followingCount > 500) {
      return 0.2
    }

    return 0
  }

  private static checkAvatar(avatarUrl?: string): number {
    if (!avatarUrl) return 0.2

    // Check for default avatars (this would need platform-specific logic)
    const defaultAvatarPatterns = [
      /default.*avatar/i,
      /profile.*default/i,
      /avatar.*default/i
    ]

    for (const pattern of defaultAvatarPatterns) {
      if (pattern.test(avatarUrl)) {
        return 0.2
      }
    }

    return 0
  }

  static getBotScoreDescription(score: number): string {
    if (score < 0.2) return 'Very unlikely to be a bot'
    if (score < 0.4) return 'Low bot probability'
    if (score < 0.6) return 'Moderate bot probability'
    if (score < 0.8) return 'High bot probability'
    return 'Very likely to be a bot'
  }

  static getBotScoreColor(score: number): string {
    if (score < 0.2) return 'text-green-600'
    if (score < 0.4) return 'text-yellow-600'
    if (score < 0.6) return 'text-orange-600'
    if (score < 0.8) return 'text-red-600'
    return 'text-red-800'
  }
}

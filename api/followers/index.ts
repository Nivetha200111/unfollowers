import { VercelRequest, VercelResponse } from '@vercel/node'
import { withAuth, handleCors, corsHeaders } from '../_middleware'

async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { page = 1, limit = 50 } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    // Check if this is a mock token (bypass auth)
    const authHeader = req.headers.authorization
    const isMockAuth = authHeader?.includes('mock-token')

    let followers = []
    let total = 0

    if (isMockAuth || !authHeader) {
      // Generate mock followers for testing
      console.log('[FOLLOWERS] Using mock data')
      const allMockFollowers = generateMockFollowers(100)
      const start = (pageNum - 1) * limitNum
      const end = start + limitNum
      followers = allMockFollowers.slice(start, end)
      total = allMockFollowers.length
    } else {
      // Real auth - use database
      console.log('[FOLLOWERS] Using real database')
      const { localDatabase } = await import('../../src/lib/localDatabase')
      const userId = (req as any).user?.id || 'mock-user'
      const result = await localDatabase.getFollowers(userId, pageNum, limitNum)
      followers = result.data
      total = result.total
    }
    
    const totalPages = Math.ceil(total / limitNum)
    
    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    
    res.status(200).json({
      success: true,
      data: {
        data: followers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    })

  } catch (error) {
    console.error('[FOLLOWERS] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch followers'
    })
  }
}

export default handler

function generateMockFollowers(count: number) {
  const followers = []
  const usernames = [
    'john_doe', 'jane_smith', 'alex_wilson', 'sarah_jones', 'mike_brown',
    'emma_davis', 'chris_taylor', 'lisa_anderson', 'david_miller', 'anna_garcia',
    'bot_user123', 'spam_account', 'fake_profile', 'test_user', 'demo_account'
  ]

  for (let i = 0; i < count; i++) {
    const username = usernames[i % usernames.length] + (i > usernames.length ? `_${i}` : '')
    const followerCount = Math.floor(Math.random() * 10000) + 10
    const followingCount = Math.floor(Math.random() * 5000) + 5
    const botScore = Math.random()
    const now = new Date().toISOString()
    const pastDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    
    followers.push({
      id: `follower_${i}`,
      userId: 'mock-user',
      platformId: `platform_${i}`,
      username,
      displayName: username.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      bio: i % 3 === 0 ? 'This is a sample bio for demonstration purposes.' : '',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      followerCount,
      followingCount,
      isVerified: i % 10 === 0,
      isPrivate: i % 5 === 0,
      isMutual: i % 4 === 0,
      botScore,
      lastAnalyzed: now,
      createdAt: pastDate,
      updatedAt: now
    })
  }

  return followers
}

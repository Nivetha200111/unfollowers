import { VercelRequest, VercelResponse } from '@vercel/node'
import { withAuth, handleCors, corsHeaders } from '../_middleware'

export default withAuth(async (req, res) => {
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

    // Import the local database service
    const { localDatabase } = await import('../../src/lib/localDatabase')
    
    // Fetch followers from local database
    const result = await localDatabase.getFollowers(req.user!.id, pageNum, limitNum)
    
    const totalPages = Math.ceil(result.total / limitNum)
    
    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    
    res.status(200).json({
      success: true,
      data: {
        data: result.data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    })

  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch followers'
    })
  }
})

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
    
    followers.push({
      id: `follower_${i}`,
      platformId: `platform_${i}`,
      username,
      displayName: username.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      bio: i % 3 === 0 ? 'This is a sample bio for demonstration purposes.' : null,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      followerCount,
      followingCount,
      isVerified: i % 10 === 0,
      isPrivate: i % 5 === 0,
      isMutual: i % 4 === 0,
      botScore,
      lastAnalyzed: new Date().toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  return followers
}

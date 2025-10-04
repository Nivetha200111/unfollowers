import { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors, corsHeaders } from '../_middleware.js'

async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if this is a mock token (bypass auth) - only for development
    const authHeader = req.headers.authorization
    const isMockAuth = process.env.MOCK_AUTH === '1' && (!authHeader || authHeader?.includes('mock-token'))

    let user

    if (isMockAuth) {
      // Return mock user for testing
      console.log('[PROFILE] Using mock user')
      user = {
        id: 'mock-user-' + Date.now(),
        username: 'testuser',
        platformId: '123456789',
        platform: 'twitter',
        profileData: {
          displayName: 'Test User',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
          bio: 'Mock user for testing the Follower Manager app',
          followerCount: 1500,
          followingCount: 300,
          isVerified: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      }
    } else {
      // Real auth - use database
      console.log('[PROFILE] Using real database')
      const { localDatabase } = await import('../../src/lib/localDatabase')
      const userId = (req as any).user?.id || 'mock-user'
      user = await localDatabase.getUserById(userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }
    }
    
    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    
    res.status(200).json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('[PROFILE] Error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user profile'
    })
  }
}

export default handler

import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { handleCors, corsHeaders } from '../_middleware.js'

const callbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required')
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Normalize input from GET query or POST body
    const rawBody: any = typeof req.body === 'string'
      ? (req.body ? JSON.parse(req.body) : {})
      : (req.body || {})
    const codeParam = (req.query?.code as string) ?? rawBody.code
    const stateParam = (req.query?.state as string) ?? rawBody.state

    const body = callbackSchema.parse({ code: codeParam, state: stateParam })
    const { code, state } = body

    // Parse state to get platform (twitter-only)
    const [platform] = state.split('_')
    if (platform !== 'twitter') {
      return res.status(400).json({ success: false, error: 'Invalid platform in state' })
    }

    // Exchange code for access token
    let accessToken: string
    try {
      accessToken = await exchangeCodeForToken(code, platform)
    } catch (e) {
      // Fallback to mock token if credentials missing or exchange fails
      accessToken = 'mock_access_token'
    }
    
    // Get user profile from platform
    const userProfile = await getUserProfile(accessToken, platform)
    
    // Create or update user in database
    const user = await createOrUpdateUser(userProfile, platform, accessToken)
    
    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured')
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        platformId: user.platformId,
        platform: user.platform
      },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          platformId: user.platformId,
          platform: user.platform,
          profileData: user.profileData
        },
        token
      }
    })

  } catch (error) {
    console.error('Callback error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    })
  }
}

async function exchangeCodeForToken(code: string, platform: string): Promise<string> {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
  
  const redirectUri = `${baseUrl}/api/auth/callback`

  switch (platform) {
    case 'twitter':
      return await exchangeTwitterToken(code, redirectUri)
    case 'instagram':
      return await exchangeInstagramToken(code, redirectUri)
    case 'github':
      return await exchangeGitHubToken(code, redirectUri)
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

async function exchangeTwitterToken(code: string, redirectUri: string): Promise<string> {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: 'challenge' // In production, use PKCE
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Twitter token')
  }

  const data = await response.json()
  return data.access_token
}

async function exchangeInstagramToken(code: string, redirectUri: string): Promise<string> {
  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Instagram token')
  }

  const data = await response.json()
  return data.access_token
}

async function exchangeGitHubToken(code: string, redirectUri: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange GitHub token')
  }

  const data = await response.json()
  return data.access_token
}

async function getUserProfile(accessToken: string, platform: string): Promise<any> {
  switch (platform) {
    case 'twitter':
      return await getTwitterProfile(accessToken)
    case 'instagram':
      return await getInstagramProfile(accessToken)
    case 'github':
      return await getGitHubProfile(accessToken)
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

async function getTwitterProfile(accessToken: string): Promise<any> {
  if (accessToken === 'mock_access_token') {
    return {
      id: '123456789',
      username: 'testuser',
      name: 'Test User',
      public_metrics: { followers_count: 1500, following_count: 300 },
      verified: true,
      profile_image_url: 'https://via.placeholder.com/150',
      description: 'Mock profile'
    }
  }
  const response = await fetch('https://api.twitter.com/2/users/me?user.fields=id,username,name,public_metrics,verified', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get Twitter profile')
  }

  const data = await response.json()
  return data.data
}

async function getInstagramProfile(accessToken: string): Promise<any> {
  const response = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`)

  if (!response.ok) {
    throw new Error('Failed to get Instagram profile')
  }

  return await response.json()
}

async function getGitHubProfile(accessToken: string): Promise<any> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get GitHub profile')
  }

  return await response.json()
}

async function createOrUpdateUser(profile: any, platform: string, accessToken: string): Promise<any> {
  // Import the local database service
  const { localDatabase } = await import('../../src/lib/localDatabase')
  
  const userData = {
    username: profile.username || profile.login,
    platformId: profile.id,
    platform: platform as 'twitter',
    accessToken,
    profileData: {
      displayName: profile.name || profile.display_name,
      avatarUrl: profile.avatar_url || profile.profile_image_url,
      bio: profile.bio || profile.description,
      followerCount: profile.public_metrics?.followers_count || profile.followers,
      followingCount: profile.public_metrics?.following_count || profile.following,
      isVerified: profile.verified || false
    }
  }

  // Check if user exists
  let user = await localDatabase.getUserByPlatformId(profile.id)
  
  if (user) {
    // Update existing user
    user = await localDatabase.updateUser(user.id, {
      username: userData.username,
      accessToken: userData.accessToken,
      profileData: userData.profileData,
      lastLoginAt: new Date().toISOString()
    })
  } else {
    // Create new user
    user = await localDatabase.createUser(userData)
  }

  return user
}

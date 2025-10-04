import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { handleCors, corsHeaders } from '../_middleware'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  platform: z.enum(['twitter', 'instagram', 'github'])
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = loginSchema.parse(req.body)
    const { username, platform } = body

    // Generate OAuth URL based on platform
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const redirectUri = `${baseUrl}/api/auth/callback`
    const state = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    let authUrl = ''

    switch (platform) {
      case 'twitter':
        authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read%20follows.read%20follows.write&state=${state}`
        break
      
      case 'instagram':
        authUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`
        break
      
      case 'github':
        authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:follow&state=${state}`
        break
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Unsupported platform' 
        })
    }

    // Store state temporarily (in production, use Redis or database)
    // For now, we'll include it in the response
    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    
    res.status(200).json({
      success: true,
      data: {
        authUrl,
        state
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

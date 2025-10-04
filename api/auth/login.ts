import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { handleCors, corsHeaders } from '../_middleware'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  platform: z.literal('twitter')
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('[LOGIN] Request received:', { method: req.method, headers: req.headers, body: req.body })

  try {
    // Vercel may provide body as string or object; normalize it
    let rawBody: any = {}
    try {
      rawBody = typeof req.body === 'string'
        ? (req.body ? JSON.parse(req.body) : {})
        : (req.body || {})
    } catch (parseError) {
      console.error('[LOGIN] Body parse error:', parseError)
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON in request body'
      })
    }

    // Force platform to twitter and validate username
    const username = String(rawBody.username || 'testuser').trim()
    const platform: 'twitter' = 'twitter'

    console.log('[LOGIN] Parsed data:', { username, platform })

    // Basic username validation
    if (!username || username.length < 3) {
      console.log('[LOGIN] Username validation failed:', username)
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters'
      })
    }

    // Generate OAuth URL based on platform
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const redirectUri = `${baseUrl}/api/auth/callback`
    const state = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    let authUrl = ''

    // Twitter/X OAuth
    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
      console.error('[LOGIN] Missing Twitter credentials')
      return res.status(500).json({
        success: false,
        error: 'Twitter API credentials not configured. Please set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET in environment variables.'
      })
    }
    
    console.log('[LOGIN] Using real Twitter OAuth')
    authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read%20follows.read%20follows.write&state=${state}`

    console.log('[LOGIN] Generated authUrl:', authUrl.substring(0, 100) + '...')

    // Store state temporarily (in production, use Redis or database)
    // For now, we'll include it in the response
    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    res.setHeader('X-API-Version', '2.0')
    
    console.log('[LOGIN] Success! Returning response')
    
    return res.status(200).json({
      success: true,
      data: {
        authUrl,
        state
      }
    })

  } catch (error) {
    console.error('Login API error:', error)
    console.error('Request body:', req.body)
    console.error('ENV CHECK - TWITTER_CLIENT_ID exists:', !!process.env.TWITTER_CLIENT_ID)
    console.error('ENV CHECK - TWITTER_CLIENT_SECRET exists:', !!process.env.TWITTER_CLIENT_SECRET)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: ' + error.errors.map(e => e.message).join(', '),
        details: error.errors
      })
    }

    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('Sending error response:', errorMessage)
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}

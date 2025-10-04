import { VercelRequest, VercelResponse } from '@vercel/node'

// v5.0 - Completely rebuilt without any dependencies
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('[LOGIN v5.0] Handler started')
    console.log('[LOGIN] Request body:', req.body)

    // Parse body
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

    // Get username
    const username = String(rawBody.username || 'testuser').trim()
    console.log('[LOGIN] Username:', username)

    // Validate username
    if (!username || username.length < 3) {
      console.log('[LOGIN] Username validation failed:', username)
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters'
      })
    }

    // Check Twitter credentials
    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
      console.error('[LOGIN] Missing Twitter credentials')
      console.error('[LOGIN] TWITTER_CLIENT_ID exists:', !!process.env.TWITTER_CLIENT_ID)
      console.error('[LOGIN] TWITTER_CLIENT_SECRET exists:', !!process.env.TWITTER_CLIENT_SECRET)
      return res.status(500).json({
        success: false,
        error: 'Twitter API credentials not configured',
        debug: {
          clientIdExists: !!process.env.TWITTER_CLIENT_ID,
          clientSecretExists: !!process.env.TWITTER_CLIENT_SECRET
        }
      })
    }

    // Generate OAuth URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const redirectUri = `${baseUrl}/api/auth/callback`
    const state = `twitter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read%20follows.read%20follows.write&state=${state}`

    console.log('[LOGIN] Success! Returning authUrl')
    
    return res.status(200).json({
      success: true,
      data: {
        authUrl,
        state
      }
    })

  } catch (error: any) {
    console.error('[LOGIN] Catch block error:', error)
    console.error('[LOGIN] Error message:', error?.message)
    console.error('[LOGIN] Error stack:', error?.stack)
    
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error',
      stack: error?.stack
    })
  }
}

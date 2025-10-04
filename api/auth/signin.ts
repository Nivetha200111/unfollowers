// Renamed from login.ts to force Vercel to rebuild completely
export default async function handler(req: any, res: any) {
  try {
    console.log('[SIGNIN v1.0] New endpoint - no cache')
    
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Parse body
    let body: any = {}
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    } catch (e) {
      body = {}
    }

    const username = body.username || 'testuser'
    
    // Check env vars
    if (!process.env.TWITTER_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        error: 'Twitter credentials not configured'
      })
    }
    
    // Generate OAuth URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const redirectUri = `${baseUrl}/api/auth/callback`
    const state = `twitter_${Date.now()}`
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read%20follows.read%20follows.write&state=${state}`
    
    console.log('[SIGNIN] Success for user:', username)
    
    return res.status(200).json({
      success: true,
      data: { authUrl, state }
    })
  } catch (err: any) {
    console.error('[SIGNIN] Error:', err)
    return res.status(500).json({ 
      success: false,
      error: err?.message || 'Internal error' 
    })
  }
}


import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow in development or with a secret key
  const isDev = process.env.NODE_ENV === 'development'
  const hasSecret = req.query.secret === process.env.JWT_SECRET
  
  if (!isDev && !hasSecret) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'not set',
    vercel: {
      url: process.env.VERCEL_URL || 'not set',
      env: process.env.VERCEL_ENV || 'not set',
    },
    twitter: {
      clientIdExists: !!process.env.TWITTER_CLIENT_ID,
      clientIdLength: process.env.TWITTER_CLIENT_ID?.length || 0,
      clientIdPrefix: process.env.TWITTER_CLIENT_ID?.substring(0, 10) || 'not set',
      clientSecretExists: !!process.env.TWITTER_CLIENT_SECRET,
      clientSecretLength: process.env.TWITTER_CLIENT_SECRET?.length || 0,
      clientSecretPrefix: process.env.TWITTER_CLIENT_SECRET?.substring(0, 10) || 'not set',
    },
    security: {
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
    },
    test: {
      canGenerateAuthUrl: false,
      error: null as string | null,
    }
  }

  // Test if we can generate an auth URL
  try {
    if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000'
      const redirectUri = `${baseUrl}/api/auth/callback`
      const state = `twitter_${Date.now()}_test`
      const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read%20follows.read%20follows.write&state=${state}`
      
      diagnostics.test.canGenerateAuthUrl = true
      diagnostics.test.error = null
    } else {
      diagnostics.test.error = 'Missing Twitter credentials'
    }
  } catch (error) {
    diagnostics.test.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return res.status(200).json({
    success: true,
    diagnostics
  })
}


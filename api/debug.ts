export default async function handler(req: any, res: any) {
  try {
    // Temporarily public for debugging - REMOVE THIS IN PRODUCTION
    // const hasSecret = req.query.secret === process.env.JWT_SECRET
    // if (!hasSecret) {
    //   return res.status(403).json({ error: 'Forbidden - invalid secret' })
    // }

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
      allEnvKeys: Object.keys(process.env).filter(k => 
        k.includes('TWITTER') || k.includes('JWT') || k.includes('VERCEL')
      )
    }

    return res.status(200).json({
      success: true,
      diagnostics
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Unknown error',
      stack: error?.stack
    })
  }
}


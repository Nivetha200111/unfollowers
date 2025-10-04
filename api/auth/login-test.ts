import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[LOGIN-TEST] Handler called')
    
    return res.status(200).json({
      success: true,
      message: 'Login test endpoint working',
      env: {
        twitterClientId: !!process.env.TWITTER_CLIENT_ID,
        twitterSecret: !!process.env.TWITTER_CLIENT_SECRET,
        jwtSecret: !!process.env.JWT_SECRET
      }
    })
  } catch (error: any) {
    console.error('[LOGIN-TEST] Error:', error)
    return res.status(500).json({
      error: error?.message || 'Unknown error',
      stack: error?.stack
    })
  }
}


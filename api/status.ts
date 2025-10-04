import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    res.status(200).json({
      success: true,
      message: 'Follower Manager API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'API error'
    })
  }
}

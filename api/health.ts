import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }

    res.status(200).json(health)
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({ 
      status: 'error',
      error: 'Internal server error'
    })
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node'
import { withAuth, handleCors, corsHeaders } from '../_middleware'

export default withAuth(async (req, res) => {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Import the local database service
    const { localDatabase } = await import('../../src/lib/localDatabase')
    
    // Get user profile
    const user = await localDatabase.getUserById(req.user!.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }
    
    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    
    res.status(200).json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    })
  }
})

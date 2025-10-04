import { VercelRequest, VercelResponse } from '@vercel/node'
import { withAuth, handleCors, corsHeaders } from '../_middleware.js'

export default withAuth(async (req, res) => {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { page = 1, limit = 20 } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)

    // Import the local database service
    const { localDatabase } = await import('../../src/lib/localDatabase')
    
    // Fetch removal history from local database
    const result = await localDatabase.getRemovals(req.user!.id, pageNum, limitNum)
    
    const totalPages = Math.ceil(result.total / limitNum)
    
    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    
    res.status(200).json({
      success: true,
      data: {
        data: result.data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    })

  } catch (error) {
    console.error('Get removal history error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch removal history'
    })
  }
})

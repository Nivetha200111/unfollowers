import { VercelRequest, VercelResponse } from '@vercel/node'
import { localDatabase } from '../../src/lib/localDatabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Initialize the database with sample data
    await localDatabase.initializeSampleData()
    
    res.status(200).json({
      success: true,
      message: 'Database initialized successfully'
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database'
    })
  }
}

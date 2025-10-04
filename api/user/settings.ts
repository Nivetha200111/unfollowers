import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { withAuth, handleCors, corsHeaders } from '../_middleware'

const settingsSchema = z.object({
  minFollowerThreshold: z.number().min(0).max(10000000).optional(),
  maxFollowingRatio: z.number().min(0).max(1000).optional(),
  botDetectionEnabled: z.boolean().optional(),
  mutualOnlyMode: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  removalConfirmations: z.boolean().optional(),
  dataRetentionDays: z.number().min(1).max(365).optional()
})

export default withAuth(async (req, res) => {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  try {
    // Import the local database service
    const { localDatabase } = await import('../../src/lib/localDatabase')

    if (req.method === 'GET') {
      // Get user settings
      const settings = await localDatabase.getUserSettings(req.user!.id)
      
      res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
      res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
      res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
      
      res.status(200).json({
        success: true,
        data: settings
      })

    } else if (req.method === 'PUT') {
      // Update user settings
      const body = settingsSchema.parse(req.body)
      
      const settings = await localDatabase.updateUserSettings(req.user!.id, body)
      
      res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
      res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
      res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
      
      res.status(200).json({
        success: true,
        data: settings
      })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('User settings error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid settings data',
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process user settings'
    })
  }
})

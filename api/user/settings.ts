import { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { handleCors, corsHeaders } from '../_middleware'

const settingsSchema = z.object({
  minFollowerThreshold: z.number().min(0).max(10000000).optional(),
  maxFollowingRatio: z.number().min(0).max(1000).optional(),
  botDetectionEnabled: z.boolean().optional(),
  mutualOnlyMode: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  removalConfirmations: z.boolean().optional(),
  dataRetentionDays: z.number().min(1).max(365).optional()
})

async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  handleCors(req, res)
  if (req.method === 'OPTIONS') return

  try {
    // Check if this is a mock token (bypass auth) - only for development
    const authHeader = req.headers.authorization
    const isMockAuth = process.env.MOCK_AUTH === '1' && (!authHeader || authHeader?.includes('mock-token'))

    if (req.method === 'GET') {
      let settings

      if (isMockAuth) {
        // Return mock settings for testing
        console.log('[SETTINGS] Using mock settings')
        settings = {
          id: 'mock-settings-' + Date.now(),
          userId: 'mock-user',
          minFollowerThreshold: 100,
          maxFollowingRatio: 10.0,
          botDetectionEnabled: true,
          mutualOnlyMode: false,
          emailNotifications: false,
          removalConfirmations: true,
          dataRetentionDays: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      } else {
        // Real auth - use database
        console.log('[SETTINGS] Using real database')
        const { localDatabase } = await import('../../src/lib/localDatabase')
        const userId = (req as any).user?.id || 'mock-user'
        settings = await localDatabase.getUserSettings(userId)
      }
      
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
      
      if (isMockAuth) {
        // Mock update - just return the updated settings
        console.log('[SETTINGS] Mock update')
        const settings = {
          id: 'mock-settings-' + Date.now(),
          userId: 'mock-user',
          minFollowerThreshold: 100,
          maxFollowingRatio: 10.0,
          botDetectionEnabled: true,
          mutualOnlyMode: false,
          emailNotifications: false,
          removalConfirmations: true,
          dataRetentionDays: 30,
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
        res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
        res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
        
        return res.status(200).json({
          success: true,
          data: settings
        })
      }

      // Real auth - use database
      const { localDatabase } = await import('../../src/lib/localDatabase')
      const userId = (req as any).user?.id || 'mock-user'
      const settings = await localDatabase.updateUserSettings(userId, body)
      
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
    console.error('[SETTINGS] Error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid settings data',
        details: error.errors
      })
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process user settings'
    })
  }
}

export default handler

import { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string
    username: string
    platformId: string
    platform: string
  }
}

export async function verifyAuth(req: VercelRequest): Promise<AuthenticatedRequest['user'] | null> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET

    if (!secret) {
      console.error('JWT_SECRET not configured')
      return null
    }

    const decoded = jwt.verify(token, secret) as any
    return {
      id: decoded.id,
      username: decoded.username,
      platformId: decoded.platformId,
      platform: decoded.platform
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export function withAuth(handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const user = await verifyAuth(req)
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      })
    }

    ;(req as AuthenticatedRequest).user = user
    return handler(req as AuthenticatedRequest, res)
  }
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.vercel.app' 
      : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}

export function handleCors(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders()['Access-Control-Allow-Origin'])
    res.setHeader('Access-Control-Allow-Methods', corsHeaders()['Access-Control-Allow-Methods'])
    res.setHeader('Access-Control-Allow-Headers', corsHeaders()['Access-Control-Allow-Headers'])
    res.setHeader('Access-Control-Max-Age', corsHeaders()['Access-Control-Max-Age'])
    return res.status(200).end()
  }
}

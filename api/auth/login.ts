export default async function handler(req: any, res: any) {
  try {
    console.log('[LOGIN v6.0] Ultra-minimal version')
    
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    return res.status(200).json({
      success: true,
      data: {
        authUrl: 'https://twitter.com/oauth/authorize',
        state: 'test123'
      }
    })
  } catch (err: any) {
    console.error('[LOGIN] Error:', err)
    return res.status(500).json({ error: err?.message || 'Error' })
  }
}

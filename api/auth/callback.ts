// Simplified callback endpoint
export default async function handler(req: any, res: any) {
  try {
    console.log('[CALLBACK] New endpoint')
    
    res.setHeader('Access-Control-Allow-Origin', '*')
    
    // For now, just return success - we'll implement proper OAuth later
    return res.status(200).json({
      success: true,
      message: 'Callback endpoint working'
    })
  } catch (err: any) {
    console.error('[CALLBACK] Error:', err)
    return res.status(500).json({ error: err?.message })
  }
}

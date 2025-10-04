// V2 callback endpoint
export default async function handler(req: any, res: any) {
  try {
    console.log('[V2-CALLBACK] New endpoint')
    
    res.setHeader('Access-Control-Allow-Origin', '*')
    
    return res.status(200).json({
      success: true,
      message: 'V2 Callback endpoint working'
    })
  } catch (err: any) {
    console.error('[V2-CALLBACK] Error:', err)
    return res.status(500).json({ error: err?.message })
  }
}


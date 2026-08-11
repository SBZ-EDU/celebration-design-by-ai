const BALE_API = 'https://tapi.bale.ai'

export const onRequestGet: PagesFunction<{
  BALE_BOT_TOKEN: string
}> = async (ctx) => {
  const token = ctx.env.BALE_BOT_TOKEN || '1052722541:R0H9EREIksYMbiNMWA-z7dqjmbrA4T6HFCU'
  const results: any = {}
  
  try {
    const meRes = await fetch(`${BALE_API}/bot${token}/getMe`)
    const txt = await meRes.text()
    try { results.getMe = JSON.parse(txt) } catch { results.getMe = {raw: txt} }
  } catch (e:any) {
    results.getMeError = e.message
  }

  try {
    const whRes = await fetch(`${BALE_API}/bot${token}/getWebhookInfo`)
    const txt = await whRes.text()
    try { results.webhookInfo = JSON.parse(txt) } catch { results.webhookInfo = {raw: txt} }
  } catch (e:any) {
    results.webhookError = e.message
  }

  try {
    const setRes = await fetch(`${BALE_API}/bot${token}/setWebhook`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({url: 'https://celebration-design-by-ai.pages.dev/api/bale-webhook'})
    })
    const txt = await setRes.text()
    try { results.setWebhook = JSON.parse(txt) } catch { results.setWebhook = {raw: txt} }
  } catch (e:any) {
    results.setWebhookError = e.message
  }

  return new Response(JSON.stringify(results, null, 2), {headers:{'Content-Type':'application/json'}})
}

export const onRequestPost: PagesFunction<{
  BALE_BOT_TOKEN: string
}> = async (ctx) => {
  const token = ctx.env.BALE_BOT_TOKEN || '1052722541:R0H9EREIksYMbiNMWA-z7dqjmbrA4T6HFCU'
  const body = await ctx.request.json().catch(()=>({})) as any
  const chatId = body.chat_id || body.chatId
  const text = body.text || 'Test from status endpoint'

  if(!chatId) {
    return new Response(JSON.stringify({error: 'need chat_id and text'}), {status:400, headers:{'Content-Type':'application/json'}})
  }

  try {
    const res = await fetch(`${BALE_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: chatId, text})
    })
    const txt = await res.text()
    let data
    try { data = JSON.parse(txt) } catch { data = {raw: txt} }
    return new Response(JSON.stringify(data, null, 2), {headers:{'Content-Type':'application/json'}})
  } catch (e:any) {
    return new Response(JSON.stringify({error: e.message}), {status:500, headers:{'Content-Type':'application/json'}})
  }
}

import { generateId, TABLES } from '../lib/db'

export const onRequestGet: PagesFunction<{WHATSAPP_VERIFY_TOKEN:string}> = async (ctx)=>{
  const url = new URL(ctx.request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  if(mode==='subscribe' && token===ctx.env.WHATSAPP_VERIFY_TOKEN){
    return new Response(challenge, {status:200})
  }
  return new Response('Forbidden', {status:403})
}

export const onRequestPost: PagesFunction<{
  DB: D1Database
  WHATSAPP_TOKEN:string
  WHATSAPP_PHONE_NUMBER_ID:string
  TELEGRAM_BOT_TOKEN?:string
  TELEGRAM_ADMIN_CHAT_ID?:string
}> = async (ctx)=>{
  const body = await ctx.request.json() as any

  const entry = body.entry?.[0]?.changes?.[0]?.value
  const msg = entry?.messages?.[0]
  const from = msg?.from
  const text = msg?.text?.body || ''
  const name = entry?.contacts?.[0]?.profile?.name || ''

  if(from && ctx.env.DB){
    try {
      const existing = await ctx.env.DB.prepare(`SELECT id FROM ${TABLES.leads} WHERE chat_id = ?`).bind(from).first()
      if(!existing){
        await ctx.env.DB.prepare(`INSERT INTO ${TABLES.leads} (id, source, chat_id, name, message, status) VALUES (?,?,?,?,?,?)`)
          .bind(generateId('lead'), 'whatsapp', from, name, text, 'new').run()
      } else {
        await ctx.env.DB.prepare(`UPDATE ${TABLES.leads} SET message = ?, updated_at = datetime("now") WHERE chat_id = ?`).bind(text, from).run()
      }
    } catch(e){ console.error(e) }
  }

  if(from && ctx.env.TELEGRAM_ADMIN_CHAT_ID && ctx.env.TELEGRAM_BOT_TOKEN){
    const tgUrl = `https://api.telegram.org/bot${ctx.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    await fetch(tgUrl, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      chat_id: ctx.env.TELEGRAM_ADMIN_CHAT_ID,
      text: `💚 واتساپ جدید از ${from} (${name}):\n${text}`
    })}).catch(()=>{})
  }

  return new Response('EVENT_RECEIVED')
}

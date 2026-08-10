import { generateId, TABLES } from '../../lib/db'
import { verifyJWT } from '../../lib/auth'

type Env = { DB: D1Database, JWT_SECRET: string, TELEGRAM_BOT_TOKEN?: string, TELEGRAM_ADMIN_CHAT_ID?: string, BALE_BOT_TOKEN?: string, BALE_ADMIN_CHAT_ID?: string }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  const payload = await verifyJWT(token, ctx.env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload) return new Response(JSON.stringify({error:'auth required'}), {status:401, headers:{'Content-Type':'application/json'}})
  const {results} = await ctx.env.DB.prepare(`SELECT * FROM ${TABLES.leads} ORDER BY created_at DESC LIMIT 100`).all()
  return new Response(JSON.stringify({ok:true, leads: results}), {headers:{'Content-Type':'application/json'}})
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const body = await ctx.request.json() as any
  const { source, chat_id, name, phone, email, occasion, style, guests, budget, theme_name, city, date, message, ai_brief } = body
  if(!name && !phone && !chat_id) {
    return new Response(JSON.stringify({error:'name or phone required'}), {status:400, headers:{'Content-Type':'application/json'}})
  }
  const id = generateId('lead')
  await ctx.env.DB.prepare(`INSERT INTO ${TABLES.leads} (id, source, chat_id, name, phone, email, occasion, style, guests, budget, theme_name, city, date, message, ai_brief, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id, source||'site', chat_id||'', name||'', phone||'', email||'', occasion||'', style||'', guests||'', budget||'', theme_name||'', city||'', date||'', message||'', ai_brief||'', 'new').run()

  if(ctx.env.TELEGRAM_BOT_TOKEN && ctx.env.TELEGRAM_ADMIN_CHAT_ID){
    const txt = `🎉 لید جدید\n👤 ${name||'-'}\n📞 ${phone||''}\n🎂 ${occasion||''} | ${style||''}\n👥 ${guests||''} | 📍 ${city||''}\n📅 ${date||''}\n💬 ${message||''}\n🤖 ${ai_brief||''}`
    await fetch(`https://api.telegram.org/bot${ctx.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({chat_id: ctx.env.TELEGRAM_ADMIN_CHAT_ID, text: txt})}).catch(()=>{})
  }
  if(ctx.env.BALE_BOT_TOKEN && ctx.env.BALE_ADMIN_CHAT_ID){
    await fetch(`https://tapi.bale.ai/bot${ctx.env.BALE_BOT_TOKEN}/sendMessage`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({chat_id: ctx.env.BALE_ADMIN_CHAT_ID, text: `🎉 لید جدید بله: ${name} ${phone}`})}).catch(()=>{})
  }

  const lead = await ctx.env.DB.prepare(`SELECT * FROM ${TABLES.leads} WHERE id = ?`).bind(id).first()
  return new Response(JSON.stringify({ok:true, lead}), {headers:{'Content-Type':'application/json'}})
}

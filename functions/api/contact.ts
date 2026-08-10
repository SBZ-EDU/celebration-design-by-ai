import { generateId, TABLES } from '../lib/db'

type Env = { DB: D1Database, TELEGRAM_BOT_TOKEN?: string, TELEGRAM_ADMIN_CHAT_ID?: string, BALE_BOT_TOKEN?: string, BALE_ADMIN_CHAT_ID?: string, CONTACT_WEBHOOK?: string }

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const data = await ctx.request.json() as any
  const id = generateId('lead')
  try {
    if(ctx.env.DB){
      await ctx.env.DB.prepare(`INSERT INTO ${TABLES.leads} (id, source, name, phone, email, occasion, style, guests, budget, theme_name, city, date, message, ai_brief, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(id, data.source||'site', data.name||'', data.phone||'', data.email||'', data.occasion||'', data.style||'', data.guests||'', data.budget||'', data.theme_name||data.themeName||'', data.city||'', data.date||'', data.message||'', data.aiBrief||data.ai_brief||'', 'new').run()
    }
  } catch(e){ console.error('db insert fail', e) }

  if(ctx.env.TELEGRAM_BOT_TOKEN && ctx.env.TELEGRAM_ADMIN_CHAT_ID){
    const txt = `🎉 لید جدید از سایت جشن‌ساز\n\n👤 نام: ${data.name}\n📞 شماره: ${data.phone}\n🎂 مناسبت: ${data.occasion}\n🎨 سبک: ${data.style}\n👥 مهمان: ${data.guests}\n📍 شهر: ${data.city}\n📅 تاریخ: ${data.date}\n💬 پیام: ${data.message}\n\nتم AI: ${data.aiBrief||'—'}`
    await fetch(`https://api.telegram.org/bot${ctx.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: ctx.env.TELEGRAM_ADMIN_CHAT_ID, text: txt})
    }).catch(()=>{})
  }
  if(ctx.env.BALE_BOT_TOKEN && ctx.env.BALE_ADMIN_CHAT_ID){
    await fetch(`https://tapi.bale.ai/bot${ctx.env.BALE_BOT_TOKEN}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: ctx.env.BALE_ADMIN_CHAT_ID, text: `🎉 لید جدید: ${data.name} ${data.phone}`})
    }).catch(()=>{})
  }
  if(ctx.env.CONTACT_WEBHOOK){
    await fetch(ctx.env.CONTACT_WEBHOOK, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)}).catch(()=>{})
  }
  return new Response(JSON.stringify({ok:true, id}), {headers:{'Content-Type':'application/json'}})
}

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ok:true, message:'contact endpoint'}), {headers:{'Content-Type':'application/json'}})
}

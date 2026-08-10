import { generateId, TABLES } from '../lib/db'

const BALE_API = 'https://tapi.bale.ai'

async function baleSendMessage(token: string, chatId: string|number, text: string) {
  const url = `${BALE_API}/bot${token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({chat_id: chatId, text})
  })
  return res.json()
}

const BOT_TEXTS = {
  welcome: `سلام! من ربات جشن‌ساز هستم 🎉\nچه جشنی داری؟\n\n🎂 تولد\n💍 نامزدی\n👰 عروسی\n🍉 یلدا\n🏢 سازمانی\n👶 سیسمونی\n\nبنویس مثلاً: تولد`,
  fallback: `متوجه نشدم 😅 بنویس: تولد، عروسی، یلدا یا /human برای ادمین`
}

export const onRequestPost: PagesFunction<{
  DB: D1Database
  BALE_BOT_TOKEN: string
  BALE_ADMIN_CHAT_ID?: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_ADMIN_CHAT_ID?: string
}> = async (ctx) => {
  const { DB, BALE_BOT_TOKEN, BALE_ADMIN_CHAT_ID, TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = ctx.env
  const update = await ctx.request.json() as any

  const message = update.message
  if(!message) return new Response('ok')
  const chatId = message.chat?.id
  const text = message.text || ''
  const fromName = message.from?.first_name || ''

  try {
    if(DB && chatId){
      const chatIdStr = String(chatId)
      const existing = await DB.prepare(`SELECT id FROM ${TABLES.leads} WHERE chat_id = ?`).bind(chatIdStr).first()
      if(!existing){
        await DB.prepare(`INSERT INTO ${TABLES.leads} (id, source, chat_id, name, message, status) VALUES (?,?,?,?,?,?)`)
          .bind(generateId('lead'), 'bale', chatIdStr, fromName, text, 'new').run()
      } else {
        await DB.prepare(`UPDATE ${TABLES.leads} SET message = ?, updated_at = datetime("now") WHERE chat_id = ?`).bind(text, chatIdStr).run()
      }
    }
  } catch(e){ console.error(e) }

  if(!BALE_BOT_TOKEN) return new Response('missing token', {status:500})

  if(text.startsWith('/start')){
    await baleSendMessage(BALE_BOT_TOKEN, chatId, BOT_TEXTS.welcome)
  } else if(text.includes('تولد') || text.includes('birthday')){
    await baleSendMessage(BALE_BOT_TOKEN, chatId, `🎂 عالی! تولد چند نفره؟\n<20 | 20-50 | 50-100 | 100+\nبنویس تعداد`)
  } else if(text.includes('عروسی') || text.includes('wedding')){
    await baleSendMessage(BALE_BOT_TOKEN, chatId, `👰 عروسی رویایی! باغ یا سالن؟ تاریخ کیه؟`)
  } else if(text.includes('/human') || text.includes('ادمین')){
    await baleSendMessage(BALE_BOT_TOKEN, chatId, `🙋‍♀️ درخواستت به ادمین ارسال شد. شماره: 021-91008877`)
    if(BALE_ADMIN_CHAT_ID){
      await baleSendMessage(BALE_BOT_TOKEN, BALE_ADMIN_CHAT_ID, `🔔 درخواست اپراتور از بله ${chatId} (${fromName}): ${text}`)
    }
    if(TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID){
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({chat_id: TELEGRAM_ADMIN_CHAT_ID, text: `🔔 بله - درخواست اپراتور از ${chatId} (${fromName}): ${text}`})
      }).catch(()=>{})
    }
  } else {
    await baleSendMessage(BALE_BOT_TOKEN, chatId, BOT_TEXTS.fallback)
    if(BALE_ADMIN_CHAT_ID && String(chatId)!==String(BALE_ADMIN_CHAT_ID)){
      await baleSendMessage(BALE_BOT_TOKEN, BALE_ADMIN_CHAT_ID, `📩 بله پیام از ${chatId} (${fromName}): ${text}`).catch(()=>{})
    }
  }

  return new Response('ok')
}

export const onRequestGet: PagesFunction = async () => {
  return new Response('Bale webhook endpoint - use POST', {status:200})
}

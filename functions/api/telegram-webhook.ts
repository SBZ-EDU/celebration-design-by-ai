import { tgSendMessage, inlineKeyboard } from '../lib/telegram'
import { BOT_TEXTS, OCCASION_BUTTONS, STYLE_BUTTONS, GUEST_BUTTONS } from '../../src/lib/bot/botFlows'
import { generateId, TABLES } from '../lib/db'

function faDesign(occ:string, style:string, guests:string){
  return `✨ تم پیشنهادی: ${occ} + ${style}\n👥 مهمان: ${guests}\n🎨 پالت: فوشیا، بنفش، طلایی، کرم\n💰 بودجه تخمینی: ۱۸ تا ۳۲ میلیون\n💡 نکته: نورپردازی ریسه‌ای + گل‌آرایی میز`
}

export const onRequestPost: PagesFunction<{
  DB: D1Database
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_ADMIN_CHAT_ID: string
}> = async (ctx) => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, DB } = ctx.env
  const update = await ctx.request.json() as any

  const msg = update.message || update.callback_query?.message
  const from = update.message?.from || update.callback_query?.from
  const chatId = msg?.chat?.id || from?.id
  if(!chatId) return new Response('ok')

  const text = update.message?.text || update.callback_query?.data || ''
  const chatIdStr = String(chatId)
  const userName = from?.first_name || ''

  try {
    if(DB && text){
      const existing = await DB.prepare(`SELECT id FROM ${TABLES.leads} WHERE chat_id = ?`).bind(chatIdStr).first()
      if(!existing){
        await DB.prepare(`INSERT INTO ${TABLES.leads} (id, source, chat_id, name, message, status) VALUES (?,?,?,?,?,?)`)
          .bind(generateId('lead'), 'telegram', chatIdStr, userName, text, 'new').run()
      } else {
        await DB.prepare(`UPDATE ${TABLES.leads} SET message = ?, updated_at = datetime("now") WHERE chat_id = ?`).bind(text, chatIdStr).run()
      }
    }
  } catch(e){ console.error(e) }

  if(text.startsWith('/start') || text === 'start'){
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, BOT_TEXTS.welcome, inlineKeyboard(OCCASION_BUTTONS))
  } else if(text.startsWith('occ_')){
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, BOT_TEXTS.askStyle, inlineKeyboard(STYLE_BUTTONS))
  } else if(text.startsWith('style_')){
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, BOT_TEXTS.askGuests, inlineKeyboard(GUEST_BUTTONS))
  } else if(text.startsWith('guests_')){
    const design = faDesign('جشن', text, '50 نفر')
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, design)
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, BOT_TEXTS.askName)
  } else if(text.includes('/human') || text.includes('ادمین')){
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, BOT_TEXTS.human)
    if(TELEGRAM_ADMIN_CHAT_ID){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, `🔔 درخواست اپراتور از ${chatId} (${userName}): ${text}`)
    }
  } else if(text.startsWith('/gallery')){
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, '📸 گالری جشن‌ساز: https://celebration-design-by-ai.pages.dev/#gallery')
  } else if(text.startsWith('/packages')){
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, '🎁 پکیج‌ها:\n- رویا ۱۲م\n- ستاره ۲۸م (محبوب)\n- افسانه ۶۵م VIP')
  } else {
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, BOT_TEXTS.fallback)
    if(TELEGRAM_ADMIN_CHAT_ID && String(chatId) !== String(TELEGRAM_ADMIN_CHAT_ID)){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, `📩 پیام تلگرام از ${chatId} (${userName}):\n${update.message?.text || JSON.stringify(update).slice(0,500)}`)
    }
  }

  return new Response('ok')
}

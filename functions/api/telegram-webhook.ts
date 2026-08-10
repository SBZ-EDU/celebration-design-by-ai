import { tgSendMessage, inlineKeyboard } from '../lib/telegram'
import { BOT_TEXTS, OCCASION_BUTTONS, STYLE_BUTTONS, GUEST_BUTTONS } from '../../src/lib/bot/botFlows'
// @ts-ignore content is outside functions but we inline generateDesign logic simple
function faDesign(occ:string, style:string, guests:string){
  return `✨ تم پیشنهادی: ${occ} + ${style}\n👥 مهمان: ${guests}\n🎨 پالت: فوشیا، بنفش، طلایی، کرم\n💰 بودجه تخمینی: ۱۸ تا ۳۲ میلیون\n💡 نکته: نورپردازی ریسه‌ای + گل‌آرایی میز`
}

export const onRequestPost: PagesFunction<{
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_ADMIN_CHAT_ID: string
}> = async (ctx) => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = ctx.env
  const update = await ctx.request.json() as any
  console.log('tg update', JSON.stringify(update).slice(0,2000))

  const msg = update.message || update.callback_query?.message
  const chatId = msg?.chat?.id || update.callback_query?.from?.id
  if(!chatId) return new Response('ok')

  const text = update.message?.text || update.callback_query?.data || ''

  // ساده: state را در KV نگه می‌داریم، فعلاً فقط demo flow
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
      await tgSendMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, `🔔 درخواست اپراتور از ${chatId}: ${text}`)
    }
  } else {
    // ذخیره لید + فوروارد به ادمین
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, BOT_TEXTS.fallback)
    if(TELEGRAM_ADMIN_CHAT_ID){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, `📩 پیام جدید از ${chatId}:\n${update.message?.text || JSON.stringify(update).slice(0,500)}`)
    }
  }

  return new Response('ok')
}

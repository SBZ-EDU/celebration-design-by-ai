import { tgSendMessage, inlineKeyboard } from '../lib/telegram'

export const onRequestGet: PagesFunction<{
  TELEGRAM_BOT_TOKEN: string
}> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const chatId = url.searchParams.get('chat_id')
  const text = url.searchParams.get('text') || 'تست منو'

  if(!chatId) {
    return new Response(JSON.stringify({
      usage: '/api/telegram-test?chat_id=YOUR_TELEGRAM_ID&text=سلام',
      how_to_get_id: 'به @userinfobot در تلگرام پیام بده تا آیدی عددی بگیری',
      test_menu: 'اگر chat_id بدی، منو با آیکن‌ها میفرسته'
    }, null, 2), {headers:{'Content-Type':'application/json'}})
  }

  const token = ctx.env.TELEGRAM_BOT_TOKEN
  if(!token) return new Response(JSON.stringify({error:'no token'}), {status:500})

  const OCCASION_BUTTONS = [
    [{text: '🎂 تولد', callback_data: 'occ_birthday'}, {text: '💍 نامزدی', callback_data: 'occ_engagement'}],
    [{text: '👰 عروسی', callback_data: 'occ_wedding'}, {text: '🍉 یلدا', callback_data: 'occ_yalda'}],
    [{text: '🏢 سازمانی', callback_data: 'occ_corporate'}, {text: '👶 سیسمونی', callback_data: 'occ_baby'}],
  ]

  const WELCOME_KB = [
    ['🎂 تولد','💍 نامزدی'],
    ['👰 عروسی','🍉 یلدا'],
    ['🏢 سازمانی','👶 سیسمونی'],
    ['✨ طراحی با AI','🎁 پکیج‌ها'],
  ]

  try {
    const r1 = await tgSendMessage(token, chatId, `سلام! من ربات جشن‌ساز هستم 🎉✨\n\n${text}\n\nمنو با آیکن‌ها 👇`, {
      reply_markup: {
        keyboard: WELCOME_KB.map(r=>r.map(t=>({text:t}))),
        resize_keyboard: true,
        is_persistent: true
      }
    })
    const r2 = await tgSendMessage(token, chatId, `🎈 <b>انتخاب سریع مناسبت (اینلاین با آیکن):</b>`, inlineKeyboard(OCCASION_BUTTONS))
    
    return new Response(JSON.stringify({ok:true, sent:[r1,r2]}, null, 2), {headers:{'Content-Type':'application/json'}})
  } catch (e:any) {
    return new Response(JSON.stringify({error: e.message}), {status:500})
  }
}

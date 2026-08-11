import { tgSendMessage, tgSendPhoto, tgAnswerCallback, inlineKeyboard, replyKeyboard } from '../lib/telegram'
import { BOT_TEXTS, OCCASION_BUTTONS, STYLE_BUTTONS, GUEST_BUTTONS, MAIN_MENU } from '../../src/lib/bot/botFlows'
import { generateId, TABLES } from '../lib/db'

function faDesign(occ:string, style:string, guests:string){
  return `✨ <b>تم پیشنهادی:</b> ${occ} + ${style}\n👥 <b>مهمان:</b> ${guests}\n🎨 <b>پالت:</b> فوشیا، بنفش، طلایی، کرم\n💰 <b>بودجه تخمینی:</b> ۱۸ تا ۳۲ میلیون\n💡 <b>نکته:</b> نورپردازی ریسه‌ای + گل‌آرایی میز`
}

const WELCOME_KB_TEXT = [
  ['🎂 تولد','💍 نامزدی'],
  ['👰 عروسی','🍉 یلدا'],
  ['🏢 سازمانی','👶 سیسمونی'],
  ['✨ طراحی با AI','🎁 پکیج‌ها'],
  ['📸 گالری','📞 تماس با ادمین']
]

async function getAdminIds(DB: D1Database, env: any){
  let tgAdmin = env.TELEGRAM_ADMIN_CHAT_ID || ''
  let baleAdmin = env.BALE_ADMIN_CHAT_ID || ''
  try {
    if(!tgAdmin){
      const row = await DB.prepare(`SELECT value FROM jashnsaz_settings WHERE key='telegram_admin_chat_id'`).first() as any
      tgAdmin = row?.value || ''
    }
    if(!baleAdmin){
      const row = await DB.prepare(`SELECT value FROM jashnsaz_settings WHERE key='bale_admin_chat_id'`).first() as any
      baleAdmin = row?.value || ''
    }
  } catch {}
  return {tgAdmin, baleAdmin}
}

export const onRequestPost: PagesFunction<{
  DB: D1Database
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_ADMIN_CHAT_ID: string
  BALE_ADMIN_CHAT_ID: string
  BALE_BOT_TOKEN?: string
}> = async (ctx) => {
  const { TELEGRAM_BOT_TOKEN, DB } = ctx.env
  let update: any
  try { update = await ctx.request.json() as any } catch { return new Response('ok') }

  const message = update.message
  const callback = update.callback_query
  const from = message?.from || callback?.from
  const chatId = message?.chat?.id || callback?.message?.chat?.id || from?.id
  const callbackId = callback?.id
  const textRaw = message?.text || callback?.data || ''
  const text = (textRaw || '').trim()
  const chatIdStr = chatId ? String(chatId) : ''
  const userName = from?.first_name || from?.username || ''

  if(!chatId) return new Response('ok')
  if(callbackId){ try { await tgAnswerCallback(TELEGRAM_BOT_TOKEN, callbackId) } catch {} }

  const {tgAdmin, baleAdmin} = await getAdminIds(DB, ctx.env)

  try {
    if(DB && chatIdStr && text){
      const existing = await DB.prepare(`SELECT id FROM ${TABLES.leads} WHERE chat_id = ?`).bind(chatIdStr).first()
      if(!existing){
        await DB.prepare(`INSERT INTO ${TABLES.leads} (id, source, chat_id, name, message, status) VALUES (?,?,?,?,?,?)`)
          .bind(generateId('lead'), 'telegram', chatIdStr, userName, text.slice(0,500), 'new').run()
      } else {
        await DB.prepare(`UPDATE ${TABLES.leads} SET message = ?, name = ?, updated_at = datetime("now") WHERE chat_id = ?`).bind(text.slice(0,500), userName, chatIdStr).run()
      }
    }
  } catch(e){ console.error('db save fail', e) }

  // Forward report with chat ID to admin (main site monitoring to 09206263218 owner)
  if(tgAdmin && String(chatId) !== String(tgAdmin)){
    const report = `🟣 Telegram report\n👤 ${userName} | ID: ${chatIdStr}\n📱 09206263218 owner monitoring\n💬 ${text}\n🔗 @celeb4neginejam_bot\n⏰ ${new Date().toISOString()}`
    await tgSendMessage(TELEGRAM_BOT_TOKEN, tgAdmin, report).catch(()=>{})
  }
  // Also if bale admin set and bale token env exists, forward to bale
  if(baleAdmin && ctx.env.BALE_BOT_TOKEN){
    try {
      await fetch(`https://tapi.bale.ai/bot${ctx.env.BALE_BOT_TOKEN}/sendMessage`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({chat_id: baleAdmin, text: `🟣 Telegram report from ${chatIdStr} (${userName}): ${text}`})
      })
    } catch {}
  }

  const lower = text.toLowerCase()
  const contains = (kw: string[]) => kw.some(k=> lower.includes(k) || text.includes(k))

  try {
    if(text.startsWith('/start') || lower === 'start' || text === 'شروع' || text.includes('سلام')){
      const welcome = `سلام ${userName ? userName + ' عزیز' : ''}! من ربات جشن‌ساز هستم 🎉✨\n\n${BOT_TEXTS.welcome}\n\nآیدی شما: <code>${chatIdStr}</code> (برای ادمین ارسال شد)\n\n👇 از منوی زیر انتخاب کن:`
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, welcome, {
        reply_markup: {
          keyboard: WELCOME_KB_TEXT.map(r=>r.map(t=>({text:t}))),
          resize_keyboard: true,
          is_persistent: true,
          input_field_placeholder: 'نوع جشن را بنویس...'
        }
      })
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🎈 <b>انتخاب سریع مناسبت (با آیکن):</b>`, inlineKeyboard(OCCASION_BUTTONS))
      return new Response('ok')
    }

    if(text.startsWith('/setadmin')){
      const parts = text.split(' ')
      const secret = parts[1]
      if(secret === 'jashnsaz2026'){
        await DB.prepare(`INSERT OR REPLACE INTO jashnsaz_settings (key, value) VALUES ('telegram_admin_chat_id', ?)`).bind(chatIdStr).run()
        await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `✅ شما به عنوان ادمین تلگرام ست شدید\nID: ${chatIdStr}\nاز این به بعد گزارش‌ها به شما می‌آید (09206263218)`)
      }
      return new Response('ok')
    }

    if(contains(['/gallery','گالری','نمونه کار'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `📸 <b>گالری جشن‌ساز</b>\n\n6 نمونه کار:\n🎂 تولد شب صورتی\n💐 سفره عقد آیینه‌خانه\nhttps://celeb.neginejam.ir/#gallery`, inlineKeyboard([[{text:'🌐 باز کردن گالری', url:'https://celeb.neginejam.ir/#gallery'}]]))
      return new Response('ok')
    }

    if(contains(['/packages','پکیج','قیمت','هزینه'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🎁 <b>پکیج‌ها</b>\n💜 رویا ۱۲م\n⭐ ستاره ۲۸م\n👑 افسانه ۶۵م\n🤖 طراحی AI ۵م\n\n☎️ 021-77947035 | 09206263218\nآیدی شما: ${chatIdStr}`)
      return new Response('ok')
    }

    if(text.startsWith('occ_') || contains(['تولد','نامزدی','عروسی','یلدا','سازمانی','سیسمونی'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🎉 مناسبت <b>${text}</b> انتخاب شد\n\n${BOT_TEXTS.askStyle}`, inlineKeyboard(STYLE_BUTTONS))
      return new Response('ok')
    }

    if(text.startsWith('style_') || contains(['مینیمال','لاکچری','بوهو','فانتزی'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `استایل <b>${text}</b> - ${BOT_TEXTS.askGuests}`, inlineKeyboard(GUEST_BUTTONS))
      return new Response('ok')
    }

    if(text.startsWith('guests_') || text.includes('نفر')){
      const design = faDesign('جشن انتخابی', 'مینیمال', text)
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, design)
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `حالا شماره‌ات رو بفرست: ${BOT_TEXTS.askPhone}`, {
        reply_markup: { keyboard: [[{text:'📞 ارسال شماره تماس', request_contact: true}],[{text:'📍 ارسال لوکیشن', request_location: true}]], resize_keyboard: true, one_time_keyboard: true }
      })
      return new Response('ok')
    }

    if(contains(['/contact','تماس','رزرو','ادمین','human','پشتیبانی'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `📞 <b>تماس</b>\n${BOT_TEXTS.human}\n\n☎️ 021-77947035\n📱 09206263218\nآیدی شما: ${chatIdStr}\n🌐 https://celeb.neginejam.ir`)
      return new Response('ok')
    }

    if(message?.contact){
      const phone = message.contact.phone_number
      const name = message.contact.first_name || userName
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `ممنون ${name}! شماره‌ات ${phone} ثبت شد 🙏\nآیدی: ${chatIdStr}`)
      if(DB){
        await DB.prepare(`UPDATE ${TABLES.leads} SET phone = ?, name = ?, updated_at = datetime("now") WHERE chat_id = ?`).bind(phone, name, chatIdStr).run().catch(()=>{})
      }
      return new Response('ok')
    }

    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `${BOT_TEXTS.fallback}\n\nآیدی شما: <code>${chatIdStr}</code>`, {
      reply_markup: { keyboard: WELCOME_KB_TEXT.map(r=>r.map(t=>({text:t}))), resize_keyboard: true }
    })

  } catch (e:any) { console.error('telegram webhook error', e) }
  return new Response('ok')
}

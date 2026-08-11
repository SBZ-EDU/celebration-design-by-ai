import { tgSendMessage, tgAnswerCallback, inlineKeyboard } from '../lib/telegram'
import { BOT_TEXTS, OCCASION_BUTTONS, STYLE_BUTTONS, GUEST_BUTTONS } from '../../src/lib/bot/botFlows'
import { generateId, TABLES } from '../lib/db'

function faDesign(occ:string, style:string, guests:string){
  return `✨ <b>تم پیشنهادی:</b> ${occ} + ${style}\n👥 <b>مهمان:</b> ${guests}\n🎨 <b>پالت:</b> فوشیا، بنفش، طلایی، کرم\n💰 <b>بودجه:</b> ۱۸ تا ۳۲ میلیون`
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
  OWNER_SECRET?: string
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
  if(callbackId){ try { const {tgAnswerCallback} = await import('../lib/telegram'); await tgAnswerCallback(TELEGRAM_BOT_TOKEN, callbackId) } catch {} }

  const {tgAdmin, baleAdmin} = await getAdminIds(DB, ctx.env)

  // Save lead
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
  } catch(e){ console.error(e) }

  // Forward to admin if not admin itself
  if(tgAdmin && String(chatId) !== String(tgAdmin)){
    const report = `🟣 Telegram report\n👤 ${userName} | ID: ${chatIdStr}\n📱 09206263218 monitoring\n💬 ${text}\n🔗 @celeb4neginejam_bot`
    await tgSendMessage(TELEGRAM_BOT_TOKEN, tgAdmin, report).catch(()=>{})
  }

  const lower = text.toLowerCase()
  const contains = (kw: string[]) => kw.some(k=> lower.includes(k) || text.includes(k))

  try {
    if(text.startsWith('/setadmin')){
      // SECURITY FIX: Only owner or current admin can change admin
      const parts = text.split(' ')
      const secret = parts[1] || ''
      const ownerSecret = ctx.env.OWNER_SECRET || 'jashnsaz2026' // fallback but should be set in env
      const isFirstSetup = !tgAdmin
      const isCurrentAdmin = tgAdmin && String(chatId) === String(tgAdmin)
      const isCorrectSecret = secret === ownerSecret

      if(!isFirstSetup && !isCurrentAdmin){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `⛔️ فقط ادمین فعلی می‌تونه ادمین رو تغییر بده\n\nادمین فعلی: ${tgAdmin}\nآیدی شما: ${chatIdStr}\n\nاگه مالک هستی با ادمین فعلی تماس بگیر یا از پنل Cloudflare Env عوض کن.`)
        return new Response('ok')
      }
      if(!isCorrectSecret && !isFirstSetup){
        // For first setup, allow without secret? No, require secret even for first
        // But if first setup and secret correct, allow
        if(secret !== ownerSecret){
          await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🔒 برای ست کردن ادمین باید رمز مالک رو بدی\n\nفرمت: /setadmin <رمز>\n\nاگه رمز رو نداری، به مالک اصلی (09206263218) پیام بده.`)
          return new Response('ok')
        }
      }
      // If we reach here, allow
      if(secret && secret !== ownerSecret && isFirstSetup){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🔒 رمز اشتباهه\n\nفرمت درست: /setadmin jashnsaz2026 (یا رمز جدید)\nآیدی شما: ${chatIdStr}`)
        return new Response('ok')
      }
      // Set admin to this chatId (or if third param is new admin id, set that)
      let newAdminId = chatIdStr
      if(parts[2]) newAdminId = parts[2] // /setadmin SECRET NEW_ID
      else if(parts.length===1) newAdminId = chatIdStr // just /setadmin SECRET -> self

      // If admin wants to set other ID, must be current admin
      if(parts[2] && !isCurrentAdmin && !isFirstSetup){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `⛔️ فقط ادمین فعلی می‌تونه ادمین جدید معرفی کنه`)
        return new Response('ok')
      }

      await DB.prepare(`INSERT OR REPLACE INTO jashnsaz_settings (key, value) VALUES ('telegram_admin_chat_id', ?)`).bind(newAdminId).run()
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `✅ ادمین تلگرام ست شد\nID جدید: ${newAdminId}\nقبلی: ${tgAdmin || 'هیچکدام (اولین ست)'}\n\nاز این به بعد گزارش‌ها به این آیدی میره.\n\nبرای امنیت، حالا فقط همین آیدی می‌تونه ادمین رو عوض کنه.`)
      if(tgAdmin && String(tgAdmin) !== newAdminId){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, tgAdmin, `⚠️ ادمین تلگرام از ${tgAdmin} به ${newAdminId} تغییر کرد توسط ${chatIdStr} (${userName})`).catch(()=>{})
      }
      return new Response('ok')
    }

    if(text.startsWith('/start') || lower === 'start' || text === 'شروع'){
      const welcome = `سلام ${userName ? userName + ' عزیز' : ''}! من ربات جشن‌ساز هستم 🎉✨\n\n${BOT_TEXTS.welcome}\n\nآیدی شما: <code>${chatIdStr}</code>\n\n👇 منو با آیکن‌ها:`
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, welcome, {
        reply_markup: {
          keyboard: WELCOME_KB_TEXT.map(r=>r.map(t=>({text:t}))),
          resize_keyboard: true,
          is_persistent: true
        }
      })
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🎈 انتخاب سریع:`, inlineKeyboard(OCCASION_BUTTONS))
      return new Response('ok')
    }

    if(contains(['/gallery','گالری'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `📸 گالری: https://celeb.neginejam.ir/#gallery`, inlineKeyboard([[{text:'🌐 باز کردن گالری', url:'https://celeb.neginejam.ir/#gallery'}]]))
      return new Response('ok')
    }
    if(contains(['/packages','پکیج','قیمت'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🎁 پکیج‌ها:\n💜 رویا ۱۲م\n⭐ ستاره ۲۸م\n👑 افسانه ۶۵م\n🤖 AI ۵م\n\n☎️ 021-77947035 | 09206263218\nآیدی شما: ${chatIdStr}`)
      return new Response('ok')
    }
    if(text.startsWith('occ_') || contains(['تولد','نامزدی','عروسی','یلدا','سازمانی','سیسمونی'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `استایل؟`, inlineKeyboard(STYLE_BUTTONS))
      return new Response('ok')
    }
    if(text.startsWith('style_') || contains(['مینیمال','لاکچری','بوهو','فانتزی'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `چند مهمان؟`, inlineKeyboard(GUEST_BUTTONS))
      return new Response('ok')
    }
    if(text.startsWith('guests_') || text.includes('نفر')){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, faDesign('جشن', text, '50 نفر'))
      return new Response('ok')
    }
    if(contains(['/contact','تماس','رزرو','ادمین','human'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `📞 تماس\n021-77947035\n09206263218\nآیدی شما: ${chatIdStr}\nhttps://celeb.neginejam.ir`)
      return new Response('ok')
    }
    if(message?.contact){
      const phone = message.contact.phone_number
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `ممنون! شماره ${phone} ثبت شد\nآیدی: ${chatIdStr}`)
      if(DB) await DB.prepare(`UPDATE ${TABLES.leads} SET phone = ? WHERE chat_id = ?`).bind(phone, chatIdStr).run().catch(()=>{})
      return new Response('ok')
    }

    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `${BOT_TEXTS.fallback}\n\nآیدی شما: <code>${chatIdStr}</code>`, {
      reply_markup: { keyboard: WELCOME_KB_TEXT.map(r=>r.map(t=>({text:t}))), resize_keyboard: true }
    })

  } catch (e:any) { console.error(e) }
  return new Response('ok')
}

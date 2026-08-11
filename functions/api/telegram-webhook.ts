import { tgSendMessage, tgSendPhoto, tgAnswerCallback, inlineKeyboard, replyKeyboard } from '../lib/telegram'
import { BOT_TEXTS, OCCASION_BUTTONS, STYLE_BUTTONS, GUEST_BUTTONS, MAIN_MENU } from '../../src/lib/bot/botFlows'
import { generateId, TABLES } from '../lib/db'

function faDesign(occ:string, style:string, guests:string){
  return `✨ <b>تم پیشنهادی:</b> ${occ} + ${style}\n👥 <b>مهمان:</b> ${guests}\n🎨 <b>پالت:</b> فوشیا، بنفش، طلایی، کرم\n💰 <b>بودجه تخمینی:</b> ۱۸ تا ۳۲ میلیون\n💡 <b>نکته:</b> نورپردازی ریسه‌ای + گل‌آرایی میز\n\nبرای دیدن گالری: /gallery`
}

const WELCOME_KB_TEXT = [
  ['🎂 تولد','💍 نامزدی'],
  ['👰 عروسی','🍉 یلدا'],
  ['🏢 سازمانی','👶 سیسمونی'],
  ['✨ طراحی با AI','🎁 پکیج‌ها'],
  ['📸 گالری','📞 تماس با ادمین']
]

export const onRequestPost: PagesFunction<{
  DB: D1Database
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_ADMIN_CHAT_ID: string
}> = async (ctx) => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, DB } = ctx.env
  let update: any
  try {
    update = await ctx.request.json() as any
  } catch {
    return new Response('ok')
  }
  console.log('tg update', JSON.stringify(update).slice(0,3000))

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

  // Answer callback to remove loading
  if(callbackId){
    try { await tgAnswerCallback(TELEGRAM_BOT_TOKEN, callbackId) } catch {}
  }

  // Save to DB
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

  const lower = text.toLowerCase()

  // Helper to check contains Persian keywords
  const contains = (kw: string[]) => kw.some(k=> lower.includes(k) || text.includes(k))

  try {
    if(text.startsWith('/start') || lower === 'start' || text === 'شروع'){
      const welcome = `سلام ${userName ? userName + ' عزیز' : ''}! من ربات جشن‌ساز هستم 🎉✨\n\n${BOT_TEXTS.welcome}\n\n👇 از منوی زیر انتخاب کن یا یک مناسبت بنویس:`
      // send with both reply keyboard (persistent) and inline (occasions)
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, welcome, {
        reply_markup: {
          keyboard: WELCOME_KB_TEXT.map(r=>r.map(t=>({text:t}))),
          resize_keyboard: true,
          is_persistent: true,
          input_field_placeholder: 'نوع جشن را بنویس...'
        }
      })
      // second message with inline occasions with icons
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🎈 <b>انتخاب سریع مناسبت:</b>`, inlineKeyboard(OCCASION_BUTTONS))
      return new Response('ok')
    }

    if(contains(['/gallery','گالری','نمونه کار','sample'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `📸 <b>گالری جشن‌ساز</b>\n\n6 نمونه کار با عکس واقعی AI:\n- 🎂 تولد شب صورتی\n- 💐 سفره عقد آیینه‌خانه\n- 💍 بله‌برون رز و نئون\n- 🍉 یلدای انار و شمع\n- 🏢 گالای سازمانی\n- 🍼 سیسمونی ابر آبی\n\nلینک سایت:\nhttps://celeb.neginejam.ir/#gallery\nhttps://celebration-design-by-ai.pages.dev/#gallery`, inlineKeyboard([
        [{text:'🌐 باز کردن گالری سایت', url:'https://celeb.neginejam.ir/#gallery'}]
      ]))
      return new Response('ok')
    }

    if(contains(['/packages','پکیج','قیمت','هزینه'])){
      const pkgText = `🎁 <b>پکیج‌های جشن‌ساز (به‌روز با شماره‌های نگین‌جم)</b>\n\n💜 <b>رویا</b> — ۱۲م تومان\nتا ۳۰ مهمان، ۲ ساعت اجرا، بادکنک + میز کیک\n\n⭐ <b>ستاره (محبوب)</b> — ۲۸م\nتا ۸۰ مهمان، ۴ ساعت، قوس ارگانیک + گل‌آرایی + نور + تابلوی نئون + عکاس ۳س\n\n👑 <b>افسانه VIP</b> — ۶۵م\nتا ۲۰۰ مهمان، یک روز کامل، رندر 3D + دکور کامل + عکاس و فیلمبردار\n\n🤖 <b>طراحی مفهومی AI</b> — ۵م\n3 کانسپت + پالت + لیست خرید\n\n☎️ تماس: 021-77947035 | 09206263218`
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, pkgText, inlineKeyboard([
        [{text:'✨ طراحی با AI', callback_data:'menu_design'}, {text:'📞 رزرو', callback_data:'menu_contact'}]
      ]))
      return new Response('ok')
    }

    if(text.startsWith('occ_') || contains(['تولد','نامزدی','عروسی','یلدا','سازمانی','سیسمونی'])){
      let occLabel = text
      if(text.startsWith('occ_')) {
        const map: any = {occ_birthday:'تولد', occ_engagement:'نامزدی', occ_wedding:'عروسی', occ_yalda:'یلدا', occ_corporate:'سازمانی', occ_baby:'سیسمونی'}
        occLabel = map[text] || text
      }
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🎉 عالی! مناسبت <b>${occLabel}</b> انتخاب شد\n\n${BOT_TEXTS.askStyle}`, inlineKeyboard(STYLE_BUTTONS))
      return new Response('ok')
    }

    if(text.startsWith('style_') || contains(['مینیمال','لاکچری','بوهو','فانتزی','کلاسیک'])){
      let styleLabel = text
      if(text.startsWith('style_')) {
        const map:any = {style_minimal:'مینیمال 🤍', style_luxury:'لاکچری 👑', style_boho:'بوهو 🌿', style_cartoon:'فانتزی 🎈'}
        styleLabel = map[text] || text
      }
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `استایل <b>${styleLabel}</b> - ${BOT_TEXTS.askGuests}`, inlineKeyboard(GUEST_BUTTONS))
      return new Response('ok')
    }

    if(text.startsWith('guests_') || text.includes('نفر') || /^\d/.test(text)){
      const design = faDesign('جشن انتخابی', 'مینیمال', text)
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, design)
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `حالا برای برآورد دقیق:\n${BOT_TEXTS.askName}\n\nیا شماره‌ات رو بفرست: ${BOT_TEXTS.askPhone}`, {
        reply_markup: {
          keyboard: [[{text:'📞 ارسال شماره تماس', request_contact: true}], [{text:'📍 ارسال لوکیشن', request_location: true}]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      })
      return new Response('ok')
    }

    if(text.startsWith('menu_')){
      if(text==='menu_design'){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `✨ <b>طراح هوشمند جشن‌ساز</b>\n\nبرو به سایت و در 30 ثانیه کانسپت بگیر:\nhttps://celeb.neginejam.ir/#designer`, inlineKeyboard([
          [{text:'🌐 باز کردن طراح', url:'https://celeb.neginejam.ir/#designer'}]
        ]))
      } else if(text==='menu_packages'){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `🎁 پکیج‌ها را بالا فرستادم — /packages`)
      } else if(text==='menu_gallery'){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `📸 گالری: https://celeb.neginejam.ir/#gallery`)
      } else if(text==='menu_contact'){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `📞 <b>تماس مستقیم</b>\n\n☎️ 021-77947035\n📱 09206263218\n📍 تهران، نارمک، دماوند، دلسیم هاشمی پلاک 30\n\nربات بله: @celeb4neginejam_bot\nسایت: https://celeb.neginejam.ir`)
      }
      return new Response('ok')
    }

    if(contains(['/contact','تماس','رزرو','ادمین','human','پشتیبانی'])){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `📞 <b>تماس</b>\n${BOT_TEXTS.human}\n\n☎️ 021-77947035\n📱 09206263218\n🌐 https://celeb.neginejam.ir\n\nربات بله: @celeb4neginejam_bot`)
      if(TELEGRAM_ADMIN_CHAT_ID && String(chatId) !== String(TELEGRAM_ADMIN_CHAT_ID)){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, `🔔 درخواست تماس از ${chatId} (${userName}):\n${text}`)
      }
      return new Response('ok')
    }

    // contact shared
    if(message?.contact){
      const phone = message.contact.phone_number
      const name = message.contact.first_name || userName
      await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `ممنون ${name}! شماره‌ات ${phone} ثبت شد 🙏\nتیم ما تا 1 ساعت آینده با 021-77947035 تماس می‌گیره.\n\nتم جشن‌ات چی بود؟`)
      if(DB){
        await DB.prepare(`UPDATE ${TABLES.leads} SET phone = ?, name = ?, updated_at = datetime("now") WHERE chat_id = ?`).bind(phone, name, chatIdStr).run().catch(()=>{})
      }
      if(TELEGRAM_ADMIN_CHAT_ID){
        await tgSendMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, `📞 شماره جدید از ربات جشن‌ساز\n👤 ${name}\n📱 ${phone}\n💬 ${text}`)
      }
      return new Response('ok')
    }

    // fallback with main menu
    await tgSendMessage(TELEGRAM_BOT_TOKEN, chatId, `${BOT_TEXTS.fallback}\n\nمنو رو از پایین انتخاب کن 👇`, {
      reply_markup: {
        keyboard: WELCOME_KB_TEXT.map(r=>r.map(t=>({text:t}))),
        resize_keyboard: true
      }
    })

    if(TELEGRAM_ADMIN_CHAT_ID && String(chatId) !== String(TELEGRAM_ADMIN_CHAT_ID)){
      await tgSendMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, `📩 پیام تلگرام از ${chatId} (${userName}):\n${text.slice(0,1000)}`).catch(()=>{})
    }

  } catch (e:any) {
    console.error('telegram webhook error', e)
  }

  return new Response('ok')
}

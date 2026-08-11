import { generateId, TABLES } from '../lib/db'

const BALE_API = 'https://tapi.bale.ai'

async function baleSendMessage(token: string, chatId: string|number, text: string, extra?: any) {
  const payload: any = { chat_id: chatId, text, ...extra }
  const url = `${BALE_API}/bot${token}/sendMessage`
  const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  const data = await res.json().catch(async()=>({ok:false, raw: await res.text()})) as any
  if(!data.ok) console.error('baleSendMessage failed', JSON.stringify(data).slice(0,2000))
  return data
}
function baleInlineKeyboard(rows: any[][]) {
  return { reply_markup: { inline_keyboard: rows.map(r=>r.map((b:any)=> typeof b==='string' ? {text:b, callback_data:b} : b)) } }
}
function baleReplyKeyboard(rows: string[][]) {
  return { reply_markup: { keyboard: rows.map(r=>r.map(text=>({text}))), resize_keyboard: true } }
}

const WELCOME_KB = [
  ['🎂 تولد','💍 نامزدی'],
  ['👰 عروسی','🍉 یلدا'],
  ['🏢 سازمانی','👶 سیسمونی'],
  ['✨ طراحی با AI','🎁 پکیج‌ها'],
  ['📸 گالری','📞 تماس با ادمین']
]
const OCCASION_INLINE = [
  [{text:'🎂 تولد', callback_data:'occ_birthday'}, {text:'💍 نامزدی', callback_data:'occ_engagement'}],
  [{text:'👰 عروسی', callback_data:'occ_wedding'}, {text:'🍉 یلدا', callback_data:'occ_yalda'}],
  [{text:'🏢 سازمانی', callback_data:'occ_corporate'}, {text:'👶 سیسمونی', callback_data:'occ_baby'}],
]
const STYLE_INLINE = [
  [{text:'🤍 مینیمال', callback_data:'style_minimal'}, {text:'👑 لاکچری', callback_data:'style_luxury'}],
  [{text:'🌿 بوهو', callback_data:'style_boho'}, {text:'🎈 فانتزی', callback_data:'style_cartoon'}],
]
const GUEST_INLINE = [
  [{text:'<20 نفر', callback_data:'guests_<20'}, {text:'20-50', callback_data:'guests_20-50'}],
  [{text:'50-100', callback_data:'guests_50-100'}, {text:'100+ نفر', callback_data:'guests_100+'}],
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
  BALE_BOT_TOKEN: string
  BALE_ADMIN_CHAT_ID?: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_ADMIN_CHAT_ID?: string
}> = async (ctx) => {
  const { DB, BALE_BOT_TOKEN } = ctx.env
  const update = await ctx.request.json() as any
  console.log('bale update', JSON.stringify(update).slice(0,3000))

  const message = update.message
  const callback = update.callback_query
  const from = message?.from || callback?.from
  const chatId = message?.chat?.id || callback?.message?.chat?.id || from?.id
  const textRaw = message?.text || callback?.data || ''
  const text = (textRaw || '').trim()
  const chatIdStr = chatId ? String(chatId) : ''
  const userName = from?.first_name || from?.username || ''

  if(!chatId) return new Response('ok')

  const {tgAdmin, baleAdmin} = await getAdminIds(DB, ctx.env)

  try {
    if(DB && chatIdStr){
      const existing = await DB.prepare(`SELECT id FROM ${TABLES.leads} WHERE chat_id = ?`).bind(chatIdStr).first()
      if(!existing){
        await DB.prepare(`INSERT INTO ${TABLES.leads} (id, source, chat_id, name, message, status) VALUES (?,?,?,?,?,?)`)
          .bind(generateId('lead'), 'bale', chatIdStr, userName, text.slice(0,500), 'new').run()
      } else {
        await DB.prepare(`UPDATE ${TABLES.leads} SET message = ?, name = ?, updated_at = datetime("now") WHERE chat_id = ?`).bind(text.slice(0,500), userName, chatIdStr).run()
      }
    }
  } catch(e){ console.error('db bale save fail', e) }

  // Forward report with chat ID to Telegram main site admin (09206263218 owner)
  const report = `🟢 Bale report\n👤 ${userName} | ID: ${chatIdStr}\n📱 09206263218 monitoring\n💬 ${text}\n🔗 @celeb4neginejam_bot Bale\n⏰ ${new Date().toISOString()}`
  if(ctx.env.TELEGRAM_BOT_TOKEN && tgAdmin){
    await fetch(`https://api.telegram.org/bot${ctx.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: tgAdmin, text: report})
    }).catch(()=>{})
  }
  if(baleAdmin && String(chatId) !== String(baleAdmin)){
    await baleSendMessage(BALE_BOT_TOKEN, baleAdmin, report).catch(()=>{})
  }

  if(!BALE_BOT_TOKEN) return new Response('missing token', {status:500})

  const lower = text.toLowerCase()
  const contains = (kws:string[]) => kws.some(k=> lower.includes(k.toLowerCase()) || text.includes(k))

  try {
    if(text.startsWith('/start') || lower==='start' || text==='شروع' || text.includes('سلام')){
      const welcome = `سلام ${userName ? userName+' عزیز' : ''}! من ربات جشن‌ساز هستم 🎉✨\nطراحی و اجرای جشن با هوش مصنوعی\n\nچه جشنی در پیش داری؟\n\nآیدی شما: ${chatIdStr} (برای ادمین ارسال شد)\n\n👇 منو با آیکن‌ها پایین 👇`
      await baleSendMessage(BALE_BOT_TOKEN, chatId, welcome, baleReplyKeyboard(WELCOME_KB))
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `🎈 انتخاب سریع مناسبت با آیکن:`, baleInlineKeyboard(OCCASION_INLINE))
      return new Response('ok')
    }

    if(text.startsWith('/setadmin')){
      const parts = text.split(' ')
      const secret = parts[1]
      if(secret === 'jashnsaz2026'){
        await DB.prepare(`INSERT OR REPLACE INTO jashnsaz_settings (key, value) VALUES ('bale_admin_chat_id', ?)`).bind(chatIdStr).run()
        await baleSendMessage(BALE_BOT_TOKEN, chatId, `✅ شما به عنوان ادمین بله ست شدید\nID: ${chatIdStr}\nاز این به بعد گزارش‌های بله و تلگرام به شما می‌آید (09206263218)`)
      }
      return new Response('ok')
    }

    if(text.startsWith('occ_') || contains(['تولد','نامزدی','عروسی','یلدا','سازمانی','سیسمونی'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `استایل مورد علاقه‌ات چیه؟ 🤍 مینیمال / 👑 لاکچری / 🌿 بوهو / 🎈 فانتزی`, baleInlineKeyboard(STYLE_INLINE))
      return new Response('ok')
    }

    if(text.startsWith('style_') || contains(['مینیمال','لاکچری','بوهو','فانتزی'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `چند مهمان داری؟ 👥`, baleInlineKeyboard(GUEST_INLINE))
      return new Response('ok')
    }

    if(text.startsWith('guests_') || contains(['نفر','<20','20-50','50-100','100+'])){
      const design = `✨ تم پیشنهادی: جشن + ${text}\n👥 مهمان: ${text}\n🎨 پالت: فوشیا، بنفش، طلایی\n💰 بودجه: ۱۸ تا ۳۲ میلیون\n\nبرای رزرو شماره‌ات رو بفرست: 09206263218`
      await baleSendMessage(BALE_BOT_TOKEN, chatId, design)
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `📞 شماره تماس‌ت رو بفرست تا ادمین با 021-77947035 تماس بگیره`, {
        reply_markup: { keyboard: [[{text:'📞 ارسال شماره تماس', request_contact: true}]], resize_keyboard: true, one_time_keyboard: true }
      })
      return new Response('ok')
    }

    if(contains(['/gallery','گالری','نمونه کار'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `📸 گالری جشن‌ساز:\nhttps://celeb.neginejam.ir/#gallery`)
      return new Response('ok')
    }

    if(contains(['/packages','پکیج','قیمت'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `🎁 پکیج‌ها:\n💜 رویا ۱۲م\n⭐ ستاره ۲۸م (محبوب)\n👑 افسانه VIP ۶۵م\n🤖 طراحی AI ۵م\n\n☎️ 021-77947035 | 09206263218\nآیدی شما: ${chatIdStr}`)
      return new Response('ok')
    }

    if(contains(['/contact','تماس','رزرو','ادمین','human'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `📞 تماس مستقیم\n☎️ 021-77947035\n📱 09206263218\n📍 تهران نارمک\n🌐 https://celeb.neginejam.ir\n\nآیدی شما: ${chatIdStr} — این آیدی برای ادمین ارسال شد ✅`)
      return new Response('ok')
    }

    if(message?.contact){
      const phone = message.contact.phone_number
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `ممنون! شماره ${phone} ثبت شد 🙏 تیم با 021-77947035 تماس می‌گیره\nآیدی: ${chatIdStr}`)
      if(DB){
        await DB.prepare(`UPDATE ${TABLES.leads} SET phone = ?, updated_at = datetime("now") WHERE chat_id = ?`).bind(phone, chatIdStr).run().catch(()=>{})
      }
      return new Response('ok')
    }

    await baleSendMessage(BALE_BOT_TOKEN, chatId, `متوجه نشدم 😅 از منوی پایین انتخاب کن 👇\nآیدی شما: ${chatIdStr}\n\nبنویس: تولد، عروسی، یلدا\nدستورات: /start /gallery /packages`, baleReplyKeyboard(WELCOME_KB))

  } catch(e:any){
    console.error('bale webhook error', e)
  }

  return new Response('ok')
}

export const onRequestGet: PagesFunction = async () => {
  return new Response('Bale webhook endpoint - POST. Use /api/bale-status to check.', {status:200})
}

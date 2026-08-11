import { generateId, TABLES } from '../lib/db'

const BALE_API = 'https://tapi.bale.ai'

async function baleSendMessage(token: string, chatId: string|number, text: string, extra?: any) {
  const payload: any = { chat_id: chatId, text, ...extra }
  const url = `${BALE_API}/bot${token}/sendMessage`
  const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
  const data = await res.json().catch(async()=>({ok:false, raw: await res.text()})) as any
  if(!data.ok) console.error('baleSend failed', data)
  return data
}
function baleInlineKeyboard(rows: any[][]) { return { reply_markup: { inline_keyboard: rows } } }
function baleReplyKeyboard(rows: string[][]) { return { reply_markup: { keyboard: rows.map(r=>r.map(text=>({text}))), resize_keyboard: true } } }

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
  OWNER_SECRET?: string
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
  } catch(e){ console.error(e) }

  // Forward to admin if not admin itself
  if(baleAdmin && String(chatId) !== String(baleAdmin)){
    await baleSendMessage(BALE_BOT_TOKEN, baleAdmin, `🟢 Bale report\n👤 ${userName} | ID: ${chatIdStr}\n📱 09206263218 monitoring\n💬 ${text}`).catch(()=>{})
  }
  if(tgAdmin && ctx.env.TELEGRAM_BOT_TOKEN){
    await fetch(`https://api.telegram.org/bot${ctx.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: tgAdmin, text: `🟢 Bale report from ${chatIdStr} (${userName}): ${text}\n📱 09206263218`})
    }).catch(()=>{})
  }

  if(!BALE_BOT_TOKEN) return new Response('missing token', {status:500})

  const lower = text.toLowerCase()
  const contains = (kws:string[]) => kws.some(k=> lower.includes(k.toLowerCase()) || text.includes(k))

  try {
    if(text.startsWith('/setadmin')){
      const parts = text.split(' ')
      const secret = parts[1] || ''
      const ownerSecret = (ctx.env as any).OWNER_SECRET || 'jashnsaz2026'
      const isFirstSetup = !baleAdmin
      const isCurrentAdmin = baleAdmin && String(chatId) === String(baleAdmin)

      if(!isFirstSetup && !isCurrentAdmin){
        await baleSendMessage(BALE_BOT_TOKEN, chatId, `⛔️ فقط ادمین فعلی می‌تونه ادمین رو تغییر بده\nادمین فعلی: ${baleAdmin}\nآیدی شما: ${chatIdStr}`)
        return new Response('ok')
      }
      if(secret !== ownerSecret && !isFirstSetup){
        // Even first setup needs correct secret
        if(secret !== ownerSecret){
          await baleSendMessage(BALE_BOT_TOKEN, chatId, `🔒 رمز اشتباهه\nفرمت: /setadmin ${ownerSecret}\nآیدی شما: ${chatIdStr}`)
          return new Response('ok')
        }
      }
      let newAdminId = chatIdStr
      if(parts[2]) newAdminId = parts[2]
      await DB.prepare(`INSERT OR REPLACE INTO jashnsaz_settings (key, value) VALUES ('bale_admin_chat_id', ?)`).bind(newAdminId).run()
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `✅ ادمین بله ست شد\nID جدید: ${newAdminId}\nقبلی: ${baleAdmin || 'هیچکدام'}\n\nحالا فقط همین آیدی می‌تونه ادمین رو عوض کنه (امنیت)`)
      if(baleAdmin && String(baleAdmin) !== newAdminId){
        await baleSendMessage(BALE_BOT_TOKEN, baleAdmin, `⚠️ ادمین بله از ${baleAdmin} به ${newAdminId} تغییر کرد توسط ${chatIdStr}`).catch(()=>{})
      }
      return new Response('ok')
    }

    if(text.startsWith('/start') || lower==='start' || text==='شروع'){
      const welcome = `سلام ${userName ? userName+' عزیز' : ''}! من ربات جشن‌ساز هستم 🎉✨\nچه جشنی در پیش داری؟\n\nآیدی شما: ${chatIdStr}\n\n👇 منو با آیکن‌ها:`
      await baleSendMessage(BALE_BOT_TOKEN, chatId, welcome, baleReplyKeyboard(WELCOME_KB))
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `🎈 انتخاب سریع مناسبت با آیکن:`, baleInlineKeyboard(OCCASION_INLINE))
      return new Response('ok')
    }

    if(text.startsWith('occ_') || contains(['تولد','نامزدی','عروسی','یلدا','سازمانی','سیسمونی'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `استایل مورد علاقه‌ات چیه؟`, baleInlineKeyboard(STYLE_INLINE))
      return new Response('ok')
    }
    if(text.startsWith('style_') || contains(['مینیمال','لاکچری','بوهو','فانتزی'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `چند مهمان داری؟`, baleInlineKeyboard(GUEST_INLINE))
      return new Response('ok')
    }
    if(text.startsWith('guests_') || contains(['نفر'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `✨ تم پیشنهادی ثبت شد! شماره‌ات رو بفرست\n09206263218`)
      return new Response('ok')
    }
    if(contains(['/gallery','گالری'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `📸 گالری: https://celeb.neginejam.ir/#gallery`)
      return new Response('ok')
    }
    if(contains(['/packages','پکیج','قیمت'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `🎁 پکیج‌ها:\n💜 رویا ۱۲م\n⭐ ستاره ۲۸م\n👑 افسانه ۶۵م\n🤖 AI ۵م\n\n☎️ 021-77947035 | 09206263218\nآیدی شما: ${chatIdStr}`)
      return new Response('ok')
    }
    if(contains(['/contact','تماس','رزرو','ادمین','human'])){
      await baleSendMessage(BALE_BOT_TOKEN, chatId, `📞 تماس\n021-77947035\n09206263218\nآیدی شما: ${chatIdStr}\nhttps://celeb.neginejam.ir`)
      return new Response('ok')
    }

    await baleSendMessage(BALE_BOT_TOKEN, chatId, `متوجه نشدم 😅 از منوی پایین انتخاب کن 👇\nآیدی شما: ${chatIdStr}`, baleReplyKeyboard(WELCOME_KB))

  } catch(e:any){ console.error(e) }
  return new Response('ok')
}

export const onRequestGet: PagesFunction = async () => {
  return new Response('Bale webhook - POST. /api/bale-status for check', {status:200})
}

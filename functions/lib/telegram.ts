export async function tgSendMessage(token: string, chatId: string|number, text: string, extra?: any) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...extra,
  }
  const res = await fetch(url, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  const data = await res.json().catch(async()=>({ok:false, raw: await res.text()})) as any
  if(!data.ok) {
    console.error('tgSendMessage failed', JSON.stringify(data).slice(0,2000), 'payload', JSON.stringify(payload).slice(0,2000))
  }
  return data
}

export async function tgSendPhoto(token: string, chatId: string|number, photoUrl: string, caption?: string) {
  const url = `https://api.telegram.org/bot${token}/sendPhoto`
  const payload = {chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML'}
  const res = await fetch(url, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  const data = await res.json().catch(async()=>({ok:false, raw: await res.text()})) as any
  if(!data.ok) console.error('tgSendPhoto failed', data)
  return data
}

export async function tgAnswerCallback(token: string, callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`
  const payload: any = {callback_query_id: callbackQueryId}
  if(text) payload.text = text
  const res = await fetch(url, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  return res.json().catch(()=>({ok:true}))
}

export function inlineKeyboard(rows: any[][]) {
  return {reply_markup: {inline_keyboard: rows}}
}

export function replyKeyboard(rows: any[][], resize=true, oneTime=false) {
  return {reply_markup: {keyboard: rows.map(r=>r.map((t:string)=>({text:t}))), resize_keyboard: resize, one_time_keyboard: oneTime}}
}

export async function tgSendMessage(token: string, chatId: string|number, text: string, extra?: any) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    ...extra,
  }
  const res = await fetch(url, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  return res.json()
}

export async function tgSendPhoto(token: string, chatId: string|number, photoUrl: string, caption?: string) {
  const url = `https://api.telegram.org/bot${token}/sendPhoto`
  const payload = {chat_id: chatId, photo: photoUrl, caption, parse_mode: 'Markdown'}
  const res = await fetch(url, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)})
  return res.json()
}

export function inlineKeyboard(rows: any[][]) {
  return {reply_markup: {inline_keyboard: rows}}
}

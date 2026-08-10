export const onRequestGet: PagesFunction<{WHATSAPP_VERIFY_TOKEN:string}> = async (ctx)=>{
  const url = new URL(ctx.request.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')
  if(mode==='subscribe' && token===ctx.env.WHATSAPP_VERIFY_TOKEN){
    return new Response(challenge, {status:200})
  }
  return new Response('Forbidden', {status:403})
}

export const onRequestPost: PagesFunction<{
  WHATSAPP_TOKEN:string
  WHATSAPP_PHONE_NUMBER_ID:string
  TELEGRAM_BOT_TOKEN?:string
  TELEGRAM_ADMIN_CHAT_ID?:string
}> = async (ctx)=>{
  const body = await ctx.request.json() as any
  console.log('wa webhook', JSON.stringify(body).slice(0,3000))

  // اینجا پیام واتساپ را می‌گیریم و همین فلو تلگرام را اجرا می‌کنیم
  // برای سادگی فعلاً فقط به تلگرام ادمین فوروارد می‌کنیم
  const entry = body.entry?.[0]?.changes?.[0]?.value
  const msg = entry?.messages?.[0]
  const from = msg?.from
  const text = msg?.text?.body || ''

  if(from && ctx.env.TELEGRAM_ADMIN_CHAT_ID && ctx.env.TELEGRAM_BOT_TOKEN){
    const tgUrl = `https://api.telegram.org/bot${ctx.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    await fetch(tgUrl, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      chat_id: ctx.env.TELEGRAM_ADMIN_CHAT_ID,
      text: `💚 واتساپ جدید از ${from}:\n${text}`
    })})
  }

  return new Response('EVENT_RECEIVED')
}

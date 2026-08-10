export const onRequestPost: PagesFunction<{
  TELEGRAM_BOT_TOKEN?:string
  TELEGRAM_ADMIN_CHAT_ID?:string
  CONTACT_WEBHOOK?:string
}> = async (ctx)=>{
  const data = await ctx.request.json() as any
  // ذخیره در KV/D1 بعداً، فعلاً فوروارد
  if(ctx.env.TELEGRAM_BOT_TOKEN && ctx.env.TELEGRAM_ADMIN_CHAT_ID){
    const txt = `🎉 لید جدید از سایت جشن‌ساز\n\n👤 نام: ${data.name}\n📞 شماره: ${data.phone}\n🎂 مناسبت: ${data.occasion}\n🎨 سبک: ${data.style}\n👥 مهمان: ${data.guests}\n📍 شهر: ${data.city}\n📅 تاریخ: ${data.date}\n💬 پیام: ${data.message}\n\nتم AI: ${data.aiBrief||'—'}`
    await fetch(`https://api.telegram.org/bot${ctx.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: ctx.env.TELEGRAM_ADMIN_CHAT_ID, text: txt})
    })
  }
  if(ctx.env.CONTACT_WEBHOOK){
    await fetch(ctx.env.CONTACT_WEBHOOK, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)}).catch(()=>{})
  }
  return new Response(JSON.stringify({ok:true}), {headers:{'Content-Type':'application/json'}})
}

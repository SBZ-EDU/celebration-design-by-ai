// تست لوکال ربات تلگرام با polling - برای دیباگ
// npm i telegraf
// TELEGRAM_BOT_TOKEN=xxx npx tsx bots/telegram-bot.local.ts
import { Telegraf, Markup } from 'telegraf'

const token = process.env.TELEGRAM_BOT_TOKEN!
const bot = new Telegraf(token)

bot.start((ctx)=> ctx.reply('سلام! جشن‌ساز 🎉 چه جشنی داری؟', Markup.inlineKeyboard([
  [Markup.button.callback('🎂 تولد','occ_birthday'), Markup.button.callback('💍 نامزدی','occ_engagement')],
])))

bot.on('callback_query', async (ctx:any)=>{
  const data = ctx.callbackQuery.data
  if(data.startsWith('occ_')) await ctx.reply('سبک؟', Markup.inlineKeyboard([[Markup.button.callback('مینیمال','style_minimal')]]))
})

bot.launch()
console.log('bot started polling')

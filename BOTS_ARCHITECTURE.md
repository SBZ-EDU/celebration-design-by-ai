# 🤖 معماری ربات‌های تماس جشن‌ساز — تلگرام + واتساپ

این سند ساختار پیشنهادی برای ربات‌های بهتر شدن ارتباط با مشتری (Lead Training + Contact) است. طوری طراحی شده که با توکن‌هایی که در پیام بعدی می‌دهی، فقط با `env` فعال شود — بدون تغییر کد.

---

## 1. هدف ربات‌ها

**جشن‌ساز** الان دارد:
- فرم تماس → localStorage + webhook اختیاری
- چت دستیار داخلی (rule-based)

**ربات‌های جدید باید:**
1.  **شکار سرنخ (Lead Capture):** هر کسی که در سایت، تلگرام یا واتساپ پیام می‌دهد → اطلاعات (نام، مناسبت، تاریخ، بودجه، شهر) ذخیره شود
2.  **صلاحیت‌سنجی (Qualification):** سوال‌های هوشمند بپرسد تا بفهمد مشتری جدی است یا نه
3.  **آموزش/پرورش سرنخ (Lead Nurturing):** گالری، پکیج‌ها، نمونه کار را اتومات بفرستد
4.  **طراح هوشمند → ربات:** خروجی `AiDesigner` (تم، پالت، بودجه) را داخل چت ربات دوباره استفاده کند
5.  **Hand-off به انسان:** اگر سوالی پیچیده بود یا مشتری گفت «ادمین»، به گروه تلگرام ادمین‌ها + واتساپ مدیر فوروارد کند

---

## 2. مقایسه پلتفرم‌ها

### تلگرام (پیشنهاد اصلی برای ایران)
- ساخت ربات: 2 دقیقه با `@BotFather`
- API رایگان، مستندات عالی، وب‌هوک سریع
- قابلیت‌های جشن: ارسال آلبوم عکس (گالری)، دکمه شیشه‌ای (Inline Keyboard) برای انتخاب مناسبت/سبک، لوکیشن، تماس
- محدودیت: فیلترینگ، اما با پروکسی/دامنه Cloudflare قابل حل

### واتساپ
دو راه داری:

**A) WhatsApp Cloud API (رسمی Meta) — پیشنهادی**
- رایگان تا 1000 مکالمه/ماه
- نیاز به Business Manager + شماره متصل
- وب‌هوک: پیام‌ها به `functions/api/whatsapp-webhook.ts` می‌آیند
- قابلیت: template message, دکمه، لیست انتخاب، ارسال گالری

**B) Twilio / Wassenger / واسط ایرانی**
- اگر Cloud API تایید نشد، از Twilio WhatsApp یا سرویس ایرانی مثل `ippanel` یا `kavenegar` استفاده می‌کنیم
- همان ساختار وب‌هوک حفظ می‌شود، فقط `provider` عوض می‌شود

---

## 3. جریان مکالمه (Conversation Flow) — یکسان برای هر دو ربات

```
شروع /start یا Hi
↓
سلام! جشن‌ساز هستم 🎉 چه جشنی داری؟ [دکمه‌ها: تولد | نامزدی | عروسی | یلدا | سازمانی | سیسمونی]
↓
سبک مورد علاقه؟ [مینیمال | لاکچری | بوهو | کارتونی/فانتزی]
↓
چند نفر؟ [کمتر از 20 | 20-50 | 50-100 | 100+]
↓
→ موتور generateDesign() (همون که در سایت داری) → خروجی:
   نام تم + پالت 4 رنگ + لیست دکور + بودجه تومانی + نکته
↓
ارسال 2 عکس از گالری مرتبط + پکیج پیشنهادی (ستاره 28م)
↓
برای رزرو: نام، تاریخ، شهر، شماره تماس؟
↓
ذخیره Lead → ارسال به:
  - Telegram Admin Group
  - Google Sheet / D1 / KV
  - WhatsApp confirmation template به کاربر
↓
ادمین با /accept یا دکمه «تماس میگیرم» پاسخ می‌دهد
```

**دستورات تلگرام:**
- `/start` - شروع
- `/gallery` - گالری فیلترشونده
- `/packages` - پکیج‌ها
- `/design` - طراح هوشمند
- `/contact` - اطلاعات تماس + لوکیشن
- `/human` - اتصال به اپراتور

---

## 4. ساختار فنی پیشنهادی (Cloudflare-First)

چون سایتت روی Cloudflare Pages است (celebration-design-by-ai.pages.dev)، بهترین جا برای ربات‌ها **Cloudflare Pages Functions** است — بدون سرور جدا.

```
celebration-design-by-ai/
├─ functions/
│  ├─ api/
│  │  ├─ contact.ts               ← فرم سایت → تلگرام + واتساپ + D1
│  │  ├─ telegram-webhook.ts       ← وب‌هوک تلگرام (setWebhook)
│  │  ├─ whatsapp-webhook.ts       ← وب‌هوک واتساپ Cloud API (GET verify + POST message)
│  │  └─ leads.ts                  ← لیست لیدها برای ادمین (محافظت با token)
│  └─ lib/
│     ├─ telegram.ts               ← sendMessage, sendPhoto, InlineKeyboard builder
│     ├─ whatsapp.ts               ← send WhatsApp template / interactive
│     └─ leadStore.ts              ← Cloudflare D1/KV wrapper
├─ src/lib/
│  ├─ content.ts                   ← همین موتور فعلی (OCCASIONS, STYLES, generateDesign)
│  └─ botFlows.ts                  ← NEW: متن‌ها، دکمه‌ها، فلوها (فارسی)
├─ bots/
│  ├─ telegram-bot.local.ts        ← برای تست لوکال با Telegraf (polling)
│  └─ whatsapp-local.ts            ← تست لوکال
└─ .dev.vars / .env                ← توکن‌ها (هرگز کامیت نکن)
```

**چرا این ساختار؟**
- هر درخواست → Function → بدون سرور، رایگان، سریع
- توکن‌ها در `Cloudflare Pages → Settings → Environment variables` ذخیره می‌شود، نه در گیت
- از همان `generateDesign()` سایت استفاده می‌کنیم → یک منبع حقیقت

---

## 5. دیتا مدل Lead

```ts
type Lead = {
  id: string // uuid
  source: 'site' | 'telegram' | 'whatsapp'
  chatId: string // telegram chat_id یا whatsapp wa_id
  name?: string
  phone?: string
  occasion: 'birthday' | 'wedding' | ...
  style?: 'minimal' | 'luxury' | ...
  guests: string // "20-50"
  budget?: string // از generateDesign
  themeName?: string
  date?: string // تاریخ جشن
  city?: string
  status: 'new' | 'qualified' | 'contacted' | 'booked' | 'lost'
  createdAt: string
  messages: {role:'user'|'bot'|'admin', text:string, at:string}[]
}
```

ذخیره:
- گزینه 1 (سریع): Cloudflare KV `JASHNSAZ_LEADS`
- گزینه 2 (حرفه‌ای): Cloudflare D1 (SQLite) + Drizzle
- گزینه 3 (دمو): Google Sheet via webhook (فعلاً همین را داریم با `VITE_CONTACT_WEBHOOK`)

---

## 6. مراحل ساخت ربات تلگرام

1. در تلگرام برو `@BotFather` → `/newbot` → نام: `JashnSaz Bot` → یوزرنیم: `jashnsaz_bot` یا `celeb_neginejam_bot`
2. توکن می‌دهد مثل `123456:ABC-...` → همین را در پیام بعدی بده
3. دستورات را ست کن: `/setcommands` → لیست بالا
4. وب‌هوک ست کن (من بعد از گرفتن توکن انجام می‌دهم):
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://celebration-design-by-ai.pages.dev/api/telegram-webhook
   ```

---

## 7. مراحل ساخت ربات واتساپ (Cloud API)

1. https://developers.facebook.com → Create App → Business → WhatsApp
2. شماره تست می‌دهد، یا شماره واقعی `neginejam.ir` را اضافه کن
3. در `WhatsApp → Configuration → Webhook` → URL بگذار:
   `https://celebration-design-by-ai.pages.dev/api/whatsapp-webhook`
   Verify Token: یک رشته دلخواه مثل `jashnsaz_verify_2026`
4. توکن موقت (24 ساعته) یا Permanent System User Token بگیر
5. توکن + Phone Number ID + Verify Token را در پیام بعدی بده

اگر Cloud API سخت بود، Twilio ساده‌تر است: Twilio Console → Messaging → Try WhatsApp → Sandbox.

---

## 8. امنیت

- هیچ توکنی در گیت کامیت نشود → فقط در `.dev.vars` لوکال و Cloudflare Env
- `functions/api/leads.ts` با `ADMIN_SECRET` محافظت شود
- لاگ شماره تلفن‌ها فقط در KV/D1، نه در لاگ عمومی
- برای واتساپ، امضای `X-Hub-Signature-256` را چک می‌کنیم

---

## 9. وقتی توکن‌ها را دادی، من چه می‌کنم؟

تو در پیام بعدی این‌ها را بده (فرمت آزاد):

```
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_ADMIN_CHAT_ID= -100xxxx (یا آیدی عددی خودت)
WHATSAPP_TOKEN=EAA... (یا Twilio SID)
WHATSAPP_PHONE_NUMBER_ID=123...
WHATSAPP_VERIFY_TOKEN=jashnsaz_verify_2026
WHATSAPP_ADMIN_NUMBER=98912...
```

من:
1.  فایل‌های `functions/api/*` را کامل می‌کنم (کد واقعی با Telegraf-style بدون وابستگی سنگین)
2.  `src/lib/botFlows.ts` را با متن‌های فارسی جشن‌ساز می‌سازم
3.  `.env.example` را آپدیت می‌کنم
4.  وب‌هوک تلگرام را ست می‌کنم (`setWebhook`)
5.  یک تست end-to-end انجام می‌دهم (ارسال پیام تست به ادمین)
6.  دوباره روی Cloudflare Pages دیپلوی می‌کنم
7.  در GitHub کامیت می‌کنم (بدون افشای توکن)

---

## 10. نمونه ساختار دکمه‌های فارسی (برای ربات)

تلگرام:
```
[🎂 تولد] [💍 نامزدی]
[👰 عروسی] [🍉 یلدا]
[🏢 سازمانی] [👶 سیسمونی]
...
[✨ طراحی با هوش مصنوعی]
[📞 صحبت با ادمین]
```

واتساپ interactive list:
```
Section: نوع جشن
- Row: تولد کودک
- Row: عروسی
- Row: یلدا شب...
```

---

**آماده‌ای؟ توکن‌ها را بفرست، من در همین پروژه `celebration-design-by-ai` ربات‌ها را زنده می‌کنم و به `celeb.neginejam.ir` هم وصل می‌کنم وقتی دامنه فعال شد.**

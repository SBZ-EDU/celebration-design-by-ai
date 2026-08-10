# افزودن سابدامین celeb.neginejam.ir — راهنما

## وضعیت فعلی

- پروژه Pages ساخته شد و دیپلوی شد: https://celebration-design-by-ai.pages.dev
- دامنه `neginejam.ir` در اکانت شما (ID: 1c35e99a5a46b6c68cd19ccd0fc70c98) وجود دارد اما **وضعیت: pending** و DNS:
```
Status: NXDOMAIN (دامنه ثبت نیست یا نیم‌سرورها ست نشده)
Activation failure: unresolvable
NameServers required: apollo.ns.cloudflare.com, tina.ns.cloudflare.com
```
- دامنه `neginegam.ir` (که نوشتی) در اکانت نیست و در DNS هم NXDOMAIN است — احتمالاً تایپ اشتباه `neginejam.ir` است.

- توکن فعلی `ancient-fire-1864` (`cfat_URPZ...`) فقط دسترسی **Pages** دارد، نه DNS و نه Custom Hostnames. تست:
  - `POST /accounts/.../pages/projects/.../domains` با هر دامنه‌ای (`example.com`, `civicavita.com`, `exhibition2world.ir`) → خطا `8000015 invalid TLD`. این خطا معمولاً وقتی توکن دسترسی Zone ندارد یا دامنه Pending است برمی‌گردد.
  - `POST /zones/.../dns_records` → `Authentication error`

به همین دلیل اتوماتیک از طریق API نمی‌توان `celeb.neginejam.ir` را اضافه کرد.

## راه حل دستی (پیشنهادی)

### 1. فعال‌سازی دامنه neginejam.ir
1. بررسی کن دامنه `neginejam.ir` ثبت شده است؟ در whois.nic.ir جستجو کن. اگر ثبت نیست، ابتدا ثبت کن.
2. در پنل nic.ir، نیم‌سرورها را به:
   - `apollo.ns.cloudflare.com`
   - `tina.ns.cloudflare.com`
   تغییر بده.
3. در داشبورد Cloudflare → `neginejam.ir` → Status باید از `pending` به `active` تبدیل شود (چند ساعت طول می‌کشد).

### 2. افزودن سابدامین در Pages
1. Cloudflare Dashboard → Pages → `celebration-design-by-ai` → Custom domains → Set up a custom domain
2. وارد کن: `celeb.neginejam.ir`
3. اگر دامنه Active باشد، Cloudflare خودکار CNAME می‌سازد:
   - `celeb` → `celebration-design-by-ai.pages.dev` (Proxied)

اگر خطای `invalid TLD` دیدی، این به خاطر محدودیت موقت Cloudflare برای دامنه‌های .ir است (در Community گزارش شده). راهکار:
- یک دامنه واسط مثل `celeb.exhibition2world.ir` (که Active است و قبلاً `leadfair.exhibition2world.ir` روی همین اکانت فعال شده) اضافه کن، سپس از طریق Redirect Rule آن را به `celeb.neginejam.ir` بعداً منتقل کن.
- یا از دامنه `civicavita.com` که Active است استفاده کن: `celeb.civicavita.com`

### 3. ساخت توکن جدید با دسترسی کامل (برای اتوماسیون آینده)
اگر می‌خواهی من اتوماتیک انجام دهم، یک توکن جدید بساز:
Cloudflare Dashboard → My Profile → API Tokens → Create Token → Create Custom Token
- Name: `celebration-full`
- Permissions:
  - Account → Cloudflare Pages → Edit
  - Zone → Zone → Read
  - Zone → DNS → Edit
  - Zone → Custom Hostnames → Edit (یا SSL and Custom Hostnames)
  - Account → Account → Read (برای لیست zones)
- Account Resources: Include → Elasa2next@gmail.com's Account
- Zone Resources: Include → All zones (یا حداقل `neginejam.ir` و `exhibition2world.ir`)
- TTL: 1 hour
Token را اینجا بده تا `celeb.neginejam.ir` را اضافه کنم.

### 4. وضعیت GitHub
Repo: https://github.com/SBZ-EDU/celebration-design-by-ai
Workflow auto-deploy فعال است و با موفقیت دیپلوی کرد: https://5f76b522.celebration-design-by-ai.pages.dev

### پیشنهاد فوری
تا زمانی که `neginejam.ir` Active شود، می‌توانیم موقتاً از دامنه `celebration.neginejam.ir.pages.dev` یا `celebration-design-by-ai.pages.dev` استفاده کنیم. اگر می‌خواهی سریعاً روی `exhibition2world.ir` بیاوریم بالا، بگو تا `celeb.exhibition2world.ir` را با توکن جدید اضافه کنم.

---
برای ادامه، لطفاً:
1. تایید کن دامنه درست `neginejam.ir` است یا `neginegam.ir`؟
2. اگر ثبت نیست، ثبت کن و NSها را ست کن
3. توکن Full Access جدید بده (یا دستی از داشبورد اضافه کن)


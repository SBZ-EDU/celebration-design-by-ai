# 🎉 جشن‌ساز — Celebration Design by AI

**وب‌سایت استودیو طراحی و اجرای جشن با هوش مصنوعی** (فارسی، RTL، تم جشن بنفش-طلایی)

> Live: **https://celebration-design-by-ai.pages.dev**  
> GitHub: **https://github.com/SBZ-EDU/celebration-design-by-ai**  
> Brand: جشن‌ساز | Stack: React 18 + Vite 5 + Tailwind 3 + TypeScript  
> Deployed: Cloudflare Pages

نسخهٔ جدیدی از خانوادهٔ «Websites by AI» — حوزهٔ **طراحی جشن و رویداد**

## ✨ امکانات
- 🤖 طراح هوشمند: مناسبت + سبک + مهمان → تم، پالت رنگ، دکور، بودجه
- 💬 چت فارسی rule-based
- 🎁 پکت‌ها: رویا / ستاره / افسانه VIP / طراحی مفهومی AI
- 📸 گالری، 📖 مجله، FAQ، فرم رزرو

## 🚀 اجرا
```bash
npm install
npm run dev
npm run build
```

## ☁️ Cloudflare Pages
- Project: `celebration-design-by-ai`
- Build: `npm run build` → `dist`
```
npx wrangler pages deploy dist --project-name=celebration-design-by-ai
```
- Auto Deploy: `.github/workflows/deploy.yml` نیاز به Secrets دارد

### GitHub Secrets
در Settings → Secrets → Actions اضافه کن:
- `CLOUDFLARE_API_TOKEN` (توکن ancient-fire-1864 که دادی)
- `CLOUDFLARE_ACCOUNT_ID` = `5b456a2b43bb367410c50b35b9e7f71f`

## R2 نکته
AccessKeyID دادی ولی SecretAccessKey جا افتاد و R2 هنوز Enable نیست. برای آپلود عکس، R2 را از داشبورد فعال کن و Secret را بده.

MIT License

import { BRAND, SERVICES } from '../lib/content'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30 py-14">
      <div className="container-x grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-amber-500 text-xl shadow-glow">
              🎉
            </span>
            <span className="text-lg font-extrabold">{BRAND.name}</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-8 text-slate-400">
            {BRAND.name}، نخستین استودیو ایرانی است که طراحی مفهومی جشن را با هوش مصنوعی انجام
            می‌دهد و با تیم‌های اجرایی در {BRAND.city}، آن را تبدیل به خاطره می‌کند. کانسپت، رندر
            سه‌بعدی، اجرا — همه در یک‌جا.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            ✉️ {BRAND.email} &nbsp;|&nbsp; 📸 {BRAND.instagram} &nbsp;|&nbsp; ✈️ {BRAND.telegram}
          </p>
        </div>

        <div>
          <p className="font-bold text-fuchsia-200">خدمات</p>
          <ul className="mt-4 space-y-2">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.id}>
                <a href="#services" className="text-sm text-slate-400 transition-colors hover:text-fuchsia-300">
                  {s.icon} {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-bold text-fuchsia-200">دسترسی سریع</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#designer" className="text-slate-400 hover:text-fuchsia-300">✨ طراح هوشمند</a></li>
            <li><a href="#packages" className="text-slate-400 hover:text-fuchsia-300">🎁 پکت‌ها و قیمت‌ها</a></li>
            <li><a href="#gallery" className="text-slate-400 hover:text-fuchsia-300">📸 نمونه‌کارها</a></li>
            <li><a href="#blog" className="text-slate-400 hover:text-fuchsia-300">📖 مجلهٔ جشن‌ساز</a></li>
            <li><a href="#faq" className="text-slate-400 hover:text-fuchsia-300">❓ سوالات متداول</a></li>
            <li><a href="#contact" className="text-slate-400 hover:text-fuchsia-300">📞 رزرو مشاوره رایگان</a></li>
          </ul>
        </div>
      </div>

      <div className="container-x mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
        <p>© ۱۴۰۵ {BRAND.name} — ساخته‌شده با 💜 و کمی هوش مصنوعی</p>
        <p>Celebration Design by AI • MIT License</p>
      </div>
    </footer>
  )
}

import { BRAND, STATS } from '../lib/content'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-36">
      {/* گوی‌های نورانی پس‌زمینه */}
      <div className="pointer-events-none absolute -top-24 right-[8%] h-72 w-72 rounded-full bg-fuchsia-600/25 blur-3xl" />
      <div className="pointer-events-none absolute top-40 left-[5%] h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="container-x relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* متن */}
          <div className="animate-popIn">
            <span className="chip">✨ نخستین استودیو طراحی جشن با هوش مصنوعی در ایران</span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.35] sm:text-5xl sm:leading-[1.3]">
              جشنِ رویاهایت را،
              <br />
              <span className="gradient-text">هوش مصنوعی</span> طراحی می‌کند؛
              <br />
              ما اجرا می‌کنیم 🎈
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
              تولد، نامزدی، عروسی، یلدا یا رویداد سازمانی — در چند دقیقه کانسپت اختصاصی‌ات را
              با پالت رنگ و برآورد بودجه بگیر، رندر سه‌بعدی ببین، و تیم ما آن را دقیقاً همان‌طور
              که دیدی اجرا می‌کند.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#designer" className="btn-primary">
                ✨ طراح هوشمند را امتحان کن
              </a>
              <a href="#gallery" className="btn-ghost">
                دیدن نمونه‌کارها
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-slate-400">
              <span className="text-amber-400">★★★★★</span>
              <span>۴/۹ از ۵ — بر اساس ۴۸۰ جشن اجراشده</span>
            </p>
          </div>

          {/* تصویر */}
          <div className="relative animate-floaty">
            <div className="glass-card overflow-hidden !rounded-[2.5rem] p-2">
              <img
                src="/images/hero.jpg"
                alt="طراحی جشن لوکس با قوس بادکنک و گل‌آرایی"
                className="h-auto w-full rounded-[2rem] object-cover"
                loading="eager"
              />
            </div>
            <div className="glass-card absolute -bottom-6 -right-3 px-5 py-4 text-center sm:-right-6">
              <p className="text-2xl font-extrabold text-amber-300">۴۸ ساعته</p>
              <p className="text-xs text-slate-300">تحویل کانسپت طراحی</p>
            </div>
            <div className="glass-card absolute -top-6 -left-3 px-5 py-4 text-center sm:-left-6">
              <p className="text-2xl font-extrabold text-fuchsia-300">۳ کانسپت</p>
              <p className="text-xs text-slate-300">برای هر سفارش</p>
            </div>
          </div>
        </div>

        {/* آمار */}
        <div className="mt-20 grid grid-cols-2 gap-4 pb-20 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="glass-card px-6 py-5 text-center transition-transform hover:-translate-y-1">
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { PACKAGES, faNum } from '../lib/content'

export default function Packages() {
  return (
    <section id="packages" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">🎁 پکت‌ها</span>
          <h2 className="section-title mt-4">
            از <span className="gradient-text">رویا</span> تا <span className="gradient-text">افسانه</span>؛ برای هر بودجه
          </h2>
          <p className="mt-4 leading-8 text-slate-400">
            قیمت‌ها شفاف، جزئیات روشن، بدون سورپرایز روی فاکتور. پیش‌پرداخت فقط ۲۰٪.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PACKAGES.map((p) => (
            <article
              key={p.id}
              className={`glass-card relative flex flex-col p-7 transition-all duration-300 hover:-translate-y-2 ${
                p.highlighted
                  ? 'border-fuchsia-400/60 !bg-gradient-to-b !from-fuchsia-500/15 !to-transparent shadow-glow'
                  : 'hover:border-white/25'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-l from-fuchsia-600 to-amber-500 px-4 py-1 text-xs font-bold shadow-glow">
                  {p.badge} ⭐
                </span>
              )}
              <h3 className="text-xl font-extrabold">{p.name}</h3>
              <p className="mt-1 text-xs text-slate-400">
                {p.guests} • {p.duration}
              </p>
              <p className="mt-5">
                <span className="text-3xl font-extrabold text-white">{faNum(p.price)}</span>{' '}
                <span className="text-sm text-slate-400">{p.unit}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-white/10 pt-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm leading-6 text-slate-300">
                    <span className={`mt-0.5 ${p.highlighted ? 'text-fuchsia-400' : 'text-amber-400'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`${p.highlighted ? 'btn-primary' : 'btn-ghost'} mt-7 w-full !py-3 text-sm`}
              >
                انتخاب این پکت
              </a>
            </article>
          ))}
        </div>

        <div className="glass-card mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4 text-sm text-slate-300">
          <span>🛡️ ضمانت بازگشت وجه تا ۷ روز قبل</span>
          <span>🧾 فاکتور شفاف و رسمی</span>
          <span>💳 پرداخت مرحله‌ای</span>
        </div>
      </div>
    </section>
  )
}

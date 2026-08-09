import { TESTIMONIALS } from '../lib/content'

export default function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">💜 حرف‌های مهمانا</span>
          <h2 className="section-title mt-4">
            لبخندها، بهترین <span className="gradient-text">فاکتور</span> ماست
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.name}
              className="glass-card relative p-7 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30"
            >
              <span className="absolute -top-4 right-6 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-fuchsia-600 to-amber-500 text-lg shadow-glow">
                ”
              </span>
              <p className="leading-8 text-slate-200">{t.text}</p>
              <footer className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-lg font-extrabold text-fuchsia-300">
                    {t.name.trim()[0]}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
                <span className="text-sm tracking-wider text-amber-400">
                  {'★'.repeat(t.stars)}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

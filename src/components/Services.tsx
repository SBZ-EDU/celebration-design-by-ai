import { SERVICES } from '../lib/content'

export default function Services() {
  return (
    <section id="services" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">🎪 خدمات ما</span>
          <h2 className="section-title mt-4">
            برای هر <span className="gradient-text">مناسبتی</span>، یک دنیای دیزاین
          </h2>
          <p className="mt-4 leading-8 text-slate-400">
            از جشن‌های صمیمی خانگی تا گالاهای پانصد نفره؛ هر مناسبت با تم اختصاصی خودش.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <article
              key={s.id}
              className="group glass-card relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-2 hover:border-fuchsia-400/40 hover:shadow-glow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl transition-all group-hover:bg-fuchsia-500/25" />
              <span className="text-4xl">{s.icon}</span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-400">{s.desc}</p>
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-fuchsia-400">✦</span>
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { GALLERY } from '../lib/content'

const FILTERS = ['همه', 'تولد', 'نامزدی', 'عروسی', 'یلدا', 'سازمانی', 'سیسمونی']

export default function Gallery() {
  const [filter, setFilter] = useState('همه')
  const items = filter === 'همه' ? GALLERY : GALLERY.filter((g) => g.tag === filter)

  return (
    <section id="gallery" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">📸 نمونه‌کارها</span>
          <h2 className="section-title mt-4">
            جایی که <span className="gradient-text">کانسپت‌ها</span> واقعی شدند
          </h2>
          <p className="mt-4 leading-8 text-slate-400">
            هر پروژه اول یک رندر هوش مصنوعی بود؛ بعد شد همین عکس‌ها.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? 'border-fuchsia-400 bg-fuchsia-500/20 text-white'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <figure
              key={g.src + g.title}
              className="group glass-card animate-popIn overflow-hidden p-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
            >
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={g.src}
                  alt={g.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-bold backdrop-blur">
                  {g.tag}
                </span>
              </div>
              <figcaption className="p-4">
                <h3 className="font-bold">{g.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{g.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

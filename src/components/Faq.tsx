import { useState } from 'react'
import { FAQS } from '../lib/content'

export default function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">❓ سوالات متداول</span>
          <h2 className="section-title mt-4">
            هرچیزی که قبل از <span className="gradient-text">رزرو</span> می‌خواهی بدانی
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {FAQS.map((f, i) => {
            const open = openIdx === i
            return (
              <div key={f.q} className={`glass-card overflow-hidden transition-all ${open ? 'border-fuchsia-400/40' : ''}`}>
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-right"
                >
                  <span className="font-bold leading-7">{f.q}</span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-sm transition-transform duration-300 ${
                      open ? 'rotate-45 border-fuchsia-400 text-fuchsia-300' : 'text-slate-400'
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-white/10 p-5 pt-4 text-sm leading-8 text-slate-300">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

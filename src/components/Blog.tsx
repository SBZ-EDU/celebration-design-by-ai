import { useState } from 'react'
import { POSTS, type Post } from '../lib/content'

export default function Blog() {
  const [openPost, setOpenPost] = useState<Post | null>(null)

  return (
    <section id="blog" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">📖 مجلهٔ جشن‌ساز</span>
          <h2 className="section-title mt-4">
            قبل از جشن، این‌ها را <span className="gradient-text">بخوان</span>
          </h2>
          <p className="mt-4 leading-8 text-slate-400">
            تجربهٔ ۴۸۰ جشن، فشرده در چند مقالهٔ کوتاه و کاربردی.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POSTS.map((p) => (
            <button
              key={p.slug}
              onClick={() => setOpenPost(p)}
              className="glass-card group flex flex-col p-6 text-right transition-all duration-300 hover:-translate-y-2 hover:border-fuchsia-400/40 hover:shadow-glow"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="chip !border-amber-400/30 !bg-amber-500/10 !text-amber-200">{p.tag}</span>
                <span className="text-slate-500">⏱ {p.readTime}</span>
              </div>
              <h3 className="mt-4 font-bold leading-7 group-hover:text-fuchsia-300">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">{p.excerpt}</p>
              <span className="mt-4 text-sm font-bold text-fuchsia-300">
                ادامهٔ مطلب ←
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* مودال مطالعه */}
      {openPost && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpenPost(null)}
        >
          <article
            className="glass-card animate-popIn max-h-[85vh] w-full max-w-2xl overflow-y-auto !bg-[#150a23] p-7 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="chip !border-amber-400/30 !bg-amber-500/10 !text-amber-200">{openPost.tag}</span>
                <h3 className="mt-3 text-2xl font-extrabold leading-10">{openPost.title}</h3>
                <p className="mt-1 text-xs text-slate-500">زمان مطالعه: {openPost.readTime}</p>
              </div>
              <button
                onClick={() => setOpenPost(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-lg hover:bg-white/10"
                aria-label="بستن"
              >
                ✕
              </button>
            </div>
            <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
              {openPost.body.map((para, i) => (
                <p key={i} className="leading-8 text-slate-200">
                  {para}
                </p>
              ))}
            </div>
            <a href="#designer" onClick={() => setOpenPost(null)} className="btn-primary mt-8 w-full">
              ✨ حالا طراح هوشمند را امتحان کن
            </a>
          </article>
        </div>
      )}
    </section>
  )
}

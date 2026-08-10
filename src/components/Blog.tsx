import { useEffect, useState } from 'react'
import { POSTS as STATIC_POSTS, type Post } from '../lib/content'
import { apiGetPosts } from '../lib/api'

type DbPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string
  tags: string
  views: number
  created_at: string
  status: string
}

export default function Blog() {
  const [openPost, setOpenPost] = useState<any | null>(null)
  const [dbPosts, setDbPosts] = useState<DbPost[]>([])
  const [useDb, setUseDb] = useState(false)

  useEffect(()=>{
    apiGetPosts('published').then(d=>{
      if(d.posts && d.posts.length>0){
        setDbPosts(d.posts)
        setUseDb(true)
      }
    }).catch(()=>{})
  },[])

  const renderTags = (tagsStr: string) => {
    try { const arr = JSON.parse(tagsStr); return Array.isArray(arr)? arr.join('، ') : tagsStr } catch { return tagsStr }
  }

  return (
    <section id="blog" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">📖 مجلهٔ جشن‌ساز {useDb && <span className="text-[10px] bg-emerald-500 text-white px-1 rounded">DB</span>}</span>
          <h2 className="section-title mt-4">
            قبل از جشن، این‌ها را <span className="gradient-text">بخوان</span>
          </h2>
          <p className="mt-4 leading-8 text-slate-400">
            تجربهٔ ۴۸۰ جشن، فشرده در چند مقالهٔ کوتاه و کاربردی. {useDb ? `${dbPosts.length} پست از دیتابیس` : `${STATIC_POSTS.length} پست استاتیک`}
          </p>
        </div>

        {!useDb ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATIC_POSTS.map((p) => (
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
                <span className="mt-4 text-sm font-bold text-fuchsia-300">ادامهٔ مطلب ←</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dbPosts.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpenPost({title:p.title, tag: renderTags(p.tags), excerpt:p.excerpt, body:[p.content], image:p.image, readTime: `${p.views} بازدید`})}
                className="glass-card group flex flex-col p-0 text-right overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-fuchsia-400/40"
              >
                {p.image && <img src={p.image} alt={p.title} className="h-40 w-full object-cover" />}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="chip !border-amber-400/30 !bg-amber-500/10 !text-amber-200 truncate max-w-[60%]">{renderTags(p.tags)}</span>
                    <span className="text-slate-500">👁 {p.views}</span>
                  </div>
                  <h3 className="mt-4 font-bold leading-7 group-hover:text-fuchsia-300">{p.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">{p.excerpt}</p>
                  <span className="mt-4 text-sm font-bold text-fuchsia-300">ادامهٔ مطلب ←</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {openPost && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpenPost(null)}>
          <article className="glass-card animate-popIn max-h-[85vh] w-full max-w-2xl overflow-y-auto !bg-[#150a23] p-7 sm:p-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="chip !border-amber-400/30 !bg-amber-500/10 !text-amber-200">{openPost.tag}</span>
                <h3 className="mt-3 text-2xl font-extrabold leading-10">{openPost.title}</h3>
                <p className="mt-1 text-xs text-slate-500">زمان مطالعه: {(openPost as any).readTime || '3 دقیقه'}</p>
              </div>
              <button onClick={() => setOpenPost(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-lg hover:bg-white/10">✕</button>
            </div>
            {openPost.image && <img src={openPost.image} alt={openPost.title} className="mt-6 w-full h-56 object-cover rounded-xl" />}
            <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
              {(openPost.body || []).map((para: string, i: number) => (<p key={i} className="leading-8 text-slate-200">{para}</p>))}
              {openPost.content && <p className="leading-8 text-slate-200 whitespace-pre-wrap">{openPost.content}</p>}
            </div>
            <a href="#designer" onClick={() => setOpenPost(null)} className="btn-primary mt-8 w-full">✨ حالا طراح هوشمند را امتحان کن</a>
          </article>
        </div>
      )}
    </section>
  )
}

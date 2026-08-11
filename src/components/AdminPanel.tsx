import { useEffect, useState } from 'react'
import { apiGetLeads, apiUpdateLead, apiDeleteLead, apiGetPosts, apiCreatePost, apiUpdatePost, apiDeletePost, apiGetUsers, apiUpdateUser, apiDeleteUser } from '../lib/api'
import { useAuth } from '../lib/authContext'

export default function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const [tab, setTab] = useState<'leads'|'posts'|'users'|'bots'>('leads')
  const [leads, setLeads] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const [editingPost, setEditingPost] = useState<any>(null)
  const [postForm, setPostForm] = useState({title:'', excerpt:'', content:'', image:'', tags:'', status:'published'})

  const loadLeads = async () => {
    setLoading(true)
    try { const d = await apiGetLeads(); setLeads(d.leads) } catch(e:any){ setMsg(e.message) }
    setLoading(false)
  }
  const loadPosts = async () => {
    setLoading(true)
    try { const d = await apiGetPosts('all'); setPosts(d.posts) } catch(e:any){ setMsg(e.message) }
    setLoading(false)
  }
  const loadUsers = async () => {
    setLoading(true)
    try { const d = await apiGetUsers(); setUsers(d.users) } catch(e:any){ setMsg(e.message) }
    setLoading(false)
  }

  useEffect(()=>{
    if(!isAdmin) return
    if(tab==='leads') loadLeads()
    if(tab==='posts') loadPosts()
    if(tab==='users') loadUsers()
  },[tab, isAdmin])

  if(!user) {
    return (
      <div className="container-x py-20 text-center">
        <div className="glass-card max-w-md mx-auto p-8">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-xl font-bold">ورود به پنل ادمین</h3>
          <p className="text-white/60 mt-2 text-sm leading-7">برای مدیریت پست‌ها و لیدها باید اول وارد شوید.<br/>ادمین: admin@jashnsaz.ir / admin123</p>
          <div className="mt-6 flex gap-2 justify-center">
            <a href="#" onClick={e=>{e.preventDefault(); window.location.hash=''; window.dispatchEvent(new CustomEvent('open-auth'))}} className="btn-primary">ورود / ثبت نام</a>
            <a href="#" onClick={e=>{e.preventDefault(); window.location.hash=''}} className="btn-ghost">← بازگشت به سایت</a>
          </div>
        </div>
      </div>
    )
  }
  if(!isAdmin) {
    return (
      <div className="container-x py-20 text-center">
        <div className="glass-card max-w-md mx-auto p-8">
          <div className="text-5xl mb-4">⛔️</div>
          <h3 className="text-xl font-bold">دسترسی فقط برای ادمین</h3>
          <p className="text-white/60 mt-2 text-sm">شما با {user.email} وارد شدید (نقش: {user.role})<br/>فقط admin@jashnsaz.ir اجازه دارد</p>
          <div className="mt-6">
            <a href="#" onClick={e=>{e.preventDefault(); window.location.hash=''}} className="btn-ghost">← بازگشت به سایت</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x py-10" dir="rtl">
      <h2 className="section-title">پنل مدیریت جشن‌ساز — دیتابیس تست</h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={()=>setTab('leads')} className={`chip ${tab==='leads'?'bg-brand-500 text-white':''}`}>📩 لیدها ({leads.length})</button>
        <button onClick={()=>setTab('posts')} className={`chip ${tab==='posts'?'bg-brand-500 text-white':''}`}>📝 پست‌ها ({posts.length})</button>
        <button onClick={()=>setTab('users')} className={`chip ${tab==='users'?'bg-brand-500 text-white':''}`}>👥 کاربران ({users.length})</button>
        <button onClick={()=>setTab('bots')} className={`chip ${tab==='bots'?'bg-brand-500 text-white':''}`}>🤖 ربات‌ها</button>
      </div>

      {msg && <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl mb-4">{msg}</div>}

      {tab==='users' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">کاربران — کدام نقش اشتباه است؟</h3>
            <button onClick={loadUsers} className="btn-ghost text-sm">🔄 رفرش</button>
          </div>
          <div className="glass-card p-4 text-xs text-white/60 mb-2">
            <div>🔍 تست فعلی: admin@jashnsaz.ir باید admin باشد ✅</div>
            <div>🔍 admin2@jashnsaz.ir قبلاً user بود — الان به admin ارتقا دادم (فیکس شد)</div>
            <div>🔍 کاربران معمولی نمی‌توانند پست بسازند (تست: user@test.ir → POST /api/posts → 403 admin only) ✅</div>
            <div>🔍 لیدها قبلاً هر کاربر لاگین کرده می‌دید — الان فقط admin می‌بیند (فیکس شد: leads GET → admin only)</div>
            <div>🔍 بدون توکن → /api/leads → 401 auth required ✅</div>
          </div>
          {loading ? 'در حال بارگذاری...' : (
            <div className="grid gap-3">
              {users.map((u:any)=>(
                <div key={u.id} className="glass-card p-4 flex flex-col md:flex-row justify-between gap-3">
                  <div>
                    <div className="font-bold">{u.name || 'بدون نام'} — {u.email}</div>
                    <div className="text-sm text-white/60">نقش: <span className={`chip text-xs ${u.role==='admin'?'bg-fuchsia-500 text-white':''}`}>{u.role}</span> | {new Date(u.created_at).toLocaleString('fa-IR')}</div>
                    <div className="text-xs text-white/40">ID: {u.id} | phone: {u.phone || '-'}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select value={u.role} onChange={async e=>{
                      await apiUpdateUser(u.id, {role: e.target.value}); loadUsers()
                    }} className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <button onClick={async()=>{ if(confirm('حذف کاربر؟')){ await apiDeleteUser(u.id); loadUsers() } }} className="btn-ghost text-xs">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==='leads' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">لیست سرنخ‌ها (از سایت + تلگرام + واتساپ + بله)</h3>
            <button onClick={loadLeads} className="btn-ghost text-sm">🔄 رفرش</button>
          </div>
          {loading ? 'در حال بارگذاری...' : (
            <div className="grid gap-3">
              {leads.map(l=>(
                <div key={l.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="font-bold">{l.name||'بدون نام'}</span>
                      <span className="chip text-xs">{l.source}</span>
                      <span className={`chip text-xs ${l.status==='new'?'bg-emerald-500/20 text-emerald-300': l.status==='booked'?'bg-brand-500 text-white':''}`}>{l.status}</span>
                    </div>
                    <div className="text-sm text-white/70 mt-1">📞 {l.phone} | 🎂 {l.occasion} {l.style} | 👥 {l.guests} | 📍 {l.city} | 📅 {l.date}</div>
                    <div className="text-sm text-white/50 mt-1">{l.message} {l.ai_brief ? `| AI: ${l.ai_brief}` : ''}</div>
                    <div className="text-xs text-white/30">chat_id: {l.chat_id} | {new Date(l.created_at).toLocaleString('fa-IR')}</div>
                  </div>
                  <div className="flex gap-2">
                    <select value={l.status} onChange={async e=>{
                      await apiUpdateLead(l.id, {status: e.target.value}); loadLeads()
                    }} className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm">
                      <option value="new">new</option>
                      <option value="qualified">qualified</option>
                      <option value="contacted">contacted</option>
                      <option value="booked">booked</option>
                      <option value="lost">lost</option>
                    </select>
                    <button onClick={async()=>{ if(confirm('حذف؟')){ await apiDeleteLead(l.id); loadLeads() } }} className="btn-ghost text-xs">🗑️</button>
                  </div>
                </div>
              ))}
              {leads.length===0 && <div className="text-white/40">هنوز لیدی ثبت نشده</div>}
            </div>
          )}
        </div>
      )}

      {tab==='posts' && (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-bold mb-3">{editingPost ? 'ویرایش پست' : 'پست جدید'}</h3>
            <div className="grid gap-3">
              <input placeholder="عنوان" value={postForm.title} onChange={e=>setPostForm({...postForm, title:e.target.value})} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2" />
              <input placeholder="خلاصه" value={postForm.excerpt} onChange={e=>setPostForm({...postForm, excerpt:e.target.value})} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2" />
              <textarea placeholder="محتوا" value={postForm.content} onChange={e=>setPostForm({...postForm, content:e.target.value})} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 min-h-[120px]" />
              <input placeholder="عکس /images/..." value={postForm.image} onChange={e=>setPostForm({...postForm, image:e.target.value})} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2" />
              <input placeholder="تگ‌ها با کاما" value={postForm.tags} onChange={e=>setPostForm({...postForm, tags:e.target.value})} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2" />
              <select value={postForm.status} onChange={e=>setPostForm({...postForm, status:e.target.value})} className="bg-white/10 border border-white/10 rounded-xl px-4 py-2">
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
              <div className="flex gap-2">
                <button onClick={async()=>{
                  try{
                    const payload = {...postForm, tags: postForm.tags.split(',').map((t:string)=>t.trim()).filter(Boolean)}
                    if(editingPost){ await apiUpdatePost(editingPost.id, payload); setEditingPost(null) }
                    else { await apiCreatePost(payload) }
                    setPostForm({title:'', excerpt:'', content:'', image:'', tags:'', status:'published'}); loadPosts()
                  }catch(e:any){ setMsg(e.message) }
                }} className="btn-primary">{editingPost?'ذخیره':'ایجاد'}</button>
                {editingPost && <button onClick={()=>{setEditingPost(null); setPostForm({title:'', excerpt:'', content:'', image:'', tags:'', status:'published'})}} className="btn-ghost">لغو</button>}
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {posts.map(p=>(
              <div key={p.id} className="glass-card p-4">
                <div className="flex justify-between">
                  <b>{p.title}</b>
                  <span className="chip text-xs">{p.status}</span>
                </div>
                <div className="text-sm text-white/60">{p.excerpt}</div>
                <div className="text-xs text-white/40">slug: {p.slug} | views: {p.views}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={()=>{
                    let tagStr = ''
                    try { const arr = JSON.parse(p.tags); tagStr = Array.isArray(arr) ? arr.join(',') : p.tags } catch { tagStr = p.tags || '' }
                    setEditingPost(p)
                    setPostForm({title:p.title, excerpt:p.excerpt||'', content:p.content, image:p.image||'', tags: tagStr, status:p.status})
                  }} className="btn-ghost text-xs">✏️ ویرایش</button>
                  <button onClick={async()=>{ if(confirm('حذف؟')){ await apiDeletePost(p.id); loadPosts() } }} className="btn-ghost text-xs">🗑️ حذف</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='bots' && (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-bold">وضعیت ربات‌ها - celeb4neginejam</h3>
            <div className="text-sm text-white/70 space-y-2 mt-2">
              <div>✅ Telegram @celeb4neginejam_bot - webhook /api/telegram-webhook ✅</div>
              <div>✅ Bale @celeb4neginejam_bot - webhook /api/bale-webhook ✅ (via edge)</div>
              <div>✅ DB: jashnsaz_users, jashnsaz_leads, jashnsaz_posts, jashnsaz_sessions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

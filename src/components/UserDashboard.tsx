import { useEffect, useState } from 'react'
import { useAuth } from '../lib/authContext'
import { apiGetLeads, apiGetPosts } from '../lib/api'

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [myLeads, setMyLeads] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])

  useEffect(()=>{
    const load = async () => {
      try {
        // For user dashboard, show posts and try to get user-specific leads (if admin, show all, else filter by email in frontend for demo)
        const p = await apiGetPosts('published')
        setPosts((p.posts||[]).slice(0,3))
        try {
          const l = await apiGetLeads()
          setMyLeads(l.leads||[])
        } catch {
          // if not admin, leads API fails (now admin-only) - show empty with message
          setMyLeads([])
        }
      } catch {}
    }
    load()
  },[])

  if(!user) {
    return (
      <div className="container-x py-20 text-center">
        <div className="glass-card max-w-md mx-auto p-8">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-xl font-bold">داشبورد کاربر</h3>
          <p className="text-white/60 mt-2 text-sm">برای دیدن داشبورد باید وارد شوید</p>
          <a href="#" onClick={e=>{e.preventDefault(); window.dispatchEvent(new CustomEvent('open-auth'))}} className="btn-primary mt-4">ورود</a>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">سلام {user.name} 👋</h1>
          <p className="text-white/60 text-sm mt-1">داشبورد شخصی — {user.email} | نقش: {user.role}</p>
        </div>
        <button onClick={logout} className="btn-ghost text-xs">خروج</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="text-xs text-white/50">پروفایل</div>
          <div className="font-bold mt-2">{user.name}</div>
          <div className="text-sm text-white/60 mt-1">{user.email}</div>
          <div className="text-xs text-white/40 mt-1">نقش: {user.role}</div>
          <div className="mt-3 flex gap-2">
            <span className="chip text-xs">{user.role==='admin' ? 'ادمین' : 'کاربر'}</span>
            <span className="chip text-xs">تایید شده ✅</span>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-white/50">درخواست‌های من</div>
          <div className="text-3xl font-extrabold mt-1">{myLeads.length}</div>
          <div className="text-xs text-white/40 mt-1">اگه ادمین باشی همه لیدها رو می‌بینی، اگه کاربر باشی فقط درخواست‌های خودت (دمو)</div>
        </div>
        <div className="glass-card p-5 bg-gradient-to-br from-fuchsia-600/20 to-amber-500/20">
          <div className="text-xs text-white/50">دسترسی سریع</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href="#designer" className="btn-primary text-xs text-center">✨ طراح هوشمند</a>
            <a href="#packages" className="btn-ghost text-xs text-center">🎁 پکیج‌ها</a>
            <a href="https://t.me/celeb4neginejam_bot" target="_blank" className="btn-ghost text-xs text-center">🤖 ربات تلگرام</a>
            <a href="https://ble.ir/celeb4neginejam_bot" target="_blank" className="btn-ghost text-xs text-center">💬 ربات بله</a>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-bold mb-3">📖 مجله پیشنهادی برای تو</h3>
          <div className="space-y-2">
            {posts.map((p:any)=>(
              <div key={p.id} className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm">{p.title}</span>
                <a href="#blog" className="text-xs text-fuchsia-300">خواندن</a>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-bold mb-3">📩 درخواست‌های اخیر (دمو)</h3>
          {myLeads.length===0 ? (
            <div className="text-sm text-white/50">شما هنوز درخواستی ثبت نکردید. از طریق فرم تماس یا ربات تلگرام/بله درخواست بدید.</div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-auto">
              {myLeads.slice(0,5).map((l:any)=>(
                <div key={l.id} className="bg-white/5 rounded-xl p-3 text-sm flex justify-between">
                  <span>{l.occasion || l.source} - {l.city || ''}</span>
                  <span className="chip text-[10px]">{l.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-5 mt-6">
        <h3 className="font-bold">🔐 امنیت حساب</h3>
        <p className="text-xs text-white/60 mt-2">توکن شما در localStorage با کلید jashnsaz-token ذخیره شده و با JWT_SECRET امضا میشه. برای خروج، دکمه خروج رو بزن.</p>
        <div className="mt-3 text-[11px] font-mono bg-black/20 p-2 rounded">user: {user.email} | id: {user.id} | role: {user.role}</div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useAuth } from '../lib/authContext'

export default function AuthModal({open, onClose}:{open:boolean, onClose:()=>void}) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState('admin@jashnsaz.ir')
  const [password, setPassword] = useState('admin123')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  if(!open) return null

  const submit = async (e:any)=>{
    e.preventDefault()
    setErr(''); setLoading(true)
    try{
      if(mode==='login') await login(email,password)
      else await register(email,password,name,phone)
      onClose()
    } catch(ex:any){ setErr(ex.message) }
    finally{ setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" dir="rtl">
      <div className="glass-card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute left-4 top-4 text-white/60 hover:text-white">✕</button>
        <h3 className="text-xl font-bold mb-1">{mode==='login' ? 'ورود' : 'ثبت نام'}</h3>
        <p className="text-sm text-white/60 mb-4">برای دسترسی به پنل ادمین و مدیریت پست‌ها</p>

        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode('login')} className={`chip ${mode==='login'?'bg-brand-500 text-white':''}`}>ورود</button>
          <button onClick={()=>setMode('register')} className={`chip ${mode==='register'?'bg-brand-500 text-white':''}`}>ثبت نام</button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode==='register' && <>
            <input className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none" placeholder="نام" value={name} onChange={e=>setName(e.target.value)} required />
            <input className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none" placeholder="شماره (اختیاری)" value={phone} onChange={e=>setPhone(e.target.value)} />
          </>}
          <input className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none" placeholder="ایمیل" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none" placeholder="رمز عبور" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

          {err && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">{err}</div>}

          <button disabled={loading} className="btn-primary w-full justify-center">
            {loading ? '...': mode==='login' ? 'ورود' : 'ساخت حساب'}
          </button>

          <div className="text-xs text-white/40 space-y-1 mt-2">
            <div>تست ادمین: admin@jashnsaz.ir / admin123</div>
            <div>تست کاربر: user@test.ir / user123</div>
          </div>
        </form>
      </div>
    </div>
  )
}

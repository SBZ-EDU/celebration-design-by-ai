import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import AiDesigner from './components/AiDesigner'
import Packages from './components/Packages'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Blog from './components/Blog'
import Faq from './components/Faq'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ChatAssistant from './components/ChatAssistant'
import AuthModal from './components/AuthModal'
import AdminPanel from './components/AdminPanel'
import AdminDashboardPro from './components/AdminDashboardPro'
import UserDashboard from './components/UserDashboard'
import { AuthProvider, useAuth } from './lib/authContext'

function MainApp() {
  const [showAuth, setShowAuth] = useState(false)
  const [view, setView] = useState<'home'|'admin'|'dashboard'|'admin-old'>('home')
  const { user, logout, isAdmin, loading } = useAuth()

  useEffect(()=>{
    const parseHash = () => {
      const h = window.location.hash
      if(h==='#admin') setView('admin')
      else if(h==='#admin-old') setView('admin-old')
      else if(h==='#dashboard' || h==='#user') setView('dashboard')
      else setView('home')
    }
    parseHash()
    const onHash = () => parseHash()
    const onOpenAuth = ()=> setShowAuth(true)
    window.addEventListener('hashchange', onHash)
    window.addEventListener('open-auth' as any, onOpenAuth)
    return ()=> {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('open-auth' as any, onOpenAuth)
    }
  },[])

  return (
    <div className="min-h-screen" dir="rtl">
      <Header onAuthClick={()=>setShowAuth(true)} />
      {view === 'admin' ? (
        <main className="pt-20">
          {isAdmin ? <AdminDashboardPro /> : <AdminPanel />}
          <div className="container-x py-6 text-center flex gap-2 justify-center">
            <a href="#dashboard" className="btn-ghost text-sm">داشبورد کاربری</a>
            <a href="#admin-old" className="btn-ghost text-sm">پنل قدیمی (مدیریت کامل)</a>
            <a href="#" className="btn-ghost text-sm" onClick={e=>{e.preventDefault(); window.location.hash=''; setView('home')}}>← سایت</a>
          </div>
        </main>
      ) : view === 'admin-old' ? (
        <main className="pt-20">
          <AdminPanel />
          <div className="container-x py-6 text-center flex gap-2 justify-center">
            <a href="#admin" className="btn-primary text-sm">داشبورد حرفه‌ای جدید</a>
            <a href="#" className="btn-ghost text-sm" onClick={e=>{e.preventDefault(); window.location.hash=''; setView('home')}}>← سایت</a>
          </div>
        </main>
      ) : view === 'dashboard' ? (
        <main className="pt-20">
          <UserDashboard />
          <div className="container-x py-6 text-center flex gap-2 justify-center">
            {isAdmin && <a href="#admin" className="btn-primary text-sm">داشبورد ادمین حرفه‌ای</a>}
            <a href="#" className="btn-ghost text-sm" onClick={e=>{e.preventDefault(); window.location.hash=''; setView('home')}}>← سایت</a>
          </div>
        </main>
      ) : (
        <main>
          <Hero />
          <Services />
          <AiDesigner />
          <Packages />
          <Gallery />
          <Testimonials />
          <Blog />
          <Faq />
          <Contact />
          <section className="container-x py-6">
            <div className="glass-card p-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="text-sm">
                <b>🤖 ربات‌ها:</b> @celeb4neginejam_bot تلگرام/بله | DB: neginjam-db (jashnsaz_*) | Domain: celeb.neginejam.ir ✅<br/>
                <span className="text-white/60">ادمین: admin@jashnsaz.ir / admin123 | admin@neginejam.ir / NegineJam123! | کاربر: user@test.ir / user123 | {loading?'چک لاگین...': user ? `سلام ${user.name} (${user.role})` : 'لاگین نکرده'}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {!user ? <button onClick={()=>setShowAuth(true)} className="btn-primary text-sm">ورود / ثبت نام</button> : <>
                  <a href="#dashboard" className="btn-ghost text-sm">داشبورد من</a>
                  {isAdmin && <a href="#admin" className="btn-primary text-sm">ادمین حرفه‌ای</a>}
                  <button onClick={logout} className="btn-ghost text-sm">خروج</button>
                </>}
              </div>
            </div>
          </section>
        </main>
      )}
      <Footer />
      <ChatAssistant />
      <AuthModal open={showAuth} onClose={()=>setShowAuth(false)} />
    </div>
  )
}

export default function App() {
  return <AuthProvider><MainApp /></AuthProvider>
}

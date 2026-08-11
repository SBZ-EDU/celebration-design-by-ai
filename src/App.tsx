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
import { AuthProvider, useAuth } from './lib/authContext'

function MainApp() {
  const [showAuth, setShowAuth] = useState(false)
  const [view, setView] = useState<'home'|'admin'>('home')
  const { user, logout, isAdmin, loading } = useAuth()

  useEffect(()=>{
    const hash = window.location.hash
    if(hash==='#admin') setView('admin')
    const onHash = ()=> setView(window.location.hash==='#admin' ? 'admin' : 'home')
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
          <AdminPanel />
          <div className="container-x py-6 text-center">
            <a href="#" className="btn-ghost text-sm" onClick={e=>{e.preventDefault(); window.location.hash=''; setView('home')}}>← بازگشت به سایت</a>
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
          {/* Bot & DB status banner */}
          <section className="container-x py-6">
            <div className="glass-card p-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="text-sm">
                <b>🤖 ربات‌ها:</b> تلگرام webhook <code className="bg-white/10 px-1 rounded">/api/telegram-webhook</code> | واتساپ <code className="bg-white/10 px-1 rounded">/api/whatsapp-webhook</code> | DB: <code className="bg-white/10 px-1 rounded">neginjam-db</code>
                <br/>
                <span className="text-white/60">ادمین: admin@jashnsaz.ir / admin123 | کاربر: user@test.ir / user123 | {loading?'در حال چک لاگین...': user ? `سلام ${user.name} (${user.role})` : 'لاگین نکرده'}</span>
              </div>
              <div className="flex gap-2">
                {!user ? <button onClick={()=>setShowAuth(true)} className="btn-primary text-sm">ورود / ثبت نام</button> : <>
                  {isAdmin && <a href="#admin" className="btn-primary text-sm">پنل ادمین</a>}
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

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

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
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
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  )
}

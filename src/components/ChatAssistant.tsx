import { useEffect, useRef, useState } from 'react'
import { CHAT_KB, CHAT_FALLBACK, CHAT_SUGGESTIONS } from '../lib/content'

interface Msg {
  from: 'user' | 'bot'
  text: string
}

function answerOf(text: string): string {
  const t = text.toLowerCase()
  let best: { score: number; answer: string } | null = null
  for (const entry of CHAT_KB) {
    const score = entry.keywords.reduce((acc, k) => (t.includes(k) ? acc + k.length : acc), 0)
    if (score > 0 && (!best || score > best.score)) best = { score, answer: entry.answer }
  }
  // احوال‌پرسی ساده
  if (!best && /(سلام|درود|صبح بخیر|وقت بخیر|hi|hello)/i.test(t)) {
    return 'سلام! به جشن‌ساز خوش آمدی 🎉 من دستیار هوشمند جشن‌سازم؛ دربارهٔ قیمت‌ها، رزرو، شهرها یا طراحی با هوش مصنوعی بپرس!'
  }
  if (!best && /(ممنون|مرسی|تشکر|خسته نباش)/i.test(t)) {
    return 'قابلی نداشت! 💜 امیدوارم جشن‌ت حیرت‌انگیز شود. اگر چیز دیگری خواستی، همین‌جا هستم!'
  }
  return best?.answer ?? CHAT_FALLBACK
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: 'bot',
      text: 'سلام! 👋 من دستیار هوشمند جشن‌سازم. دربارهٔ قیمت، رزرو، خدمات یا طراحی با هوش مصنوعی هر سوالی داری بپرس!',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing, open])

  const send = (text: string) => {
    const q = text.trim()
    if (!q || typing) return
    setMsgs((m) => [...m, { from: 'user', text: q }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'bot', text: answerOf(q) }])
      setTyping(false)
    }, 700 + Math.random() * 600)
  }

  return (
    <>
      {/* دکمهٔ شناور */}
      <button
        onClick={() => {
          setOpen(!open)
          setUnread(false)
        }}
        className="fixed bottom-5 left-5 z-[80] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-fuchsia-600 to-amber-500 text-2xl shadow-glow transition-transform hover:scale-110 active:scale-95"
        aria-label="دستیار چت"
      >
        {open ? '✕' : '💬'}
        {unread && !open && (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 animate-pulse place-items-center rounded-full bg-red-500 text-[10px] font-bold">
            ۱
          </span>
        )}
      </button>

      {/* پنجرهٔ چت */}
      {open && (
        <div className="animate-popIn fixed bottom-24 left-5 z-[80] flex h-[520px] w-[calc(100vw-40px)] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#150a23]/95 shadow-card backdrop-blur-xl">
          {/* هدر */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-l from-fuchsia-600/25 to-amber-500/15 p-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-amber-500 text-xl shadow-glow">
              🤖
            </span>
            <div>
              <p className="text-sm font-extrabold">دستیار جشن‌ساز</p>
              <p className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> آنلاین — پاسخ آنی
              </p>
            </div>
          </div>

          {/* پیام‌ها */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-start' : 'justify-end'}`}>
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-7 ${
                    m.from === 'user'
                      ? 'rounded-br-sm bg-white/10 text-slate-100'
                      : 'rounded-bl-sm bg-gradient-to-l from-fuchsia-600/80 to-fuchsia-700/80 text-white'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {typing && (
              <div className="flex justify-end">
                <p className="rounded-2xl rounded-bl-sm bg-fuchsia-600/60 px-4 py-2.5 text-sm text-white">
                  <span className="animate-pulse">در حال نوشتن…</span>
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* پیشنهادها */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
            {CHAT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-fuchsia-500/20 hover:border-fuchsia-400/40"
              >
                {s}
              </button>
            ))}
          </div>

          {/* ورودی */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="سوالت را بنویس..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-fuchsia-400"
            />
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-l from-fuchsia-600 to-amber-500 text-lg shadow-glow transition-transform hover:scale-110 active:scale-95"
              aria-label="ارسال"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  )
}

import { useEffect, useState } from 'react'
import { BRAND, OCCASIONS } from '../lib/content'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', occasion: '', date: '', message: '' })

  // اگر از «طراح هوشمند» آمده باشد، پیام از قبل پر می‌شود
  useEffect(() => {
    try {
      const brief = localStorage.getItem('jashnsaz-brief')
      if (brief) {
        setForm((f) => ({ ...f, message: brief }))
        localStorage.removeItem('jashnsaz-brief')
      }
    } catch {}
  }, [])

  const set = (k: keyof typeof form) => (e: any) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    // ذخیرهٔ محلی + ارسال اختیاری به وب‌هوک (در صورت تنظیم در .env)
    try {
      const leads = JSON.parse(localStorage.getItem('jashnsaz-leads') ?? '[]')
      leads.push({ ...form, at: new Date().toISOString() })
      localStorage.setItem('jashnsaz-leads', JSON.stringify(leads))
    } catch {}
    const hook = import.meta.env.VITE_CONTACT_WEBHOOK
    if (hook) {
      try {
        await fetch(hook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } catch {}
    }
    setSent(true)
  }

  const inputCls =
    'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-fuchsia-400 focus:bg-white/[0.08]'

  return (
    <section id="contact" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">📞 رزرو و مشاوره</span>
          <h2 className="section-title mt-4">
            بیایید جشن‌تان را <span className="gradient-text">شروع</span> کنیم
          </h2>
          <p className="mt-4 leading-8 text-slate-400">
            فرم را پر کن؛ کمتر از ۲۴ ساعت آینده با راهنمایی و برآورد اولیه برمی‌گردیم.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* فرم */}
          <div className="glass-card p-6 sm:p-8">
            {sent ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center animate-popIn">
                <span className="text-6xl">🎊</span>
                <h3 className="mt-6 text-2xl font-extrabold">پیامت رسید!</h3>
                <p className="mt-3 max-w-sm leading-8 text-slate-300">
                  {form.name || 'دوست'} عزیز، تیم {BRAND.name} تا ۲۴ ساعت آینده برای هماهنگی تماس می‌گیرد.
                  اگر عجله داری: <a className="font-bold text-amber-300" dir="ltr" href={`tel:${BRAND.phoneLink}`}>{BRAND.phone}</a>
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <input required value={form.name} onChange={set('name')} placeholder="نام و نام خانوادگی *" className={inputCls} />
                <input
                  required
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="شماره تماس *"
                  className={inputCls}
                  inputMode="tel"
                  dir="ltr"
                />
                <select required value={form.occasion} onChange={set('occasion')} className={`${inputCls} [&>option]:bg-[#1a0e2a]`}>
                  <option value="">مناسبت چیست؟ *</option>
                  {OCCASIONS.map((o) => (
                    <option key={o.id} value={o.label}>
                      {o.emoji} {o.label}
                    </option>
                  ))}
                  <option value="سایر">🎈 سایر</option>
                </select>
                <input value={form.date} onChange={set('date')} placeholder="تاریخ جشن (مثلاً ۱۵ آذر)" className={inputCls} />
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  placeholder="هرچه از جشن رویایی‌ات در سرت است، این‌جا بنویس..."
                  rows={4}
                  className={`${inputCls} sm:col-span-2`}
                />
                <button type="submit" className="btn-primary sm:col-span-2 !py-4">
                  ارسال درخواست رزرو 🎉
                </button>
                <p className="text-center text-xs text-slate-500 sm:col-span-2">
                  با ارسال فرم، با تماس تیم مشاورهٔ {BRAND.name} موافقت می‌کنید.
                </p>
              </form>
            )}
          </div>

          {/* اطلاعات تماس */}
          <div className="space-y-5">
            <div className="glass-card p-6">
              <p className="font-bold text-fuchsia-200">☎️ تماس مستقیم</p>
              <a href={`tel:${BRAND.phoneLink}`} className="mt-2 block text-2xl font-extrabold text-amber-300" dir="ltr">
                {BRAND.phone}
              </a>
              <p className="mt-2 text-sm text-slate-400">موبایل مشاوره: {BRAND.mobile}</p>
            </div>
            <div className="glass-card p-6">
              <p className="font-bold text-fuchsia-200">🕐 ساعات کاری</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{BRAND.hours}</p>
            </div>
            <div className="glass-card p-6">
              <p className="font-bold text-fuchsia-200">📍 محدودهٔ فعالیت</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{BRAND.city}</p>
              <p className="mt-1 text-xs text-slate-500">{BRAND.address}</p>
            </div>
            <div className="glass-card flex items-center justify-around p-6 text-3xl">
              <a href="#" title="اینستاگرام" className="transition-transform hover:scale-125">📸</a>
              <a href="#" title="تلگرام" className="transition-transform hover:scale-125">✈️</a>
              <a href="#" title="واتس‌اپ" className="transition-transform hover:scale-125">💬</a>
              <a href={`mailto:${BRAND.email}`} title="ایمیل" className="transition-transform hover:scale-125">📧</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

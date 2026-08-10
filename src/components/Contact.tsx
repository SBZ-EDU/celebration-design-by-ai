import { useEffect, useState } from 'react'
import { BRAND, OCCASIONS } from '../lib/content'
import { apiCreateLead, apiContact } from '../lib/api'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', occasion: '', date: '', city: '', message: '', email: '' })

  useEffect(() => {
    try {
      const brief = localStorage.getItem('jashnsaz-brief')
      if (brief) {
        setForm((f) => ({ ...f, message: brief }))
        localStorage.removeItem('jashnsaz-brief')
      }
    } catch {}
  }, [])

  const set = (k: keyof typeof form) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      try {
        const leads = JSON.parse(localStorage.getItem('jashnsaz-leads') ?? '[]')
        leads.push({ ...form, at: new Date().toISOString() })
        localStorage.setItem('jashnsaz-leads', JSON.stringify(leads))
      } catch {}

      try {
        await apiCreateLead({
          source: 'site',
          name: form.name,
          phone: form.phone,
          email: form.email,
          occasion: form.occasion,
          city: form.city,
          date: form.date,
          message: form.message,
          ai_brief: form.message?.slice(0,200)
        })
      } catch (ex:any) {
        try { await apiContact(form) } catch {}
        console.warn('lead api failed', ex)
      }

      const hook = (import.meta as any).env?.VITE_CONTACT_WEBHOOK
      if (hook) {
        try { await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }) } catch {}
      }

      setSent(true)
    } catch (ex:any) { setErr(ex.message) }
    finally { setLoading(false) }
  }

  const inputCls = 'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-fuchsia-400 focus:bg-white/[0.08]'

  return (
    <section id="contact" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">📞 رزرو و مشاوره + 🤖 ربات celeb4neginejam</span>
          <h2 className="section-title mt-4">
            بیایید جشن‌تان را <span className="gradient-text">شروع</span> کنیم
          </h2>
          <p className="mt-4 leading-8 text-slate-400">
            فرم را پر کن؛ کمتر از ۲۴ ساعت آینده برمی‌گردیم. اطلاعاتت مستقیم در دیتابیس <code className="bg-white/10 px-1 rounded">jashnsaz_leads</code> و ربات‌های تلگرام/بله ذخیره می‌شود.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="glass-card p-6 sm:p-8">
            {sent ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center animate-popIn">
                <span className="text-6xl">🎊</span>
                <h3 className="mt-6 text-2xl font-extrabold">پیامت رسید و در دیتابیس ذخیره شد!</h3>
                <p className="mt-3 max-w-sm leading-8 text-slate-300">
                  {form.name || 'دوست'} عزیز، تیم {BRAND.name} تا ۲۴ ساعت آینده تماس می‌گیرد.
                  <br/> ربات‌های جدید:
                  <br/><a className="text-fuchsia-300 font-bold" href="https://t.me/celeb4neginejam_bot" target="_blank">@celeb4neginejam_bot (تلگرام)</a>
                  <br/><a className="text-fuchsia-300 font-bold" href="https://ble.ir/celeb4neginejam_bot" target="_blank">@celeb4neginejam_bot (بله)</a>
                </p>
                <button onClick={()=>setSent(false)} className="btn-ghost mt-4 text-sm">ارسال دوباره</button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <input required value={form.name} onChange={set('name')} placeholder="نام و نام خانوادگی *" className={inputCls} />
                <input required value={form.phone} onChange={set('phone')} placeholder="شماره تماس *" className={inputCls} inputMode="tel" dir="ltr" />
                <select required value={form.occasion} onChange={set('occasion')} className={`${inputCls} [&>option]:bg-[#1a0e2a]`}>
                  <option value="">مناسبت چیست؟ *</option>
                  {OCCASIONS.map((o) => (<option key={o.id} value={o.label}>{o.emoji} {o.label}</option>))}
                  <option value="سایر">🎈 سایر</option>
                </select>
                <input value={form.date} onChange={set('date')} placeholder="تاریخ جشن (۱۴۰۴/۰۶/۲۰)" className={inputCls} />
                <input value={form.city} onChange={set('city')} placeholder="شهر" className={inputCls} />
                <input value={form.email} onChange={set('email')} placeholder="ایمیل (اختیاری)" className={`${inputCls} sm:col-span-2`} type="email" />
                <textarea value={form.message} onChange={set('message')} placeholder="توضیح جشن + خروجی طراح هوشمند" rows={4} className={`${inputCls} sm:col-span-2`} />
                {err && <div className="sm:col-span-2 text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-sm">{err}</div>}
                <button type="submit" disabled={loading} className="btn-primary sm:col-span-2 !py-4">{loading?'در حال ارسال...':'ارسال به دیتابیس + ربات‌ها 🎉'}</button>
                <p className="text-center text-xs text-slate-500 sm:col-span-2">ذخیره در D1 jashnsaz_leads + فوروارد به تلگرام/بله ادمین (اگر ADMIN_CHAT_ID ست باشد)</p>
              </form>
            )}
          </div>

          <div className="space-y-5">
            <div className="glass-card p-6">
              <p className="font-bold text-fuchsia-200">☎️ تماس مستقیم</p>
              <a href={`tel:${BRAND.phoneLink}`} className="mt-2 block text-2xl font-extrabold text-amber-300" dir="ltr">{BRAND.phone}</a>
              <p className="mt-2 text-sm text-slate-400">موبایل مشاوره: {BRAND.mobile}</p>
            </div>
            <div className="glass-card p-6">
              <p className="font-bold text-fuchsia-200">🤖 ربات‌های فعال - celeb4neginejam</p>
              <div className="mt-2 space-y-2 text-sm">
                <div>تلگرام: <a href="https://t.me/celeb4neginejam_bot" target="_blank" className="text-fuchsia-300 font-bold">@celeb4neginejam_bot</a> — webhook ✅ ست شد</div>
                <div>بله: <a href="https://ble.ir/celeb4neginejam_bot" target="_blank" className="text-fuchsia-300 font-bold">@celeb4neginejam_bot</a> — webhook باید از ایران ست شود</div>
                <div>تست قدیمی: @exhibition_ai_bot و @exhibition_bot همچنان فعال</div>
                <div className="text-xs text-white/40">DB: neginjam-db → jashnsaz_users, jashnsaz_leads, jashnsaz_posts</div>
              </div>
            </div>
            <div className="glass-card p-6">
              <p className="font-bold text-fuchsia-200">🕐 ساعات کاری</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{BRAND.hours}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

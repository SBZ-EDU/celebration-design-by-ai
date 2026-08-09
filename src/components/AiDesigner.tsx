import { useState } from 'react'
import {
  OCCASIONS,
  STYLES,
  GUESTS_BANDS,
  generateDesign,
  faNum,
  type DesignResult,
} from '../lib/content'

function OptionButton({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean
  onClick: () => void
  emoji: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
        active
          ? 'border-fuchsia-400 bg-fuchsia-500/20 text-white shadow-glow'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.07]'
      }`}
    >
      <span className="text-lg">{emoji}</span>
      {label}
    </button>
  )
}

export default function AiDesigner() {
  const [occId, setOccId] = useState('birthday')
  const [styleId, setStyleId] = useState('classic')
  const [bandId, setBandId] = useState('m')
  const [result, setResult] = useState<DesignResult | null>(null)
  const [thinking, setThinking] = useState(false)

  const run = () => {
    setThinking(true)
    setResult(null)
    // شبیه‌سازی تفکر موتور طراحی
    setTimeout(() => {
      setResult(generateDesign(occId, styleId, bandId))
      setThinking(false)
    }, 900)
  }

  return (
    <section id="designer" className="scroll-mt-24 py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip">🤖✨ موتور طراحی — رایگان و آنی</span>
          <h2 className="section-title mt-4">
            <span className="gradient-text">طراح هوشمند</span> جشن
          </h2>
          <p className="mt-4 leading-8 text-slate-400">
            سه انتخاب ساده بکن؛ کانسپت اختصاصی‌ات را با پالت رنگ، لیست دکور و برآورد بودجه تحویل بگیر.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* فرم انتخاب */}
          <div className="glass-card p-6 sm:p-8">
            <div>
              <h3 className="mb-3 font-bold text-fuchsia-200">۱) مناسبت چیست؟</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {OCCASIONS.map((o) => (
                  <OptionButton
                    key={o.id}
                    active={occId === o.id}
                    onClick={() => setOccId(o.id)}
                    emoji={o.emoji}
                    label={o.label}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-3 font-bold text-fuchsia-200">۲) سبک دلخواهت؟</h3>
              <div className="grid grid-cols-2 gap-3">
                {STYLES.map((s) => (
                  <OptionButton
                    key={s.id}
                    active={styleId === s.id}
                    onClick={() => setStyleId(s.id)}
                    emoji={s.emoji}
                    label={s.label}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="mb-3 font-bold text-fuchsia-200">۳) چند مهمان داری؟</h3>
              <div className="grid grid-cols-2 gap-3">
                {GUESTS_BANDS.map((b) => (
                  <OptionButton
                    key={b.id}
                    active={bandId === b.id}
                    onClick={() => setBandId(b.id)}
                    emoji={b.emoji}
                    label={b.label}
                  />
                ))}
              </div>
            </div>

            <button onClick={run} disabled={thinking} className="btn-primary mt-10 w-full !py-4 text-base disabled:opacity-60">
              {thinking ? '⏳ در حال طراحی کانسپت...' : '✨ طراحی کن!'}
            </button>
          </div>

          {/* نتیجه */}
          <div className="glass-card relative overflow-hidden p-6 sm:p-8">
            <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />

            {!result && !thinking && (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
                <span className="text-6xl">🎨</span>
                <p className="mt-6 max-w-xs leading-8 text-slate-400">
                  کانسپت طراحی‌شده‌ات این‌جا ظاهر می‌شود؛
                  <br />
                  مثل یک مودبورد واقعی!
                </p>
              </div>
            )}

            {thinking && (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
                <span className="animate-spin text-5xl">💫</span>
                <p className="mt-6 max-w-xs animate-pulse leading-8 text-fuchsia-200">
                  در حال ترکیب‌کردن رنگ‌ها، گل‌ها و ایده‌ها...
                </p>
              </div>
            )}

            {result && (
              <div className="animate-popIn" key={result.themeName + result.budgetMax}>
                <p className="text-xs text-slate-400">کانسپت پیشنهادی هوش مصنوعی:</p>
                <h3 className="mt-2 text-3xl font-extrabold">
                  تم «<span className="gradient-text">{result.themeName}</span>»
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {result.occasion.emoji} {result.occasion.label} • {result.style.emoji} {result.style.label} • {result.band.label}
                </p>

                {/* پالت رنگ */}
                <div className="mt-6">
                  <p className="mb-2 text-sm font-bold text-fuchsia-200">🎨 پالت رنگ پیشنهادی</p>
                  <div className="flex gap-3">
                    {result.style.palette.map((c) => (
                      <div key={c} className="text-center">
                        <span
                          className="block h-12 w-12 rounded-2xl border border-white/20 shadow-card"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* اجزای دکور */}
                <div className="mt-6">
                  <p className="mb-2 text-sm font-bold text-fuchsia-200">🧩 اجزای دکور</p>
                  <ul className="space-y-2">
                    {result.decor.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm leading-6 text-slate-300">
                        <span className="mt-0.5 text-amber-400">✦</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* بودجه */}
                <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
                  <p className="text-sm font-bold text-amber-200">💰 برآورد بودجه</p>
                  <p className="mt-1 text-xl font-extrabold text-white">
                    {faNum(result.budgetMin)} تا {faNum(result.budgetMax)}{' '}
                    <span className="text-sm font-medium text-slate-300">تومان</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    آماده‌سازی: حدود {faNum(result.prepDays)} روز قبل از جشن رزرو کن
                  </p>
                </div>

                {/* نکته */}
                <p className="mt-4 rounded-2xl bg-white/[0.05] p-4 text-xs leading-6 text-slate-300">
                  <span className="font-bold text-fuchsia-300">💡 نکتهٔ حرفه‌ای: </span>
                  {result.tip}
                </p>

                <a
                  href="#contact"
                  onClick={() => {
                    try {
                      localStorage.setItem(
                        'jashnsaz-brief',
                        `سلام! از طراح هوشمند استفاده کردم. تم پیشنهادی: «${result.themeName}» برای ${result.occasion.label} با سبک ${result.style.label} (${result.band.label}). برآورد: ${result.budgetMin.toLocaleString('fa-IR')} تا ${result.budgetMax.toLocaleString('fa-IR')} تومان.`,
                      )
                    } catch {}
                  }}
                  className="btn-primary mt-6 w-full"
                >
                  همین تم را رزرو کن 🎉
                </a>
              </div>
            )}
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-6 text-slate-500">
          * برآوردها بر اساس داده‌های اجرای واقعی جشن‌ساز است؛ قیمت نهایی پس از بازدید/جلسهٔ
          نیازسنجی شفاف اعلام می‌شود.
        </p>
      </div>
    </section>
  )
}

/** متن‌ها و فلوهای مشترک برای تلگرام و واتساپ - جشن‌ساز */
export const BOT_TEXTS = {
  welcome: `سلام! من ربات جشن‌ساز هستم 🎉✨\nطراحی و اجرای جشن با هوش مصنوعی\n\nچه جشنی در پیش داری؟`,
  askOccasion: `چه نوع جشنی؟`,
  askStyle: `سبک مورد علاقه‌ات چیه؟`,
  askGuests: `چند مهمان داری؟`,
  askDate: `تاریخ جشن کی هست؟ (مثلاً 1405/06/20)`,
  askCity: `شهر کجاست؟`,
  askName: `اسمت رو بگو تا با همون صدات کنم؟`,
  askPhone: `شماره تماس‌ت رو بفرست تا ادمین سریع باهات تماس بگیره 📞`,
  thanksLead: (name:string, theme:string) => `عالیه ${name} جان! 🎊\nتم پیشنهادی‌ات: *${theme}*\nتیمت تماس می‌گیره و پیش‌فاکتور می‌فرسته.\n\nگالری رو ببینی؟ /gallery`,
  fallback: `متوجه نشدم 😅 یکی از دکمه‌ها رو بزن یا /human برای صحبت با ادمین`,
  human: `درخواستت به ادمین ارسال شد 🙋‍♀️ همین الان جواب میده. شماره پشتیبانی: 021-91008877`,
}

export const OCCASION_BUTTONS = [
  [{text: '🎂 تولد', callback_data: 'occ_birthday'}, {text: '💍 نامزدی', callback_data: 'occ_engagement'}],
  [{text: '👰 عروسی', callback_data: 'occ_wedding'}, {text: '🍉 یلدا', callback_data: 'occ_yalda'}],
  [{text: '🏢 سازمانی', callback_data: 'occ_corporate'}, {text: '👶 سیسمونی', callback_data: 'occ_baby'}],
]

export const STYLE_BUTTONS = [
  [{text: '🤍 مینیمال', callback_data: 'style_minimal'}, {text: '👑 لاکچری', callback_data: 'style_luxury'}],
  [{text: '🌿 بوهو', callback_data: 'style_boho'}, {text: '🎈 فانتزی', callback_data: 'style_cartoon'}],
]

export const GUEST_BUTTONS = [
  [{text: '<20 نفر', callback_data: 'guests_<20'}, {text: '20-50', callback_data: 'guests_20-50'}],
  [{text: '50-100', callback_data: 'guests_50-100'}, {text: '100+ نفر', callback_data: 'guests_100+'}],
]

export const MAIN_MENU = [
  [{text: '✨ طراحی با AI', callback_data: 'menu_design'}, {text: '🎁 پکیج‌ها', callback_data: 'menu_packages'}],
  [{text: '📸 گالری', callback_data: 'menu_gallery'}, {text: '📞 تماس', callback_data: 'menu_contact'}],
]

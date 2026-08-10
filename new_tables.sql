CREATE TABLE IF NOT EXISTS jashnsaz_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jashnsaz_leads (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  chat_id TEXT,
  name TEXT,
  phone TEXT,
  email TEXT,
  occasion TEXT,
  style TEXT,
  guests TEXT,
  budget TEXT,
  theme_name TEXT,
  city TEXT,
  date TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  message TEXT,
  ai_brief TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jashnsaz_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image TEXT,
  tags TEXT,
  author_id TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  views INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jashnsaz_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- copy existing users and leads into prefixed tables if not exists
INSERT OR IGNORE INTO jashnsaz_users SELECT * FROM users;
INSERT OR IGNORE INTO jashnsaz_leads SELECT * FROM leads;

-- seed posts with new schema if empty
INSERT OR IGNORE INTO jashnsaz_posts (id, slug, title, excerpt, content, image, tags, author_id, status) VALUES
('post-1', 'tavalod-minimal', 'ایده‌های تولد مینیمال ۱۴۰۴', 'ترندهای تولد مینیمال', 'محتوای کامل تولد مینیمال...', '/images/gallery-birthday.jpg', '["تولد","مینیمال"]', 'admin-001', 'published'),
('post-2', 'aroosi-boho', 'عروسی بوهو در باغ', 'چطور یک عروسی بوهو رویایی بسازی', 'محتوای بوهو...', '/images/gallery-wedding.jpg', '["عروسی","بوهو"]', 'admin-001', 'published'),
('post-3', 'yalda-luxury', 'یلدا لاکچری', 'سفره یلدا لاکچری', 'محتوای یلدا...', '/images/gallery-yalda.jpg', '["یلدا","لاکچری"]', 'admin-001', 'published'),
('post-4', 'sismuni', 'سیسمونی مدرن', 'ایده سیسمونی', 'محتوای سیسمونی...', '/images/gallery-baby.jpg', '["سیسمونی"]', 'admin-001', 'published');

SELECT COUNT(*) as j_users FROM jashnsaz_users;
SELECT COUNT(*) as j_leads FROM jashnsaz_leads;
SELECT COUNT(*) as j_posts FROM jashnsaz_posts;

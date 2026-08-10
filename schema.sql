DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS sessions;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user', -- user, admin
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL, -- site, telegram, whatsapp
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
  status TEXT NOT NULL DEFAULT 'new', -- new, qualified, contacted, booked, lost
  message TEXT,
  ai_brief TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image TEXT,
  tags TEXT, -- JSON array
  author_id TEXT REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'published', -- draft, published
  views INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_sessions_token ON sessions(token);

-- seed admin user: admin@jashnsaz.ir / password: admin123 (hashed with simple sha256 for now, will be replaced by bcrypt in app)
INSERT INTO users (id, email, password_hash, name, role) VALUES 
('admin-001', 'admin@jashnsaz.ir', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'مدیر جشن‌ساز', 'admin'),
('user-001', 'user@test.ir', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'کاربر تست', 'user');

-- seed posts from existing content
INSERT INTO posts (id, slug, title, excerpt, content, image, tags, author_id) VALUES
('post-1', 'tavalod-minimal', 'ایده‌های تولد مینیمال ۱۴۰۴', 'ترندهای تولد مینیمال با پالت بژ و طلایی', 'محتوای کامل مقاله تولد مینیمال... شامل ایده بادکنک، میز دسر، نورپردازی.', '/images/gallery-birthday.jpg', '["تولد","مینیمال"]', 'admin-001'),
('post-2', 'aroosi-boho', 'عروسی بوهو در باغ', 'چطور یک عروسی بوهو رویایی بسازی', 'محتوای کامل بوهو...', '/images/gallery-wedding.jpg', '["عروسی","بوهو"]', 'admin-001'),
('post-3', 'yalda-luxury', 'یلدا لاکچری', 'سفره یلدا لاکچری با انار و طلایی', 'محتوای یلدا...', '/images/gallery-yalda.jpg', '["یلدا","لاکچری"]', 'admin-001'),
('post-4', 'sismuni', 'سیسمونی مدرن', 'ایده سیسمونی مدرن', 'محتوای سیسمونی...', '/images/gallery-baby.jpg', '["سیسمونی"]', 'admin-001');

-- seed one lead
INSERT INTO leads (id, source, name, phone, occasion, style, guests, city, status, message) VALUES
('lead-001', 'site', 'سارا', '09123456789', 'birthday', 'minimal', '20-50', 'تهران', 'new', 'برای تولد ۲ سالگی پسرم');

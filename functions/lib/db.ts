export type Env = {
  DB: D1Database
  JWT_SECRET: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_ADMIN_CHAT_ID?: string
  BALE_BOT_TOKEN?: string
  BALE_ADMIN_CHAT_ID?: string
  WHATSAPP_TOKEN?: string
  WHATSAPP_PHONE_NUMBER_ID?: string
  WHATSAPP_VERIFY_TOKEN?: string
}

export const generateId = (prefix='id') => `${prefix}-${Math.random().toString(36).slice(2,9)}-${Date.now().toString(36)}`

// use prefixed tables to avoid collision with existing neginjam site
export const TABLES = {
  users: 'jashnsaz_users',
  leads: 'jashnsaz_leads',
  posts: 'jashnsaz_posts',
  sessions: 'jashnsaz_sessions',
}

export async function getUserByEmail(DB: D1Database, email: string) {
  return await DB.prepare(`SELECT * FROM ${TABLES.users} WHERE email = ?`).bind(email).first()
}
export async function getUserById(DB: D1Database, id: string) {
  return await DB.prepare(`SELECT * FROM ${TABLES.users} WHERE id = ?`).bind(id).first()
}

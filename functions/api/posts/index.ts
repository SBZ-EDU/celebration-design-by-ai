import { generateId, TABLES } from '../../lib/db'
import { verifyJWT } from '../../lib/auth'

type Env = { DB: D1Database, JWT_SECRET: string }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g,'-').replace(/^-|-$/g,'').slice(0,80) + '-' + Math.random().toString(36).slice(2,5)
}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url)
  const status = url.searchParams.get('status') || 'published'
  const q = status === 'all' ? `SELECT * FROM ${TABLES.posts} ORDER BY created_at DESC` : `SELECT * FROM ${TABLES.posts} WHERE status = ? ORDER BY created_at DESC`
  const stmt = status === 'all' ? ctx.env.DB.prepare(q) : ctx.env.DB.prepare(q).bind(status)
  const {results} = await stmt.all()
  return new Response(JSON.stringify({ok:true, posts: results}), {headers:{'Content-Type':'application/json'}})
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  const payload = await verifyJWT(token, ctx.env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload || payload.role !== 'admin') return new Response(JSON.stringify({error:'admin only'}), {status:403, headers:{'Content-Type':'application/json'}})

  const body = await ctx.request.json() as any
  const { title, excerpt, content, image, tags, status } = body
  if(!title || !content) return new Response(JSON.stringify({error:'title and content required'}), {status:400, headers:{'Content-Type':'application/json'}})

  const id = generateId('post')
  const slug = body.slug || slugify(title)
  const tagsStr = JSON.stringify(tags || [])
  await ctx.env.DB.prepare(`INSERT INTO ${TABLES.posts} (id, slug, title, excerpt, content, image, tags, author_id, status) VALUES (?,?,?,?,?,?,?,?,?)`)
    .bind(id, slug, title, excerpt||'', content, image||'', tagsStr, payload.userId, status||'published').run()

  const post = await ctx.env.DB.prepare(`SELECT * FROM ${TABLES.posts} WHERE id = ?`).bind(id).first()
  return new Response(JSON.stringify({ok:true, post}), {headers:{'Content-Type':'application/json'}})
}

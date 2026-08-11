import { verifyJWT } from '../../lib/auth'
import { TABLES } from '../../lib/db'

type Env = { DB: D1Database, JWT_SECRET: string }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  const payload = await verifyJWT(token, ctx.env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload || payload.role !== 'admin') return new Response(JSON.stringify({error:'admin only'}), {status:403, headers:{'Content-Type':'application/json'}})

  const {results} = await ctx.env.DB.prepare(`SELECT id, email, name, phone, role, created_at FROM ${TABLES.users} ORDER BY created_at DESC`).all()
  return new Response(JSON.stringify({ok:true, users: results}), {headers:{'Content-Type':'application/json'}})
}

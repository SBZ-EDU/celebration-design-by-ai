import { verifyJWT } from '../../lib/auth'
import { TABLES } from '../../lib/db'

type Env = { DB: D1Database, JWT_SECRET: string }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  if(!token) return new Response(JSON.stringify({error:'no token'}), {status:401, headers:{'Content-Type':'application/json'}})
  const payload = await verifyJWT(token, ctx.env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload) return new Response(JSON.stringify({error:'invalid token'}), {status:401, headers:{'Content-Type':'application/json'}})
  const user = await ctx.env.DB.prepare(`SELECT id,email,name,role,phone,created_at FROM ${TABLES.users} WHERE id = ?`).bind(payload.userId).first()
  if(!user) return new Response(JSON.stringify({error:'user not found'}), {status:404, headers:{'Content-Type':'application/json'}})
  return new Response(JSON.stringify({ok:true, user}), {headers:{'Content-Type':'application/json'}})
}

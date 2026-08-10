import { verifyJWT } from '../../lib/auth'
import { TABLES } from '../../lib/db'

type Env = { DB: D1Database, JWT_SECRET: string }

export const onRequestPatch: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  const payload = await verifyJWT(token, ctx.env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload || payload.role !== 'admin') return new Response(JSON.stringify({error:'admin only'}), {status:403, headers:{'Content-Type':'application/json'}})

  const id = ctx.params.id as string
  const body = await ctx.request.json() as any
  const allowed = ['status','message','budget','city']
  const sets: string[] = []
  const vals: any[] = []
  for(const k of allowed){
    if(body[k]!==undefined){ sets.push(`${k} = ?`); vals.push(body[k]) }
  }
  if(sets.length===0) return new Response(JSON.stringify({error:'no fields'}), {status:400})
  sets.push("updated_at = datetime('now')")
  vals.push(id)
  await ctx.env.DB.prepare(`UPDATE ${TABLES.leads} SET ${sets.join(',')} WHERE id = ?`).bind(...vals).run()
  const lead = await ctx.env.DB.prepare(`SELECT * FROM ${TABLES.leads} WHERE id = ?`).bind(id).first()
  return new Response(JSON.stringify({ok:true, lead}), {headers:{'Content-Type':'application/json'}})
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  const payload = await verifyJWT(token, ctx.env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload || payload.role !== 'admin') return new Response(JSON.stringify({error:'admin only'}), {status:403})

  const id = ctx.params.id as string
  await ctx.env.DB.prepare(`DELETE FROM ${TABLES.leads} WHERE id = ?`).bind(id).run()
  return new Response(JSON.stringify({ok:true}), {headers:{'Content-Type':'application/json'}})
}

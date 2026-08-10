import { verifyJWT } from '../../lib/auth'
import { TABLES } from '../../lib/db'

type Env = { DB: D1Database, JWT_SECRET: string }

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const id = ctx.params.id as string
  let post = await ctx.env.DB.prepare(`SELECT * FROM ${TABLES.posts} WHERE id = ? OR slug = ?`).bind(id,id).first()
  if(!post) return new Response(JSON.stringify({error:'not found'}), {status:404, headers:{'Content-Type':'application/json'}})
  await ctx.env.DB.prepare(`UPDATE ${TABLES.posts} SET views = views + 1 WHERE id = ?`).bind((post as any).id).run().catch(()=>{})
  return new Response(JSON.stringify({ok:true, post}), {headers:{'Content-Type':'application/json'}})
}

export const onRequestPut: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  const payload = await verifyJWT(token, ctx.env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload || payload.role !== 'admin') return new Response(JSON.stringify({error:'admin only'}), {status:403, headers:{'Content-Type':'application/json'}})

  const id = ctx.params.id as string
  const body = await ctx.request.json() as any
  const fields = ['title','excerpt','content','image','tags','status','slug']
  const sets: string[] = []
  const vals: any[] = []
  for(const f of fields){
    if(body[f] !== undefined){
      sets.push(`${f} = ?`)
      vals.push(f==='tags' ? JSON.stringify(body[f]) : body[f])
    }
  }
  if(sets.length===0) return new Response(JSON.stringify({error:'no fields'}), {status:400, headers:{'Content-Type':'application/json'}})
  sets.push("updated_at = datetime('now')")
  const sql = `UPDATE ${TABLES.posts} SET ${sets.join(', ')} WHERE id = ? OR slug = ?`
  vals.push(id, id)
  await ctx.env.DB.prepare(sql).bind(...vals).run()
  const post = await ctx.env.DB.prepare(`SELECT * FROM ${TABLES.posts} WHERE id = ? OR slug = ?`).bind(id,id).first()
  return new Response(JSON.stringify({ok:true, post}), {headers:{'Content-Type':'application/json'}})
}

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  const payload = await verifyJWT(token, ctx.env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload || payload.role !== 'admin') return new Response(JSON.stringify({error:'admin only'}), {status:403, headers:{'Content-Type':'application/json'}})

  const id = ctx.params.id as string
  await ctx.env.DB.prepare(`DELETE FROM ${TABLES.posts} WHERE id = ? OR slug = ?`).bind(id,id).run()
  return new Response(JSON.stringify({ok:true}), {headers:{'Content-Type':'application/json'}})
}

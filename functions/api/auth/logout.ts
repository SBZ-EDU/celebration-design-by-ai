import { TABLES } from '../../lib/db'
type Env = { DB: D1Database }

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const auth = ctx.request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  if(token){
    await ctx.env.DB.prepare(`DELETE FROM ${TABLES.sessions} WHERE token = ?`).bind(token).run().catch(()=>{})
  }
  return new Response(JSON.stringify({ok:true}), {headers:{'Content-Type':'application/json'}})
}

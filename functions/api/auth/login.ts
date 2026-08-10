import { comparePassword, createJWT } from '../../lib/auth'
import { TABLES } from '../../lib/db'

type Env = { DB: D1Database, JWT_SECRET: string }

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const { email, password } = await ctx.request.json() as any
    if(!email || !password) {
      return new Response(JSON.stringify({error: 'ایمیل و رمز الزامی است'}), {status:400, headers:{'Content-Type':'application/json'}})
    }
    const user = await ctx.env.DB.prepare(`SELECT * FROM ${TABLES.users} WHERE email = ?`).bind(email).first() as any
    if(!user) {
      return new Response(JSON.stringify({error: 'کاربر یافت نشد'}), {status:404, headers:{'Content-Type':'application/json'}})
    }
    const ok = await comparePassword(password, user.password_hash)
    if(!ok) {
      return new Response(JSON.stringify({error: 'رمز عبور اشتباه'}), {status:401, headers:{'Content-Type':'application/json'}})
    }
    const token = await createJWT({userId: user.id, email: user.email, role: user.role, name: user.name}, ctx.env.JWT_SECRET || 'jashnsaz-secret')
    const sid = `sess-${Math.random().toString(36).slice(2)}`
    const exp = new Date(Date.now()+7*24*60*60*1000).toISOString()
    await ctx.env.DB.prepare(`INSERT INTO ${TABLES.sessions} (id, user_id, token, expires_at) VALUES (?,?,?,?)`)
      .bind(sid, user.id, token, exp).run().catch(()=>{})

    return new Response(JSON.stringify({ok:true, token, user: {id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone}}), {headers:{'Content-Type':'application/json'}})
  } catch(e:any) {
    console.error(e)
    return new Response(JSON.stringify({error: e.message}), {status:500, headers:{'Content-Type':'application/json'}})
  }
}

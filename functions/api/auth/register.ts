import { generateId, TABLES } from '../../lib/db'
import { hashPassword, createJWT } from '../../lib/auth'

type Env = { DB: D1Database, JWT_SECRET: string }

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const { email, password, name, phone } = await ctx.request.json() as any
    if(!email || !password) {
      return new Response(JSON.stringify({error: 'ایمیل و رمز عبور الزامی است'}), {status:400, headers:{'Content-Type':'application/json'}})
    }
    if(password.length < 6) {
      return new Response(JSON.stringify({error: 'رمز حداقل ۶ کاراکتر'}), {status:400, headers:{'Content-Type':'application/json'}})
    }
    const existing = await ctx.env.DB.prepare(`SELECT id FROM ${TABLES.users} WHERE email = ?`).bind(email).first()
    if(existing) {
      return new Response(JSON.stringify({error: 'این ایمیل قبلاً ثبت شده'}), {status:409, headers:{'Content-Type':'application/json'}})
    }
    const id = generateId('user')
    const hash = await hashPassword(password)
    await ctx.env.DB.prepare(`INSERT INTO ${TABLES.users} (id, email, password_hash, name, phone, role) VALUES (?,?,?,?,?,?)`)
      .bind(id, email, hash, name||'', phone||'', 'user').run()

    const token = await createJWT({userId: id, email, role: 'user', name}, ctx.env.JWT_SECRET || 'jashnsaz-secret')

    return new Response(JSON.stringify({ok:true, token, user: {id, email, name, role:'user'}}), {headers:{'Content-Type':'application/json'}})
  } catch(e:any) {
    return new Response(JSON.stringify({error: e.message || 'خطا'}), {status:500, headers:{'Content-Type':'application/json'}})
  }
}

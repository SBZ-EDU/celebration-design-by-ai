import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiMe, apiLogin, apiRegister, getToken, setToken, clearToken } from './api'

type User = { id: string, email: string, name: string, role: 'user'|'admin', phone?: string }
type AuthCtx = {
  user: User | null
  loading: boolean
  login: (email:string, password:string)=>Promise<void>
  register: (email:string, password:string, name:string, phone?:string)=>Promise<void>
  logout: ()=>void
  isAdmin: boolean
}

const Ctx = createContext<AuthCtx>({} as any)

export function AuthProvider({children}:{children: React.ReactNode}) {
  const [user, setUser] = useState<User|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = getToken()
    if(!token){ setLoading(false); return }
    apiMe().then(d=> setUser(d.user)).catch(()=> clearToken()).finally(()=> setLoading(false))
  },[])

  const login = async (email:string, password:string) => {
    const d = await apiLogin({email, password})
    setToken(d.token)
    setUser(d.user)
  }
  const register = async (email:string, password:string, name:string, phone?:string) => {
    const d = await apiRegister({email, password, name, phone})
    setToken(d.token)
    setUser(d.user)
  }
  const logout = () => {
    clearToken()
    setUser(null)
  }

  return <Ctx.Provider value={{user, loading, login, register, logout, isAdmin: user?.role==='admin'}}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)

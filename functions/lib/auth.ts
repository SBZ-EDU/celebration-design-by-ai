import { generateId } from './db'

function base64urlEncode(input: string | ArrayBuffer) {
  let bytes: Uint8Array
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input)
  } else {
    bytes = new Uint8Array(input)
  }
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  const base64 = btoa(binary)
  return base64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
function base64urlDecode(str: string) {
  str = str.replace(/-/g,'+').replace(/_/g,'/')
  while (str.length % 4) str += '='
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for(let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

async function hmacSign(secret: string, data: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return sig
}

export async function createJWT(payload: any, secret: string, expiresInSec = 60*60*24*7) {
  const header = {alg:'HS256', typ:'JWT'}
  const now = Math.floor(Date.now()/1000)
  const fullPayload = {...payload, iat: now, exp: now+expiresInSec}
  const headerB64 = base64urlEncode(JSON.stringify(header))
  const payloadB64 = base64urlEncode(JSON.stringify(fullPayload))
  const data = `${headerB64}.${payloadB64}`
  const sig = await hmacSign(secret, data)
  const sigB64 = base64urlEncode(sig)
  return `${data}.${sigB64}`
}

export async function verifyJWT(token: string, secret: string) {
  try {
    const [headerB64, payloadB64, sigB64] = token.split('.')
    if(!headerB64 || !payloadB64 || !sigB64) return null
    const data = `${headerB64}.${payloadB64}`
    const expectedSig = await hmacSign(secret, data)
    const expectedB64 = base64urlEncode(expectedSig)
    if(expectedB64 !== sigB64) return null
    const payloadStr = base64urlDecode(payloadB64)
    const payload = JSON.parse(payloadStr)
    if(payload.exp && payload.exp < Math.floor(Date.now()/1000)) return null
    return payload
  } catch {
    return null
  }
}

let bcryptLib: any = null
async function getBcrypt() {
  if(bcryptLib) return bcryptLib
  try {
    // @ts-ignore
    const mod = await import('bcryptjs')
    bcryptLib = mod.default || mod
    return bcryptLib
  } catch {
    return null
  }
}

export async function hashPassword(password: string) {
  const bcrypt = await getBcrypt()
  if(bcrypt) {
    return bcrypt.hashSync(password, 10)
  } else {
    const enc = new TextEncoder()
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password))
    const arr = Array.from(new Uint8Array(buf))
    return arr.map(b=>b.toString(16).padStart(2,'0')).join('')
  }
}

export async function comparePassword(password: string, hash: string) {
  const bcrypt = await getBcrypt()
  if(bcrypt && (hash.startsWith('$2a$') || hash.startsWith('$2b$'))) {
    return bcrypt.compareSync(password, hash)
  } else if(bcrypt) {
    return false
  } else {
    const enc = new TextEncoder()
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password))
    const arr = Array.from(new Uint8Array(buf))
    const sha = arr.map(b=>b.toString(16).padStart(2,'0')).join('')
    return sha === hash
  }
}

export async function requireAuth(request: Request, env: any) {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ','').trim()
  if(!token) return null
  const payload = await verifyJWT(token, env.JWT_SECRET || 'jashnsaz-secret')
  if(!payload) return null
  return payload
}
